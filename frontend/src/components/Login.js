import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Link,
  Box
} from "@mui/material";
import { green } from "@mui/material/colors";
import api from "../utils/api";

const Login = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", { email, password });

      // Stocke le token et les données utilisateur
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.user.id);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Force a page reload to update the authentication state
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("❌ Login error:", error);
      alert("Identifiants invalides. Réessaye !");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8, textAlign: "center" }}>
      <Card sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)"
      }}>
        <CardContent>
          <Typography
            variant="h5"
            sx={{ color: green[700], fontWeight: "bold", mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
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
            Welcome to Ecosphere 🌿
          </Typography>

          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ bgcolor: green[700], mt: 2 }}
            onClick={handleLogin}
          >
            Login
          </Button>

          {/* Lien vers l'inscription */}
          <Typography variant="body2" sx={{ mt: 2 }}>
            Pas encore de compte ?{" "}
            <Link component={RouterLink} to="/register">
              S’inscrire
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
