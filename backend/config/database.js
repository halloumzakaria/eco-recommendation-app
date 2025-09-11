const { Sequelize } = require("sequelize");

const DATABASE_URL = process.env.DATABASE_URL;
let sequelize;

console.log("🔍 DATABASE_URL:", DATABASE_URL ? "✅ Set" : "❌ Not set");

if (DATABASE_URL) {
  console.log("🔗 Using Railway DATABASE_URL");
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  console.log("⚠️  No DATABASE_URL, using fallback configuration");
  const DB_NAME = process.env.POSTGRES_DB || process.env.DB_NAME || "eco_recommendation";
  const DB_USER = process.env.POSTGRES_USER || process.env.DB_USER || "postgres";
  const DB_PASSWORD = process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || "postgres";
  const DB_HOST = process.env.POSTGRES_HOST || process.env.DB_HOST || "localhost";
  const DB_PORT = process.env.POSTGRES_PORT || process.env.DB_PORT || 5432;
  
  console.log("🔗 Database config:", { DB_HOST, DB_PORT, DB_NAME, DB_USER });
  
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres",
    logging: false,
  });
}

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL successfully!");
  } catch (error) {
    console.error("❌ BDD error:", error);
  }
}

testConnection();

module.exports = sequelize;