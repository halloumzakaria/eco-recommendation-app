import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../utils/api";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Rating,
} from "@mui/material";
import { green } from "@mui/material/colors";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// -------- Image handling (prevents request spam when broken) --------
const PLACEHOLDER =
  "https://images.unsplash.com/photo-1520975964184-9bcd9a59e2bc?q=80&w=1200&auto=format&fit=crop";

function pickFirstImage(value) {
  if (Array.isArray(value)) {
    const found = value.find((x) => typeof x === "string" && x.trim().length > 3);
    return found || "";
  }
  return typeof value === "string" ? value : "";
}
function normalizeUrl(u) {
  if (!u) return PLACEHOLDER;
  if (u.startsWith("//")) return "https:" + u;
  if (!/^https?:\/\//i.test(u)) return "https://" + u;
  return u;
}
function safeImageUrl(image_url) {
  return normalizeUrl(pickFirstImage(image_url));
}

// -------- Page --------
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [recs, setRecs] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);

  const userId = useMemo(() => localStorage.getItem("userId") || "", []);
  const isAdmin = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u?.role === "admin";
    } catch {
      return false;
    }
  }, []);

  // Fetch product details (Node API)
  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get(`/products/${id}`);
        if (!mounted) return;
        setProduct(data);
        setImgSrc(safeImageUrl(data?.image_url));
      } catch (e) {
        console.error("❌ Product fetch error:", e);
        if (!mounted) return;
        setErr(e?.response?.data?.error || e?.response?.data?.msg || "Failed to load product");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [id]);

  // Recommendations from NLP service (same pattern as your Products page)
  const fetchRecs = useCallback(async (pid) => {
    try {
      setRecsLoading(true);
      const url = `${process.env.REACT_APP_NLP_API_URL || "http://localhost:5001"}/recommend`;
      const { data } = await api.get(`${url}?user_id=${encodeURIComponent(userId)}&product_id=${encodeURIComponent(pid)}`);
      setRecs(Array.isArray(data?.recommendations) ? data.recommendations : []);
    } catch (e) {
      console.warn("⚠️ Recs fetch failed:", e?.message || e);
      setRecs([]);
    } finally {
      setRecsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (product?.id) fetchRecs(product.id);
  }, [product?.id, fetchRecs]);

  const ecoRating = useMemo(() => {
    const v = parseFloat(product?.eco_rating ?? 0);
    return Number.isFinite(v) ? v : 0;
  }, [product]);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (err || !product) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="error">{err || "Product not found"}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Grid container spacing={4}>
        {/* Left: Image */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: 2,
              bgcolor: "#f6f9fc",
            }}
          >
            <CardMedia
              component="img"
              image={imgSrc}
              alt={product.name}
              sx={{ height: 360, objectFit: "cover", bgcolor: "#eef2f5" }}
              onError={(e) => {
                if (e.currentTarget.src !== PLACEHOLDER) {
                  e.currentTarget.src = PLACEHOLDER;
                }
              }}
              loading="lazy"
            />
          </Card>
        </Grid>

        {/* Right: Info */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: green[800], mb: 1 }}
              >
                {product.name}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                {product.category && (
                  <Chip label={product.category} variant="outlined" />
                )}
                {product.brand && (
                  <Chip label={product.brand} variant="outlined" />
                )}
              </Box>

              <Typography variant="h6" sx={{ color: green[700], mb: 1 }}>
                💲 {Number(product.price ?? 0).toFixed(2)}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="body1">Eco Rating:</Typography>
                <Rating
                  value={ecoRating}
                  precision={0.1}
                  readOnly
                />
                <Typography variant="body2" color="text.secondary">
                  ({ecoRating.toFixed(1)} / 5)
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {product.material && <>Material: <b>{product.material}</b> • </>}
                {product.made_in && <>Made in: <b>{product.made_in}</b></>}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Description
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {product.description || "—"}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {isAdmin && (
                  <Button
                    variant="outlined"
                    component={RouterLink}
                    to="/products"
                  >
                    Manage Products
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recommendations */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          You might also like
        </Typography>

        {recsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : recs.length === 0 ? (
          <Alert severity="info">No recommendations available.</Alert>
        ) : (
          <Grid container spacing={3}>
            {recs.map((r) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={r.id ?? r.product_id}>
                <Card sx={{ borderRadius: 3, boxShadow: 1, height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardMedia
                    component="img"
                    image={safeImageUrl(r.image_url)}
                    alt={r.name}
                    sx={{ height: 160, objectFit: "cover", bgcolor: "#eef2f5" }}
                    onError={(e) => {
                      if (e.currentTarget.src !== PLACEHOLDER) {
                        e.currentTarget.src = PLACEHOLDER;
                      }
                    }}
                    loading="lazy"
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {r.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {r.category || "—"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: green[700], fontWeight: 600 }}>
                      💲 {Number(r.price ?? 0).toFixed(2)}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        component={RouterLink}
                        to={`/products/${r.id ?? r.product_id}`}
                      >
                        View
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default ProductDetails;
