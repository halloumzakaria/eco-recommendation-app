# 🌱 Eco-Recommendation App

A comprehensive eco-friendly product recommendation system with AI-powered search capabilities.

## ✨ Features

- **Smart Product Search** - AI-powered product recommendations using NLP
- **Admin Dashboard** - Complete product and user management
- **User Authentication** - Secure login and registration system
- **Eco-Rating System** - Products rated for environmental impact
- **Responsive Design** - Modern UI with Material-UI components
- **Comprehensive Testing** - Full test suite for reliability

## 🚀 Tech Stack

- **Frontend:** React, Material-UI, Axios
- **Backend:** Node.js, Express, Sequelize
- **Database:** PostgreSQL
- **NLP Service:** Python, Flask, NLTK
- **Testing:** Jest, React Testing Library
- **Deployment:** Docker, Railway

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/maryamnajari/eco-recommendation-app.git
   cd eco-recommendation-app
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   
   # NLP API
   cd ../backend/nlp_api
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Start the application**
   ```bash
   # Using Docker (recommended)
   docker-compose up -d
   
   # Or manually
   # Start PostgreSQL
   # Start backend: cd backend && npm start
   # Start frontend: cd frontend && npm start
   # Start NLP API: cd backend/nlp_api && python app.py
   ```

## 🧪 Testing

```bash
# Run all tests
./run-tests.sh

# Backend tests only
cd backend && npm test

# Frontend tests only
cd frontend && npm test
```

## 🌐 Deployment

### Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Set environment variables
3. Deploy automatically!

### Other Platforms
- **Render:** Connect GitHub → Deploy web service
- **Vercel:** Connect GitHub → Deploy frontend
- **Docker:** Use provided Docker configurations

## 📁 Project Structure

```
eco-recommendation/
├── backend/                 # Node.js API server
│   ├── controllers/         # API route handlers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── nlp_api/            # Python NLP service
│   └── tests/              # Backend tests
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── docker-compose.yml      # Docker configuration
├── Dockerfile              # Production Docker image
└── README.md              # This file
```

## 🔧 Environment Variables

```env
POSTGRES_DB=eco_recommendation
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NLP_API_URL=http://localhost:5001
```

## 📚 Documentation

- [Testing Guide](TESTING-GUIDE.md) - Complete testing documentation
- [GitHub Deployment](GITHUB-DEPLOYMENT-QUICK-START.md) - Deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🌱 About

Built with ❤️ for a more sustainable future. Help users make environmentally conscious choices with our AI-powered eco-friendly product recommendations.
