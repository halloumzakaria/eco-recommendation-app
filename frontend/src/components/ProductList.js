import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Card, CardContent, Typography, Button, TextField, Grid, Container } from "@mui/material";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [review, setReview] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        api.get("/products")
            .then(response => setProducts(response.data))
            .catch(error => console.error("Error fetching products:", error));
    }, []);

    const submitReview = async (productId) => {
        if (!review.trim()) return alert("Please enter a review");

        try {
            await api.post(`/products/${productId}/review`, { review });
            alert("Review submitted!");
            setReview("");
            api.get("/products")
                .then(response => setProducts(response.data));
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };

    return (
        <Container style={{ marginTop: "20px" }}>
            <Typography variant="h3" align="center" style={{ marginBottom: "20px" }}>
                🏰 Eco-Friendly Fantasy Market 🧙‍♂️
            </Typography>

            <Grid container spacing={3}>
                {products.map(product => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <Card style={{ background: "#ffe4e1", borderRadius: "15px" }}>
                            <CardContent>
                                <Typography variant="h5">{product.name}</Typography>
                                <Typography variant="body2">{product.description}</Typography>
                                <Typography variant="body1" style={{ marginTop: "10px", fontWeight: "bold" }}>
                                    Price: ${product.price}
                                </Typography>
                                <Typography variant="body1" style={{ color: "#ffa500", fontWeight: "bold" }}>
                                    Eco-Rating: {product.eco_rating} ⭐
                                </Typography>
                                <Button variant="contained" color="secondary" style={{ marginTop: "10px" }}
                                    onClick={() => setSelectedProduct(product)}>
                                    Leave a Review
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {selectedProduct && (
                <div style={{ marginTop: "30px", padding: "20px", background: "#fff8dc", borderRadius: "10px" }}>
                    <Typography variant="h4">Review {selectedProduct.name} 🌟</Typography>
                    <TextField fullWidth multiline rows={3} variant="outlined" label="Write your review..."
                        value={review} onChange={(e) => setReview(e.target.value)}
                        style={{ marginTop: "10px" }} />
                    <Button variant="contained" color="primary" style={{ marginTop: "10px" }}
                        onClick={() => submitReview(selectedProduct.id)}>
                        Submit Review
                    </Button>
                </div>
            )}
        </Container>
    );
};

export default ProductList;
