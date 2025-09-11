// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar    from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Products  from "./pages/Products";
import Profile   from "./pages/Profile";
import Login     from "./components/Login";
import React, { useState, useEffect } from "react";
import Register  from "./components/Register";
import SearchBar from "./components/SearchBar";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setIsAuthenticated(!!token);
      setUser(userData);
    };
    
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkAuth);
    
    // Check auth on mount
    checkAuth();
    
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <Router>
      {isAuthenticated && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {isAuthenticated ? (
          <>
            {/* Protected Routes */}
            {isAdmin ? (
              // Admin Routes
              <>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/search" element={<SearchBar />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </>
            ) : (
              // User Routes
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/search" element={<SearchBar />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            )}
          </>
        ) : (
          /* If not authenticated, redirect to login */
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
