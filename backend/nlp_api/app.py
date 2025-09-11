from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import psycopg2
import json
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Download NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
except:
    pass

# 🔹 Initialisation de l'application Flask
app = Flask(__name__)
CORS(app)  # Activer les CORS pour permettre les requêtes externes

# 🔹 Configuration PostgreSQL
DB_NAME = "eco_recommendation"
DB_USER = "postgres"
DB_PASSWORD = "postgres"
DB_HOST = "postgres"
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

# 🤖 AI Search Engine Class
class AISearchEngine:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        
        # Advanced Intent Recognition Patterns
        self.intent_patterns = {
            'facial_care': [
                r'\b(face|visage|facial|facial care|soin visage|skin|peau)\b',
                r'\b(what can i use for my face|que puis-je utiliser pour mon visage)\b',
                r'\b(something for my face|quelque chose pour mon visage)\b',
                r'\b(face products|produits visage|facial products|produits faciaux)\b',
                r'\b(need.*face|want.*face|looking.*face|for.*face|use.*face)\b',
                r'\b(soap|savon|cleanser|nettoyant|moisturizer|hydratant)\b',
                r'\b(face|facial|skin)\b.*\b(use|need|want|looking|for)\b',
                r'\b(use|need|want|looking|for)\b.*\b(face|facial|skin)\b'
            ],
            'hair_care': [
                r'\b(hair|cheveux|shampoo|shampoing|brush|brosse|comb|peigne)\b',
                r'\b(hair care|soin cheveux|hair products|produits cheveux)\b',
                r'\b(something for my hair|quelque chose pour mes cheveux)\b',
                r'\b(need.*hair|want.*hair|looking.*hair|for.*hair)\b',
                r'\b(hair.*brush|brush.*hair|hair.*care|care.*hair)\b',
                r'\b(bamboo.*hair|hair.*bamboo)\b'
            ],
            'oral_care': [
                r'\b(teeth|dents|tooth|dent|toothbrush|brosse|toothpaste|dentifrice)\b',
                r'\b(oral care|soin buccal|dental|dentaire|oral hygiene|hygiène buccale)\b',
                r'\b(need.*teeth|want.*teeth|looking.*teeth|need.*oral|want.*oral|looking.*oral)\b',
                r'\b(oral|buccal|dental|dentaire)\b.*\b(hygiene|hygiène|care|soin|products|produits)\b',
                r'\b(hygiene|hygiène|care|soin|products|produits)\b.*\b(oral|buccal|dental|dentaire)\b'
            ],
            'kitchen': [
                r'\b(kitchen|cuisine|cook|cooking|cuisiner|utensils|ustensiles)\b',
                r'\b(plate|assiette|cup|tasse|bottle|bouteille|straw|paille)\b',
                r'\b(something for the kitchen|quelque chose pour la cuisine)\b',
                r'\b(need.*kitchen|want.*kitchen|looking.*kitchen)\b'
            ],
            'bathroom': [
                r'\b(bathroom|salle de bain|bath|bain|soap|savon|towel|serviette)\b',
                r'\b(hygiene|hygiène|clean|nettoyer|wash|laver)\b',
                r'\b(need.*bathroom|want.*bathroom|looking.*bathroom)\b'
            ],
            'eco_friendly': [
                r'\b(eco|ecological|écologique|green|vert|sustainable|durable)\b',
                r'\b(bamboo|bambou|reusable|réutilisable|biodegradable|biodégradable)\b',
                r'\b(natural|naturel|organic|bio|environmental|environnemental)\b',
                r'\b(something eco-friendly|quelque chose d\'écologique)\b',
                r'\b(need.*eco|want.*eco|looking.*eco)\b'
            ],
            'materials': [
                r'\b(wood|bois|bamboo|bambou|glass|verre|metal|métal|steel|acier)\b',
                r'\b(cotton|coton|fabric|tissu|ceramic|céramique)\b'
            ],
            'cleaning': [
                r'\b(clean|nettoyer|cleaning|nettoyage|soap|savon|wash|laver)\b',
                r'\b(need.*clean|want.*clean|looking.*clean)\b'
            ]
        }
    
    def preprocess_text(self, text):
        """Advanced text preprocessing with lemmatization"""
        if not text:
            return ""
        
        # Convert to lowercase and remove special characters
        text = re.sub(r'[^a-zA-Z\s]', ' ', text.lower())
        
        try:
            # Tokenize and lemmatize
            tokens = word_tokenize(text)
            tokens = [self.lemmatizer.lemmatize(token) for token in tokens]
            # Remove stop words and short words
            tokens = [token for token in tokens if token not in self.stop_words and len(token) > 2]
            return ' '.join(tokens)
        except:
            return text
    
    def detect_intent(self, query):
        """Advanced intent detection with confidence scoring"""
        try:
            query_lower = query.lower()
            intent_scores = {}
            
            for intent, patterns in self.intent_patterns.items():
                score = 0
                for pattern in patterns:
                    matches = re.findall(pattern, query_lower, re.IGNORECASE)
                    score += len(matches) * 3
                
                # Additional scoring based on word importance
                query_words = set(self.preprocess_text(query).split())
                important_words = {
                    'facial_care': {'face', 'facial', 'skin', 'soap', 'cleanser', 'moisturizer', 'hygiene', 'care', 'use', 'my'},
                    'hair_care': {'hair', 'shampoo', 'brush', 'comb', 'care'},
                    'oral_care': {'teeth', 'tooth', 'brush', 'toothpaste', 'dental', 'oral', 'hygiene'},
                    'kitchen': {'kitchen', 'cook', 'utensil', 'plate', 'cup', 'bottle'},
                    'bathroom': {'bathroom', 'soap', 'towel', 'hygiene', 'clean'},
                    'eco_friendly': {'eco', 'green', 'sustainable', 'bamboo', 'natural', 'organic'},
                    'materials': {'wood', 'glass', 'metal', 'cotton', 'bamboo', 'ceramic'},
                    'cleaning': {'clean', 'soap', 'wash', 'hygiene'}
                }
                
                if intent in important_words:
                    word_overlap = len(query_words.intersection(important_words[intent]))
                    score += word_overlap * 2
                
                intent_scores[intent] = score
            
            if intent_scores:
                top_intent = max(intent_scores.items(), key=lambda x: x[1])
                return top_intent[0], top_intent[1]
            return 'none', 0
        except Exception as e:
            print(f"Error in detect_intent: {e}")
            return 'none', 0
    
    def calculate_simple_similarity(self, query, product_texts):
        """Calculate simple text similarity without heavy dependencies"""
        if not product_texts:
            return []
        
        processed_query = self.preprocess_text(query).split()
        similarities = []
        
        for text in product_texts:
            processed_text = self.preprocess_text(text).split()
            
            # Calculate Jaccard similarity
            query_words = set(processed_query)
            text_words = set(processed_text)
            
            if not query_words or not text_words:
                similarities.append(0)
                continue
                
            intersection = len(query_words.intersection(text_words))
            union = len(query_words.union(text_words))
            similarity = intersection / union if union > 0 else 0
            similarities.append(similarity)
        
        return similarities

