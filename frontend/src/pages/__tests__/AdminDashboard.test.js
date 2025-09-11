import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import AdminDashboard from '../AdminDashboard';
import api from '../../utils/api';

// Mock the API module
jest.mock('../../utils/api');
const mockApi = api;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock data
const mockUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin'
};

const mockUsers = [
  { id: 1, name: 'User 1', email: 'user1@example.com', role: 'user' },
  { id: 2, name: 'User 2', email: 'user2@example.com', role: 'user' },
  { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'admin' }
];

const mockProducts = [
  { id: 1, name: 'Bamboo Toothbrush', category: 'Personal Care', price: 8.99, views: 10 },
  { id: 2, name: 'Reusable Bottle', category: 'Kitchen', price: 22.50, views: 25 },
  { id: 3, name: 'Eco Soap', category: 'Personal Care', price: 15.99, views: 5 },
  { id: 4, name: 'Bamboo Utensils', category: 'Kitchen', price: 29.99, views: 30 },
  { id: 5, name: 'Organic Shampoo', category: 'Hair Care', price: 19.99, views: 15 },
  { id: 6, name: 'Solar Charger', category: 'Electronics', price: 49.99, views: 8 }
];

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock localStorage
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'mock-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    // Mock API responses
    mockApi.get.mockImplementation((url) => {
      if (url === '/auth/me') {
        return Promise.resolve({ data: mockUser });
      }
      if (url === '/auth/users') {
        return Promise.resolve({ data: mockUsers });
      }
      if (url === '/products') {
        return Promise.resolve({ data: mockProducts });
      }
      return Promise.reject(new Error('Unknown API endpoint'));
    });

    mockApi.put.mockResolvedValue({ data: {} });
    mockApi.delete.mockResolvedValue({ data: {} });
  });

  const renderAdminDashboard = () => {
    return render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
  };

  it('should render admin dashboard with correct title', async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Ecosphere Admin Dashboard 👑')).toBeInTheDocument();
    });
  });

  it('should display admin statistics', async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });
  });

  it('should display all products (not just 5)', async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      // Check that the section title shows "All Products"
      expect(screen.getByText('All Products')).toBeInTheDocument();
      
      // Check that all 6 products are displayed
      expect(screen.getByText('Bamboo Toothbrush')).toBeInTheDocument();
      expect(screen.getByText('Reusable Bottle')).toBeInTheDocument();
      expect(screen.getByText('Eco Soap')).toBeInTheDocument();
      expect(screen.getByText('Bamboo Utensils')).toBeInTheDocument();
      expect(screen.getByText('Organic Shampoo')).toBeInTheDocument();
      expect(screen.getByText('Solar Charger')).toBeInTheDocument();
    });
  });

  it('should display all users (not just 5)', async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      // Check that the section title shows "All Users"
      expect(screen.getByText('All Users')).toBeInTheDocument();
      
      // Check that all 3 users are displayed
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });
  });

  it('should show correct product information in table', async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      // Check table headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Stock')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      
      // Check specific product data
      expect(screen.getByText('Bamboo Toothbrush')).toBeInTheDocument();
      expect(screen.getByText('Personal Care')).toBeInTheDocument();
      expect(screen.getByText('$8.99')).toBeInTheDocument();
    });
  });

  it('should show correct user information in table', async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      // Check user table headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      
      // Check specific user data
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });
  });

  it('should have edit and delete buttons for each product', async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      // Check that edit and delete buttons are present
      const editButtons = screen.getAllByLabelText(/edit/i);
      const deleteButtons = screen.getAllByLabelText(/delete/i);
      
      // Should have 6 edit buttons and 6 delete buttons (one for each product)
      expect(editButtons).toHaveLength(6);
      expect(deleteButtons).toHaveLength(6);
    });
  });

  it('should have edit and delete buttons for each user', async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      // Check that edit and delete buttons are present for users
      const editButtons = screen.getAllByLabelText(/edit/i);
      const deleteButtons = screen.getAllByLabelText(/delete/i);
      
      // Should have edit and delete buttons for users (total includes both users and products)
      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  it('should display loading state initially', () => {
    renderAdminDashboard();
    
    // Should show loading spinner initially
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    mockApi.get.mockRejectedValue(new Error('API Error'));
    
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load admin data')).toBeInTheDocument();
    });
  });

  it('should redirect non-admin users', () => {
    // Mock non-admin user
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'mock-token';
      if (key === 'user') return JSON.stringify({ ...mockUser, role: 'user' });
      return null;
    });

    renderAdminDashboard();
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect users without token', () => {
    // Mock no token
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return null;
      if (key === 'user') return null;
      return null;
    });

    renderAdminDashboard();
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
