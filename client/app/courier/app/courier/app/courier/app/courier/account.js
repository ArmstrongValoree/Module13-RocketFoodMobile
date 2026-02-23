import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Courier Account Page
// Displays user email (read-only), courier email, and courier phone (both editable)
// Connects to: GET /api/account/{id}?type=courier
// Connects to: POST /api/account/{id}

export default function CourierAccount() {
  const router = useRouter();

  // TODO: Replace with real data from API in backend integration step
  const userEmail = "erica.ger@gmail.com";
  const [courierEmail, setCourierEmail] = useState("");
  const [courierPhone, setCourierPhone] = useState("");

  // Handles sending updated email and phone to the backend
  const handleUpdate = async () => {
    Alert.alert("Success", "Account updated successfully.");
    // TODO: Connect to POST /api/account/{id} in backend integration step
  };

  // Handles logging out and returning to login screen
  const handleLogout = () => {
    router.replace("/");
  };

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
      <Text style={styles.roleLabel}>Logged In As: Courier</Text>

      {/* Primary Email - Read Only */}
      <Text style={styles.fieldLabel}>Primary Email (Read Only)</Text>
      <TextInput
        style={[styles.input, styles.readOnly]}
        value={userEmail}
        editable={false}
      />
      <Text style={styles.fieldHint}>
        Email used to login to the application.
      </Text>

      {/* Courier Email - Editable */}
      <Text style={styles.fieldLabel}>Courier Email:</Text>
      <TextInput
        style={styles.input}
        value={courierEmail}
        onChangeText={setCourierEmail}
        placeholder="Courier email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.fieldHint}>Email used for your Courier account.</Text>

      {/* Courier Phone - Editable */}
      <Text style={styles.fieldLabel}>Courier Phone:</Text>
      <TextInput
        style={styles.input}
        value={courierPhone}
        onChangeText={setCourierPhone}
        placeholder="Courier phone"
        keyboardType="phone-pad"
      />
      <Text style={styles.fieldHint}>
        Phone number for your Courier account.
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
