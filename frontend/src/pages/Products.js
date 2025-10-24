// src/pages/Products.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  Collapse,
  IconButton,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { Add, Save, Cancel, FilterList, ExpandMore, ExpandLess } from "@mui/icons-material";

// -------------------------------------------------------
// Image helpers
// -------------------------------------------------------
const PLACEHOLDER =
  "https://images.unsplash.com/photo-1520975964184-9bcd9a59e2bc?q=80&w=1200&auto=format&fit=crop";

function normalizeImageUrl(image_url) {
  let u = image_url;
  if (Array.isArray(u)) u = u.find((x) => typeof x === "string" && x.trim().length > 3) || "";
  if (typeof u !== "string") return "";
  u = u.trim();
  if (!u) return "";
  if (u.startsWith("//")) return "https:" + u;
  if (/^https?:\/\//i.test(u)) return u;
  // Avoid auto-prefixing non-URLs (prevents infinite 404 loops)
  return "";
}

function ImageWithFallback({ src, alt, height = 200, sx }) {
  const initial = useMemo(() => normalizeImageUrl(src) || PLACEHOLDER, [src]);
  const [imgSrc, setImgSrc] = useState(initial);

  useEffect(() => {
    setImgSrc(initial);
  }, [initial]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      height={height}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      style={{
        objectFit: "cover",
        backgroundColor: "#eef2f5",
        width: "100%",
        display: "block",
        ...(sx || {}),
      }}
      onError={() => {
        if (imgSrc !== PLACEHOLDER) setImgSrc(PLACEHOLDER);
      }}
    />
  );
}

// -------------------------------------------------------
// Page
// -------------------------------------------------------
const Products = () => {
  const navigate = useNavigate();

  // Auth role (for Add dialog)
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const isAdmin = user?.role === "admin";

  // Data
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination (client-side)
  const [page, setPage] = useState(1);
  const pageSize = 24;

  // Filters
  const [filters, setFilters] = useState({
    priceRange: [0, 200],
    ecoRatingRange: [0, 5],
    category: "",
    sortBy: "relevance",
  });

  // Filter panel visibility
  const [showFilters, setShowFilters] = useState(false);

  // Review dialog
  const [openReview, setOpenReview] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [review, setReview] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  // Add dialog
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // -------------------------------------------
  // Load catalog once (big pageSize) for filters
  // -------------------------------------------
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      // grab many items (server still returns {items, total,...})
      const { data } = await api.get(`/products?page=1&pageSize=1000`);
      const items = Array.isArray(data?.items) ? data.items : [];
      setAllItems(items);
      // initialize price slider from data
      const prices = items.map((p) => Number(p.price) || 0);
      if (prices.length) {
        const min = Math.floor(Math.min(...prices));
        const max = Math.ceil(Math.max(...prices));
        setFilters((f) => ({
          ...f,
          priceRange: [min, Math.max(max, min)],
        }));
      }
    } catch (e) {
      console.error("❌ Error loading products:", e);
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Derived sets
  const categories = useMemo(() => {
    return Array.from(
      new Set(
        allItems
          .map((p) => (p.category || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [allItems]);

  // -------------------------------------------
  // Apply filters + sorting
  // -------------------------------------------
  const filteredSorted = useMemo(() => {
    const filtered = allItems.filter((p) => {
      const price = Number(p.price) || 0;
      const eco = Number(p.eco_rating) || 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
      if (eco < filters.ecoRatingRange[0] || eco > filters.ecoRatingRange[1]) return false;
      if (filters.category && (p.category || "") !== filters.category) return false;
      return true;
    });

    const arr = [...filtered];
    switch (filters.sortBy) {
      case "price-low":
        arr.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case "price-high":
        arr.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case "eco-rating":
        arr.sort((a, b) => (Number(b.eco_rating) || 0) - (Number(a.eco_rating) || 0));
        break;
      case "name":
        arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      default:
        // relevance: keep current order
        break;
    }
    return arr;
  }, [allItems, filters]);

  // Client-side pagination for the filtered result
  const totalFiltered = filteredSorted.length;
  const totalPages = Math.max(Math.ceil(totalFiltered / pageSize), 1);
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.category, filters.priceRange, filters.ecoRatingRange, filters.sortBy]);

  // -------------------------------------------
  // Review flow
  // -------------------------------------------
  const fetchRecommendations = useCallback(async (productId) => {
    try {
      const userId = localStorage.getItem("userId");
      const base = process.env.REACT_APP_NLP_API_URL || "http://localhost:5003";
      const response = await api.get(`${base}/recommend?user_id=${userId}&product_id=${productId}`);
      setRecommendations(response?.data?.recommendations || []);
    } catch (error) {
      console.error("❌ Error fetching recommendations:", error);
      setRecommendations([]);
    }
  }, []);

  const openReviewDialog = (product) => {
    setSelectedProduct(product);
    setOpenReview(true);
    fetchRecommendations(product.id);
  };
  const closeReviewDialog = () => {
    setOpenReview(false);
    setReview("");
    setRecommendations([]);
  };
  const submitReview = async () => {
    if (!selectedProduct || review.trim() === "") {
      alert("Please enter a review!");
      return;
    }
    try {
      await api.post(`/products/${selectedProduct.id}/review`, { review });
      alert("Thank you for your review!");
      closeReviewDialog();
    } catch (error) {
      console.error("❌ Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    }
  };

  // -------------------------------------------
  // Add product (admin)
  // -------------------------------------------
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    eco_rating: "",
    image_url: "",
  });

  const openAdd = () => {
    setOpenAddDialog(true);
    setNewProduct({
      name: "",
      description: "",
      price: "",
      category: "",
      eco_rating: "",
      image_url: "",
    });
    setErrorMessage("");
    setSuccessMessage("");
  };
  const closeAdd = () => {
    setOpenAddDialog(false);
    setErrorMessage("");
    setSuccessMessage("");
  };
  const onAddChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };
  const submitAdd = async () => {
    if (
      !newProduct.name ||
      !newProduct.description ||
      !newProduct.price ||
      !newProduct.eco_rating ||
      !newProduct.image_url
    ) {
      setErrorMessage("Please fill in all required fields!");
      return;
    }
    if (isNaN(parseFloat(newProduct.price)) || parseFloat(newProduct.price) <= 0) {
      setErrorMessage("Please enter a valid price!");
      return;
    }
    if (
      isNaN(parseFloat(newProduct.eco_rating)) ||
      parseFloat(newProduct.eco_rating) < 1 ||
      parseFloat(newProduct.eco_rating) > 5
    ) {
      setErrorMessage("Eco rating must be between 1 and 5!");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const payload = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        eco_rating: parseFloat(newProduct.eco_rating),
        image_url: newProduct.image_url,
      };

      await api.post("/products", payload);
      setSuccessMessage("Product added successfully!");
      await loadAll();
      setTimeout(() => closeAdd(), 1000);
    } catch (error) {
      console.error("❌ Error creating product:", error);
      setErrorMessage(error.response?.data?.error || "Failed to create product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------
  // Navigation → product details
  // -------------------------------------------
  const goToDetails = (id) => navigate(`/products/${id}`);

  // -------------------------------------------
  // UI
  // -------------------------------------------
  return (
    <Box sx={{ padding: 3, backgroundColor: "#f7f9fc", minHeight: "100vh" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: green[800], fontWeight: "bold" }}>
          🌱 Ecosphere Products
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openAdd}
            sx={{ bgcolor: green[700], "&:hover": { bgcolor: green[800] } }}
          >
            Add Product
          </Button>
        )}
      </Box>

      {/* Filter Toggle Button */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          startIcon={<FilterList />}
          endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
          onClick={() => setShowFilters(!showFilters)}
          sx={{
            backgroundColor: green[600],
            color: "white",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
            '&:hover': {
              backgroundColor: green[700],
              boxShadow: "0 6px 16px rgba(76, 175, 80, 0.4)",
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </Box>

      {/* Collapsible Filters Card */}
      <Collapse in={showFilters} timeout="auto" unmountOnExit>
        <Box
          sx={{
            mb: 3,
            p: 3,
            border: "1px solid #e5e7eb",
            borderRadius: 3,
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, color: green[800], fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
            🌿 Filter Products
          </Typography>
          
          <Grid container spacing={3}>
            {/* Price */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: "#374151", fontWeight: 600 }}>
                Price Range
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: green[700], fontWeight: 500 }}>
                ${filters.priceRange[0]} – ${filters.priceRange[1]}
              </Typography>
              <Slider
                value={filters.priceRange}
                onChange={(_, v) => setFilters((f) => ({ ...f, priceRange: v }))}
                valueLabelDisplay="auto"
                min={Math.min(filters.priceRange[0], 0)}
                max={Math.max(filters.priceRange[1], 200)}
                sx={{ 
                  color: green[600],
                  '& .MuiSlider-thumb': {
                    backgroundColor: green[600],
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: green[600],
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: green[100],
                  }
                }}
              />
            </Grid>

            {/* Eco Rating */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: "#374151", fontWeight: 600 }}>
                Eco Rating
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: green[700], fontWeight: 500 }}>
                {filters.ecoRatingRange[0]} – {filters.ecoRatingRange[1]} stars
              </Typography>
              <Slider
                value={filters.ecoRatingRange}
                onChange={(_, v) => setFilters((f) => ({ ...f, ecoRatingRange: v }))}
                valueLabelDisplay="auto"
                min={0}
                max={5}
                step={0.1}
                sx={{ 
                  color: green[600],
                  '& .MuiSlider-thumb': {
                    backgroundColor: green[600],
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: green[600],
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: green[100],
                  }
                }}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: "#374151", fontWeight: 600 }}>
                Category
              </Typography>
              <FormControl fullWidth>
                <Select
                  label="Category"
                  value={filters.category}
                  onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: green[300],
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: green[500],
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: green[600],
                    },
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sort */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: "#374151", fontWeight: 600 }}>
                Sort By
              </Typography>
              <FormControl fullWidth>
                <Select
                  label="Sort By"
                  value={filters.sortBy}
                  onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: green[300],
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: green[500],
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: green[600],
                    },
                  }}
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="price-low">Price: Low → High</MenuItem>
                  <MenuItem value="price-high">Price: High → Low</MenuItem>
                  <MenuItem value="eco-rating">Eco Rating</MenuItem>
                  <MenuItem value="name">Name A–Z</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              onClick={() => setFilters({ priceRange: [0, 200], ecoRatingRange: [0, 5], category: "", sortBy: "relevance" })}
              sx={{
                color: green[700],
                borderColor: green[300],
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  borderColor: green[500],
                  backgroundColor: green[50],
                }
              }}
            >
               Clear All Filters
            </Button>
            <Button
              variant="contained"
              onClick={() => setPage(1)}
              sx={{
                backgroundColor: green[600],
                color: "white",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                '&:hover': {
                  backgroundColor: green[700],
                  boxShadow: "0 6px 16px rgba(76, 175, 80, 0.4)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
               Apply Filters
            </Button>
          </Box>

          {/* Active filters chips */}
          <Box sx={{ mt: 3, display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
            {filters.category && (
              <Chip
                label={`Category: ${filters.category}`}
                onDelete={() => setFilters((f) => ({ ...f, category: "" }))}
                sx={{
                  backgroundColor: green[100],
                  color: green[800],
                  fontWeight: 500,
                  '& .MuiChip-deleteIcon': {
                    color: green[600],
                  }
                }}
              />
            )}
            {(filters.sortBy && filters.sortBy !== "relevance") && (
              <Chip
                label={`Sort: ${filters.sortBy}`}
                onDelete={() => setFilters((f) => ({ ...f, sortBy: "relevance" }))}
                sx={{
                  backgroundColor: green[100],
                  color: green[800],
                  fontWeight: 500,
                  '& .MuiChip-deleteIcon': {
                    color: green[600],
                  }
                }}
              />
            )}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 200) && (
              <Chip
                label={`Price: $${filters.priceRange[0]}-$${filters.priceRange[1]}`}
                onDelete={() => setFilters((f) => ({ ...f, priceRange: [0, 200] }))}
                sx={{
                  backgroundColor: green[100],
                  color: green[800],
                  fontWeight: 500,
                  '& .MuiChip-deleteIcon': {
                    color: green[600],
                  }
                }}
              />
            )}
            {(filters.ecoRatingRange[0] > 0 || filters.ecoRatingRange[1] < 5) && (
              <Chip
                label={`Eco: ${filters.ecoRatingRange[0]}-${filters.ecoRatingRange[1]} stars`}
                onDelete={() => setFilters((f) => ({ ...f, ecoRatingRange: [0, 5] }))}
                sx={{
                  backgroundColor: green[100],
                  color: green[800],
                  fontWeight: 500,
                  '& .MuiChip-deleteIcon': {
                    color: green[600],
                  }
                }}
              />
            )}
          </Box>
        </Box>
      </Collapse>

      {/* Status */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", mb: 2 }}>
        <Typography variant="body1" sx={{ color: green[700] }}>
          {loading ? "Loading…" : `Showing ${pageItems.length} of ${totalFiltered} products`}
        </Typography>
      </Box>

      {/* Grid */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {pageItems.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                onClick={() => goToDetails(product.id)}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  borderRadius: 2,
                  transition: "transform .18s ease, box-shadow .18s ease",
                  "&:hover": { transform: "translateY(-3px)", boxShadow: 6 },
                }}
              >
                <CardMedia
                  component={ImageWithFallback}
                  src={product.image_url}
                  alt={product.name}
                  height={200}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ color: green[800], fontWeight: 700 }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {product.description}
                  </Typography>
                  {product.category && (
                    <Chip
                      label={product.category}
                      size="small"
                      sx={{ mb: 1, bgcolor: "#e8f5e9", color: green[900], fontWeight: 600 }}
                    />
                  )}
                  <Typography variant="h6" sx={{ color: green[800] }}>
                    💲{Number(product.price ?? 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2">🌟 Eco Rating: {product.eco_rating ?? "—"} / 5</Typography>

                  <Button
                    variant="contained"
                    sx={{ mt: 1.5, backgroundColor: green[700], "&:hover": { bgcolor: green[800] } }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${product.id}#reviews`);
                    }}
                  >
                    Leave a Review
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Bottom pagination */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination color="primary" page={page} count={totalPages} onChange={(_e, p) => setPage(p)} />
        </Box>
      )}

      {/* Review Dialog */}
      <Dialog open={openReview} onClose={closeReviewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Leave a Review</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Review"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReviewDialog} sx={{ color: "gray" }} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button onClick={submitReview} sx={{ backgroundColor: green[700], color: "white" }} startIcon={<Save />}>
            Submit
          </Button>
        </DialogActions>

        <DialogContent>
          {Array.isArray(recommendations) && recommendations.length > 0 ? (
            <>
              <Typography variant="h6" sx={{ mt: 2, mb: 2, color: green[800] }}>
                🔗 Recommended Products
              </Typography>
              <Grid container spacing={2}>
                {recommendations.map((rec) => (
                  <Grid item xs={12} key={rec.product_id ?? rec.id ?? `${rec.name}-${rec.price}`}>
                    <Card sx={{ boxShadow: 1, borderRadius: "10px", backgroundColor: "#e8f5e9" }}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ color: green[700], fontWeight: "bold" }}>
                          {rec.name}
                        </Typography>
                        <Typography variant="body2">💲 {Number(rec.price ?? 0).toFixed(2)}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <Typography variant="body2" sx={{ mt: 2, color: "gray", textAlign: "center" }}>
              ❌ No recommendations available.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={openAddDialog} onClose={closeAdd} maxWidth="md" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={newProduct.name}
                onChange={onAddChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={newProduct.description}
                onChange={onAddChange}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price ($)"
                name="price"
                type="number"
                value={newProduct.price}
                onChange={onAddChange}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category (display only)</InputLabel>
                <Select
                  name="category"
                  value={newProduct.category}
                  onChange={onAddChange}
                  label="Category (display only)"
                >
                  <MenuItem value="">—</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Eco Rating (1-5)"
                name="eco_rating"
                type="number"
                value={newProduct.eco_rating}
                onChange={onAddChange}
                inputProps={{ min: 1, max: 5, step: 0.1 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Image URL"
                name="image_url"
                value={newProduct.image_url}
                onChange={onAddChange}
                placeholder="https://example.com/image.jpg"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAdd} startIcon={<Cancel />} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={submitAdd}
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            disabled={saving}
            sx={{ bgcolor: green[700], "&:hover": { bgcolor: green[800] } }}
          >
            {saving ? "Adding..." : "Add Product"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
