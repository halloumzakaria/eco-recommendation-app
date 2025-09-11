const Product = require("../models/Product");
const { Op } = require("sequelize");
const axios = require("axios");

// 📌 Ajouter un produit
exports.createProduct = async (req, res) => {
  try {
    console.log("📦 Requête reçue:", req.body); // 🧪 Ajout temporaire

    const { name, description, price, category, eco_rating, image_url } = req.body;

    const product = await Product.create({ name, description, price, category, eco_rating, image_url });

    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Erreur lors de la création du produit :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


// 📌 Récupérer tous les produits
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des produits :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 📌 Récupérer un produit par ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ msg: "Produit non trouvé" });
        res.json(product);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération du produit :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 📌 Mettre à jour un produit
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, eco_rating, image_url } = req.body;
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ msg: "Produit non trouvé" });

        await product.update({ name, description, price, category, eco_rating, image_url });
        res.json({ msg: "Produit mis à jour avec succès", product });
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour du produit :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 📌 Supprimer un produit
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ msg: "Produit non trouvé" });

        await product.destroy();
        res.json({ msg: "Produit supprimé avec succès" });
    } catch (error) {
        console.error("❌ Erreur lors de la suppression du produit :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 📌 Incrémenter les vues
exports.incrementProductView = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ msg: "Produit non trouvé" });

        product.views += 1;
        await product.save();

        res.json({ msg: "Vue ajoutée", views: product.views });
    } catch (error) {
        console.error("❌ Erreur lors de l'incrémentation des vues :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 📌 Produits populaires
exports.getPopularProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [["views", "DESC"]],
            limit: 5,
        });
        res.json(products);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des produits populaires :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 📌 Recherche intelligente avec IA (Flask)
exports.aiSearch = async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: "Paramètre de recherche manquant" });
    }

    try {
        console.log(`🔍 Backend: Searching for "${query}" via NLP API...`);
        const response = await axios.get(`http://eco-nlp:5001/ai-search?q=${encodeURIComponent(query)}`, {
            timeout: 5000 // 5 second timeout
        });
        const results = response.data.results;
        console.log(`✅ Backend: Found ${results.length} results from NLP API`);
        res.json(results);
    } catch (error) {
        console.error("❌ Backend: NLP API Error:", error.message);
        console.error("❌ Backend: Error details:", error.response?.data || error.code);
        
        // Fallback: Simple database search if NLP API is not available
        try {
            console.log("🔄 Backend: Falling back to simple database search...");
            const products = await Product.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${query}%` } },
                        { description: { [Op.iLike]: `%${query}%` } },
                        { category: { [Op.iLike]: `%${query}%` } }
                    ]
                },
                limit: 10
            });
            
            const results = products.map(product => ({
                id: product.id,
                name: product.name,
                description: product.description,
                category: product.category,
                price: product.price,
                score: 1 // Basic score for fallback results
            }));
            
            console.log(`✅ Backend: Fallback search found ${results.length} results`);
            res.json(results);
        } catch (fallbackError) {
            console.error("❌ Backend: Fallback search also failed:", fallbackError.message);
            res.status(500).json({ error: "Échec de la recherche intelligente et de la recherche de base" });
        }
    }
};