# Initialize AI Search Engine
ai_engine = AISearchEngine()

# �� **Route principale pour analyser un avis et mettre à jour eco_rating**
@app.route("/analyze_review", methods=["POST"])
def analyze_review():
    try:
        data = request.json
        product_id = data.get("product_id", 0)
        review_text = data.get("review", "")

        print(f"📌 Avis reçu : {review_text} pour le produit {product_id}")

        # 🔹 Analyse NLP avec TextBlob
        analysis = TextBlob(review_text)
        polarity = analysis.sentiment.polarity
        print(f"�� Score de sentiment : {polarity}")

        # 🔹 Connexion à PostgreSQL
        connection = get_db_connection()
        cursor = connection.cursor()

        # 🔹 Vérifier si le produit existe
        cursor.execute('SELECT id, eco_rating FROM "Products" WHERE id = %s;', (product_id,))
        product = cursor.fetchone()

        if not product:
            print(f"❌ ERREUR : Le produit {product_id} n'existe pas dans la base de données.")
            return jsonify({"error": "Produit non trouvé"}), 404

        # �� Exécuter la mise à jour du eco_rating
        if polarity > 0.1:  # Avis positif
            cursor.execute('UPDATE "Products" SET eco_rating = eco_rating + 1 WHERE id = %s AND eco_rating < 5;', (product_id,))
            connection.commit()
            cursor.execute('SELECT eco_rating FROM "Products" WHERE id = %s;', (product_id,))
            updated_value = cursor.fetchone()
            print(f"✅ eco_rating augmenté pour le produit {product_id}. Nouvelle valeur : {updated_value}")

        elif polarity < -0.1:  # Avis négatif
            cursor.execute('UPDATE "Products" SET eco_rating = eco_rating - 1 WHERE id = %s AND eco_rating > 1;', (product_id,))
            connection.commit()
            cursor.execute('SELECT eco_rating FROM "Products" WHERE id = %s;', (product_id,))
            updated_value = cursor.fetchone()
            print(f"✅ eco_rating diminué pour le produit {product_id}. Nouvelle valeur : {updated_value}")
        else:
            print(f"ℹ️ Aucun changement de eco_rating pour le produit {product_id}")

        cursor.close()
        connection.close()

        return jsonify({
            "message": "Analyse réussie",
            "review": review_text,
            "sentiment": polarity
        }), 200

    except Exception as e:
        print(f"❌ Erreur serveur : {e}")
        return jsonify({"error": str(e)}), 500

