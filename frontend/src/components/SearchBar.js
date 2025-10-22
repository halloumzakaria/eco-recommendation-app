import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Fade,
  Zoom,
  LinearProgress,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import api from '../utils/api';

const CATEGORIES = [
  'hygiène',
  'cuisine',
  'accessoire',
  'décoration',
  'sport',
  'maison',
  'jardinage',
  'kit',
];

// ---------- image helpers ----------
const PLACEHOLDER =
  'https://images.unsplash.com/photo-1520975964184-9bcd9a59e2bc?q=80&w=1200&auto=format&fit=crop';

function normalizeImageUrl(image_url) {
  let u = image_url;
  if (Array.isArray(u)) u = u.find((x) => typeof x === 'string' && x.trim().length > 3) || '';
  if (typeof u !== 'string') return '';
  u = u.trim();
  if (!u) return '';
  if (u.startsWith('//')) return 'https:' + u;
  if (/^https?:\/\//i.test(u)) return u;
  return '';
}

function Thumb({ src, alt }) {
  const [imgSrc, setImgSrc] = useState(() => normalizeImageUrl(src) || '');
  useEffect(() => setImgSrc(normalizeImageUrl(src) || ''), [src]);
  if (!imgSrc) return null;
  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setImgSrc('')}
      style={{
        width: '100%',
        height: 140,
        objectFit: 'cover',
        borderRadius: 10,
        background: '#1113',
        display: 'block',
        marginBottom: 12,
      }}
    />
  );
}

// ---------- number helper ----------
const n = (v, def = 0) => {
  if (typeof v === 'string') v = v.replace(',', '.');
  const x = Number(v);
  return Number.isFinite(x) ? x : def;
};

