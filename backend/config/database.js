// backend/config/database.js
/* Centralised Sequelize setup for Railway + local dev */

const { Sequelize } = require("sequelize");
const pg = require("pg");

// Make pg accept Railway's self-signed certs (DEV).
// Safe because we also pass the same setting in dialectOptions.
// Do NOT enable strict verification here for Railway dev URLs.
pg.defaults.ssl = { rejectUnauthorized: false };

const DATABASE_URL = process.env.DATABASE_URL;
let sequelize;

function logUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    // Hide password in logs
    const host = `${u.hostname}:${u.port || 5432}${u.pathname}`;
    console.log(`🔗 Using Railway DB → ${host}`);
  } catch {
    console.log("🔗 Using Railway DB (URL parsed)");
  }
}

console.log("🔍 DATABASE_URL:", DATABASE_URL ? "✅ Set" : "❌ Not set");

if (DATABASE_URL) {
  // TIP: in dev prefer ?sslmode=no-verify in the URL to avoid TLS warnings
  // e.g. .../railway?sslmode=no-verify
  logUrl(DATABASE_URL);

  sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    // Both of these help with Railway's TLS
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 10,
      min: 0,
      idle: 10_000,
      acquire: 30_000,
    },
  });
} else {
  console.log("⚠️  No DATABASE_URL, using local fallback configuration");

  const DB_NAME = process.env.POSTGRES_DB || process.env.DB_NAME || "eco_recommendation";
  const DB_USER = process.env.POSTGRES_USER || process.env.DB_USER || "postgres";
  const DB_PASSWORD = process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || "postgres";
  const DB_HOST = process.env.POSTGRES_HOST || process.env.DB_HOST || "localhost";
  const DB_PORT = parseInt(process.env.POSTGRES_PORT || process.env.DB_PORT || "5432", 10);

  console.log("🔗 Local DB config:", { DB_HOST, DB_PORT, DB_NAME, DB_USER });

  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      idle: 10_000,
      acquire: 30_000,
    },
  });
}

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL successfully!");
  } catch (error) {
    console.error("❌ BDD error:", error);
    console.warn("⚠️  Database connection failed; the API may run in limited mode.");
  }
}

// Run a quick check on startup (non-blocking for the rest of the app)
testConnection();

module.exports = sequelize;
