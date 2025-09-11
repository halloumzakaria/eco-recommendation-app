const { User, Product, UserInteraction, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

describe('Models Tests', () => {
  describe('User Model', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      const user = await User.create(userData);
      
      expect(user).toHaveProperty('id');
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });

    it('should validate required fields', async () => {
      const invalidUser = {
        name: '',
        email: 'invalid-email'
      };

      await expect(User.create(invalidUser)).rejects.toThrow();
    });

    it('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'test2@example.com',
        password: 'plainpassword',
        role: 'user'
      };

      const user = await User.create(userData);
      expect(user.password).not.toBe('plainpassword');
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash length
    });

    it('should validate email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email-format',
        password: 'password123',
        role: 'user'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('Product Model', () => {
    it('should create a product with valid data', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        price: 19.99,
        category: 'Personal Care',
        eco_rating: 4.5,
        image_url: 'https://example.com/image.jpg'
      };

      const product = await Product.create(productData);
      
      expect(product).toHaveProperty('id');
      expect(product.name).toBe(productData.name);
      expect(product.price).toBe(productData.price);
      expect(product.eco_rating).toBe(productData.eco_rating);
      expect(product.views).toBe(0); // Default value
    });

    it('should validate price is positive', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        price: -10, // Negative price
        category: 'Personal Care',
        eco_rating: 4.5,
        image_url: 'https://example.com/image.jpg'
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    it('should validate eco_rating range', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product',
        price: 19.99,
        category: 'Personal Care',
        eco_rating: 6, // Invalid rating (should be 1-5)
        image_url: 'https://example.com/image.jpg'
      };

      await expect(Product.create(productData)).rejects.toThrow();
    });

    it('should increment views', async () => {
      const product = await Product.create({
        name: 'Test Product',
        description: 'A test product',
        price: 19.99,
        category: 'Personal Care',
        eco_rating: 4.5,
        image_url: 'https://example.com/image.jpg'
      });

      expect(product.views).toBe(0);
      
      product.views += 1;
      await product.save();
      
      expect(product.views).toBe(1);
    });
  });

  describe('UserInteraction Model', () => {
    let user, product;

    beforeEach(async () => {
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });

      product = await Product.create({
        name: 'Test Product',
        description: 'A test product',
        price: 19.99,
        category: 'Personal Care',
        eco_rating: 4.5,
        image_url: 'https://example.com/image.jpg'
      });
    });

    it('should create a user interaction', async () => {
      const interactionData = {
        user_id: user.id,
        product_id: product.id,
        interaction_type: 'view'
      };

      const interaction = await UserInteraction.create(interactionData);
      
      expect(interaction).toHaveProperty('id');
      expect(interaction.user_id).toBe(user.id);
      expect(interaction.product_id).toBe(product.id);
      expect(interaction.interaction_type).toBe('view');
    });

    it('should validate interaction_type', async () => {
      const interactionData = {
        user_id: user.id,
        product_id: product.id,
        interaction_type: 'invalid_type'
      };

      await expect(UserInteraction.create(interactionData)).rejects.toThrow();
    });
  });

  describe('Database Relationships', () => {
    it('should handle foreign key relationships', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });

      const product = await Product.create({
        name: 'Test Product',
        description: 'A test product',
        price: 19.99,
        category: 'Personal Care',
        eco_rating: 4.5,
        image_url: 'https://example.com/image.jpg'
      });

      const interaction = await UserInteraction.create({
        user_id: user.id,
        product_id: product.id,
        interaction_type: 'view'
      });

      expect(interaction.user_id).toBe(user.id);
      expect(interaction.product_id).toBe(product.id);
    });
  });
});