// ---------- main ----------
const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [rawResults, setRawResults] = useState([]); // unfiltered
  const [results, setResults] = useState([]);       // filtered/sorted
  const [loading, setLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    priceRange: [0, 200],
    ecoRatingRange: [0, 5],
    category: '',
    sortBy: 'relevance',
  });

  // request management
  const cache = useRef(new Map());              // query -> normalized array
  const inFlight = useRef(null);                // AbortController
  const lastQueryRef = useRef('');              // dedupe

  const handleFilterChange = (name, value) =>
    setFilters((p) => ({ ...p, [name]: value }));

  const clearFilters = () =>
    setFilters({ priceRange: [0, 200], ecoRatingRange: [0, 5], category: '', sortBy: 'relevance' });

  // normalize any backend shape into a consistent list
  const normalizePayload = (payload) => {
    const arr = Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload)
      ? payload
      : [];

    return arr.map((r) => ({
      id: r.id ?? r.product_id ?? r._id ?? null,
      name: r.name ?? '',
      description: r.description ?? '',
      category: r.category ?? '',
      price: n(r.price, null),
      eco_rating: n(r.eco_rating, null),
      image_url: Array.isArray(r.image_url) ? (r.image_url[0] || '') : (r.image_url ?? ''),
      score: typeof r.score === 'number' ? r.score : undefined,
    })).filter((x) => Number.isFinite(x.id) || typeof x.id === 'string');
  };

  // filtering + sorting pipeline
  const applyFilters = useCallback((products) => {
    const { priceRange, ecoRatingRange, category } = filters;
    return products.filter((p) => {
      const priceOk =
        (priceRange?.length === 2)
          ? (n(p.price, 0) >= n(priceRange[0], 0) && n(p.price, 0) <= n(priceRange[1], 200))
          : true;

      const eco = n(p.eco_rating, 0);
      const ecoOk =
        (ecoRatingRange?.length === 2)
          ? (eco >= n(ecoRatingRange[0], 0) && eco <= n(ecoRatingRange[1], 5))
          : true;

      const catOk = category ? (String(p.category || '').toLowerCase() === String(category).toLowerCase()) : true;

      return priceOk && ecoOk && catOk;
    });
  }, [filters]);

  const sortResults = useCallback((products) => {
    const { sortBy } = filters;
    const arr = [...products];
    switch (sortBy) {
      case 'price-low':
        return arr.sort((a, b) => n(a.price, Infinity) - n(b.price, Infinity));
      case 'price-high':
        return arr.sort((a, b) => n(b.price, -1) - n(a.price, -1));
      case 'eco-rating':
        return arr.sort((a, b) => n(b.eco_rating, -1) - n(a.eco_rating, -1));
      case 'name':
        return arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      default:
        // relevance: if score exists, sort desc by score; fallback name
        return arr.sort((a, b) => n(b.score, 0) - n(a.score, 0) || (a.name || '').localeCompare(b.name || ''));
    }
  }, [filters]);

  const runPipeline = useCallback((list) => sortResults(applyFilters(list)), [applyFilters, sortResults]);

  // Re-apply filters whenever filters or rawResults change
  useEffect(() => {
    setResults(runPipeline(rawResults));
  }, [rawResults, runPipeline]);

  // Cancel any current request
  const cancelInFlight = () => {
    if (inFlight.current) {
      inFlight.current.abort();
      inFlight.current = null;
    }
  };

  // Load all (once per click), not on every small change
  const loadAllProducts = async () => {
    setError('');
    setHasSearched(true);
    setAiThinking(true);
    setLoading(true);

    cancelInFlight();
    const ctrl = new AbortController();
    inFlight.current = ctrl;

    try {
      const { data } = await api.get('/products?page=1&pageSize=1000', { signal: ctrl.signal });
      const normalized = normalizePayload(data);
      setRawResults(normalized);
    } catch (e) {
      if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
        console.error('❌ Error loading products:', e);
        setError(`Failed to load products: ${e.message}`);
        setRawResults([]);
      }
    } finally {
      setAiThinking(false);
      setLoading(false);
      inFlight.current = null;
    }
  };

  // Search on explicit action only (Enter or button click)
  const handleSearch = async (qOverride) => {
    const q = typeof qOverride === 'string' ? qOverride.trim() : query.trim();

    setError('');
    setHasSearched(true);

    if (!q) {
      await loadAllProducts();
      return;
    }

    // dedupe same query if already cached
    if (cache.current.has(q)) {
      setRawResults(cache.current.get(q));
      return;
    }

    // avoid sending same query multiple times rapidly
    if (lastQueryRef.current === q && loading) return;
    lastQueryRef.current = q;

    setAiThinking(true);
    setLoading(true);

    cancelInFlight();
    const ctrl = new AbortController();
    inFlight.current = ctrl;

    try {
      const res = await api.get(`/products/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
      const normalized = normalizePayload(res?.data);
      cache.current.set(q, normalized);
      setRawResults(normalized);
    } catch (e) {
      if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
        console.error('Search error:', e);
        setError('AI search encountered an error. Please try again.');
        setRawResults([]);
      }
    } finally {
      setAiThinking(false);
      setLoading(false);
      inFlight.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const safeResults = Array.isArray(results) ? results : [];
  const count = safeResults.length;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, p: 4 }}>
        {/* Header */}
        <Fade in timeout={600}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                background: 'linear-gradient(45deg, #00d4ff, #ff00ff, #00ff88)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              🤖 AI Product Search
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 300 }}>
              Find the perfect eco-friendly products
            </Typography>
          </Box>
        </Fade>

        {/* Search bar */}
        <Fade in timeout={800}>
          <Box sx={{ maxWidth: 900, mx: 'auto', mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                p: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask AI… e.g. “bamboo toothbrush”, “zero waste kitchen”"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(0, 212, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#00d4ff' },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    '&::placeholder': { color: 'rgba(255, 255, 255, 0.6)' },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={() => handleSearch()}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(45deg, #00d4ff, #ff00ff)',
                  minWidth: 130,
                  height: 56,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  textTransform: 'none',
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Searching…</span>
                  </Box>
                ) : (
                  '🚀 Search'
                )}
              </Button>
            </Box>

            {aiThinking && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                />
              </Box>
            )}

            {error && (
              <Fade in>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#ff6b6b',
                      background: 'rgba(255, 107, 107, 0.1)',
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid rgba(255, 107, 107, 0.3)',
                    }}
                  >
                    ⚠️ {error}
                  </Typography>
                </Box>
              </Fade>
            )}
          </Box>
        </Fade>

        {/* Filters */}
        <Fade in timeout={900}>
          <Box sx={{ maxWidth: 1000, mx: 'auto', mb: 5 }}>
            <Grid container spacing={3}>
              {/* Price */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    p: 3,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography sx={{ color: 'white', mb: 1, fontWeight: 600 }}>Price Range</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                    ${filters.priceRange[0]} – ${filters.priceRange[1]}
                  </Typography>
                  <Slider
                    value={filters.priceRange}
                    onChange={(_, v) => handleFilterChange('priceRange', v)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={200}
                    sx={{ color: '#fff' }}
                  />
                </Box>
              </Grid>

              {/* Eco rating */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    p: 3,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography sx={{ color: 'white', mb: 1, fontWeight: 600 }}>Eco Rating</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                    {filters.ecoRatingRange[0]} – {filters.ecoRatingRange[1]} stars
                  </Typography>
                  <Slider
                    value={filters.ecoRatingRange}
                    onChange={(_, v) => handleFilterChange('ecoRatingRange', v)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={5}
                    step={0.1}
                    sx={{ color: '#fff' }}
                  />
                </Box>
              </Grid>

              {/* Category */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    p: 3,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography sx={{ color: 'white', mb: 1, fontWeight: 600 }}>Category</Typography>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Select Category</InputLabel>
                    <Select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.2)',
                        },
                      }}
                      label="Select Category"
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {CATEGORIES.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>

              {/* Sort */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    p: 3,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography sx={{ color: 'white', mb: 1, fontWeight: 600 }}>Sort By</Typography>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Sort Order</InputLabel>
                    <Select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.2)',
                        },
                      }}
                      label="Sort Order"
                    >
                      <MenuItem value="relevance">Relevance</MenuItem>
                      <MenuItem value="price-low">Price: Low to High</MenuItem>
                      <MenuItem value="price-high">Price: High to Low</MenuItem>
                      <MenuItem value="eco-rating">Eco Rating</MenuItem>
                      <MenuItem value="name">Name A–Z</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>

              {/* Actions */}
              <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    borderColor: 'rgba(255,255,255,0.3)',
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="contained"
                  onClick={loadAllProducts}
                  disabled={loading}
                  sx={{
                    background: 'rgba(255,255,255,0.12)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  Load All Products
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setResults(runPipeline(rawResults))}
                  sx={{
                    background: 'rgba(255,255,255,0.12)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Fade>

        {/* Results */}
        {(hasSearched || results.length > 0) && (
          <Fade in timeout={500}>
            <Box>
              <Typography
                variant="h6"
                sx={{ textAlign: 'center', mb: 3, color: 'white', fontWeight: 700 }}
              >
                {loading ? '🔍 Loading products…' : `✨ Found ${count} products`}
              </Typography>

              {count === 0 && !loading && (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      background: 'rgba(255,255,255,0.06)',
                      p: 2,
                      borderRadius: 2,
                      display: 'inline-block',
                    }}
                  >
                    🤖 No matches. Try “sustainable”, “eco-friendly”, or “zero waste”.
                  </Typography>
                </Box>
              )}

              <Grid container spacing={3}>
                {safeResults.map((p, i) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={p.id ?? `${p.name}-${i}`}>
                    <Zoom in timeout={300 + i * 60}>
                      <Card
                        sx={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 3,
                          height: '100%',
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Thumb src={p.image_url} alt={p.name} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography sx={{ color: 'white', fontWeight: 700 }}>
                              {p.name}
                            </Typography>
                            {typeof p.score === 'number' && (
                              <Chip
                                label={`Score ${p.score.toFixed(2)}`}
                                size="small"
                                sx={{ color: 'white', background: 'rgba(0,212,255,0.25)' }}
                              />
                            )}
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ color: 'rgba(255,255,255,0.85)', mb: 1.5 }}
                          >
                            {p.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                            {p.category && (
                              <Chip
                                label={p.category}
                                size="small"
                                sx={{
                                  color: '#00d4ff',
                                  background: 'rgba(0,212,255,0.18)',
                                  border: '1px solid rgba(0,212,255,0.3)',
                                }}
                              />
                            )}
                            {Number.isFinite(p.eco_rating) && (
                              <Chip
                                label={`Eco ★ ${p.eco_rating}`}
                                size="small"
                                sx={{
                                  color: '#00ff88',
                                  background: 'rgba(0,255,136,0.18)',
                                  border: '1px solid rgba(0,255,136,0.3)',
                                }}
                              />
                            )}
                          </Box>
                          {p.price != null && (
                            <Typography
                              sx={{
                                color: '#00ff88',
                                fontWeight: 800,
                                textAlign: 'right',
                              }}
                            >
                              ${n(p.price, 0).toFixed(2)}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default SearchBar;
