// API Service for communicating with the backend
import { adminApi as firebaseAdminApi, flightApi as firebaseFlightApi } from './firebaseService';

// Admin API endpoints
export const adminApi = {
  // Get analytics for admin dashboard
  getAnalytics: async () => {
    return firebaseAdminApi.getAnalytics();
  },
  
  // Get all flights with optional filters
  getFlights: async (filters = {}) => {
    return firebaseAdminApi.getFlights(filters);
  },
  
  // Get a single flight by ID
  getFlight: async (flightId) => {
    return firebaseAdminApi.getFlight(flightId);
  },
  
  // Create a new flight
  createFlight: async (flightData) => {
    return firebaseAdminApi.createFlight(flightData);
  },
  
  // Update a flight
  updateFlight: async (flightId, flightData) => {
    return firebaseAdminApi.updateFlight(flightId, flightData);
  },
  
  // Delete a flight
  deleteFlight: async (flightId) => {
    return firebaseAdminApi.deleteFlight(flightId);
  },
  
  // Generate random flights
  generateFlights: async (generationData) => {
    return firebaseAdminApi.generateFlights(generationData);
  }
};

// Flight API endpoints
export const flightApi = {
  // Search for flights based on criteria
  searchFlights: async (from, to, date, page = 1) => {
    return firebaseFlightApi.searchFlights(from, to, date, page);
  },
  
  // Get flight by ID
  getFlightById: async (flightId) => {
    return firebaseFlightApi.getFlightById(flightId);
  },
  
  // Record flight activity (search, booking)
  recordActivity: async (flightId, activityType) => {
    return firebaseFlightApi.recordActivity(flightId, activityType);
  }
};

export default {
  flightApi,
  adminApi
}; 