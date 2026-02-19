import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Service for handling order-related API calls
 * All responses follow standard format: { success, data, message, statusCode }
 */
export const orderService = {
  /**
   * Create a new order
   * @param {number} restaurantId - Restaurant ID
   * @param {Array} products - Array of {id, quantity}
   * @returns {Promise<Object>} Created order data
   */
  async createOrder(restaurantId, products) {
    try {
      const customerId = await AsyncStorage.getItem("customer_id");

      const orderData = {
        restaurant_id: parseInt(restaurantId),
        customer_id: parseInt(customerId),
        products: products.map((p) => ({
          id: p.id,
          quantity: p.quantity,
        })),
      };

      console.log(
        "Creating order with data:",
        JSON.stringify(orderData, null, 2),
      );

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
      const data = await response.json();
      return data; // Server returns the order object directly
    } catch (error) {
      console.error(
        "Order creation error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  /**
   * Get order history for current customer
   * @returns {Promise<Array>} List of orders
   */
  async getOrderHistory() {
    try {
      const customerId = await AsyncStorage.getItem("customer_id");
      const type = await AsyncStorage.getItem("type");
      console.log(
        `Fetching order history for customer_id=${customerId} with type=${type}`,
      );
      const response = await axios.get(
        `${API_URL}/api/orders?type=${type}&id=${customerId}`,
      );
      return response.data; // Extract orders array from wrapper
    } catch (error) {
      console.error("Error fetching order history:", error);
      throw error;
    }
  },

  /**
   * Get single order by ID
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderById(orderId) {
    try {
      const response = await axios.get(`${API_URL}/api/orders/${orderId}`);

      // Standardized: response.data contains { success, data, message, statusCode }
      return response.data.data; // Extract order from wrapper
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },
};
