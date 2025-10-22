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
  LinearProgress
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

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [typing, setTyping] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

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

  // Launch AI search (optionally with a query passed as parameter)
  const handleSearch = async (qOverride) => {
    const q = typeof qOverride === 'string' ? qOverride : query;
    if (!q.trim()) return;

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

      setResults(normalized);
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

        {/* Search Results */}
        {hasSearched && (
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
                {loading ? '🔍 AI is searching...' : `✨ Found ${count} AI-recommended products`}
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
