import { StyleSheet, Text, View } from "react-native";

export default function RestaurantListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurants</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontFamily: "Arial",
    fontSize: 24,
    fontWeight: "bold",
    color: "#222126",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Arial",
    fontSize: 16,
    color: "#666",
  },
});
