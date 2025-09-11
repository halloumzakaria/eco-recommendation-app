// seed-database.js
const { Product } = require("./models");

const sampleProducts = [
  {
    name: "Bamboo Hair Brush",
    description: "Eco-friendly bamboo hair brush with natural bristles",
    price: 15.99,
    category: "hygiène",
    eco_rating: 4.5,
    image_url: "https://example.com/bamboo-brush.jpg"
  },
  {
    name: "Bamboo Toothbrush",
    description: "Biodegradable bamboo toothbrush with charcoal bristles",
    price: 8.99,
    category: "hygiène", 
    eco_rating: 4.8,
    image_url: "https://example.com/bamboo-toothbrush.jpg"
  },
  {
    name: "Reusable Glass Bottle",
    description: "BPA-free glass water bottle with bamboo cap",
    price: 22.50,
    category: "cuisine",
    eco_rating: 4.2,
    image_url: "https://example.com/glass-bottle.jpg"
  },
  {
    name: "Bamboo Kitchen Utensils Set",
    description: "Set of 6 bamboo kitchen utensils for eco-friendly cooking",
    price: 29.99,
    category: "cuisine",
    eco_rating: 4.6,
    image_url: "https://example.com/bamboo-utensils.jpg"
  },
  {
    name: "Organic Cotton Shopping Bags",
    description: "Set of 3 reusable organic cotton shopping bags",
    price: 18.75,
    category: "accessoire",
    eco_rating: 4.3,
    image_url: "https://example.com/cotton-bags.jpg"
  },
  {
    name: "Natural Soap Bar",
    description: "Handmade natural soap with essential oils",
    price: 12.99,
    category: "hygiène",
    eco_rating: 4.7,
    image_url: "https://example.com/natural-soap.jpg"
  },
  {
    name: "Bamboo Yoga Mat",
    description: "Non-slip bamboo yoga mat with carrying strap",
    price: 45.00,
    category: "sport",
    eco_rating: 4.4,
    image_url: "https://example.com/bamboo-yoga-mat.jpg"
  },
  {
    name: "Metal Straw Set",
    description: "Set of 4 stainless steel reusable straws with cleaning brush",
    price: 14.99,
    category: "cuisine",
    eco_rating: 4.5,
    image_url: "https://example.com/metal-straws.jpg"
  },
  {
    name: "Bamboo Coffee Cup",
    description: "Insulated bamboo coffee cup with silicone lid",
    price: 19.99,
    category: "cuisine",
    eco_rating: 4.1,
    image_url: "https://example.com/bamboo-cup.jpg"
  },
  {
    name: "Eco-Friendly Candles",
    description: "Soy wax candles with natural cotton wicks",
    price: 24.99,
    category: "décoration",
    eco_rating: 4.6,
    image_url: "https://example.com/eco-candles.jpg"
  }
];

async function seedDatabase() {
  try {
    console.log("🌱 Seeding database with sample products...");
    
    // Clear existing products
    await Product.destroy({ where: {} });
    console.log("✅ Cleared existing products");
    
    // Add sample products
    for (const product of sampleProducts) {
      await Product.create(product);
      console.log(`✅ Added: ${product.name}`);
    }
    
    console.log(`🎉 Successfully seeded ${sampleProducts.length} products!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
