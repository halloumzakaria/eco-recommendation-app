import React, { useEffect, useState } from "react";
import api from "../utils/api";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Grid,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { Add, Save, Cancel } from "@mui/icons-material";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1520975964184-9bcd9a59e2bc?q=80&w=1200&auto=format&fit=crop";

function getImageUrl(image_url) {
  let u = image_url;
  if (Array.isArray(u)) u = u.find(x => typeof x === "string" && x.length > 3);
  if (typeof u !== "string" || u.length < 4) return PLACEHOLDER;
  if (u.startsWith("//")) return "https:" + u;
  if (!/^https?:\/\//i.test(u)) return "https://" + u;
  return u;
}

const Products = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(24);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [review, setReview] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  // Add Product states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    eco_rating: "",
    image_url: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  // -------- Load products (paginated) ----------
  async function loadProducts(p = 1) {
    try {
      setLoading(true);
      const { data } = await api.get(`/products?page=${p}&pageSize=${pageSize}`);
      setItems(Array.isArray(data?.items) ? data.items : []);
      setTotal(data?.total ?? 0);
      setTotalPages(data?.totalPages ?? 1);
      setPage(data?.page ?? p);
    } catch (e) {
      console.error("❌ Error fetching products:", e);
      setItems([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- Recommendations ----------
  const fetchRecommendations = async (productId) => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await api.get(
        `${process.env.REACT_APP_NLP_API_URL || "http://localhost:5003"}/recommend?user_id=${userId}&product_id=${productId}`
      );
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error("❌ Error fetching recommendations:", error);
      setRecommendations([]);
    }
  };

  // -------- Review Dialog ----------
  const handleOpen = (product) => {
    setSelectedProduct(product);
    setOpen(true);
    fetchRecommendations(product.id);
  };
  const handleClose = () => {
    setOpen(false);
    setReview("");
    setRecommendations([]);
  };
  const handleSubmitReview = async () => {
    if (!selectedProduct || review.trim() === "") {
      alert("Please enter a review!");
      return;
    }
    try {
      await api.post(`/products/${selectedProduct.id}/review`, { review });
      alert("Thank you for your review!");
      handleClose();
    } catch (error) {
      console.error("❌ Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    }
  };

  // -------- Add Product Dialog ----------
  const handleAddProduct = () => {
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
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setErrorMessage("");
    setSuccessMessage("");
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmitProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.description ||
      !newProduct.price ||
      !newProduct.category ||
      !newProduct.eco_rating ||
      !newProduct.image_url
    ) {
      setErrorMessage("Please fill in all fields!");
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

      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        // compat: ton backend « produits (nouveau schéma) » ne stocke pas category texte,
        // mais c’est ok pour l’instant si tu veux juste l’afficher côté front.
        eco_rating: parseFloat(newProduct.eco_rating),
        image_url: newProduct.image_url,
      };

      await api.post("/products", productData);
      setSuccessMessage("Product added successfully!");

      // Recharge la 1ère page (ou la page courante)
      await loadProducts(1);

      setTimeout(() => {
        handleCloseAddDialog();
      }, 1200);
    } catch (error) {
      console.error("❌ Error creating product:", error);
      setErrorMessage(error.response?.data?.error || "Failed to create product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#f7f9fc", minHeight: "100vh" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: green[800], fontWeight: "bold" }}>
          🌱 Ecosphere Products
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddProduct}
            sx={{ bgcolor: green[700], "&:hover": { bgcolor: green[800] } }}
          >
            Add Product
          </Button>
        )}
      </Box>

      {/* Top status + pagination */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="body1" sx={{ color: green[700] }}>
          {loading ? "Loading…" : `Showing ${items.length} of ${total} products`}
        </Typography>
        <Pagination
          color="primary"
          page={page}
          count={totalPages}
          onChange={(_e, p) => loadProducts(p)}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {items.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: "15px",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": { transform: "scale(1.03)" },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={getImageUrl(product.image_url)}
                  alt={product.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER;
                  }}
                  sx={{ objectFit: "cover", bgcolor: "#eef2f5" }}
                />

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" sx={{ color: green[700], fontWeight: "bold" }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.description}
                  </Typography>
                  <Typography variant="h6" sx={{ color: green[800], mt: 1 }}>
                    💲{Number(product.price ?? 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2">🌟 Eco Rating: {product.eco_rating ?? "—"} / 5</Typography>
                  <Typography variant="body2">👀 Views: {product.views ?? 0}</Typography>

                  <Button
                    variant="contained"
                    sx={{ mt: 1, backgroundColor: green[700], color: "white" }}
                    onClick={() => handleOpen(product)}
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
          <Pagination color="primary" page={page} count={totalPages} onChange={(_e, p) => loadProducts(p)} />
        </Box>
      )}

      {/* Review Popup */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
          <Button onClick={handleClose} sx={{ color: "gray" }}>
            Cancel
          </Button>
          <Button onClick={handleSubmitReview} sx={{ backgroundColor: green[700], color: "white" }}>
            Submit
          </Button>
        </DialogActions>

        <DialogContent>
          {recommendations && recommendations.length > 0 ? (
            <>
              <Typography variant="h6" sx={{ mt: 2, mb: 2, color: green[800] }}>
                🔗 Recommended Products:
              </Typography>
              <Grid container spacing={2}>
                {recommendations.map((rec) => (
                  <Grid item xs={12} key={rec.id}>
                    <Card sx={{ boxShadow: 1, borderRadius: "10px", backgroundColor: "#e8f5e9" }}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ color: green[700], fontWeight: "bold" }}>
                          {rec.name}
                        </Typography>
                        <Typography variant="body2">💲 {rec.price}</Typography>
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
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
          {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Product Name" name="name" value={newProduct.name} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select name="category" value={newProduct.category} onChange={handleInputChange} label="Category">
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
                name="eco_rating"
                type="number"
                value={newProduct.eco_rating}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} startIcon={<Cancel />} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitProduct}
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
