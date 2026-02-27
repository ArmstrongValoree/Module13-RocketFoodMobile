// Connects to: GET /api/orders?type=courier&id={id}
// Connects to: PUT /api/order/{id}/courier — assigns courier to order
// Connects to: PUT /api/order/{id}/status — updates delivery status

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Courier Delivery Page — Courier Home Page
// Displays all PENDING orders with no courier assigned
// Plus all orders assigned to the logged-in courier
// Connects to: GET /api/couriers/{id}/orders
// Connects to: PATCH /api/orders/{id} — updates delivery status

// Status progression: PENDING → IN PROGRESS → DELIVERED
// Status colors: PENDING = red, IN PROGRESS = orange, DELIVERED = green

export default function CourierDeliveries() {
  const router = useRouter();

  // Holds the list of deliveries fetched from the backend
  const [deliveries, setDeliveries] = useState([]);

  // Tracks whether the page is still loading data from the API
  const [loading, setLoading] = useState(true);

  // Controls which delivery is shown in the detail modal
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetches deliveries from GET /api/orders?type=courier&id={courierId}
  const fetchDeliveries = async () => {
    try {
      const type = await AsyncStorage.getItem("type");
      const courierId = await AsyncStorage.getItem("courier_id");
      console.log("DEBUG: type=", type, "courierId=", courierId);

      const response = await fetch(
        `${API_URL}/api/orders?type=courier&id=${courierId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      // 204 No Content means the courier has no orders — not an error
      if (response.status === 204) {
        setDeliveries([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Map the API response to the shape our UI expects
      const mapped = data.map((order) => ({
        id: order.id,
        address: order.customer_address || "No address provided",
        status: order.status || "pending",
        restaurant: order.restaurant_name || "Unknown Restaurant",
        orderDate: order.timestamp || "",
        products: (order.products || []).map((p) => ({
          name: p.product_name,
          quantity: p.quantity,
          price: p.unit_cost,
        })),
        total: order.total_cost || 0,
      }));

      setDeliveries(mapped);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  // useFocusEffect re-fetches deliveries every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchDeliveries();
    }, []),
  );

  // Returns the background color for each status button
  const getStatusColor = (status) => {
    if (status === "pending") return "#c0392b";
    if (status === "in progress") return "#e67e22";
    if (status === "delivered") return "#27ae60";
    return "#c0392b";
  };

  // Determines the next status in the progression
  const getNextStatus = (currentStatus) => {
    if (currentStatus === "pending") return "in progress";
    if (currentStatus === "in progress") return "delivered";
    return currentStatus;
  };

  // Advances the status to the next stage and updates the database
  // PENDING → IN PROGRESS → DELIVERED (locked after DELIVERED)
  const handleStatusPress = async (deliveryId, currentStatus) => {
    // Do nothing if already delivered
    if (currentStatus === "delivered") return;

    const nextStatus = getNextStatus(currentStatus);
    const courierId = await AsyncStorage.getItem("courier_id");
    console.log(
      "DEBUG: handleStatusPress courierId=",
      courierId,
      "nextStatus=",
      nextStatus,
    );

    try {
      // Step 1 — If moving to IN PROGRESS, assign this courier to the order first
      if (nextStatus === "in progress") {
        const courierResponse = await fetch(
          `${API_URL}/api/order/${deliveryId}/courier`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({ courier_id: parseInt(courierId) }),
          },
        );

        if (!courierResponse.ok) {
          throw new Error(`HTTP error! status: ${courierResponse.status}`);
        }
      }

      // Step 2 — Update the order status
      // Backend expects lowercase: "pending", "in progress", "delivered"
      const response = await fetch(
        `${API_URL}/api/order/${deliveryId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ status: nextStatus.toLowerCase() }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Re-fetch the full list so the UI reflects the latest state from the database
      await fetchDeliveries();
    } catch (error) {
      console.error("Error updating delivery status:", error);
    }
  };

  // Formats a date string to MM/DD/YYYY format
  const formatOrderDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString; // Return original if invalid
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Opens the delivery detail modal for the selected order
  const handleViewPress = (delivery) => {
    setSelectedDelivery(delivery);
    setModalVisible(true);
  };

  // Handles logging out and returning to login screen
  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/");
  };

  // Show a loading spinner while data is being fetched
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DA583B" />
        <Text style={styles.loadingText}>Loading deliveries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MY DELIVERIES</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
      </View>

      {/* Deliveries Table */}
      <ScrollView>
        {/* Table Header Row */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colId]}>ORDER ID</Text>
          <Text style={[styles.tableHeaderText, styles.colAddress]}>
            ADDRESS
          </Text>
          <Text style={[styles.tableHeaderText, styles.colStatus]}>STATUS</Text>
          <Text style={[styles.tableHeaderText, styles.colView]}>VIEW</Text>
        </View>

        {/* Empty State — shown when no deliveries are available */}
        {deliveries.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No deliveries available.</Text>
          </View>
        )}

        {/* Table Data Rows */}
        {deliveries.map((delivery) => (
          <View key={delivery.id} style={styles.tableRow}>
            {/* Order ID */}
            <Text style={[styles.tableCell, styles.colId]}>{delivery.id}</Text>

            {/* Delivery Address */}
            <Text style={[styles.tableCell, styles.colAddress]}>
              {delivery.address}
            </Text>

            {/* Status Button */}
            <TouchableOpacity
              style={[
                styles.statusButton,
                { backgroundColor: getStatusColor(delivery.status) },
              ]}
              onPress={() => handleStatusPress(delivery.id, delivery.status)}
              disabled={delivery.status === "delivered"}
            >
              <Text style={styles.statusButtonText}>{delivery.status}</Text>
            </TouchableOpacity>

            {/* View Button */}
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => handleViewPress(delivery)}
            >
              <Text style={styles.viewButtonText}>🔍</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Delivery Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>DELIVERY DETAILS</Text>
                <Text style={styles.modalStatus}>
                  Status: {selectedDelivery?.status}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Delivery Address: {selectedDelivery?.address}
              </Text>
              <Text style={styles.modalText}>
                Restaurant: {selectedDelivery?.restaurant}
              </Text>
              <Text style={styles.modalText}>
                Order Date: {formatOrderDate(selectedDelivery?.orderDate)}
              </Text>

              {/* Order Details Label */}
              <Text style={styles.modalSectionLabel}>Order Details:</Text>

              {/* Product List */}
              {selectedDelivery?.products.map((product, index) => (
                <View key={index} style={styles.productRow}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productQty}>x{product.quantity}</Text>
                  <Text style={styles.productPrice}>
                    $ {Number(product.price).toFixed(2)}
                  </Text>
                </View>
              ))}

              {/* Total */}
              <Text style={styles.modalTotal}>
                TOTAL: $ {Number(selectedDelivery?.total).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontFamily: "Arial",
    fontSize: 16,
    color: "#888888",
    marginTop: 12,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#888888",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  headerTitle: {
    fontFamily: "Oswald",
    fontSize: 20,
    color: "#2c2c2c",
  },
  logoutButton: {
    backgroundColor: "#c0392b",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: "#ffffff",
    fontFamily: "Oswald",
    fontSize: 14,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2c2c2c",
    padding: 10,
    alignItems: "center",
  },
  tableHeaderText: {
    color: "#ffffff",
    fontFamily: "Oswald",
    fontSize: 13,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    alignItems: "center",
  },
  tableCell: {
    fontFamily: "Arial",
    fontSize: 13,
    color: "#2c2c2c",
    textAlign: "center",
  },
  colId: { flex: 1 },
  colAddress: { flex: 2 },
  colStatus: { flex: 2 },
  colView: { flex: 1 },
  statusButton: {
    flex: 2,
    padding: 6,
    borderRadius: 4,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statusButtonText: {
    color: "#ffffff",
    fontFamily: "Oswald",
    fontSize: 11,
  },
  viewButton: {
    flex: 1,
    alignItems: "center",
  },
  viewButtonText: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    width: "100%",
    overflow: "hidden",
  },
  modalHeader: {
    backgroundColor: "#2c2c2c",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "Oswald",
    fontSize: 18,
    color: "#DA583B",
  },
  modalStatus: {
    fontFamily: "Arial",
    fontSize: 13,
    color: "#ffffff",
    marginTop: 4,
  },
  modalClose: {
    color: "#ffffff",
    fontSize: 18,
  },
  modalBody: {
    padding: 16,
  },
  modalText: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#2c2c2c",
    marginBottom: 6,
  },
  modalSectionLabel: {
    fontFamily: "Oswald",
    fontSize: 15,
    color: "#2c2c2c",
    marginTop: 12,
    marginBottom: 8,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  productName: {
    fontFamily: "Arial",
    fontSize: 13,
    color: "#2c2c2c",
    flex: 2,
  },
  productQty: {
    fontFamily: "Arial",
    fontSize: 13,
    color: "#2c2c2c",
    flex: 1,
    textAlign: "center",
  },
  productPrice: {
    fontFamily: "Arial",
    fontSize: 13,
    color: "#2c2c2c",
    flex: 1,
    textAlign: "right",
  },
  modalTotal: {
    fontFamily: "Oswald",
    fontSize: 15,
    color: "#2c2c2c",
    textAlign: "right",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 8,
  },
});
