import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import { green } from '@mui/material/colors';
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
  const [results, setResults] = useState([]);      // <- toujours un tableau
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

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

  // Lance la recherche (optionnellement avec une requête passée en paramètre)
  const handleSearch = async (qOverride) => {
    const q = typeof qOverride === 'string' ? qOverride : query;
    if (!q.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setError('');

    try {
      const res = await api.get(`/products/search?q=${encodeURIComponent(q)}`);

      // 🔒 SÉCURITÉ : le backend renvoie { results: [...] } ; si jamais il renvoie autre chose, on protège
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
      setError('Search temporarily unavailable. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
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
    <Box sx={{ padding: 3, backgroundColor: '#f7f9fc', minHeight: '100vh' }}>
      <Typography
        variant="h4"
        sx={{
          color: green[800],
          marginBottom: 3,
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        🔍 AI Product Search
      </Typography>

      {/* Search Input */}
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 4, maxWidth: 600, margin: '0 auto 2rem auto' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for eco-friendly products... (e.g., 'hair care', 'kitchen items', 'bamboo products')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              borderRadius: 2,
            },
          }}
        />
        <Button
          variant="contained"
          onClick={() => handleSearch()}
          disabled={loading}
          sx={{
            backgroundColor: green[700],
            minWidth: 120,
            height: 56,
            borderRadius: 2,
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : '🔍 Search'}
        </Button>
      </Box>

      {/* Messages d'erreur / statut */}
      {error && (
        <Typography variant="body2" color="error" sx={{ textAlign: 'center', mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Search Results */}
      {hasSearched && (
        <Box>
          <Typography variant="h6" sx={{ marginBottom: 2, color: green[700] }}>
            {loading ? 'Searching...' : `Found ${count} products`}
          </Typography>

          {count === 0 && !loading && (
            <Typography variant="body1" color="text.secondary" textAlign="center">
              No products found. Try different keywords like "hair", "kitchen", "bamboo", etc.
            </Typography>
          )}

          <Grid container spacing={3}>
            {safeResults.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id ?? `${product.name}-${product.category}`}>
                <Card
                  sx={{
                    boxShadow: 3,
                    borderRadius: '15px',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': { transform: 'scale(1.05)' },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ color: green[700], fontWeight: 'bold', fontSize: '1.1rem', lineHeight: 1.2 }}
                      >
                        {product.name}
                      </Typography>
                      <Chip
                        label={`Score: ${product.score ?? 0}`}
                        size="small"
                        sx={{ backgroundColor: green[100], color: green[800], fontWeight: 'bold' }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {product.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={product.category}
                        size="small"
                        sx={{ backgroundColor: getCategoryColor(product.category), color: 'text.primary' }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{ color: green[800], fontWeight: 'bold', textAlign: 'right' }}
                    >
                      💲{product.price}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Search Suggestions */}
      {!hasSearched && (
        <Box sx={{ textAlign: 'center', marginTop: 4 }}>
          <Typography variant="h6" sx={{ color: green[700], marginBottom: 2 }}>
            Try searching for:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            {SUGGESTIONS.map((suggestion) => (
              <Chip
                key={suggestion}
                label={suggestion}
                onClick={() => {
                  setQuery(suggestion);     // met à jour l’input
                  handleSearch(suggestion); // lance la recherche directement avec cette valeur
                }}
                sx={{
                  backgroundColor: green[50],
                  color: green[700],
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: green[100] },
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;
