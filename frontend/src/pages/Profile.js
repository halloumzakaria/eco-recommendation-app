import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress
} from "@mui/material";
import {
  Person,
  Email,
  Nature,
  ShoppingCart,
  Favorite,
  Edit,
  Save,
  Cancel,
  TrendingUp,
  LocalShipping,
  Recycling,
  Star
} from "@mui/icons-material";
import { green } from "@mui/material/colors";
import api from "../utils/api";

const Profile = () => {
    const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "" });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
    fetchUserData();
    }, [token]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/me");
      setUser(response.data);
      setEditData({
        name: response.data.name,
        email: response.data.email
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setErrorMessage("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setOpenEditDialog(true);
  };

  const handleEditSave = async () => {
    try {
      // Note: You'll need to implement the update endpoint in your backend
      // const response = await api.put("/auth/profile", editData);
      // setUser(response.data);
      setSuccessMessage("Profile updated successfully!");
      setOpenEditDialog(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Failed to update profile");
    }
  };

  const handleEditCancel = () => {
    setEditData({
      name: user.name,
      email: user.email
    });
    setOpenEditDialog(false);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} sx={{ color: green[700] }} />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Failed to load profile data</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Success/Error Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Header Card */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, background: `linear-gradient(135deg, ${green[50]} 0%, ${green[100]} 100%)` }}>
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
                  {getInitials(user.name)}
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom sx={{ color: green[800] }}>
                    {user.name}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {user.email}
                  </Typography>
                  <Chip
                    icon={<Nature />}
                    label={user.role === 'admin' ? 'Administrator' : 'Eco-Friendly User'}
                    color="success"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={handleEditClick}
                sx={{
                  bgcolor: green[700],
                  '&:hover': { bgcolor: green[800] }
                }}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Box sx={{ color: green[700], mb: 2 }}>
                <ShoppingCart sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" component="div" sx={{ color: green[700], fontWeight: 'bold' }}>
                12
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Eco Products Purchased
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Box sx={{ color: green[700], mb: 2 }}>
                <Recycling sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" component="div" sx={{ color: green[700], fontWeight: 'bold' }}>
                8.5kg
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                CO₂ Saved
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Box sx={{ color: green[700], mb: 2 }}>
                <Star sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" component="div" sx={{ color: green[700], fontWeight: 'bold' }}>
                4.8
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Eco Rating
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: green[700], display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person />
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Person color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Full Name"
                    secondary={user.name}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Email color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Address"
                    secondary={user.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Nature color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Account Type"
                    secondary={user.role === 'admin' ? 'Administrator' : 'Eco-Friendly User'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Eco Achievements */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: green[700], display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp />
                Eco Achievements
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <LocalShipping color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Carbon Neutral Shipping"
                    secondary="You've chosen eco-friendly delivery options"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Recycling color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Recycling Champion"
                    secondary="Consistently choosing recyclable products"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Favorite color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Eco Advocate"
                    secondary="Supporting sustainable brands"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            fullWidth
            variant="outlined"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Email Address"
            fullWidth
            variant="outlined"
            value={editData.email}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            startIcon={<Save />}
            variant="contained"
            sx={{ bgcolor: green[700], '&:hover': { bgcolor: green[800] } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    );
};

export default Profile;
