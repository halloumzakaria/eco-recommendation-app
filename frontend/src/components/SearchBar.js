import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel
} from '@mui/material';
import { green, blue, purple, cyan } from '@mui/material/colors';
import api from '../utils/api';

const SUGGESTIONS = [
  'hair care',
  'kitchen items',
  'bamboo products',
  'eco-friendly soap',
  'reusable bottles',
  'yoga mat',
  'cotton bags',
];

// Available categories based on your database
const CATEGORIES = [
  'hygiène',
  'cuisine', 
  'accessoire',
  'décoration',
  'sport',
  'maison',
  'jardinage',
  'kit'
];

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [typing, setTyping] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    priceRange: [0, 200],
    ecoRatingRange: [0, 5],
    category: '',
    sortBy: 'relevance'
  });

  // Couleurs pour les catégories
  const getCategoryColor = (category) => {
    const colors = {
      'hygiène': green[100],
      'cuisine': '#e3f2fd',
      'accessoire': '#f3e5f5',
      'décoration': '#fff3e0',
      'sport': '#e8f5e8',
      'maison': '#fce4ec',
      'jardinage': '#e0f2f1',
      'kit': '#f1f8e9',
    };
    return colors[category] || '#f5f5f5';
  };

  // AI typing animation effect
  useEffect(() => {
    if (query.length > 0) {
      setTyping(true);
      const timer = setTimeout(() => setTyping(false), 500);
      return () => clearTimeout(timer);
    }
  }, [query]);

  // Apply filters to results
  const applyFilters = (products) => {
    return products.filter(product => {
      // Price filter
      const price = parseFloat(product.price) || 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Eco rating filter
      const ecoRating = parseFloat(product.eco_rating) || 0;
      if (ecoRating < filters.ecoRatingRange[0] || ecoRating > filters.ecoRatingRange[1]) {
        return false;
      }

      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      return true;
    });
  };

  // Sort results
  const sortResults = (products) => {
    const sorted = [...products];
    switch (filters.sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
      case 'price-high':
        return sorted.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
      case 'eco-rating':
        return sorted.sort((a, b) => (parseFloat(b.eco_rating) || 0) - (parseFloat(a.eco_rating) || 0));
      case 'name':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      default:
        return sorted; // relevance - keep original order
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      priceRange: [0, 200],
      ecoRatingRange: [0, 5],
      category: '',
      sortBy: 'relevance'
    });
  };

  // Load all products for filtering
  const loadAllProducts = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Loading products using same method as Products page...');
      
      // Use the same approach as Products page
      const { data } = await api.get('/products?page=1&pageSize=1000');
      console.log('📦 API response data:', data);
      
      const normalized = Array.isArray(data?.items) ? data.items : [];
      console.log('📦 Products loaded:', normalized.length);

      // Apply filters and sorting
      const filtered = applyFilters(normalized);
      const sorted = sortResults(filtered);
      
      console.log('📦 After filtering:', filtered.length);
      setResults(sorted);
      setHasSearched(true);
    } catch (e) {
      console.error('❌ Error loading products:', e);
      setError(`Failed to load products: ${e.message}`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Launch AI search (optionally with a query passed as parameter)
  const handleSearch = async (qOverride) => {
    const q = typeof qOverride === 'string' ? qOverride : query;
    if (!q.trim()) {
      // If no query, load all products with filters
      await loadAllProducts();
      return;
    }

    setLoading(true);
    setAiThinking(true);
    setHasSearched(true);
    setError('');

    // Simulate AI thinking time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const res = await api.get(`/products/search?q=${encodeURIComponent(q)}`);

      // Security: backend returns { results: [...] }; protect against unexpected responses
      const data = res?.data;
      const normalized =
        Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : [];

      // Apply filters and sorting
      const filtered = applyFilters(normalized);
      const sorted = sortResults(filtered);
      
      setResults(sorted);
    } catch (e) {
      console.error('Search error:', e);
      setError('AI search encountered an error. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
      setAiThinking(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  // Pour éviter les crashes dans le rendu, on force un tableau
  const safeResults = Array.isArray(results) ? results : [];
  const count = safeResults.length;

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
          `,
          animation: 'pulse 4s ease-in-out infinite alternate',
        },
        '@keyframes pulse': {
          '0%': { opacity: 0.5 },
          '100%': { opacity: 0.8 },
        }
      }}
    >
      {/* Animated background particles */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(2px 2px at 20px 30px, #eee, transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 90px 40px, #fff, transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.3), transparent),
            radial-gradient(2px 2px at 160px 30px, #eee, transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 100px',
          animation: 'float 6s ease-in-out infinite',
          opacity: 0.3,
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          }
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, padding: 4 }}>
        {/* AI Header */}
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                background: 'linear-gradient(45deg, #00d4ff, #ff00ff, #00ff88)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                textShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
                animation: 'glow 2s ease-in-out infinite alternate',
                '@keyframes glow': {
                  '0%': { textShadow: '0 0 30px rgba(0, 212, 255, 0.5)' },
                  '100%': { textShadow: '0 0 40px rgba(255, 0, 255, 0.8)' },
                }
              }}
            >
              🤖 AI Product Search
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 300,
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Powered by advanced AI algorithms to find the perfect eco-friendly products for you
      </Typography>
          </Box>
        </Fade>

        {/* AI Search Interface */}
        <Fade in timeout={1500}>
          <Box sx={{ maxWidth: 800, mx: 'auto', mb: 6 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                p: 3,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
        <TextField
          fullWidth
          variant="outlined"
                placeholder="Ask AI to find eco-friendly products... (e.g., 'sustainable hair care', 'zero waste kitchen')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 3,
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 212, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00d4ff',
                      boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.6)',
                    },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={() => handleSearch()}
          disabled={loading}
          sx={{
                  background: 'linear-gradient(45deg, #00d4ff, #ff00ff)',
                  minWidth: 140,
            height: 56,
                  borderRadius: 3,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #ff00ff, #00d4ff)',
                    boxShadow: '0 6px 25px rgba(255, 0, 255, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>AI Thinking...</span>
                  </Box>
                ) : (
                  '🚀 Search'
                )}
        </Button>
      </Box>

            {/* AI Thinking Indicator */}
            {aiThinking && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  AI is analyzing your request...
                </Typography>
                <LinearProgress 
                  sx={{ 
                    height: 4, 
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(45deg, #00d4ff, #ff00ff)',
                    }
                  }} 
                />
              </Box>
            )}

            {/* Error Messages */}
      {error && (
              <Fade in>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#ff6b6b',
                      background: 'rgba(255, 107, 107, 0.1)',
                      padding: 2,
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

        {/* Mesmerizing AI Filters */}
        <Fade in timeout={1000}>
          <Box sx={{ maxWidth: 1000, mx: 'auto', mb: 6 }}>
            <Box 
              sx={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(15px)',
                borderRadius: 3,
                p: 4,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Professional Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 600, 
                    fontSize: '1.8rem',
                    mb: 1,
                    letterSpacing: '-0.5px'
                  }}
                >
                  Advanced Filtering
                </Typography>
                <Typography 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    letterSpacing: '0.3px'
                  }}
                >
                  Refine your search with precision controls
                </Typography>
              </Box>
                
              <Grid container spacing={4}>
                {/* Price Range - Professional Design */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 2,
                      p: 3,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        background: 'rgba(255, 255, 255, 0.05)',
                      }
                    }}
                  >
                    <Typography 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        mb: 2,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Price Range
                    </Typography>
                    <Typography 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        mb: 3, 
                        fontWeight: 400,
                        fontSize: '1.1rem',
                        textAlign: 'center',
                      }}
                    >
                      ${filters.priceRange[0]} - ${filters.priceRange[1]}
                    </Typography>
                    <Slider
                      value={filters.priceRange}
                      onChange={(_, newValue) => handleFilterChange('priceRange', newValue)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={200}
                      sx={{
                        color: '#ffffff',
                        height: 6,
                        '& .MuiSlider-track': {
                          background: '#ffffff',
                          height: 6,
                          borderRadius: 3,
                        },
                        '& .MuiSlider-rail': {
                          background: 'rgba(255, 255, 255, 0.15)',
                          height: 6,
                          borderRadius: 3,
                        },
                        '& .MuiSlider-thumb': {
                          width: 20,
                          height: 20,
                          background: '#ffffff',
                          border: '2px solid rgba(0, 0, 0, 0.1)',
                          '&:hover': {
                            boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.1)',
                          },
                          '&.Mui-focusVisible': {
                            boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.2)',
                          }
                        },
                        '& .MuiSlider-valueLabel': {
                          background: 'rgba(0, 0, 0, 0.8)',
                          borderRadius: 2,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }
                      }}
                    />
                  </Box>
                </Grid>

                {/* Eco Rating Range - Professional Design */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 2,
                      p: 3,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        background: 'rgba(255, 255, 255, 0.05)',
                      }
                    }}
                  >
                    <Typography 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        mb: 2,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Eco Rating
                    </Typography>
                    <Typography 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        mb: 3, 
                        fontWeight: 400,
                        fontSize: '1.1rem',
                        textAlign: 'center',
                      }}
                    >
                      {filters.ecoRatingRange[0]} - {filters.ecoRatingRange[1]} stars
                    </Typography>
                    <Slider
                      value={filters.ecoRatingRange}
                      onChange={(_, newValue) => handleFilterChange('ecoRatingRange', newValue)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={5}
                      step={0.1}
                      sx={{
                        color: '#ffffff',
                        height: 6,
                        '& .MuiSlider-track': {
                          background: '#ffffff',
                          height: 6,
                          borderRadius: 3,
                        },
                        '& .MuiSlider-rail': {
                          background: 'rgba(255, 255, 255, 0.15)',
                          height: 6,
                          borderRadius: 3,
                        },
                        '& .MuiSlider-thumb': {
                          width: 20,
                          height: 20,
                          background: '#ffffff',
                          border: '2px solid rgba(0, 0, 0, 0.1)',
                          '&:hover': {
                            boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.1)',
                          },
                          '&.Mui-focusVisible': {
                            boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.2)',
                          }
                        },
                        '& .MuiSlider-valueLabel': {
                          background: 'rgba(0, 0, 0, 0.8)',
                          borderRadius: 2,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }
                      }}
                    />
                  </Box>
                </Grid>

                {/* Category Filter - Professional Design */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 2,
                      p: 3,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        background: 'rgba(255, 255, 255, 0.05)',
                      }
                    }}
                  >
                    <Typography 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        mb: 2,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Category
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.6)',
                          '&.Mui-focused': { color: 'rgba(255, 255, 255, 0.8)' }
                        }}
                      >
                        Select Category
                      </InputLabel>
                      <Select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        sx={{
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 1,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.6)',
                          },
                          '& .MuiSelect-icon': {
                            color: 'rgba(255, 255, 255, 0.6)',
                          }
                        }}
                      >
                        <MenuItem value="">All Categories</MenuItem>
                        {CATEGORIES.map(category => (
                          <MenuItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                {/* Sort By - Professional Design */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 2,
                      p: 3,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        background: 'rgba(255, 255, 255, 0.05)',
                      }
                    }}
                  >
                    <Typography 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        mb: 2,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Sort By
        </Typography>
                    <FormControl fullWidth>
                      <InputLabel 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.6)',
                          '&.Mui-focused': { color: 'rgba(255, 255, 255, 0.8)' }
                        }}
                      >
                        Sort Order
                      </InputLabel>
                      <Select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        sx={{
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 1,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.6)',
                          },
                          '& .MuiSelect-icon': {
                            color: 'rgba(255, 255, 255, 0.6)',
                          }
                        }}
                      >
                        <MenuItem value="relevance">Relevance</MenuItem>
                        <MenuItem value="price-low">Price: Low to High</MenuItem>
                        <MenuItem value="price-high">Price: High to Low</MenuItem>
                        <MenuItem value="eco-rating">Eco Rating</MenuItem>
                        <MenuItem value="name">Name A-Z</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                {/* Professional Action Buttons */}
                <Grid item xs={12}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      justifyContent: 'center', 
                      mt: 4, 
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Clear Filters */}
                    <Button
                      variant="outlined"
                      onClick={clearFilters}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.4)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'white',
                        },
                      }}
                    >
                      Clear Filters
                    </Button>

                    {/* Load All Products */}
                    <Button
                      variant="contained"
                      onClick={loadAllProducts}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.15)',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                      }}
                    >
                      Load All Products
                    </Button>

                    {/* Apply Filters */}
                    <Button
                      variant="contained"
                      onClick={() => {
                        const filtered = applyFilters(results);
                        const sorted = sortResults(filtered);
                        setResults(sorted);
                      }}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.15)',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                      }}
                    >
                      Apply Filters
                    </Button>
                  </Box>
                </Grid>
                </Grid>
              </Box>
            </Box>
          </Fade>
      )}

      {/* Search Results */}
        {(hasSearched || results.length > 0) && (
          <Fade in timeout={1000}>
        <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  textAlign: 'center', 
                  mb: 4, 
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
                }}
              >
                {loading ? '🔍 Loading products...' : `✨ Found ${count} products`}
          </Typography>

          {count === 0 && !loading && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      mb: 2,
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: 3,
                      borderRadius: 3,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    🤖 AI couldn't find matching products. Try different keywords like "sustainable", "eco-friendly", or "zero waste"
            </Typography>
                </Box>
          )}

              <Grid container spacing={4}>
                {safeResults.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id ?? `${product.name}-${product.category}`}>
                    <Zoom in timeout={500 + index * 100}>
                <Card
                  sx={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: 4,
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                          transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                          '&:hover': { 
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: '0 20px 40px rgba(0, 212, 255, 0.2)',
                            border: '1px solid rgba(0, 212, 255, 0.3)',
                          },
                  }}
                >
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography
                        variant="h6"
                              sx={{ 
                                color: 'white', 
                                fontWeight: 'bold', 
                                fontSize: '1.2rem', 
                                lineHeight: 1.3,
                                textShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
                              }}
                      >
                        {product.name}
                      </Typography>
                      <Chip
                              label={`AI Score: ${product.score ?? 0}`}
                        size="small"
                              sx={{ 
                                background: 'linear-gradient(45deg, #00d4ff, #ff00ff)',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                              }}
                      />
                    </Box>

                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.8)', 
                              mb: 2,
                              lineHeight: 1.5,
                            }}
                          >
                      {product.description}
                    </Typography>

                          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={product.category}
                        size="small"
                              sx={{ 
                                background: 'rgba(0, 212, 255, 0.2)',
                                color: '#00d4ff',
                                border: '1px solid rgba(0, 212, 255, 0.3)',
                                fontWeight: 'bold',
                              }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                            sx={{ 
                              color: '#00ff88', 
                              fontWeight: 'bold', 
                              textAlign: 'right',
                              textShadow: '0 0 10px rgba(0, 255, 136, 0.3)',
                            }}
                    >
                      💲{product.price}
                    </Typography>
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
