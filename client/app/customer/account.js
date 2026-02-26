import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Customer Account Page
// Displays user email (read-only), customer email, and customer phone (both editable)
// Connects to: GET /api/account/{id}?type=customer
// Connects to: POST /api/account/{id}

export default function CustomerAccount() {
  const router = useRouter();

  // Primary email is read-only — comes from the users table
  const [userEmail, setUserEmail] = useState("");

  // Editable fields — come from the customers table
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Tracks whether the page is still loading data from the API
  const [loading, setLoading] = useState(true);

  // useEffect runs once when the screen loads
  // It fetches the account data from the backend and populates the fields
  useFocusEffect(
    useCallback(() => {
      fetchAccountData();
    }, []),
  );

  // Fetches account data from GET /api/account/{id}?type=customer
  const fetchAccountData = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      const accessToken = await AsyncStorage.getItem("accessToken");
      const response = await fetch(
        `${API_URL}/api/account/${userId}?type=customer`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Populate the fields with real data from the database
      setUserEmail(data.primaryEmail || "");
      setCustomerEmail(data.customerEmail || "");
      setCustomerPhone(data.customerPhone || "");
    } catch (error) {
      console.error("Error fetching account data:", error);
      Alert.alert("Error", "Could not load account data. Please try again.");
    } finally {
      // Whether it succeeded or failed, stop showing the loading state
      setLoading(false);
    }
  };

  // Sends updated email and phone to POST /api/account/{id}
  const handleUpdate = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      const accessToken = await AsyncStorage.getItem("accessToken");
      const response = await fetch(
        `${API_URL}/api/account/${userId}?type=customer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      Alert.alert("Success", "Account updated successfully.");
    } catch (error) {
      console.error("Error updating account:", error);
      Alert.alert("Error", "Could not update account. Please try again.");
    }
  };

  // Handles logging out and returning to login screen
  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/");
  };

  // Show a loading message while data is being fetched
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading account...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MY ACCOUNT</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
      </View>

      {/* Role Label */}
      <Text style={styles.roleLabel}>Logged In As: Customer</Text>

      {/* Primary Email - Read Only */}
      <Text style={styles.fieldLabel}>Primary Email (Read Only)</Text>
      <TextInput
        style={[styles.input, styles.readOnly]}
        value={userEmail}
        editable={false}
        key={`primary-${userEmail}`}
      />
      <Text style={styles.fieldHint}>
        Email used to login to the application.
      </Text>

      {/* Customer Email - Editable */}
      <Text style={styles.fieldLabel}>Customer Email:</Text>
      <TextInput
        style={styles.input}
        value={customerEmail}
        onChangeText={setCustomerEmail}
        placeholder="Customer email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.fieldHint}>
        Email used for your Customer account.
      </Text>

      {/* Customer Phone - Editable */}
      <Text style={styles.fieldLabel}>Customer Phone:</Text>
      <TextInput
        style={styles.input}
        value={customerPhone}
        placeholder="Customer phone"
        keyboardType="phone-pad"
      />
      <Text style={styles.fieldHint}>
        Phone number for your Customer account.
      </Text>

      {/* Update Button */}
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
        <Text style={styles.updateButtonText}>UPDATE ACCOUNT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: "Oswald",
    fontSize: 22,
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
  roleLabel: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#2c2c2c",
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#2c2c2c",
    marginBottom: 6,
  },
  fieldHint: {
    fontFamily: "Arial",
    fontSize: 12,
    color: "#888888",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 6,
    padding: 12,
    fontFamily: "Arial",
    fontSize: 14,
    color: "#2c2c2c",
    marginBottom: 4,
  },
  readOnly: {
    backgroundColor: "#eeeeee",
    color: "#888888",
  },
  updateButton: {
    backgroundColor: "#c0392b",
    padding: 16,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 24,
  },
  updateButtonText: {
    fontFamily: "Oswald",
    fontSize: 16,
    color: "#ffffff",
  },
});
