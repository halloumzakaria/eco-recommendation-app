import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Add, Remove, Delete, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { green } from '@mui/material/colors';
import cartApi from '../utils/cartApi';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart(data.cart);
      setItems(data.items || []);
      setTotalPrice(data.totalPrice || 0);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setMessage({ type: 'error', text: 'Failed to load cart' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, currentQuantity, delta) => {
    const newQuantity = Math.max(1, currentQuantity + delta);
    try {
      await cartApi.updateItem(itemId, newQuantity);
      loadCart();
      setMessage({ type: 'success', text: 'Cart updated' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update quantity' });
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await cartApi.removeItem(itemId);
      loadCart();
      setMessage({ type: 'success', text: 'Item removed from cart' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove item' });
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await cartApi.clearCart();
        loadCart();
        setMessage({ type: 'success', text: 'Cart cleared' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to clear cart' });
    }
  }
  };

  const handleCheckout = async () => {
    try {
      const data = await cartApi.checkout();
      setMessage({ type: 'success', text: 'Checkout successful!' });
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to complete checkout' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, color: green[800], fontWeight: 'bold' }}>
        🛒 Shopping Cart
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ShoppingCartIcon sx={{ fontSize: 80, color: green[300], mb: 2 }} />
          <Typography variant="h6" sx={{ color: green[700], mb: 2 }}>
            Your cart is empty
          </Typography>
          <Button variant="contained" href="/products" sx={{ bgcolor: green[600] }}>
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {items.map((item) => (
              <Card key={item.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <img
                        src={
                          item.Product?.image_url?.[0] ||
                          'https://images.unsplash.com/photo-1520975964184-9bcd9a59e2bc?q=80&w=1200'
                        }
                        alt={item.Product?.name}
                        style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="h6" sx={{ color: green[800], fontWeight: 'bold' }}>
                        {item.Product?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        ${parseFloat(item.price_at_purchase).toFixed(2)} each
                      </Typography>
                      {item.Product?.eco_rating && (
                        <Chip
                          label={`🌿 Eco Rating: ${item.Product.eco_rating}`}
                          size="small"
                          sx={{ bgcolor: green[100], color: green[800], mb: 2 }}
                        />
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                          sx={{ border: '1px solid', borderColor: green[300] }}
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ minWidth: 40, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                          sx={{ border: '1px solid', borderColor: green[300] }}
                        >
                          <Add />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveItem(item.id)}
                          color="error"
                          sx={{ ml: 2 }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outlined"
              color="error"
              onClick={handleClearCart}
              sx={{ mt: 2 }}
            >
              Clear Cart
            </Button>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Order Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items):</Typography>
                  <Typography variant="h6" sx={{ color: green[800], fontWeight: 'bold' }}>
                    ${totalPrice.toFixed(2)}
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                  sx={{
                    bgcolor: green[600],
                    '&:hover': { bgcolor: green[700] },
                    py: 1.5,
                    fontWeight: 'bold'
                  }}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Cart;

