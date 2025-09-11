const { Sequelize } = require("sequelize");

const DATABASE_URL = process.env.DATABASE_URL;
let sequelize;

if (DATABASE_URL) {
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
  const DB_NAME = process.env.DB_NAME || "eco_recommendation";
  const DB_USER = process.env.DB_USER || "postgres";
  const DB_PASSWORD = process.env.DB_PASSWORD || "postgres";
  const DB_HOST = process.env.DB_HOST || "postgres";
  const DB_PORT = process.env.DB_PORT || 5432;
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