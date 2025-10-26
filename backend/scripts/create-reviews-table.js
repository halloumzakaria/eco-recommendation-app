// backend/scripts/create-reviews-table.js
const sequelize = require('../config/database');
const Review = require('../models/Review');

async function createReviewsTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Check if table already exists
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews'
      );
    `);
    
    if (results[0].exists) {
      console.log('ℹ️  Reviews table already exists');
      process.exit(0);
    }
    
    // Create the table using Sequelize sync
    console.log('📝 Creating reviews table...');
    await Review.sync({ force: false, alter: true });
    
    console.log('✅ Reviews table created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating reviews table:', error.message);
    process.exit(1);
  }
}

createReviewsTable();

