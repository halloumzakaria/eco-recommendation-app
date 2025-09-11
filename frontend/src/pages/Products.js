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
    Fab
} from "@mui/material";
import { green } from "@mui/material/colors";
import { Add, Save, Cancel } from "@mui/icons-material";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [review, setReview] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    
    // Add Product states
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        eco_rating: "",
        image_url: ""
    });
    
    // Get user role
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role === 'admin';

    // Fetch products from backend
    useEffect(() => {
        api
            .get("/products")
            .then((response) => setProducts(response.data))
            .catch((error) => console.error("❌ Error fetching products:", error));
    }, []);

    // Fetch AI Recommendations for the selected product
    const fetchRecommendations = async (productId) => {
        try {
            const userId = localStorage.getItem("userId"); // Get logged-in user ID
            const response = await api.get(
                `${process.env.REACT_APP_NLP_API_URL || 'http://localhost:5003'}/recommend?user_id=${userId}&product_id=${productId}`
            );

            console.log("✅ Recommendations received:", response.data.recommendations);
            setRecommendations(response.data.recommendations);
        } catch (error) {
            console.error("❌ Error fetching recommendations:", error);
        }
    };

    // Open Review Popup
    const handleOpen = (product) => {
        setSelectedProduct(product);
        setOpen(true);
        fetchRecommendations(product.id); // Fetch recommendations when popup opens
    };

    // Close Popup
    const handleClose = () => {
        setOpen(false);
        setReview("");
        setRecommendations([]); // Clear recommendations when popup closes
    };

    // Submit Review
    const handleSubmitReview = async () => {
        if (!selectedProduct || review.trim() === "") {
            alert("Please enter a review!");
            return;
        }

        try {
            console.log(`📌 Submitting review for Product ID: ${selectedProduct.id}, Review: ${review}`);

            // Use the backend API route which handles authentication and calls the NLP API
            const response = await api.post(`/products/${selectedProduct.id}/review`, {
                review: review,
            });

            console.log("✅ Review Submitted Successfully:", response.data);
            alert("Thank you for your review!");
            handleClose(); // Close popup after submission
        } catch (error) {
            console.error("❌ Error submitting review:", error);
            alert("Failed to submit review. Please try again.");
        }
    };

    // Add Product functions
    const handleAddProduct = () => {
        setOpenAddDialog(true);
        setNewProduct({
            name: "",
            description: "",
            price: "",
            category: "",
            eco_rating: "",
            image_url: ""
        });
        setErrorMessage("");
        setSuccessMessage("");
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setNewProduct({
            name: "",
            description: "",
            price: "",
            category: "",
            eco_rating: "",
            image_url: ""
        });
        setErrorMessage("");
        setSuccessMessage("");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitProduct = async () => {
        // Validation
        if (!newProduct.name || !newProduct.description || !newProduct.price || 
            !newProduct.category || !newProduct.eco_rating || !newProduct.image_url) {
            setErrorMessage("Please fill in all fields!");
            return;
        }

        if (isNaN(parseFloat(newProduct.price)) || parseFloat(newProduct.price) <= 0) {
            setErrorMessage("Please enter a valid price!");
            return;
        }

        if (isNaN(parseFloat(newProduct.eco_rating)) || parseFloat(newProduct.eco_rating) < 1 || parseFloat(newProduct.eco_rating) > 5) {
            setErrorMessage("Eco rating must be between 1 and 5!");
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");

            const productData = {
                name: newProduct.name,
                description: newProduct.description,
                price: parseFloat(newProduct.price),
                category: newProduct.category,
                eco_rating: parseFloat(newProduct.eco_rating),
                image_url: newProduct.image_url
            };

            console.log("📦 Creating product:", productData);
            const response = await api.post("/products", productData);
            
            console.log("✅ Product created successfully:", response.data);
            setSuccessMessage("Product added successfully!");
            
            // Refresh products list
            const updatedProducts = await api.get("/products");
            setProducts(updatedProducts.data);
            
            // Close dialog after 2 seconds
            setTimeout(() => {
                handleCloseAddDialog();
            }, 2000);

        } catch (error) {
            console.error("❌ Error creating product:", error);
            setErrorMessage(error.response?.data?.error || "Failed to create product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ padding: "20px", backgroundColor: "#f7f9fc", minHeight: "100vh" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography
                    variant="h4"
                    sx={{
                        color: green[800],
                        fontWeight: "bold",
                    }}
                >
                    🌱 Ecosphere Products
                </Typography>
                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddProduct}
                        sx={{
                            bgcolor: green[700],
                            '&:hover': { bgcolor: green[800] }
                        }}
                    >
                        Add Product
                    </Button>
                )}
            </Box>
            <Grid container spacing={4}>
                {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                        <Card
                            sx={{
                                boxShadow: 3,
                                borderRadius: "15px",
                                transition: "transform 0.3s ease-in-out",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                },
                            }}
                        >
                            <CardMedia
                                component="img"
                                height="200"
                                image={product.image_url || "https://pixabay.com/fr/photos/sac-coton-sac-en-coton-textile-mur-4364558/"} // Use backend image URL or fallback
                                alt={product.name}
                                sx={{ objectFit: "cover" }}
                            />
                            <CardContent>
                                <Typography
                                    gutterBottom
                                    variant="h6"
                                    sx={{ color: green[700], fontWeight: "bold" }}
                                >
                                    {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {product.description}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{ color: green[800], marginTop: 1 }}
                                >
                                    💲{product.price}
                                </Typography>
                                <Typography variant="body2">
                                    🌟 Eco Rating: {product.eco_rating} / 5
                                </Typography>
                                <Typography variant="body2">👀 Views: {product.views}</Typography>
                                <Button
                                    variant="contained"
                                    sx={{
                                        marginTop: "10px",
                                        backgroundColor: green[700],
                                        color: "white",
                                    }}
                                    onClick={() => handleOpen(product)}
                                >
                                    Leave a Review
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Review Popup */}
            <Dialog open={open} onClose={handleClose}>
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
                    <Button
                        onClick={handleSubmitReview}
                        sx={{ backgroundColor: green[700], color: "white" }}
                    >
                        Submit
                    </Button>
                </DialogActions>

                {/* Recommended Products Section */}
                <DialogContent>
                    {recommendations && recommendations.length > 0 ? (
                        <>
                            <Typography
                                variant="h6"
                                sx={{ marginTop: 2, marginBottom: 2, color: green[800] }}
                            >
                                🔗 Recommended Products:
                            </Typography>
                            <Grid container spacing={2}>
                                {recommendations.map((rec) => (
                                    <Grid item xs={12} key={rec.id}>
                                        <Card
                                            sx={{
                                                boxShadow: 1,
                                                borderRadius: "10px",
                                                backgroundColor: "#e8f5e9",
                                            }}
                                        >
                                            <CardContent>
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{ color: green[700], fontWeight: "bold" }}
                                                >
                                                    {rec.name}
                                                </Typography>
                                                <Typography variant="body2">
                                                    💲 {rec.price}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    ) : (
                        <Typography
                            variant="body2"
                            sx={{ marginTop: 2, color: "gray", textAlign: "center" }}
                        >
                            ❌ No recommendations available.
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add Product Dialog */}
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
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
                                onChange={handleInputChange}
                                required
                            />
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
                                <Select
                                    name="category"
                                    value={newProduct.category}
                                    onChange={handleInputChange}
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
                    <Button 
                        onClick={handleCloseAddDialog} 
                        startIcon={<Cancel />}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitProduct}
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        disabled={loading}
                        sx={{
                            bgcolor: green[700],
                            '&:hover': { bgcolor: green[800] }
                        }}
                    >
                        {loading ? 'Adding...' : 'Add Product'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Products;
