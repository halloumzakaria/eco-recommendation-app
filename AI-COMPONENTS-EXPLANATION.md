# 🤖 AI Components in Eco-Recommendation App - Complete Explanation

## 📋 **Overview**
This document contains all the AI/NLP components used in the eco-recommendation app. Use this to ask ChatGPT or other AI tools to explain how each component works.

---

## 🧠 **1. AI Search Engine Class**

```python
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
```

**🤖 Ask ChatGPT:** "Explain how this intent recognition system works. What are regex patterns and how do they detect user intent in natural language queries?"

---

## 📝 **2. Text Preprocessing Function**

```python
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
```

**🤖 Ask ChatGPT:** "Explain text preprocessing in NLP. What is tokenization, lemmatization, and stop word removal? Why are these steps important?"

---

## 🎯 **3. Intent Detection Algorithm**

```python
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
```

**🤖 Ask ChatGPT:** "Explain how this intent detection algorithm works. What is confidence scoring and how does it determine the most likely user intent?"

---

## 🔍 **4. Text Similarity Calculation**

```python
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
```

**🤖 Ask ChatGPT:** "Explain Jaccard similarity in text analysis. How does it measure similarity between two sets of words? What are the advantages and limitations?"

---

## 🧮 **5. Advanced Product Scoring System**

```python
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
```

**🤖 Ask ChatGPT:** "Explain this weighted scoring system for product recommendations. How do the different weights (70%, 20%, 10%) affect the final results? What is the purpose of each scoring component?"

---

## 🎭 **6. Sentiment Analysis with TextBlob**

```python
@app.route("/analyze_review", methods=["POST"])
def analyze_review():
    try:
        data = request.json
        product_id = data.get("product_id", 0)
        review_text = data.get("review", "")

        # 🔹 Analyse NLP avec TextBlob
        analysis = TextBlob(review_text)
        polarity = analysis.sentiment.polarity

        # 🔹 Update eco_rating based on sentiment
        if polarity > 0.1:  # Avis positif
            cursor.execute('UPDATE "Products" SET eco_rating = eco_rating + 1 WHERE id = %s AND eco_rating < 5;', (product_id,))
        elif polarity < -0.1:  # Avis négatif
            cursor.execute('UPDATE "Products" SET eco_rating = eco_rating - 1 WHERE id = %s AND eco_rating > 1;', (product_id,))

        return jsonify({
            "message": "Analyse réussie",
            "review": review_text,
            "sentiment": polarity
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

**🤖 Ask ChatGPT:** "Explain sentiment analysis with TextBlob. What is polarity in sentiment analysis? How does it determine if a review is positive, negative, or neutral?"

---

## 🚀 **7. Complete AI Search Pipeline**

```python
@app.route("/ai-search", methods=["GET"])
def ai_search():
    try:
        query = request.args.get("q", "").strip()
        
        # Get all products from database
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute('SELECT id, name, description, category, price, eco_rating FROM "Products"')
        products = cursor.fetchall()
        
        # Prepare product data
        product_data = []
        product_texts = []
        
        for product in products:
            product_id, name, description, category, price, eco_rating = product
            product_text = f"{name} {description} {category}"
            product_data.append({
                'id': product_id, 'name': name, 'description': description or "",
                'category': category or "", 'price': float(price) if price else 0.0,
                'eco_rating': float(eco_rating) if eco_rating else 0.0
            })
            product_texts.append(product_text)

        # 1. Intent Detection
        detected_intent, intent_confidence = ai_engine.detect_intent(query)

        # 2. Simple Text Similarity
        semantic_scores = ai_engine.calculate_simple_similarity(query, product_texts)

        # 3. Advanced Product Scoring (as shown above)
        results = []
        # ... scoring logic ...
        
        # Sort by total score and return top results
        results.sort(key=lambda x: x['score'], reverse=True)
        results = results[:10]
        
        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"results": []})
```

**🤖 Ask ChatGPT:** "Explain this complete AI search pipeline. How do all the components work together to provide intelligent product recommendations? What is the flow from user query to final results?"

---

## 📚 **8. Libraries and Technologies Used**

```python
# Core AI/NLP Libraries
from textblob import TextBlob          # Sentiment analysis
import nltk                            # Natural Language Toolkit
from nltk.corpus import stopwords      # Stop word removal
from nltk.tokenize import word_tokenize # Text tokenization
from nltk.stem import WordNetLemmatizer # Word lemmatization
import re                              # Regular expressions for pattern matching
import json                            # JSON data handling
import psycopg2                        # PostgreSQL database connection
```

**🤖 Ask ChatGPT:** "Explain each of these AI/NLP libraries and their specific roles in building an intelligent search system. What does each library do and why is it important?"

---

## 🎯 **Key AI Concepts to Ask About:**

1. **Intent Recognition** - How AI understands what users want
2. **Text Preprocessing** - Cleaning and preparing text for analysis
3. **Semantic Similarity** - Measuring how similar two pieces of text are
4. **Weighted Scoring** - Combining multiple factors to rank results
5. **Sentiment Analysis** - Determining if text is positive, negative, or neutral
6. **Regular Expressions** - Pattern matching for intent detection
7. **Natural Language Processing (NLP)** - Making computers understand human language
8. **Machine Learning Concepts** - How AI learns from data

---

## 💡 **Sample Questions for ChatGPT:**

- "Explain how intent recognition works in e-commerce search"
- "What is the difference between tokenization and lemmatization?"
- "How does Jaccard similarity work for text comparison?"
- "What are the advantages of weighted scoring systems?"
- "How does sentiment analysis improve product recommendations?"
- "Explain the complete pipeline from user query to search results"

---

**🌱 This AI system makes your eco-recommendation app intelligent by understanding user intent, analyzing text similarity, and providing relevant product suggestions based on multiple factors!**
