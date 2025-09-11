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
  CircularProgress
} from "@mui/material";
import {
  TrendingUp,
  ShoppingCart,
  Nature,
  Recycling,
  LocalShipping,
  Star,
  Favorite,
  Search,
  Add,
  Notifications,
  Refresh,
  ArrowForward,
  CheckCircle,
  Schedule,
  MonetizationOn
} from "@mui/icons-material";
import { green, orange, blue, red } from "@mui/material/colors";
import api from "../utils/api";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    ecoRating: 0,
    co2Saved: 0,
    recentActivity: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (!token) {
      alert("You must log in first!");
      navigate("/login");
    } else if (userData.role === 'admin') {
      // Redirect admins to admin dashboard
      navigate("/admin");
    } else {
      fetchUserData();
      fetchDashboardData();
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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate fetching dashboard data
      // In a real app, you'd fetch this from your backend
      setTimeout(() => {
        setStats({
          totalProducts: 24,
          ecoRating: 4.8,
          co2Saved: 12.5,
          recentActivity: [
            { id: 1, action: "Purchased Bamboo Toothbrush", time: "2 hours ago", type: "purchase" },
            { id: 2, action: "Rated Eco Soap 5 stars", time: "1 day ago", type: "rating" },
            { id: 3, action: "Saved 2.3kg CO₂", time: "2 days ago", type: "impact" },
            { id: 4, action: "Added Reusable Bottle to cart", time: "3 days ago", type: "cart" }
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'purchase': return <ShoppingCart color="success" />;
      case 'rating': return <Star color="warning" />;
      case 'impact': return <Nature color="success" />;
      case 'cart': return <Add color="primary" />;
      default: return <CheckCircle color="success" />;
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
      {/* Welcome Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: `linear-gradient(135deg, ${green[50]} 0%, ${green[100]} 100%)` }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: green[700],
                fontSize: '2rem',
                fontWeight: 'bold'
              }}
            >
              {getInitials(user?.name || 'U')}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ color: green[800] }}>
                Welcome to Ecosphere, {user?.name}! 🌱
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Chip
                icon={<Nature />}
                label="Eco Champion"
                color="success"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <IconButton color="primary" onClick={fetchDashboardData}>
              <Refresh />
            </IconButton>
            <IconButton color="primary">
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Search />}
            onClick={() => navigate('/search')}
            sx={{
              bgcolor: green[700],
              '&:hover': { bgcolor: green[800] },
              py: 2
            }}
          >
            Search Products
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ShoppingCart />}
            onClick={() => navigate('/products')}
            sx={{ py: 2, borderColor: green[700], color: green[700] }}
          >
            Browse Products
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Favorite />}
            onClick={() => navigate('/profile')}
            sx={{ py: 2, borderColor: green[700], color: green[700] }}
          >
            View Profile
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Add />}
            sx={{ py: 2, borderColor: green[700], color: green[700] }}
          >
            Add Product
          </Button>
        </Grid>
      </Grid>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center', position: 'relative', overflow: 'visible' }}>
            <CardContent>
              <Box sx={{ color: green[700], mb: 2 }}>
                <ShoppingCart sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" component="div" sx={{ color: green[700], fontWeight: 'bold' }}>
                {stats.totalProducts}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Eco Products
              </Typography>
              <Typography variant="body2" color="success.main">
                +12% this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Box sx={{ color: orange[700], mb: 2 }}>
                <Star sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" component="div" sx={{ color: orange[700], fontWeight: 'bold' }}>
                {stats.ecoRating}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Eco Rating
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stats.ecoRating * 20}
                sx={{ mt: 1, bgcolor: orange[100], '& .MuiLinearProgress-bar': { bgcolor: orange[700] } }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Box sx={{ color: blue[700], mb: 2 }}>
                <Recycling sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" component="div" sx={{ color: blue[700], fontWeight: 'bold' }}>
                {stats.co2Saved}kg
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                CO₂ Saved
              </Typography>
              <Typography variant="body2" color="success.main">
                Equivalent to 3 trees
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Box sx={{ color: red[700], mb: 2 }}>
                <TrendingUp sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" component="div" sx={{ color: red[700], fontWeight: 'bold' }}>
                85%
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Eco Score
              </Typography>
              <Typography variant="body2" color="success.main">
                Excellent!
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: green[700], display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule />
                Recent Activity
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {stats.recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.action}
                        secondary={activity.time}
                      />
                    </ListItem>
                    {index < stats.recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
              <Button
                fullWidth
                endIcon={<ArrowForward />}
                sx={{ mt: 2, color: green[700] }}
              >
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Eco Impact & Recommendations */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: green[700], display: 'flex', alignItems: 'center', gap: 1 }}>
                <Nature />
                Your Eco Impact
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  This Month's Impact
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{ mb: 1, bgcolor: green[100], '& .MuiLinearProgress-bar': { bgcolor: green[700] } }}
                />
                <Typography variant="body2" color="success.main">
                  75% of monthly goal achieved
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Carbon Footprint Reduction
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" color="success.main">
                    -{stats.co2Saved}kg CO₂
                  </Typography>
                  <Chip label="Great job!" size="small" color="success" />
                </Box>
              </Box>

              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  You're in the top 15% of eco-friendly users! Keep up the great work! 🌟
                </Typography>
              </Alert>

              <Button
                fullWidth
                variant="contained"
                startIcon={<Search />}
                sx={{
                  bgcolor: green[700],
                  '&:hover': { bgcolor: green[800] }
                }}
              >
                Discover More Eco Products
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
