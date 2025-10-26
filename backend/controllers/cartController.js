const { Cart, CartItem, Product } = require("../models");

// Get user's active cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    let cart;
    
    if (userId) {
      // Find or create active cart for user
      cart = await Cart.findOrCreate({
        where: { user_id: userId, status: 'active' },
        defaults: { user_id: userId, status: 'active', total_price: 0 }
      });
      cart = cart[0];
    } else {
      return res.status(401).json({ error: 'User must be logged in' });
    }

    const items = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [{ model: Product, attributes: ['id', 'name', 'price', 'image_url', 'description', 'eco_rating'] }]
    });

    const totalPrice = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price_at_purchase) * item.quantity);
    }, 0);

    await cart.update({ total_price: totalPrice });

    res.json({ cart, items, totalPrice });
  } catch (error) {
    console.error('❌ getCart error:', error);
    res.status(500).json({ error: 'Failed to get cart' });
  }
};

// Add item to cart
exports.addItem = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User must be logged in' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find or create active cart
    const [cart] = await Cart.findOrCreate({
      where: { user_id: userId, status: 'active' },
      defaults: { user_id: userId, status: 'active', total_price: 0 }
    });

    // Check if item already exists in cart
    const existingItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id: productId }
    });

    if (existingItem) {
      // Update quantity
      await existingItem.update({ 
        quantity: existingItem.quantity + quantity 
      });
    } else {
      // Create new item
      await CartItem.create({
        cart_id: cart.id,
        product_id: productId,
        quantity: quantity,
        price_at_purchase: product.price
      });
    }

    res.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    console.error('❌ addItem error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

// Update item quantity
exports.updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User must be logged in' });
    }

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const item = await CartItem.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Verify cart belongs to user
    const cart = await Cart.findByPk(item.cart_id);
    if (cart.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await item.update({ quantity });
    res.json({ success: true, message: 'Item updated' });
  } catch (error) {
    console.error('❌ updateItem error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

// Remove item from cart
exports.removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User must be logged in' });
    }

    const item = await CartItem.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Verify cart belongs to user
    const cart = await Cart.findByPk(item.cart_id);
    if (cart.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await item.destroy();
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('❌ removeItem error:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User must be logged in' });
    }

    const cart = await Cart.findOne({
      where: { user_id: userId, status: 'active' }
    });

    if (cart) {
      await CartItem.destroy({ where: { cart_id: cart.id } });
      await cart.update({ total_price: 0 });
    }

    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('❌ clearCart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};

// Complete checkout (convert cart to order)
exports.checkout = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User must be logged in' });
    }

    const cart = await Cart.findOne({
      where: { user_id: userId, status: 'active' },
      include: [{ model: CartItem, include: [{ model: Product }] }]
    });

    if (!cart || cart.CartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Mark cart as completed
    await cart.update({ status: 'completed' });

    // Create a new active cart for future use
    await Cart.create({ user_id: userId, status: 'active', total_price: 0 });

    res.json({ 
      success: true, 
      message: 'Checkout successful',
      orderId: cart.id,
      totalPrice: cart.total_price
    });
  } catch (error) {
    console.error('❌ checkout error:', error);
    res.status(500).json({ error: 'Failed to complete checkout' });
  }
};

