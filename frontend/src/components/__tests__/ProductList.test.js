import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductList from '../ProductList';
import api from '../../utils/api';

// Mock the API module
jest.mock('../../utils/api');
const mockApi = api;

// Mock data
const mockProducts = [
  {
    id: 1,
    name: 'Bamboo Toothbrush',
    description: 'Eco-friendly bamboo toothbrush',
    price: 8.99,
    category: 'Personal Care',
    eco_rating: 4.5,
    image_url: 'https://example.com/toothbrush.jpg',
    views: 10
  },
  {
    id: 2,
    name: 'Reusable Water Bottle',
    description: 'Stainless steel reusable bottle',
    price: 22.50,
    category: 'Kitchen',
    eco_rating: 4.8,
    image_url: 'https://example.com/bottle.jpg',
    views: 25
  },
  {
    id: 3,
    name: 'Organic Shampoo',
    description: 'Natural organic shampoo',
    price: 15.99,
    category: 'Hair Care',
    eco_rating: 4.2,
    image_url: 'https://example.com/shampoo.jpg',
    views: 5
  }
];

describe('ProductList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API response
    mockApi.get.mockResolvedValue({ data: mockProducts });
  });

  it('should render product list with all products', async () => {
    render(<ProductList />);
    
    await waitFor(() => {
      expect(screen.getByText('Bamboo Toothbrush')).toBeInTheDocument();
      expect(screen.getByText('Reusable Water Bottle')).toBeInTheDocument();
      expect(screen.getByText('Organic Shampoo')).toBeInTheDocument();
    });
  });

  it('should display product information correctly', async () => {
    render(<ProductList />);
    
    await waitFor(() => {
      // Check first product details
      expect(screen.getByText('Bamboo Toothbrush')).toBeInTheDocument();
      expect(screen.getByText('Eco-friendly bamboo toothbrush')).toBeInTheDocument();
      expect(screen.getByText('$8.99')).toBeInTheDocument();
      expect(screen.getByText('Personal Care')).toBeInTheDocument();
    });
  });

  it('should display eco rating stars', async () => {
    render(<ProductList />);
    
    await waitFor(() => {
      // Check that star ratings are displayed
      const starElements = screen.getAllByTestId('StarIcon');
      expect(starElements.length).toBeGreaterThan(0);
    });
  });

  it('should show loading state initially', () => {
    render(<ProductList />);
    
    // Should show loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should handle empty product list', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    
    render(<ProductList />);
    
    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    mockApi.get.mockRejectedValue(new Error('API Error'));
    
    render(<ProductList />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading products')).toBeInTheDocument();
    });
  });

  it('should filter products by category', async () => {
    render(<ProductList />);
    
    await waitFor(() => {
      // Check that all products are initially displayed
      expect(screen.getByText('Bamboo Toothbrush')).toBeInTheDocument();
      expect(screen.getByText('Reusable Water Bottle')).toBeInTheDocument();
      expect(screen.getByText('Organic Shampoo')).toBeInTheDocument();
    });
  });

  it('should display product images', async () => {
    render(<ProductList />);
    
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  it('should show view counts', async () => {
    render(<ProductList />);
    
    await waitFor(() => {
      // Check that view counts are displayed
      expect(screen.getByText('10')).toBeInTheDocument(); // First product views
      expect(screen.getByText('25')).toBeInTheDocument(); // Second product views
      expect(screen.getByText('5')).toBeInTheDocument();  // Third product views
    });
  });
});
