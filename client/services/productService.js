const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Service for fetching restaurant products
 */
export const productService = {
  /**
   * Get all products for a specific restaurant
   * @param {number} restaurantId - Restaurant ID
   * @returns {Promise<Array>} List of products
   */
  async getProductsByRestaurant(restaurantId) {
    try {
      const response = await fetch(
        `${API_URL}/api/products?restaurant=${restaurantId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },
};