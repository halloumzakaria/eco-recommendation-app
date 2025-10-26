// backend/scripts/check-reviews-table.js
const sequelize = require('../config/database');

async function checkReviewsTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Check if reviews table exists
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews'
      );
    `);
    
    const exists = results[0].exists;
    
    if (exists) {
      console.log('✅ Reviews table EXISTS');
      
      // Get table structure
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'reviews'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'}`);
      });
      
      // Get row count
      const [count] = await sequelize.query('SELECT COUNT(*) as count FROM reviews;');
      console.log(`\n📊 Total reviews: ${count[0].count}`);
      
    } else {
      console.log('❌ Reviews table DOES NOT exist');
      console.log('\n⚠️  You need to create it. Options:');
      console.log('  1. Run: node backend/scripts/create-reviews-table.js');
      console.log('  2. Or let Sequelize sync automatically when server starts');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkReviewsTable();

