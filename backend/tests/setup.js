// Test setup file
const { sequelize } = require('../models');

// Setup test database
beforeAll(async () => {
  // Use test database
  process.env.NODE_ENV = 'test';
  
  // Sync database
  await sequelize.sync({ force: true });
});

// Clean up after each test
afterEach(async () => {
  // Clear all tables
  await sequelize.truncate({ cascade: true });
});

// Close database connection after all tests
afterAll(async () => {
  await sequelize.close();
});
