import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// This screen appears only when a user has BOTH customer and courier accounts.
// It lets them choose which role they want to use for this session.

export default function SelectionScreen() {
  const router = useRouter();

  // Save customer role and navigate to customer app
  const goToCustomer = async () => {
    await AsyncStorage.setItem("type", "customer");
    router.replace("/customer/restaurant/list");
  };

  // Save courier role and navigate to courier app
  const goToCourier = async () => {
    await AsyncStorage.setItem("type", "courier");
    router.replace("/courier/deliveries");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Rocket Food Delivery Logo */}
      <Image
        source={require("../assets/images/rocket-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Page Title */}
      <Text style={styles.title}>Select Account Type</Text>

      {/* Account Type Buttons */}
      <View style={styles.buttonRow}>
        {/* Customer Button */}
        <TouchableOpacity style={styles.card} onPress={goToCustomer}>
          <Ionicons name="person" size={60} color="#c0392b" />
          <Text style={styles.cardText}>Customer</Text>
        </TouchableOpacity>

        {/* Courier Button */}
        <TouchableOpacity style={styles.card} onPress={goToCourier}>
          <Ionicons name="car" size={60} color="#2c2c2c" />
          <Text style={styles.cardText}>Courier</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    width: 220,
    height: 120,
    marginBottom: 32,
  },
  title: {
    fontFamily: "Oswald",
    fontSize: 22,
    color: "#ffffff",
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    width: 130,
  },
  cardText: {
    fontFamily: "Oswald",
    fontSize: 16,
    color: "#2c2c2c",
    marginTop: 12,
  },
});
