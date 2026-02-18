import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { orderService } from "../../services/orderService";

export default function OrderHistoryScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderHistory();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#F0CB67";
      case "in progress":
        return "#DA583B";
      case "delivered":
        return "#609475";
      default:
        return "#666";
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderRow}>
      <View style={styles.orderInfo}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <Text style={styles.restaurantName}>{item.restaurant_name}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.orderActions}>
        <Text style={styles.totalCost}>${item.total_cost.toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewOrder(item)}
        >
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { flex: 2 }]}>Order</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>View</Text>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No orders yet</Text>}
      />

      {/* Order Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Order Details</Text>

            {selectedOrder && (
              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Order ID:</Text>
                  <Text style={styles.detailValue}>#{selectedOrder.id}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedOrder.timestamp)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(selectedOrder.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {selectedOrder.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Restaurant:</Text>
                  <Text style={styles.detailValue}>
                    {selectedOrder.restaurant_name}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Courier:</Text>
                  <Text style={styles.detailValue}>
                    {selectedOrder.courier_name || "Not assigned"}
                  </Text>
                </View>

                <Text style={styles.productsTitle}>Products:</Text>
                {selectedOrder.products.map((product, index) => (
                  <View key={index} style={styles.productRow}>
                    <Text style={styles.productName}>
                      {product.quantity}x {product.product_name}
                    </Text>
                    <Text style={styles.productPrice}>
                      ${product.total_cost.toFixed(2)}
                    </Text>
                  </View>
                ))}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>
                    ${selectedOrder.total_cost.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
    padding: 16,
    backgroundColor: "#222126",
    borderBottomWidth: 2,
    borderBottomColor: "#DA583B",
  },
  headerTitle: {
    fontFamily: "Arial",
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tableHeader: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  tableHeaderText: {
    fontFamily: "Arial",
    fontSize: 14,
    fontWeight: "bold",
    color: "#222126",
  },
  listContent: {
    padding: 16,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  orderInfo: {
    flex: 2,
  },
  orderId: {
    fontFamily: "Arial",
    fontSize: 16,
    fontWeight: "bold",
    color: "#222126",
    marginBottom: 4,
  },
  restaurantName: {
    fontFamily: "Arial",
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontFamily: "Arial",
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  orderActions: {
    flex: 1,
    alignItems: "flex-end",
  },
  totalCost: {
    fontFamily: "Arial",
    fontSize: 16,
    fontWeight: "bold",
    color: "#609475",
    marginBottom: 8,
  },
  viewButton: {
    backgroundColor: "#DA583B",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
  },
  viewButtonText: {
    fontFamily: "Arial",
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  emptyText: {
    fontFamily: "Arial",
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
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
    padding: 24,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontFamily: "Arial",
    fontSize: 20,
    fontWeight: "bold",
    color: "#222126",
    marginBottom: 20,
    textAlign: "center",
  },
  orderDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontFamily: "Arial",
    fontSize: 14,
    fontWeight: "bold",
    color: "#222126",
  },
  detailValue: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#666",
  },
  productsTitle: {
    fontFamily: "Arial",
    fontSize: 16,
    fontWeight: "bold",
    color: "#222126",
    marginTop: 16,
    marginBottom: 12,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  productName: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#222126",
  },
  productPrice: {
    fontFamily: "Arial",
    fontSize: 14,
    fontWeight: "bold",
    color: "#609475",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
  },
  totalLabel: {
    fontFamily: "Arial",
    fontSize: 16,
    fontWeight: "bold",
    color: "#222126",
  },
  totalValue: {
    fontFamily: "Arial",
    fontSize: 18,
    fontWeight: "bold",
    color: "#609475",
  },
  closeButton: {
    backgroundColor: "#DA583B",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    fontFamily: "Arial",
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
