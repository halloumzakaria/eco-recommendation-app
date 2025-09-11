// src/components/Register.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Alert
} from "@mui/material";
import { green } from "@mui/material/colors";
import api from "../utils/api";

export default function Register() {
  const [user, setUser] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async () => {
    if (!user.name || !user.email || !user.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    console.log("🧐 Registering user:", user);
    try {
      const res = await api.post("/auth/register", user);
      console.log("✅ Registration response:", res.status, res.data);
      if (res.status === 201) {
        alert("Registration successful! You can now login.");
        navigate("/login");
      } else {
        setError(res.data.error || "Registration failed");
      }
    } catch (err) {
      console.error("❌ Registration error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ 
        p: 4, 
        borderRadius: 2, 
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
        textAlign: 'center'
      }}>
        <Typography
          variant="h5"
          sx={{ color: green[700], fontWeight: "bold", mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
        >
          <Box
            component="span"
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            E
          </Box>
          Join Ecosphere 🌿
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Full Name"
          name="name"
          value={user.name}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={user.email}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={user.password}
          onChange={handleChange}
          margin="normal"
          required
        />

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Role</InputLabel>
          <Select
            name="role"
            value={user.role}
            onChange={handleChange}
            label="Role"
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>

        <Button
          fullWidth
          variant="contained"
          onClick={handleRegister}
          disabled={loading}
          sx={{ 
            mt: 3, 
            mb: 2, 
            bgcolor: green[700], 
            '&:hover': { bgcolor: green[800] },
            py: 1.5
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account? <Link to="/login" style={{ color: green[700], textDecoration: 'none' }}>Login here</Link>
        </Typography>
      </Paper>
    </Container>
  );
}
