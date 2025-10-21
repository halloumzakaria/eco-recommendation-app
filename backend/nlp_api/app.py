from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import psycopg2
import psycopg2.extras as pgextras
import math
import re
import nltk
import os
from collections import Counter
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk import word_tokenize, pos_tag

# --- NLTK data ---
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
except Exception:
    pass

# --- Flask + CORS ---
app = Flask(__name__)
CORS(app)

# --- Config PostgreSQL ---
DB_NAME = os.getenv("POSTGRES_DB", "eco_recommendation")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DATABASE_URL = os.getenv("DATABASE_URL")  # Railway

# Colonnes "souhaitées" si elles existent (détection dynamique)
PREFERRED_PRODUCT_COLUMNS = [
    "id", "name", "description", "category", "price", "eco_rating",
    "brand", "materials", "certifications", "tags", "source_url"
]

def get_db_connection():
    """Connexion PostgreSQL (préfère DATABASE_URL si dispo, sinon variables séparées)."""
    try:
        if DATABASE_URL:
            return psycopg2.connect(DATABASE_URL)
        return psycopg2.connect(
            dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD,
            host=DB_HOST, port=DB_PORT
        )
    except Exception as e:
        # Fallback si la tentative variables séparées échoue mais DATABASE_URL existe
        if not DATABASE_URL:
            print(f"❌ Database connection error: {e}")
            raise
        try:
            return psycopg2.connect(DATABASE_URL)
        except Exception as ee:
            print(f"❌ Database connection error (DATABASE_URL): {ee}")
            raise

