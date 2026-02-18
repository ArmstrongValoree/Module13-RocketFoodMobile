import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const restaurantService = {
  async getAllRestaurants(rating = null, priceRange = null) {
    try {
      let url = `${API_URL}/api/restaurants`;
      const params = [];

      if (rating) params.push(`rating=${rating}`);
      if (priceRange) params.push(`price_range=${priceRange}`);

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await axios.get(url);
      return response.data.data; // Extract the 'data' array
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      throw error;
    }
  },

  async getRestaurantById(id) {
    try {
      const response = await axios.get(`${API_URL}/api/restaurants/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      throw error;
    }
  },
};
