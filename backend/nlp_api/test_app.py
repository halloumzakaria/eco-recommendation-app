from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import psycopg2
import json

# 🔹 Initialisation de l'application Flask
app = Flask(__name__)
CORS(app)  # Activer les CORS pour permettre les requêtes externes

# 🔹 Configuration PostgreSQL
DB_NAME = "eco_recommendation"
DB_USER = "postgres"
DB_PASSWORD = "postgres"  # Remplace par ton mot de passe PostgreSQL
DB_HOST = "localhost"
DB_PORT = "5432"

# 🔹 Connexion PostgreSQL
def get_db_connection():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )

# 📌 Route de test avec analyse NLP et mise à jour PostgreSQL
@app.route("/test", methods=["POST"])
def test():
    try:
        data = request.json
        product_id = data.get("product_id", 0)  # ✅ S'assurer que product_id est bien défini
        review_text = data.get("review", "")

        print(f"📌 Avis reçu : {review_text} pour le produit {product_id}")

        # 🔹 Analyse NLP
        analysis = TextBlob(review_text)
        polarity = analysis.sentiment.polarity
        print(f"📌 Score de sentiment : {polarity}")

        # 🔹 Connexion à PostgreSQL
        connection = get_db_connection()
        cursor = connection.cursor()

        # 🔹 Vérifier si le produit existe
        cursor.execute('SELECT id, eco_rating FROM "Products" WHERE id = %s;', (product_id,))
        product = cursor.fetchone()

        if not product:
            print(f"❌ ERREUR : Le produit {product_id} n'existe pas dans la base de données.")
            return jsonify({"error": "Produit non trouvé"}), 404

        # 🔹 Exécuter la mise à jour du eco_rating
        if polarity > 0.1:  # Avis positif
            cursor.execute('UPDATE "Products" SET eco_rating = eco_rating + 1 WHERE id = %s AND eco_rating < 5;', (product_id,))
            connection.commit()  # ✅ Assurer que la mise à jour est appliquée
            cursor.execute('SELECT eco_rating FROM "Products" WHERE id = %s;', (product_id,))  # 🔹 Vérifier la nouvelle valeur
            updated_value = cursor.fetchone()
            print(f"✅ eco_rating augmenté pour le produit {product_id}. Nouvelle valeur : {updated_value}")

        elif polarity < -0.1:  # Avis négatif
            cursor.execute('UPDATE "Products" SET eco_rating = eco_rating - 1 WHERE id = %s AND eco_rating > 1 RETURNING eco_rating;', (product_id,))
            updated_value = cursor.fetchone()
            print(f"✅ eco_rating diminué pour le produit {product_id}. Nouvelle valeur : {updated_value}")
        else:
            print(f"ℹ️ Aucun changement de eco_rating pour le produit {product_id}")

        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({
            "message": "Test réussi",
            "review": review_text,
            "sentiment": polarity
        }), 200

    except Exception as e:
        print(f"❌ Erreur serveur : {e}")
        return jsonify({"error": str(e)}), 500


# 📌 Lancer le serveur Flask
if __name__ == "__main__":
    app.run(debug=True, port=5002)
