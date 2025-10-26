import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Chip, Box, IconButton, Badge } from "@mui/material";
import { green, purple } from "@mui/material/colors";
import { AdminPanelSettings, Person, ShoppingCart } from "@mui/icons-material";

const Navbar = () => {
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role === 'admin';

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        // Force page reload to update authentication state
        window.location.href = "/login";
    };

    return (
        <AppBar position="static" sx={{ bgcolor: isAdmin ? purple[700] : green[700] }}>
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        component="span"
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '16px'
                        }}
                    >
                        E
                    </Box>
                    Ecosphere
                </Typography>
                {!isAuthenticated ? (
                    <>
                        <Button color="inherit" component={Link} to="/login">Login</Button>
                        <Button color="inherit" component={Link} to="/register">Register</Button>
                    </>
                ) : (
                    <>
                        <Box display="flex" alignItems="center" gap={1} sx={{ mr: 2 }}>
                            <Chip
                                icon={isAdmin ? <AdminPanelSettings /> : <Person />}
                                label={isAdmin ? "Admin" : "User"}
                                color={isAdmin ? "secondary" : "primary"}
                                variant="outlined"
                                size="small"
                                sx={{ color: 'white', borderColor: 'white' }}
                            />
                        </Box>
                        
                        {isAdmin ? (
                            // Admin Navigation
                            <>
                                <Button color="inherit" component={Link} to="/admin">Admin Dashboard</Button>
                                <Button color="inherit" component={Link} to="/products">Products</Button>
                                <Button color="inherit" component={Link} to="/search">🔍 AI Search</Button>
                                <Button color="inherit" component={Link} to="/profile">Profile</Button>
                                <IconButton color="inherit" component={Link} to="/cart" sx={{ mr: 1 }}>
                                    <ShoppingCart />
                                </IconButton>
                                <Button color="inherit" onClick={handleLogout}>Logout</Button>
                            </>
                        ) : (
                            // User Navigation
                            <>
                                <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
                                <Button color="inherit" component={Link} to="/products">Products</Button>
                                <Button color="inherit" component={Link} to="/search">🔍 AI Search</Button>
                                <Button color="inherit" component={Link} to="/profile">Profile</Button>
                                <IconButton color="inherit" component={Link} to="/cart" sx={{ mr: 1 }}>
                                    <ShoppingCart />
                                </IconButton>
                                <Button color="inherit" onClick={handleLogout}>Logout</Button>
                            </>
                        )}
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
