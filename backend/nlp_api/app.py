# backend/nlp_api/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import os, math, re, psycopg2, psycopg2.extras as pgextras
import nltk
from collections import Counter
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk import word_tokenize, pos_tag

# --- charge le .env DU DOSSIER nlp_api + éventuellement celui du parent
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# --- NLTK data ---
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
except Exception:
    pass

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000", "*"]}})

# ---------- DB CONFIG ----------
DB_NAME = os.getenv("POSTGRES_DB", "eco_recommendation")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DATABASE_URL = os.getenv("DATABASE_URL")

print("🗄️  [nlp_api] DATABASE_URL present? ->", bool(DATABASE_URL))

def get_db_connection():
    try:
        if DATABASE_URL:
            print("🔌 [nlp_api] Connecting with DATABASE_URL (Railway)…")
            return psycopg2.connect(DATABASE_URL)
        print(f"🔌 [nlp_api] Connecting local {DB_HOST}:{DB_PORT}…")
        return psycopg2.connect(
            dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD,
            host=DB_HOST, port=DB_PORT
        )
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        raise

# ---------- util DB ----------
def get_table_columns(conn, table_name):
    with conn.cursor(cursor_factory=pgextras.DictCursor) as cur:
        cur.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema='public' AND table_name=%s;
        """, (table_name.lower(),))
        return {r["column_name"] for r in cur.fetchall()}

def table_exists(conn, table_name):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT EXISTS (
              SELECT 1 FROM information_schema.tables
              WHERE table_schema='public' AND table_name=%s
            );
        """, (table_name.lower(),))
        return cur.fetchone()[0]

PREFERRED_PRODUCT_COLUMNS = [
    "id","name","description","price","eco_rating",
    "category_id","brand_id","image_url","source_url","tags","materials","certifications"
]


def select_products(conn, wanted=PREFERRED_PRODUCT_COLUMNS, extra_where=None, params=()):
    # base table + available columns
    pcols = get_table_columns(conn, "products")
    cols = [c for c in wanted if c in pcols]
    if "id" not in cols:
        cols.insert(0, "id")

    # detect optional joins
    have_categories = table_exists(conn, "categories") and {"id","name"} <= get_table_columns(conn, "categories")
    have_brands     = table_exists(conn, "brands") and {"id","name"} <= get_table_columns(conn, "brands")

    # build SELECT list (include alias for readable names)
    select_list = [f'p."{c}"' for c in cols]
    if have_categories and "category_id" in pcols:
        select_list.append('c.name AS category')
    if have_brands and "brand_id" in pcols:
        select_list.append('b.name AS brand')

    sql = f'SELECT {", ".join(select_list)} FROM "products" p'
    if have_categories and "category_id" in pcols:
        sql += ' LEFT JOIN "categories" c ON p."category_id" = c."id"'
    if have_brands and "brand_id" in pcols:
        sql += ' LEFT JOIN "brands" b ON p."brand_id" = b."id"'

    if extra_where:
        # extra_where should already start with WHERE/AND
        sql += " " + extra_where

    with conn.cursor(cursor_factory=pgextras.DictCursor) as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()

    out = []
    for r in rows:
        item = {k: r.get(k) for k in r.keys()}  # include joins (category/brand)
        # normalize keys expected by the rest of your code
        item.setdefault("name","")
        item.setdefault("description","")
        item.setdefault("price", 0.0)
        item.setdefault("eco_rating", 0.0)
        # if we didn't join names, provide empty readable fields
        item.setdefault("category", "")
        item.setdefault("brand", "")
        # optional fields
        for k in ("materials","certifications","tags","source_url","image_url"):
            item.setdefault(k, "")
        out.append(item)
    return out


# ---------- NLP util ----------
STOP_WORDS = set(stopwords.words('english')) | {
    "les","des","pour","avec","dans","sur","une","un","le","la","de","du",
    "et","ou","au","aux","en","plus","eco","écologique"
}
LEMM = WordNetLemmatizer()
GOOD_POS = {"NN","NNS","NNP","NNPS","JJ","JJR","JJS"}

