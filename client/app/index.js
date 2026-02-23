import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("both@gmail.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  /**
   * Validates login form fields
   * @returns {boolean} True if valid, false otherwise
   */
  const validateForm = () => {
    // Check if email is empty
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Check if password is empty
    if (!password) {
      setError("Password is required");
      return false;
    }

    // Check password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    // Clear previous errors
    setError("");

    // Validate form before sending
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const { accessToken, user_id, customer_id, courier_id } = data;

      // Store credentials from API response
      await AsyncStorage.setItem("accessToken", accessToken || "temp-token");
      await AsyncStorage.setItem("user_id", String(user_id));
      await AsyncStorage.setItem("customer_id", String(customer_id));
      await AsyncStorage.setItem("courier_id", String(courier_id));

      // Determine which app to navigate to based on roles
      // hasCustomer is true if the API returned a real customer_id (not null/undefined)
      // hasCourier is true if the API returned a real courier_id (not null/undefined)
      const hasCustomer = customer_id !== null && customer_id !== undefined;
      const hasCourier = courier_id !== null && courier_id !== undefined;

      if (hasCustomer && hasCourier) {
        // Scenario 3: User has both accounts — go to selection page
        router.replace("/selection");
      } else if (hasCustomer) {
        // Scenario 1: Customer only — go directly to customer app
        await AsyncStorage.setItem("type", "customer");
        router.replace("/customer/restaurant/list");
      } else if (hasCourier) {
        // Scenario 2: Courier only — go directly to courier app
        await AsyncStorage.setItem("type", "courier");
        router.replace("/courier/deliveries");
      } else {
        // No valid role found
        setError("No account role found. Please contact support.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/rocket-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to begin</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your primary email here"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>LOG IN</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#222126",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 250,
    height: 120,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontFamily: "Arial",
    fontSize: 22,
    fontWeight: "bold",
    color: "#222126",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  label: {
    fontFamily: "Arial",
    fontSize: 14,
    color: "#222126",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    fontFamily: "Arial",
    color: "#222126",
    marginBottom: 16,
  },
  errorText: {
    color: "#DA583B",
    fontFamily: "Arial",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#DA583B",
    borderRadius: 6,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontFamily: "Arial",
    fontSize: 16,
    fontWeight: "bold",
  },
});
