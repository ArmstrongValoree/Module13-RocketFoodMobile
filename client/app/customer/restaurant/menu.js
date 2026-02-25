import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { orderService } from "../../../services/orderService";
import { productService } from "../../../services/productService";
import { restaurantService } from "../../../services/restaurantService";

export default function RestaurantMenuScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const restaurantId = params.id;

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null); // 'loading', 'success', 'error'
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);

  useEffect(() => {
    fetchData();
  }, [restaurantId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [restaurantData, productsData] = await Promise.all([
        restaurantService.getRestaurantById(restaurantId),
        productService.getProductsByRestaurant(restaurantId),
      ]);
      setRestaurant(restaurantData);
      setProducts(productsData);

      // Initialize quantities to 0
      const initialQuantities = {};
      productsData.forEach((product) => {
        initialQuantities[product.id] = 0;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId, change) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change),
    }));
  };

  const getTotalItems = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalCost = () => {
    return products.reduce((sum, product) => {
      return sum + product.cost * (quantities[product.id] || 0);
    }, 0);
  };

  // Opens the modal to show notification checkboxes before placing the order
  const handleCreateOrder = () => {
    setOrderStatus(null);
    setModalVisible(true);
  };

  // Called when the user taps CONFIRM ORDER inside the modal
  // Sends the order to the backend with notification preferences
  const handleConfirmOrder = async () => {
    setOrderStatus("loading");

    try {
      const orderProducts = products
        .filter((p) => quantities[p.id] > 0)
        .map((p) => ({
          id: p.id,
          quantity: quantities[p.id],
          name: p.name,
          cost: p.cost,
        }));

      await orderService.createOrder(
        restaurantId,
        orderProducts.map((p) => ({ id: p.id, quantity: p.quantity })),
        sendEmail,
        sendSMS,
      );
      setOrderStatus("success");
    } catch (error) {
      console.error("Order creation failed:", error);
      setOrderStatus("error");
    }
  };

  const getOrderSummary = () => {
    return products
      .filter((p) => quantities[p.id] > 0)
      .map((p) => ({
        name: p.name,
        quantity: quantities[p.id],
        cost: p.cost,
        total: p.cost * quantities[p.id],
      }));
  };

  const closeModalAndReset = () => {
    const resetQuantities = {};
    products.forEach((product) => (resetQuantities[product.id] = 0));
    setQuantities(resetQuantities);
    setModalVisible(false);
    setOrderStatus(null);
  };

  const renderProduct = ({ item }) => {
    const quantity = quantities[item.id] || 0;

    return (
      <View style={styles.productCard}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.productPrice}>${item.cost.toFixed(2)}</Text>
        </View>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, -1)}
            disabled={quantity === 0}
          >
            <Text
              style={[
                styles.quantityButtonText,
                quantity === 0 && styles.disabledText,
              ]}
            >
              −
            </Text>
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#DA583B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../../assets/images/rocket-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await AsyncStorage.clear();
            router.replace("/");
          }}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Restaurant Banner */}
      <View style={styles.restaurantBanner}>
        <Image
          source={require("../../../assets/images/restaurants/RestaurantMenu.jpg")}
          style={styles.restaurantImage}
        />
        <View style={styles.restaurantOverlay}>
          <Text style={styles.restaurantName}>{restaurant?.name}</Text>
        </View>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />

      {/* Create Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.createOrderButton,
            getTotalItems() === 0 && styles.disabledButton,
          ]}
          onPress={handleCreateOrder}
          disabled={getTotalItems() === 0}
        >
          <Text style={styles.createOrderText}>
            Create Order ({getTotalItems()} items) - $
            {getTotalCost().toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Order Confirmation Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Notification Options */}
            {/* Notification Options — shown before order is submitted */}
            {!orderStatus && (
              <View style={styles.notificationSection}>
                <Text style={styles.notificationTitle}>
                  Would you like to receive your order confirmation by email
                  and/or text?
                </Text>

                {/* By Email Checkbox */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setSendEmail(!sendEmail)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      sendEmail && styles.checkboxChecked,
                    ]}
                  >
                    {sendEmail && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>By Email</Text>
                </TouchableOpacity>

                {/* By Phone Checkbox */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setSendSMS(!sendSMS)}
                >
                  <View
                    style={[styles.checkbox, sendSMS && styles.checkboxChecked]}
                  >
                    {sendSMS && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>By Phone</Text>
                </TouchableOpacity>

                {/* CONFIRM ORDER button — disabled while API call is in progress */}
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmOrder}
                >
                  <Text style={styles.confirmButtonText}>CONFIRM ORDER</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Status Messages */}
            {orderStatus === "loading" && (
              <>
                <ActivityIndicator size="large" color="#DA583B" />
                <Text style={styles.modalText}>Processing Order...</Text>
              </>
            )}

            {orderStatus === "success" && (
              <>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.modalText}>Order Confirmed!</Text>
                <Text style={styles.modalSubtext}>
                  Your order has been received.
                </Text>
              </>
            )}

            {orderStatus === "error" && (
              <>
                <Text style={styles.errorIcon}>✗</Text>
                <Text style={styles.modalText}>Order Failed</Text>
                <Text style={styles.modalSubtext}>
                  An error occurred while processing your order.
                </Text>
                {/* Confirm Button */}
                {/* Disabled with 'In Progress' text while waiting for API response */}
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    orderStatus === "loading" && styles.disabledButton,
                  ]}
                  onPress={
                    orderStatus === null
                      ? handleCreateOrder
                      : closeModalAndReset
                  }
                  disabled={orderStatus === "loading"}
                >
                  <Text style={styles.confirmButtonText}>
                    {orderStatus === "loading"
                      ? "In Progress"
                      : "CONFIRM ORDER"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      {/* Order Confirmation Modal */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5", // Light gray background
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#222126",
    borderBottomWidth: 2,
    borderBottomColor: "#DA583B",
  },
  logo: {
    width: 150,
    height: 40,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#DA583B",
    borderRadius: 4,
  },
  logoutText: {
    color: "#FFFFFF",
    fontFamily: "Arial",
    fontSize: 14,
    fontWeight: "bold",
  },
  restaurantBanner: {
    position: "relative",
    height: 150,
  },
  restaurantImage: {
    width: "100%",
    height: "100%",
  },
  restaurantOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(34, 33, 38, 0.7)",
    padding: 12,
  },
  restaurantName: {
    fontFamily: "Arial",
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  listContent: {
    padding: 16,
  },
  productCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontFamily: "Arial",
    fontSize: 16,
    fontWeight: "bold",
    color: "#222126",
    marginBottom: 4,
  },
  productDescription: {
    fontFamily: "Arial",
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  productPrice: {
    fontFamily: "Arial",
    fontSize: 15,
    fontWeight: "bold",
    color: "#609475",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DA583B",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontFamily: "Arial",
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  disabledText: {
    opacity: 0.3,
  },
  quantityText: {
    fontFamily: "Arial",
    fontSize: 16,
    fontWeight: "bold",
    color: "#222126",
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: "center",
  },
  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#DDD",
  },
  createOrderButton: {
    backgroundColor: "#DA583B",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#CCC",
  },
  createOrderText: {
    fontFamily: "Arial",
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  confirmButton: {
    backgroundColor: "#DA583B",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  confirmButtonText: {
    fontFamily: "Arial",
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#222126",
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  modalTitle: {
    fontFamily: "Arial",
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  closeButton: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  orderSummarySection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  summaryTitle: {
    fontFamily: "Arial",
    fontSize: 16,
    fontWeight: "bold",
    color: "#222126",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryItem: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#222126",
    flex: 2,
  },
  summaryQuantity: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#666",
    flex: 1,
    textAlign: "center",
  },
  summaryPrice: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#222126",
    flex: 1,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  totalLabel: {
    fontFamily: "Arial",
    fontSize: 16,
    fontWeight: "bold",
    color: "#222126",
  },
  totalAmount: {
    fontFamily: "Arial",
    fontSize: 16,
    fontWeight: "bold",
    color: "#222126",
  },
  statusSection: {
    padding: 20,
    alignItems: "center",
  },
  statusText: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
  successIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#609475",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 36,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  successTitle: {
    fontFamily: "Arial",
    fontSize: 18,
    fontWeight: "bold",
    color: "#222126",
    marginBottom: 8,
  },
  successMessage: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  errorIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#851919",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 36,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  errorMessage: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#DA583B",
    padding: 16,
    margin: 20,
    marginTop: 0,
    borderRadius: 4,
    alignItems: "center",
  },
  confirmButtonText: {
    fontFamily: "Arial",
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  notificationSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  notificationTitle: {
    fontFamily: "Arial",
    fontSize: 13,
    color: "#222126",
    textAlign: "center",
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 3,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#DA583B",
    borderColor: "#DA583B",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#222126",
  },
});
