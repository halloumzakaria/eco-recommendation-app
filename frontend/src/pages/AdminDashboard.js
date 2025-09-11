import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Paper,
  IconButton,
  Badge,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import {
  AdminPanelSettings,
  People,
  ShoppingCart,
  Nature,
  Recycling,
  TrendingUp,
  Star,
  Add,
  Edit,
  Delete,
  Visibility,
  Notifications,
  Refresh,
  BarChart,
  PieChart,
  Settings,
  Security,
  Analytics
} from "@mui/icons-material";
import { green, orange, blue, red, purple } from "@mui/material/colors";
import api from "../utils/api";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    recentUsers: [],
    recentProducts: []
  });
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [openEditProductDialog, setOpenEditProductDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [userFormData, setUserFormData] = useState({ name: "", email: "", role: "user" });
  const [productFormData, setProductFormData] = useState({ name: "", description: "", price: "", category: "", eco_rating: "", image_url: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (!token) {
      alert("You must log in first!");
      navigate("/login");
    } else if (userData.role !== 'admin') {
      alert("Access denied. Admin privileges required.");
      navigate("/dashboard");
    } else {
      fetchUserData();
      fetchAdminData();
    }
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch users and products from backend
      const [usersResponse, productsResponse] = await Promise.all([
        api.get("/auth/users"),
        api.get("/products")
      ]);
      
      const users = usersResponse.data;
      const products = productsResponse.data;
      
      setAdminStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: 3421, // Mock data for now
        revenue: 45680, // Mock data for now
        recentUsers: users, // Show all users
        recentProducts: products // Show all products
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setErrorMessage("Failed to load admin data");
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // User CRUD functions
  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setOpenEditUserDialog(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        setLoading(true);
        await api.delete(`/auth/users/${userId}`);
        setSuccessMessage("User deleted successfully!");
        fetchAdminData(); // Refresh data
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Error deleting user:", error);
        setErrorMessage(error.response?.data?.message || "Failed to delete user");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      
      await api.put(`/auth/users/${editingUser.id}`, userFormData);
      setSuccessMessage("User updated successfully!");
      setOpenEditUserDialog(false);
      fetchAdminData(); // Refresh data
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating user:", error);
      setErrorMessage(error.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // Product CRUD functions
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      eco_rating: product.eco_rating,
      image_url: product.image_url
    });
    setOpenEditProductDialog(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        setLoading(true);
        await api.delete(`/products/${productId}`);
        setSuccessMessage("Product deleted successfully!");
        fetchAdminData(); // Refresh data
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Error deleting product:", error);
        setErrorMessage(error.response?.data?.message || "Failed to delete product");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateProduct = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      
      await api.put(`/products/${editingProduct.id}`, productFormData);
      setSuccessMessage("Product updated successfully!");
      setOpenEditProductDialog(false);
      fetchAdminData(); // Refresh data
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating product:", error);
      setErrorMessage(error.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} sx={{ color: green[700] }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Admin Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: `linear-gradient(135deg, ${purple[50]} 0%, ${purple[100]} 100%)` }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: purple[700],
                fontSize: '2rem',
                fontWeight: 'bold'
              }}
            >
              {getInitials(user?.name || 'A')}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ color: purple[800] }}>
                Ecosphere Admin Dashboard 👑
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Chip
                icon={<AdminPanelSettings />}
                label="Administrator"
                color="secondary"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <IconButton color="primary" onClick={fetchAdminData}>
              <Refresh />
            </IconButton>
            <IconButton color="primary">
              <Badge badgeContent={7} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Quick Admin Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<People />}
            onClick={() => setOpenUserDialog(true)}
            sx={{
              bgcolor: purple[700],
              '&:hover': { bgcolor: purple[800] },
              py: 2
            }}
          >
            Manage Users
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ShoppingCart />}
            onClick={() => window.location.href = '/products'}
            sx={{ py: 2, borderColor: purple[700], color: purple[700] }}
          >
            Manage Products
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Analytics />}
            sx={{ py: 2, borderColor: purple[700], color: purple[700] }}
          >
            View Analytics
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Settings />}
            sx={{ py: 2, borderColor: purple[700], color: purple[700] }}
          >
            System Settings
          </Button>
        </Grid>
      </Grid>

      {/* Admin Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Box sx={{ color: blue[700], mb: 2 }}>
                <People sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" component="div" sx={{ color: blue[700], fontWeight: 'bold' }}>
                {adminStats.totalUsers.toLocaleString()}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="body2" color="success.main">
                +8% this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Box sx={{ color: green[700], mb: 2 }}>
                <ShoppingCart sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" component="div" sx={{ color: green[700], fontWeight: 'bold' }}>
                {adminStats.totalProducts}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Products
              </Typography>
              <Typography variant="body2" color="success.main">
                +3 new this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Box sx={{ color: orange[700], mb: 2 }}>
                <TrendingUp sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" component="div" sx={{ color: orange[700], fontWeight: 'bold' }}>
                {adminStats.totalOrders.toLocaleString()}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="body2" color="success.main">
                +15% this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Box sx={{ color: red[700], mb: 2 }}>
                <BarChart sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" component="div" sx={{ color: red[700], fontWeight: 'bold' }}>
                ${adminStats.revenue.toLocaleString()}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Revenue
              </Typography>
              <Typography variant="body2" color="success.main">
                +22% this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: purple[700], display: 'flex', alignItems: 'center', gap: 1 }}>
                <People />
                All Users
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {adminStats.recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            color={user.role === 'admin' ? 'secondary' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary" onClick={() => handleEditUser(user)}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Products */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: purple[700], display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCart />
                All Products
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {adminStats.recentProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>
                          <Chip
                            label={product.views || 0}
                            color={product.views > 50 ? 'success' : product.views > 20 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary" onClick={() => handleEditProduct(product)}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteProduct(product.id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Status */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: purple[700], display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security />
            System Status
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: '50%' }} />
                <Typography variant="body2">Database: Online</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: '50%' }} />
                <Typography variant="body2">API: Online</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: '50%' }} />
                <Typography variant="body2">NLP Service: Online</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 12, height: 12, bgcolor: 'warning.main', borderRadius: '50%' }} />
                <Typography variant="body2">Backup: Pending</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* User Management Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>User Management</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Manage user accounts, roles, and permissions.
          </Typography>
          <TextField
            fullWidth
            label="Search users..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ bgcolor: purple[700], '&:hover': { bgcolor: purple[800] } }}
          >
            Add New User
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Product Management Dialog */}
      <Dialog open={openProductDialog} onClose={() => setOpenProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Product Management</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Manage products, inventory, and categories.
          </Typography>
          <TextField
            fullWidth
            label="Search products..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ bgcolor: purple[700], '&:hover': { bgcolor: purple[800] } }}
          >
            Add New Product
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProductDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditUserDialog} onClose={() => setOpenEditUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={userFormData.name}
                onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                  label="Role"
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditUserDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateUser}
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: purple[700], '&:hover': { bgcolor: purple[800] } }}
          >
            {loading ? 'Updating...' : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={openEditProductDialog} onClose={() => setOpenEditProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                value={productFormData.name}
                onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={productFormData.description}
                onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price ($)"
                type="number"
                value={productFormData.price}
                onChange={(e) => setProductFormData({...productFormData, price: e.target.value})}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={productFormData.category}
                  onChange={(e) => setProductFormData({...productFormData, category: e.target.value})}
                  label="Category"
                >
                  <MenuItem value="Personal Care">Personal Care</MenuItem>
                  <MenuItem value="Kitchen">Kitchen</MenuItem>
                  <MenuItem value="Bathroom">Bathroom</MenuItem>
                  <MenuItem value="Oral Care">Oral Care</MenuItem>
                  <MenuItem value="Hair Care">Hair Care</MenuItem>
                  <MenuItem value="Cleaning">Cleaning</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Eco Rating (1-5)"
                type="number"
                value={productFormData.eco_rating}
                onChange={(e) => setProductFormData({...productFormData, eco_rating: e.target.value})}
                inputProps={{ min: 1, max: 5, step: 0.1 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Image URL"
                value={productFormData.image_url}
                onChange={(e) => setProductFormData({...productFormData, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditProductDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateProduct}
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: purple[700], '&:hover': { bgcolor: purple[800] } }}
          >
            {loading ? 'Updating...' : 'Update Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
