// src/App.js
import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Eager small components
import Navbar   from "./components/Navbar";
import Login    from "./components/Login";
import Register from "./components/Register";

// Lazy load heavier pages for faster first paint
const Dashboard       = lazy(() => import("./pages/Dashboard"));
const AdminDashboard  = lazy(() => import("./pages/AdminDashboard"));
const Products        = lazy(() => import("./pages/Products"));
const ProductDetails  = lazy(() => import("./pages/ProductDetails")); // <— new detail page
const Profile         = lazy(() => import("./pages/Profile"));
const SearchBar       = lazy(() => import("./components/SearchBar"));

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = (() => {
        try { return JSON.parse(localStorage.getItem("user") || "null"); }
        catch { return null; }
      })();
      setIsAuthenticated(!!token);
      setUser(userData);
    };

    // On mount + listen to cross-tab updates
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <Router>
      {isAuthenticated && <Navbar />}

      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {isAuthenticated ? (
            <>
              {isAdmin ? (
                // Admin routes
                <>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetails />} /> {/* detail route */}
                  <Route path="/search" element={<SearchBar />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
                  <Route path="/" element={<Navigate to="/admin" replace />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </>
              ) : (
                // User routes
                <>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetails />} /> {/* detail route */}
                  <Route path="/search" element={<SearchBar />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </>
              )}
            </>
          ) : (
            // Not authenticated → funnel to login
            <>
              {/* If you want the AI search to be public, move /search up here */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