# 🤖 **Advanced AI-Powered Search with Real NLP**
@app.route("/ai-search", methods=["GET"])
def ai_search():
    try:
        query = request.args.get("q", "").strip()
        if not query:
            return jsonify({"results": []})

        print(f"🤖 AI Search: Processing query '{query}'")

        # Get all products
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute('SELECT id, name, description, category, price, eco_rating FROM "Products"')
        products = cursor.fetchall()
        cursor.close()
        connection.close()

        if not products:
            return jsonify({"results": []})

        # Prepare product data
        product_data = []
        product_texts = []
        
        for product in products:
            product_id, name, description, category, price, eco_rating = product
            product_text = f"{name} {description} {category}"
            product_data.append({
                'id': product_id,
                'name': name,
                'description': description or "",
                'category': category or "",
                'price': float(price) if price else 0.0,
                'eco_rating': float(eco_rating) if eco_rating else 0.0
            })
            product_texts.append(product_text)

        # 1. Intent Detection
        detected_intent, intent_confidence = ai_engine.detect_intent(query)
        print(f"�� Detected intent: {detected_intent} (confidence: {intent_confidence})")

        # 2. Simple Text Similarity
        semantic_scores = ai_engine.calculate_simple_similarity(query, product_texts)

        # 3. Advanced Product Scoring
        results = []
        for i, product in enumerate(product_data):
            total_score = 0
            score_breakdown = {}
            
            # 1. Intent-based scoring (70% weight) - Primary factor
            if detected_intent != 'none' and intent_confidence > 0:
                intent_score = 0
                product_text = f"{product['name']} {product['description']} {product['category']}".lower()
                
                if detected_intent == 'facial_care' and any(word in product_text for word in ['soap', 'savon', 'face', 'facial', 'skin', 'hygiene', 'cleanser', 'moisturizer']):
                    intent_score = 10
                elif detected_intent == 'hair_care' and any(word in product_text for word in ['hair', 'cheveux', 'brush', 'brosse', 'shampoo', 'bamboo']):
                    intent_score = 10
                elif detected_intent == 'oral_care' and any(word in product_text for word in ['teeth', 'dents', 'tooth', 'dent', 'toothbrush']):
                    intent_score = 8
                elif detected_intent == 'kitchen' and any(word in product_text for word in ['kitchen', 'cuisine', 'utensil', 'cup', 'bottle']):
                    intent_score = 8
                elif detected_intent == 'bathroom' and any(word in product_text for word in ['soap', 'savon', 'towel', 'hygiene']):
                    intent_score = 8
                elif detected_intent == 'eco_friendly' and any(word in product_text for word in ['bamboo', 'bambou', 'eco', 'green', 'natural', 'organic']):
                    intent_score = 10
                elif detected_intent == 'materials' and any(word in product_text for word in ['wood', 'glass', 'metal', 'cotton', 'bamboo']):
                    intent_score = 6
                elif detected_intent == 'cleaning' and any(word in product_text for word in ['soap', 'savon', 'clean', 'wash']):
                    intent_score = 7
                
                total_score += intent_score * 7.0  # 70% weight
                score_breakdown['intent'] = intent_score * 7.0
            else:
                # If no intent detected, use semantic similarity
                semantic_score = semantic_scores[i] if i < len(semantic_scores) else 0
                total_score += semantic_score * 7.0  # 70% weight
                score_breakdown['semantic'] = semantic_score * 7.0
            
            # 2. Direct keyword matching (20% weight)
            query_words = set(ai_engine.preprocess_text(query).split())
            product_words = set(ai_engine.preprocess_text(f"{product['name']} {product['description']} {product['category']}").split())
            
            keyword_overlap = len(query_words.intersection(product_words))
            keyword_score = keyword_overlap * 2
            total_score += keyword_score * 2.0  # 20% weight
            score_breakdown['keywords'] = keyword_score * 2.0
            
            # 3. Semantic Similarity (10% weight) - Reduced weight
            semantic_score = semantic_scores[i] if i < len(semantic_scores) else 0
            total_score += semantic_score * 1.0  # 10% weight
            score_breakdown['semantic'] = score_breakdown.get('semantic', 0) + semantic_score * 1.0
            
            # Filter out completely irrelevant products based on intent
            is_relevant = True
            if detected_intent != 'none' and intent_confidence > 0:
                product_text = f"{product['name']} {product['description']} {product['category']}".lower()
                
                # For facial care, only include products that are actually for facial care
                if detected_intent == 'facial_care':
                    facial_keywords = ['soap', 'savon', 'face', 'facial', 'skin', 'hygiene', 'cleanser', 'moisturizer', 'wash', 'clean']
                    is_relevant = any(keyword in product_text for keyword in facial_keywords)
                elif detected_intent == 'hair_care':
                    hair_keywords = ['hair', 'cheveux', 'brush', 'brosse', 'shampoo', 'comb', 'peigne', 'bamboo']
                    is_relevant = any(keyword in product_text for keyword in hair_keywords)
                elif detected_intent == 'oral_care':
                    oral_keywords = ['teeth', 'dents', 'tooth', 'dent', 'toothbrush', 'toothpaste', 'dental']
                    is_relevant = any(keyword in product_text for keyword in oral_keywords)
                elif detected_intent == 'kitchen':
                    kitchen_keywords = ['kitchen', 'cuisine', 'utensil', 'cup', 'bottle', 'plate', 'cook']
                    is_relevant = any(keyword in product_text for keyword in kitchen_keywords)
                elif detected_intent == 'bathroom':
                    bathroom_keywords = ['bathroom', 'soap', 'savon', 'towel', 'hygiene', 'wash', 'clean']
                    is_relevant = any(keyword in product_text for keyword in bathroom_keywords)
            
            # Only include products with some relevance and that match the intent
            if total_score > 0 and is_relevant:
                result = {
                    "id": product['id'],
                    "name": product['name'],
                    "description": product['description'],
                    "category": product['category'],
                    "price": product['price'],
                    "score": round(total_score, 2),
                    "ai_confidence": round(semantic_score, 3),
                    "detected_intent": detected_intent,
                    "intent_confidence": intent_confidence,
                    "search_method": "ai_powered",
                    "score_breakdown": score_breakdown
                }
                results.append(result)

        # Sort by total score (highest first) and limit results
        results.sort(key=lambda x: x['score'], reverse=True)
        results = results[:10]  # Limit to top 10 results

        print(f"✅ AI Search: Found {len(results)} results with intent '{detected_intent}'")
        print(f"🔍 Top results: {[r['name'] for r in results[:3]]}")
        return jsonify({"results": results})

    except Exception as e:
        print(f"❌ AI Search Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"results": []})

# 📌 Lancer le serveur Flask
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5001)