def get_table_columns(conn, table_name):
    """Retourne l’ensemble des colonnes existantes pour la table."""
    with conn.cursor(cursor_factory=pgextras.DictCursor) as cur:
        cur.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = %s;
        """, (table_name,))
        return {row["column_name"] for row in cur.fetchall()}

def select_products(conn, wanted=PREFERRED_PRODUCT_COLUMNS, extra_where=None, params=()):
    """Sélectionne dynamiquement les colonnes disponibles parmi 'wanted'."""
    available = get_table_columns(conn, "Products")
    cols = [c for c in wanted if c in available]
    if "id" not in cols:
        cols.insert(0, "id")
    col_sql = ", ".join([f'"{c}"' for c in cols])
    sql = f'SELECT {col_sql} FROM "Products"'
    if extra_where:
        sql += " " + extra_where
    with conn.cursor(cursor_factory=pgextras.DictCursor) as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()

    normalized = []
    for r in rows:
        item = {c: r.get(c) for c in cols}
        # valeurs par défaut raisonnables
        item.setdefault("name", "")
        item.setdefault("description", "")
        item.setdefault("category", "")
        item.setdefault("price", 0.0)
        item.setdefault("eco_rating", 0.0)
        item.setdefault("tags", "")
        item.setdefault("brand", "")
        item.setdefault("materials", "")
        item.setdefault("certifications", "")
        item.setdefault("source_url", "")
        normalized.append(item)
    return normalized

# ---------- Prétraitement & extraction auto de mots-clés ----------
STOP_WORDS = set(stopwords.words('english')) | {
    # quelques stopwords FR
    "les", "des", "pour", "avec", "dans", "sur", "une", "un", "le", "la",
    "de", "du", "et", "ou", "au", "aux", "en", "plus", "eco", "écologique"
}
LEMM = WordNetLemmatizer()
GOOD_POS = {"NN","NNS","NNP","NNPS","JJ","JJR","JJS"}  # noms + adjectifs

def normalize_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r"[^a-zA-Z\s\-]", " ", text.lower())

def extract_keywords_free(text: str):
    """Extraction automatique légère (POS + stopwords + lemma)."""
    text = normalize_text(text)
    if not text.strip():
        return []
    toks = word_tokenize(text)
    pos = pos_tag(toks)  # modèle EN, fonctionne raisonnablement en FR simple
    out = []
    for tok, tag in pos:
        if tag in GOOD_POS and len(tok) > 2 and tok not in STOP_WORDS:
            out.append(LEMM.lemmatize(tok))
    return out

# ---------- TF-IDF & Cosine ----------
def build_tfidf_index(doc_tokens_list):
    N = len(doc_tokens_list)
    df = Counter()
    for tokens in doc_tokens_list:
        df.update(set(tokens))
    idf = {term: (math.log((N + 1) / (d + 1)) + 1.0) for term, d in df.items()}
    tf_vectors = []
    for tokens in doc_tokens_list:
        if not tokens:
            tf_vectors.append({})
            continue
        tf = Counter(tokens)
        vec = {t: (tf[t] / len(tokens)) * idf.get(t, 0.0) for t in tf}
        tf_vectors.append(vec)
    return idf, tf_vectors

def tfidf_vector(tokens, idf):
    if not tokens:
        return {}
    tf = Counter(tokens)
    return {t: (tf[t] / len(tokens)) * idf.get(t, 0.0) for t in tf}

def cosine_sim(a: dict, b: dict):
    if not a or not b:
        return 0.0
    dot = sum(a[t] * b.get(t, 0.0) for t in a)
    na = math.sqrt(sum(v*v for v in a.values()))
    nb = math.sqrt(sum(v*v for v in b.values()))
    return (dot / (na * nb)) if (na > 0 and nb > 0) else 0.0

# ------------------- Routes -------------------

# Root : si on l'appelle avec ?q=..., on route vers /ai-search (évite les 404 sur "/?q=...").
@app.route("/", methods=["GET"])
def root():
    q = request.args.get("q")
    if q is not None:
        return ai_search()
    return jsonify({
        "ok": True,
        "service": "eco-nlp",
        "endpoints": ["/health", "/ai-search?q=...", "/recommend?user_id=&product_id=", "/analyze_review (POST JSON)"]
    }), 200

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True}), 200

@app.route("/analyze_review", methods=["POST"])
def analyze_review():
    try:
        data = request.json or {}
        product_id = data.get("product_id", 0)
        review_text = data.get("review", "")

        print(f"📌 Avis reçu : {review_text} pour le produit {product_id}")

        polarity = TextBlob(review_text).sentiment.polarity
        print(f"🧠 Score de sentiment : {polarity}")

        conn = get_db_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute('SELECT id FROM "Products" WHERE id = %s;', (product_id,))
                if not cur.fetchone():
                    conn.close()
                    return jsonify({"error": "Produit non trouvé"}), 404

                if polarity > 0.1:
                    cur.execute('UPDATE "Products" SET eco_rating = eco_rating + 1 WHERE id = %s AND eco_rating < 5;', (product_id,))
                elif polarity < -0.1:
                    cur.execute('UPDATE "Products" SET eco_rating = eco_rating - 1 WHERE id = %s AND eco_rating > 1;', (product_id,))

        conn.close()
        return jsonify({"message": "Analyse réussie", "review": review_text, "sentiment": polarity}), 200

    except Exception as e:
        print(f"❌ Erreur serveur : {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/recommend", methods=["GET", "OPTIONS"])
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
        all_rows = select_products(conn, wanted=PREFERRED_PRODUCT_COLUMNS,
                                   extra_where='WHERE "id" <> %s', params=(product_id,))
        conn.close()

        pool = [r for r in all_rows if (r.get("category") or "").strip() == category] or all_rows
        pool.sort(key=lambda r: (float(r.get("eco_rating") or 0.0), r.get("id")), reverse=True)
        pool = pool[:5]

        recs = [{
            "product_id": r["id"],
            "name": r.get("name", ""),
            "description": r.get("description", "") or "",
            "category": r.get("category", "") or "",
            "price": float(r.get("price") or 0.0),
            "eco_rating": float(r.get("eco_rating") or 0.0),
            "brand": r.get("brand", "") or "",
            "materials": r.get("materials", "") or "",
            "certifications": r.get("certifications", "") or "",
            "tags": r.get("tags", "") or "",
            "source_url": r.get("source_url", "") or ""
        } for r in pool]

        return jsonify({"ok": True, "user_id": user_id, "product_id": product_id, "recommendations": recs}), 200

    except Exception as e:
        print(f"❌ /recommend error: {e}")
        return jsonify({"ok": False, "error": "SERVER_ERROR"}), 500

@app.route("/ai-search", methods=["GET"])
def ai_search():
    try:
        query = (request.args.get("q", "") or "").strip()
        if not query:
            return jsonify({"results": []})

        print(f"🤖 AI Search: '{query}'")

        conn = get_db_connection()
        products = select_products(conn, wanted=PREFERRED_PRODUCT_COLUMNS)
        conn.close()
        if not products:
            return jsonify({"results": []})

        docs = []
        for p in products:
            parts = [
                p.get("name",""), p.get("description",""), p.get("category",""),
                p.get("brand",""), p.get("materials",""),
                p.get("certifications",""), p.get("tags","")
            ]
            docs.append(" ".join(x for x in parts if x))

        doc_tokens = [extract_keywords_free(d) for d in docs]
        idf, tf_vectors = build_tfidf_index(doc_tokens)

        query_tokens = extract_keywords_free(query)
        q_vec = tfidf_vector(query_tokens, idf)

        results = []
        q_lower = query.lower()
        for p, p_vec in zip(products, tf_vectors):
            sim = cosine_sim(q_vec, p_vec)  # 0..1
            bonus = 0.0
            cat = (p.get("category") or "").lower()
            if cat and cat in q_lower: bonus += 0.05
            tags = (p.get("tags") or "").lower()
            if tags:
                for t in tags.split(","):
                    t = t.strip()
                    if t and t in q_lower:
                        bonus += 0.02
            score = min(sim + bonus, 1.0)
            results.append({
                "id": p["id"],
                "name": p.get("name",""),
                "description": p.get("description","") or "",
                "category": p.get("category","") or "",
                "brand": p.get("brand","") or "",
                "materials": p.get("materials","") or "",
                "certifications": p.get("certifications","") or "",
                "tags": p.get("tags","") or "",
                "price": float(p.get("price") or 0.0),
                "eco_rating": float(p.get("eco_rating") or 0.0),
                "compatibility_pct": round(score * 100, 1),
                "search_method": "tfidf_cosine_auto_keywords"
            })

        results.sort(key=lambda r: (r["compatibility_pct"], r["eco_rating"]), reverse=True)
        return jsonify({"results": results[:10]})

    except Exception as e:
        print(f"❌ AI Search Error: {e}")
        return jsonify({"results": []})

# ---------- Run ----------
if __name__ == "__main__":
    # ✅ Port aligné avec ton backend (.env: NLP_API_URL=http://127.0.0.1:5001)
    app.run(debug=True, host='0.0.0.0', port=5001)
