import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Courier Delivery Page — Courier Home Page
// Displays all PENDING orders with no courier assigned
// Plus all orders assigned to the logged-in courier
// Connects to: GET /api/couriers/{id}/orders
// Connects to: PATCH /api/orders/{id} — updates delivery status

// Status progression: PENDING → IN PROGRESS → DELIVERED
// Status colors: PENDING = red, IN PROGRESS = orange, DELIVERED = green

export default function CourierDeliveries() {
  const router = useRouter();

  // TODO: Replace with real data from API in backend integration step
  const [deliveries, setDeliveries] = useState([
    {
      id: 1,
      address: "111 1st Ave.",
      status: "PENDING",
      restaurant: "Sushi California",
      orderDate: "2023/02/27",
      products: [
        { name: "Salmon Roll", quantity: 2, price: 6.5 },
        { name: "Tuna Roll", quantity: 1, price: 2.25 },
        { name: "Yasai Tempura", quantity: 1, price: 3.0 },
      ],
      total: 12.0,
    },
    {
      id: 2,
      address: "222 2nd Ave.",
      status: "PENDING",
      restaurant: "Amazing Greek",
      orderDate: "2023/02/28",
      products: [{ name: "Greek Salad", quantity: 1, price: 8.5 }],
      total: 8.5,
    },
  ]);

  // Controls which delivery is shown in the detail modal
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Returns the background color for each status button
  const getStatusColor = (status) => {
    if (status === "PENDING") return "#c0392b";
    if (status === "IN PROGRESS") return "#e67e22";
    if (status === "DELIVERED") return "#27ae60";
    return "#c0392b";
  };

  // Advances the status to the next stage
  // PENDING → IN PROGRESS → DELIVERED (locked after DELIVERED)
  const handleStatusPress = (deliveryId) => {
    setDeliveries((prev) =>
      prev.map((delivery) => {
        if (delivery.id !== deliveryId) return delivery;
        if (delivery.status === "PENDING") {
          // TODO: Call PATCH /api/orders/{id} with status IN_PROGRESS in backend step
          return { ...delivery, status: "IN PROGRESS" };
        }
        if (delivery.status === "IN PROGRESS") {
          // TODO: Call PATCH /api/orders/{id} with status DELIVERED in backend step
          return { ...delivery, status: "DELIVERED" };
        }
        // DELIVERED — no further changes allowed
        return delivery;
      }),
    );
  };

  // Opens the delivery detail modal for the selected order
  const handleViewPress = (delivery) => {
    setSelectedDelivery(delivery);
    setModalVisible(true);
  };

  // Handles logging out and returning to login screen
  const handleLogout = () => {
    router.replace("/");
  };

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
              onPress={() => handleStatusPress(delivery.id)}
              disabled={delivery.status === "DELIVERED"}
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
                Order Date: {selectedDelivery?.orderDate}
              </Text>

              {/* Order Details Label */}
              <Text style={styles.modalSectionLabel}>Order Details:</Text>

              {/* Product List */}
              {selectedDelivery?.products.map((product, index) => (
                <View key={index} style={styles.productRow}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productQty}>x{product.quantity}</Text>
                  <Text style={styles.productPrice}>
                    $ {product.price.toFixed(2)}
                  </Text>
                </View>
              ))}

              {/* Total */}
              <Text style={styles.modalTotal}>
                TOTAL: $ {selectedDelivery?.total.toFixed(2)}
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
