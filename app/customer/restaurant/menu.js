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

  const handleCreateOrder = async () => {
    setModalVisible(true);
    setOrderStatus("loading");

    try {
      // Simulate API call (we'll implement real order creation later)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For now, just show success
      setOrderStatus("success");

      // Reset quantities after 2 seconds
      setTimeout(() => {
        const resetQuantities = {};
        products.forEach((product) => {
          resetQuantities[product.id] = 0;
        });
        setQuantities(resetQuantities);
        setModalVisible(false);
        setOrderStatus(null);
      }, 2000);
    } catch (error) {
      console.error("Order creation failed:", error);
      setOrderStatus("error");
    }
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
                <Text style={styles.modalSubtext}>Please try again.</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleCreateOrder}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    minWidth: 280,
  },
  modalText: {
    fontFamily: "Arial",
    fontSize: 18,
    fontWeight: "bold",
    color: "#222126",
    marginTop: 16,
    textAlign: "center",
  },
  modalSubtext: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  successIcon: {
    fontSize: 48,
    color: "#609475",
  },
  errorIcon: {
    fontSize: 48,
    color: "#DA583B",
  },
  retryButton: {
    backgroundColor: "#DA583B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  retryButtonText: {
    fontFamily: "Arial",
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
