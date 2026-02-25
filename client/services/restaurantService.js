const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Service for fetching restaurant data
 */
export const restaurantService = {
  /**
   * Get all restaurants with optional filters
   * @param {number|null} rating - Filter by rating (1-5)
   * @param {string|null} priceRange - Filter by price ($, $$, $$$)
   * @returns {Promise<Array>} List of restaurants
   */
  async getAllRestaurants(rating = null, priceRange = null) {
    try {
      let url = `${API_URL}/api/restaurants`;
      const params = [];

      if (rating) params.push(`rating=${rating}`);
      if (priceRange) params.push(`price_range=${priceRange}`);

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json(); // Renamed from 'data'
      return responseData.data; // Now it's clear: get 'data' from responseData
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      throw error;
    }
  },

  /**
   * Get a single restaurant by ID
   * @param {number} id - Restaurant ID
   * @returns {Promise<Object>} Restaurant details
   */
  async getRestaurantById(id) {
    try {
      const response = await fetch(`${API_URL}/api/restaurants/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data; // Backend returns { data: {...} }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      throw error;
    }
  },
};
