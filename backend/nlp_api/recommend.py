from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sklearn.feature_extraction.text import TfidfVectorizer

# 🔧 Initialize Flask app
app = Flask(__name__)
CORS(app)

# 🔗 Database connection
DB_URI = "postgresql://postgres:postgres@postgres:5432/eco_recommendation"  # Use Docker service name
engine = create_engine(DB_URI)

# 🔹 Load products data
def get_products():
    try:
        return pd.read_sql('SELECT id, name, description, category, price FROM "Products"', con=engine)
    except SQLAlchemyError as e:
        print(f"❌ Database Error (Products): {e}")
        return pd.DataFrame()

# 🔹 Load user interactions
def get_user_interactions():
    try:
        return pd.read_sql('SELECT user_id, product_id, interaction_type FROM "UserInteractions"', con=engine)
    except SQLAlchemyError as e:
        print(f"❌ Database Error (UserInteractions): {e}")
        return pd.DataFrame()

# 🔍 Content-Based Filtering
def recommend_similar_products(product_id, num_recommendations=3):
    df = get_products()
    if df.empty or product_id not in df['id'].values:
        return []

    df['combined_features'] = df['category'].fillna('') + " " + df['description'].fillna('')
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(df['combined_features'])
    similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)

    product_index = df[df['id'] == product_id].index[0]
    similar_indices = np.argsort(similarity_matrix[product_index])[::-1][1:num_recommendations + 1]
    similar_indices = [i for i in similar_indices if i < len(df)]

    return df.iloc[similar_indices][['id', 'name', 'category', 'price']].to_dict(orient="records")

# 🔍 Collaborative Filtering
def recommend_based_on_users(user_id, num_recommendations=3):
    interactions = get_user_interactions()
    if interactions.empty or user_id not in interactions['user_id'].values:
        return []

    matrix = interactions.pivot_table(index='user_id', columns='product_id', aggfunc='size', fill_value=0)
    similarity = cosine_similarity(matrix)
    user_index = np.where(matrix.index == user_id)[0]

    if len(user_index) == 0:
        return []

    user_index = user_index[0]
    similar_users = np.argsort(similarity[user_index])[::-1][1:3]

    recommendations = set()
    for sim_user in similar_users:
        similar_user_id = matrix.index[sim_user]
        liked = interactions[interactions['user_id'] == similar_user_id]['product_id'].values
        recommendations.update(liked)

    return [{"id": pid} for pid in list(recommendations)[:num_recommendations]]

# 📌 Route: /ai-search
@app.route("/ai-search", methods=["GET"])
def ai_search():
    try:
        query = request.args.get("q", "").lower()
        if not query:
            return jsonify({"results": []})

        # Get all products
        products_df = get_products()
        if products_df.empty:
            return jsonify({"results": []})

        # Simple AI search using keyword matching and scoring
        results = []
        
        # Define search keywords and their corresponding categories/terms
        search_keywords = {
            "hair": ["cheveux", "brosse", "shampoing", "hygiène"],
            "teeth": ["dents", "dentifrice", "brosse", "hygiène"],
            "kitchen": ["cuisine", "vaisselle", "cafetière", "tasse", "pailles"],
            "bathroom": ["salle de bain", "savon", "hygiène", "bain", "démaquillant"],
            "eco": ["bambou", "bamboo", "bio", "naturel", "réutilisable"],
            "wood": ["bois", "wood", "bambou", "bamboo"],
            "glass": ["verre", "glass", "bouteille"],
            "metal": ["inox", "acier", "métal", "metal"],
            "cotton": ["coton", "cotton", "tissu", "lavable"],
            "soap": ["savon", "soap", "shampoing", "shampoo"],
            "bottle": ["bouteille", "bottle", "verre", "glass"],
            "brush": ["brosse", "brush", "cheveux", "dents"],
            "candle": ["bougie", "candle", "cire", "wax"],
            "yoga": ["yoga", "tapis", "mat", "sport"],
            "bag": ["sac", "bag", "coton", "cotton"],
            "straw": ["paille", "straw", "inox", "metal"],
            "cup": ["tasse", "cup", "mug", "bambou"],
            "towel": ["serviette", "towel", "bain", "bath"],
            "seed": ["graine", "seed", "jardin", "garden"],
            "kit": ["kit", "démarrage", "starter", "zéro déchet"]
        }

        # Score products based on query matching
        for _, product in products_df.iterrows():
            score = 0
            product_text = f"{product['name']} {product['description']} {product['category']}".lower()
            
            # Direct keyword matching
            for keyword, related_terms in search_keywords.items():
                if keyword in query:
                    for term in related_terms:
                        if term in product_text:
                            score += 2
                
                # Also check if any related term is in the query
                for term in related_terms:
                    if term in query and term in product_text:
                        score += 3
            
            # Category matching
            if product['category'].lower() in query:
                score += 2
            
            # Name matching
            if any(word in product['name'].lower() for word in query.split()):
                score += 1
            
            # Description matching
            if any(word in product['description'].lower() for word in query.split()):
                score += 1

            if score > 0:
                results.append({
                    "id": product['id'],
                    "name": product['name'],
                    "description": product['description'],
                    "category": product['category'],
                    "price": float(product['price']),
                    "score": score
                })

        # Sort by score (highest first) and limit results
        results.sort(key=lambda x: x['score'], reverse=True)
        results = results[:10]  # Limit to top 10 results

        return jsonify({"results": results})

    except Exception as e:
        print(f"❌ AI Search Error: {e}")
        return jsonify({"results": []})

# 📌 Route: /recommend
@app.route("/recommend", methods=["GET"])
def recommend():
    try:
        user_id = request.args.get("user_id", type=int)
        product_id = request.args.get("product_id", type=int)

        if not user_id and not product_id:
            return jsonify({"message": "Please provide user_id or product_id"}), 400

        recommendations = []

        if user_id:
            query = text('SELECT product_id FROM "UserInteractions" WHERE user_id = :user_id')
            user_history = pd.read_sql(query, con=engine, params={"user_id": user_id})

            if not user_history.empty:
                viewed_ids = user_history["product_id"].tolist()
                all_products = get_products()
                available = all_products[~all_products["id"].isin(viewed_ids)]

                if not available.empty:
                    sampled = available.sample(min(5, len(available)))
                    recommendations.extend(sampled.to_dict(orient="records"))

                # Optionally, add collaborative filtering:
                # recommendations += recommend_based_on_users(user_id)

        if product_id:
            recommendations += recommend_similar_products(product_id)

        return jsonify({"recommendations": recommendations})

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

# 🚀 Run server
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5003)
