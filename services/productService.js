import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const productService = {
  async getProductsByRestaurant(restaurantId) {
    try {
      const response = await axios.get(
        `${API_URL}/api/products?restaurant=${restaurantId}`,
      );
      return response.data; // Direct array, no wrapper
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },
};
