import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const orderService = {
  async createOrder(restaurantId, products) {
    try {
      const customerId = await AsyncStorage.getItem("customerId");

      const orderData = {
        restaurant_id: parseInt(restaurantId),
        customer_id: parseInt(customerId),
        products: products.map((p) => ({
          product_id: p.id,
          quantity: p.quantity,
        })),
      };

      const response = await axios.post(`${API_URL}/api/orders`, orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  async getOrderHistory() {
    try {
      const customerId = await AsyncStorage.getItem("customerId");
      const response = await axios.get(
        `${API_URL}/api/orders?customer_id=${customerId}`,
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching order history:", error);
      throw error;
    }
  },

  async getOrderById(orderId) {
    try {
      const response = await axios.get(`${API_URL}/api/orders/${orderId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },
};