def normalize_text(text: str) -> str:
    if not text: return ""
    return re.sub(r"[^a-zA-Z\s\-]", " ", text.lower())

def extract_keywords_free(text: str):
    text = normalize_text(text)
    if not text.strip(): return []
    toks = word_tokenize(text)
    pos = pos_tag(toks)
    out = []
    for tok, tag in pos:
        if tag in GOOD_POS and len(tok)>2 and tok not in STOP_WORDS:
            out.append(LEMM.lemmatize(tok))
    return out

def build_tfidf_index(doc_tokens_list):
    N = len(doc_tokens_list)
    df = Counter()
    for tokens in doc_tokens_list:
        df.update(set(tokens))
    idf = {term: (math.log((N+1)/(d+1))+1.0) for term, d in df.items()}
    tf_vectors = []
    for tokens in doc_tokens_list:
        if not tokens:
            tf_vectors.append({})
            continue
        tf = Counter(tokens)
        vec = {t: (tf[t]/len(tokens))*idf.get(t,0.0) for t in tf}
        tf_vectors.append(vec)
    return idf, tf_vectors

def tfidf_vector(tokens, idf):
    if not tokens: return {}
    tf = Counter(tokens)
    return {t: (tf[t]/len(tokens))*idf.get(t,0.0) for t in tf}

def cosine_sim(a: dict, b: dict):
    if not a or not b: return 0.0
    dot = sum(a[t]*b.get(t,0.0) for t in a)
    na = math.sqrt(sum(v*v for v in a.values()))
    nb = math.sqrt(sum(v*v for v in b.values()))
    return (dot/(na*nb)) if na>0 and nb>0 else 0.0

# ---------- Health ----------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True}), 200

# ---------- Analyze review (maj eco_rating) ----------
# ---------- Analyze review (maj eco_rating) ----------
@app.route("/analyze_review", methods=["POST"])
def analyze_review():
    try:
        data = request.json or {}
        product_id = data.get("product_id")
        review_text = data.get("review","")
        if not product_id:
            return jsonify({"ok": False, "error": "MISSING_PRODUCT_ID"}), 400

        polarity = TextBlob(review_text).sentiment.polarity

        conn = get_db_connection()
        with conn:
            with conn.cursor(cursor_factory=pgextras.DictCursor) as cur:
                # infos de base
                cur.execute('SELECT id, price, category_id, eco_rating FROM "products" WHERE id=%s;', (product_id,))
                p = cur.fetchone()
                if not p:
                    return jsonify({"ok": False, "error": "PRODUCT_NOT_FOUND"}), 404

                price = float(p["price"] or 0.0)
                category_id = p.get("category_id")

                # --- affordability (moins cher que la médiane = mieux)
                afford = 0.0
                try:
                    if category_id is not None:
                        cur.execute("""
                            SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price) AS median_price
                            FROM "products" WHERE category_id=%s AND price IS NOT NULL
                        """, (category_id,))
                        r = cur.fetchone()
                        median_price = float(r["median_price"] or 0.0)
                        if median_price > 0:
                            afford = max(-1.0, min(1.0, (median_price - price)/median_price))
                except Exception:
                    afford = 0.0

                # --- popularité (ventes normalisées 0..1)
                pop_norm = 0.0
                try:
                    if table_exists(conn, "order_items"):
                        cur.execute('SELECT COALESCE(SUM(quantity),0)::float AS qty FROM "order_items" WHERE product_id=%s;', (product_id,))
                        my_qty = float(cur.fetchone()["qty"] or 0.0)
                        cur.execute('SELECT COALESCE(MAX(sum_qty),0)::float AS max_qty FROM (SELECT product_id, SUM(quantity) AS sum_qty FROM "order_items" GROUP BY product_id) t;')
                        max_qty = float(cur.fetchone()["max_qty"] or 0.0)
                        if max_qty > 0:
                            pop_norm = max(0.0, min(1.0, my_qty/max_qty))
                except Exception:
                    pop_norm = 0.0

                # --- base selon polarité
                if   polarity >= 0.6: base = 0.25
                elif polarity >= 0.2: base = 0.10
                elif polarity >  -0.2: base = 0.0
                elif polarity >= -0.5: base = -0.20   # mauvais = -0.2
                else:                  base = -1.00   # très mauvais = -1

                # --- amplification seulement si positif
                if base > 0:
                    mult = 1.0 + 0.4*pop_norm + 0.3*afford
                    # cher mais très populaire → petit bonus premium
                    if afford < 0 and pop_norm >= 0.7:
                        mult += 0.2
                    delta = base * mult
                else:
                    delta = base

                # --- appliquer 0..5
                cur.execute('UPDATE "products" SET eco_rating = LEAST(GREATEST(COALESCE(eco_rating,0) + %s, 0), 5) WHERE id=%s;', (delta, product_id))

        conn.close()
        return jsonify({"ok": True, "sentiment": polarity, "delta": float(delta), "pop_norm": float(pop_norm), "afford": float(afford)}), 200
    except Exception as e:
        print("❌ analyze_review error:", e)
        return jsonify({"ok": False, "message": "analyze_review_skipped"}), 200


