const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/authMiddleware');

// All cart routes require authentication
router.use(authMiddleware);

// Get user's cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/items', cartController.addItem);

// Update item quantity
router.put('/items/:itemId', cartController.updateItem);

// Remove item from cart
router.delete('/items/:itemId', cartController.removeItem);

// Clear entire cart
router.delete('/clear', cartController.clearCart);

// Complete checkout
router.post('/checkout', cartController.checkout);

module.exports = router;

