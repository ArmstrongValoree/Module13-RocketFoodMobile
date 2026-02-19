import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const orderService = {
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

      const response = await axios.post(`${API_URL}/api/orders`, orderData);
      return response.data;
    } catch (error) {
      console.error(
        "Order creation error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }, // ← ADD COMMA HERE

  async getOrderHistory() {
    try {
      const customerId = await AsyncStorage.getItem("customer_id");
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