# ---------- Recommend ----------
@app.route("/recommend", methods=["GET"])
def recommend():
    try:
        user_id = request.args.get("user_id", type=int)
        product_id = request.args.get("product_id", type=int)

        conn = get_db_connection()
        prod_rows = select_products(conn, wanted=["id","category","eco_rating","price","name","description"])
        prod = next((r for r in prod_rows if r["id"] == product_id), None)
        if not prod:
            conn.close()
            return jsonify({"ok": False, "error": "PRODUCT_NOT_FOUND"}), 404

        category = (prod.get("category") or "").strip()
        all_rows = select_products(
            conn,
            wanted=PREFERRED_PRODUCT_COLUMNS,
            extra_where='WHERE p."id" <> %s',   
            params=(product_id,)
        )
        conn.close()

        pool = [r for r in all_rows if (r.get("category") or "").strip() == category] or all_rows
        pool.sort(key=lambda r: (float(r.get("eco_rating") or 0.0), r.get("id")), reverse=True)
        pool = pool[:5]

        recs = [{
            "product_id": r["id"],
            "name": r.get("name",""),
            "description": r.get("description","") or "",
            "category": r.get("category","") or "",
            "price": float(r.get("price") or 0.0),
            "eco_rating": float(r.get("eco_rating") or 0.0),
            "brand": r.get("brand","") or "",
            "materials": r.get("materials","") or "",
            "certifications": r.get("certifications","") or "",
            "tags": r.get("tags","") or "",
            "source_url": r.get("source_url","") or ""
        } for r in pool]

        return jsonify({"ok": True, "user_id": user_id, "product_id": product_id, "recommendations": recs}), 200
    except Exception as e:
        print("❌ /recommend error:", e)
        return jsonify({"ok": False, "error": "SERVER_ERROR"}), 500

# ---------- AI Search ----------
# --- helper: build WHERE (...) and params from query terms
import re

def _build_sql_filter_from_query(conn, q: str):
    terms = [t for t in re.split(r"\s+", q.strip()) if t]
    if not terms:
        return None, ()

    pcols = get_table_columns(conn, "products")
    have_categories = table_exists(conn, "categories") and {"id","name"} <= get_table_columns(conn, "categories")
    have_brands     = table_exists(conn, "brands") and {"id","name"} <= get_table_columns(conn, "brands")

    searchable = []
    # always: product name/description if present
    if "name" in pcols: searchable.append('p."name"')
    if "description" in pcols: searchable.append('p."description"')
    # tags/materials/certifications if you still have them
    if "tags" in pcols: searchable.append('p."tags"')
    if "materials" in pcols: searchable.append('p."materials"')
    if "certifications" in pcols: searchable.append('p."certifications"')
    # human-readable joins (category/brand names)
    if have_categories and "category_id" in pcols:
        searchable.append('c."name"')
    if have_brands and "brand_id" in pcols:
        searchable.append('b."name"')

    if not searchable:
        return None, ()

    clauses, params = [], []
    for t in terms:
        pat = f"%{t}%"
        part = " OR ".join([f"{col} ILIKE %s" for col in searchable])
        clauses.append(f"({part})")
        params.extend([pat] * len(searchable))

    return "WHERE " + " AND ".join(clauses), tuple(params)

