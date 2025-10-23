import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
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
  Avatar,
  Pagination,
  Stack,
} from "@mui/material";
import { green } from "@mui/material/colors";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RateReviewIcon from "@mui/icons-material/RateReview";

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

function timeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  return d.toLocaleDateString();
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [imgSrc, setImgSrc] = useState(PLACEHOLDER);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Recs
  const [recs, setRecs] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);

  // Reviews list + meta
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsErr, setReviewsErr] = useState("");
  const [meta, setMeta] = useState({ avg_rating: 0, reviews_count: 0 });

  // New review form
  const [myReview, setMyReview] = useState("");
  const [myStars, setMyStars] = useState(5);

  // Pagination (reviews)
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  }, []);
  const userId = user?.id || localStorage.getItem("userId") || "";
  const currentUserName = user?.name || "Anonymous";
  const isAdmin = user?.role === "admin";

  // Scroll auto vers #reviews si on arrive depuis la grille
  useEffect(() => {
    if (location.hash === "#reviews") {
      setTimeout(() => {
        document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
  }, [location.hash]);

  // Fetch product details
  const loadProduct = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setImgSrc(safeImageUrl(data?.image_url));
    } catch (e) {
      console.error("❌ Product fetch error:", e);
      setErr(e?.response?.data?.error || e?.response?.data?.msg || "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let mounted = true;
    (async () => { if (mounted) await loadProduct(); })();
    return () => { mounted = false; };
  }, [loadProduct]);

  // Recommendations (max 3) — via le proxy Node: /api/recommend
  const fetchRecs = useCallback(async (pid) => {
    try {
      setRecsLoading(true);
      const { data } = await api.get(`/recommend`, {
        params: { user_id: userId, product_id: pid },
      });
      const arr = Array.isArray(data?.recommendations) ? data.recommendations : [];
      setRecs(arr.slice(0, 3));
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

  // Fetch reviews meta + list
  const loadReviews = useCallback(async (targetPage = 1) => {
    try {
      setReviewsLoading(true);
      setReviewsErr("");
      const [metaRes, listRes] = await Promise.all([
        api.get(`/products/${id}/reviews/meta`),
        api.get(`/products/${id}/reviews`, {
          params: { limit: pageSize, offset: (targetPage - 1) * pageSize },
        }),
      ]);
      setMeta({
        avg_rating: Number(metaRes?.data?.avg_rating || 0),
        reviews_count: Number(metaRes?.data?.reviews_count || 0),
      });
      setReviews(Array.isArray(listRes?.data?.reviews) ? listRes.data.reviews : []);
      setPage(targetPage);
    } catch (e) {
      console.error("❌ Reviews fetch error:", e);
      setReviewsErr("Failed to load reviews");
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (product?.id) loadReviews(1);
  }, [product?.id, loadReviews]);

  const ecoRating = useMemo(() => {
    const v = parseFloat(product?.eco_rating ?? 0);
    return Number.isFinite(v) ? v : 0;
  }, [product]);

  const totalPages = useMemo(
    () => Math.max(Math.ceil((meta.reviews_count || 0) / pageSize), 1),
    [meta.reviews_count]
  );

  // Submit review (avec token)
  const submitReview = useCallback(async () => {
    const text = (myReview || "").trim();
    if (!text) return alert("Please write something 🙂");

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      // Route MVC: POST /products/:id/reviews
      await api.post(
        `/products/${id}/reviews`,
        {
          authorName: currentUserName,
          rating: myStars,
          body: text,
          title: null,
        },
        { headers }
      );

      // Clean + refresh reviews + produit (eco_rating)
      setMyReview("");
      setMyStars(5);
      await Promise.all([loadReviews(1), loadProduct()]);
      // scroll vers la section
      document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      console.error("❌ submit review error:", e);
      // Fallback éventuel vers l’ancienne route Flask si dispo
      try {
        await api.post(`/products/${id}/review`, { review: text }, { headers });
        setMyReview("");
        setMyStars(5);
        await Promise.all([loadReviews(1), loadProduct()]);
      } catch {
        alert("Failed to submit review.");
      }
    }
  }, [id, myReview, myStars, currentUserName, loadReviews, loadProduct]);

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
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Alert severity="error">{err || "Product not found"}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Grid container spacing={4}>
        {/* Left: Image */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 2, bgcolor: "#f6f9fc" }}>
            <CardMedia
              component="img"
              image={imgSrc}
              alt={product.name}
              sx={{ height: 360, objectFit: "cover", bgcolor: "#eef2f5" }}
              onError={(e) => { if (e.currentTarget.src !== PLACEHOLDER) e.currentTarget.src = PLACEHOLDER; }}
              loading="lazy"
            />
          </Card>
        </Grid>

        {/* Right: Info */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Typography variant="h4" sx={{ fontWeight: 700, color: green[800], mb: 1 }}>
                  {product.name}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<RateReviewIcon />}
                  onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
                  sx={{ bgcolor: green[700], "&:hover": { bgcolor: green[800] } }}
                >
                  Write a review
                </Button>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                {product.category && <Chip label={product.category} variant="outlined" />}
                {product.brand && <Chip label={product.brand} variant="outlined" />}
              </Box>

              <Typography variant="h6" sx={{ color: green[700], mb: 1 }}>
                💲 {Number(product.price ?? 0).toFixed(2)}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="body1">Eco Rating:</Typography>
                <Rating value={ecoRating} precision={0.1} readOnly />
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

              {isAdmin && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button variant="outlined" component={RouterLink} to="/products">
                    Manage Products
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reviews */}
      <Box id="reviews" sx={{ mt: 5 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 2, border: `1px solid ${green[100]}` }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Customer reviews
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Rating value={meta.avg_rating || 0} precision={0.1} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    {meta.avg_rating?.toFixed?.(1) || "0.0"} / 5 · {meta.reviews_count} review{meta.reviews_count === 1 ? "" : "s"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* New review form */}
            <Box sx={{ p: 2, borderRadius: 2, background: "#f6fbf7", border: `1px dashed ${green[200]}`, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Write a review
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Rating value={myStars} precision={1} onChange={(_e, v) => setMyStars(v || 5)} />
                <Typography variant="body2" color="text.secondary">{myStars} / 5</Typography>
              </Box>
              <textarea
                value={myReview}
                onChange={(e) => setMyReview(e.target.value)}
                rows={4}
                style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd" }}
                placeholder="Your review..."
              />
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  onClick={submitReview}
                  sx={{ bgcolor: green[700], "&:hover": { bgcolor: green[800] } }}
                >
                  Submit
                </Button>
              </Box>
            </Box>

            {/* Reviews list */}
            {reviewsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress />
              </Box>
            ) : reviewsErr ? (
              <Alert severity="error">{reviewsErr}</Alert>
            ) : reviews.length === 0 ? (
              <Alert severity="info">No reviews yet. Be the first!</Alert>
            ) : (
              <Stack spacing={2}>
                {reviews.map((rv) => (
                  <Box
                    key={rv.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid #e8f0eb",
                      background: "#fff",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Avatar sx={{ bgcolor: green[600], width: 28, height: 28 }}>
                        {(rv.author_name || "A").slice(0, 1).toUpperCase()}
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {rv.author_name || "Anonymous"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">· {timeAgo(rv.created_at)}</Typography>
                    </Box>
                    <Rating value={Number(rv.rating) || 0} readOnly size="small" />
                    {rv.title && (
                      <Typography variant="subtitle2" sx={{ mt: 0.5, fontWeight: 700 }}>
                        {rv.title}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                      {rv.body}
                    </Typography>
                  </Box>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                    <Pagination
                      color="primary"
                      page={page}
                      count={totalPages}
                      onChange={(_e, p) => loadReviews(p)}
                    />
                  </Box>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

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
              <Grid item xs={12} sm={6} md={4} key={r.id ?? r.product_id}>
                <Card sx={{ borderRadius: 3, boxShadow: 1, height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardMedia
                    component="img"
                    image={safeImageUrl(r.image_url)}
                    alt={r.name}
                    sx={{ height: 160, objectFit: "cover", bgcolor: "#eef2f5" }}
                    onError={(e) => { if (e.currentTarget.src !== PLACEHOLDER) e.currentTarget.src = PLACEHOLDER; }}
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