# --- lightweight tokenizer (no NLTK needed)
def _simple_tokens(text: str):
    if not text:
        return []
    tokens = re.findall(r"[A-Za-zÀ-ÖØ-öø-ÿ0-9]+", text.lower())
    return [t for t in tokens if len(t) > 2 and t not in STOP_WORDS]

@app.route("/ai-search", methods=["GET"])
def ai_search():
    try:
        query = (request.args.get("q", "") or "").strip()
        print(f"[ai-search] q='{query}'")
        if not query:
            return jsonify({"results": []}), 200

        conn = get_db_connection()
        extra_where, params = _build_sql_filter_from_query(conn, query)

        products = select_products(conn, wanted=PREFERRED_PRODUCT_COLUMNS,
                                   extra_where=extra_where, params=params)
        conn.close()

        if not products:
            return jsonify({"results": []}), 200

        docs = []
        for p in products:
            docs.append(" ".join(s for s in [
                p.get("name",""), p.get("description",""),
                p.get("category",""),  # comes from join alias if available
                p.get("brand",""),     # comes from join alias if available
                p.get("materials",""), p.get("certifications",""), p.get("tags","")
            ] if s))
        print(f"[ai-search] matched={len(products)} docs={len(docs)}")

        # lightweight tokens (no NLTK runtime dependency)
        def _simple_tokens(text: str):
            tokens = re.findall(r"[A-Za-zÀ-ÖØ-öø-ÿ0-9]+", (text or "").lower())
            return [t for t in tokens if len(t) > 2 and t not in STOP_WORDS]

        doc_tokens = [_simple_tokens(d) for d in docs]
        idf, tf_vectors = build_tfidf_index(doc_tokens)

        query_tokens = _simple_tokens(query)
        if not query_tokens:
            products.sort(key=lambda r: (float(r.get("eco_rating") or 0.0),
                                         -float(r.get("price") or 0.0)), reverse=True)
            payload = [{
                "id": p["id"], "name": p.get("name",""), "description": p.get("description","") or "",
                "category": p.get("category","") or "", "brand": p.get("brand","") or "",
                "materials": p.get("materials","") or "", "certifications": p.get("certifications","") or "",
                "tags": p.get("tags","") or "", "price": float(p.get("price") or 0.0),
                "eco_rating": float(p.get("eco_rating") or 0.0),
                "compatibility_pct": 0.0, "search_method": "fallback_top_eco_rating"
            } for p in products[:10]]
            return jsonify({"results": payload}), 200

        q_vec = tfidf_vector(query_tokens, idf)

        results = []
        q_lower = query.lower()
        for p, p_vec in zip(products, tf_vectors):
            sim = cosine_sim(q_vec, p_vec)
            bonus = 0.0
            cat = (p.get("category") or "").lower()
            if cat and cat in q_lower:
                bonus += 0.05
            tags = (p.get("tags") or "").lower()
            if tags:
                for t in tags.split(","):
                    t = t.strip()
                    if t and t in q_lower:
                        bonus += 0.02
            score = min(sim + bonus, 1.0)
            results.append({
                "id": p["id"], "name": p.get("name",""),
                "description": p.get("description","") or "",
                "category": p.get("category","") or "", "brand": p.get("brand","") or "",
                "materials": p.get("materials","") or "", "certifications": p.get("certifications","") or "",
                "tags": p.get("tags","") or "", "price": float(p.get("price") or 0.0),
                "eco_rating": float(p.get("eco_rating") or 0.0),
                "compatibility_pct": round(score * 100, 1),
                "search_method": "tfidf_cosine_sql_prefilter"
            })

        results.sort(key=lambda r: (r["compatibility_pct"], r["eco_rating"]), reverse=True)
        return jsonify({"results": results[:10]}), 200

    except Exception as e:
        print("❌ AI Search Error:", e)
        return jsonify({"results": []}), 503

if __name__ == "__main__":
    # NB: tu veux 5001 ici (le backend Node pointe dessus)
    app.run(debug=True, host="0.0.0.0", port=5001)
