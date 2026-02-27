import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { restaurantService } from "../../../services/restaurantService";

export default function RestaurantListScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, [selectedRating, selectedPrice]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getAllRestaurants(
        selectedRating,
        selectedPrice,
      );
      setRestaurants(data);
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderRestaurant = ({ item }) => {
    // Map cuisine type to image
    const cuisineImages = {
      1: require("../../../assets/images/restaurants/cuisineGreek.jpg"),
      2: require("../../../assets/images/restaurants/cuisineJapanese.jpg"),
      3: require("../../../assets/images/restaurants/cuisinePasta.jpg"),
    };

    const imageSource = cuisineImages[item.price_range] || cuisineImages[1];

    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => router.push(`/customer/restaurant/menu?id=${item.id}`)}
      >
        <Image source={imageSource} style={styles.restaurantImage} />
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.rating}>★ {item.rating || 0}</Text>
            <Text style={styles.priceRange}>
              {"$".repeat(item.price_range)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>NEARBY RESTAURANTS</Text>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Rating</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedRating}
                onValueChange={(value) =>
                  setSelectedRating(value === "" ? null : value)
                }
                style={styles.picker}
              >
                <Picker.Item label="-- Select --" value="" />
                {[1, 2, 3, 4, 5].map((r) => (
                  <Picker.Item key={r} label={`${r} ★`} value={r} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Price</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedPrice}
                onValueChange={(value) =>
                  setSelectedPrice(value === "" ? null : value)
                }
                style={styles.picker}
              >
                <Picker.Item label="-- Select --" value="" />
                {[1, 2, 3].map((p) => (
                  <Picker.Item key={p} label={"$".repeat(p)} value={p} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {/* Restaurant List */}
      {loading ? (
        <ActivityIndicator size="large" color="#DA583B" style={styles.loader} />
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderRestaurant}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No restaurants found</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  sectionTitle: {
    fontFamily: "Oswald",
    fontSize: 16,
    fontWeight: "bold",
    color: "#222126",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  filterGroup: {
    flex: 1,
  },
  filterLabel: {
    fontFamily: "Arial",
    fontSize: 14,
    fontWeight: "bold",
    color: "#222126",
    marginBottom: 4,
  },
  pickerWrapper: {
    backgroundColor: "#DA583B",
    borderRadius: 4,
    overflow: "hidden",
  },
  picker: {
    color: "#FFFFFF",
    backgroundColor: "#DA583B",
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  restaurantCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  restaurantImage: {
    width: "100%",
    height: 120,
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantName: {
    fontFamily: "Arial",
    fontSize: 14,
    fontWeight: "bold",
    color: "#222126",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rating: {
    fontFamily: "Arial",
    fontSize: 13,
    color: "#DA583B",
  },
  priceRange: {
    fontFamily: "Arial",
    fontSize: 13,
    color: "#609475",
    fontWeight: "bold",
  },
  loader: {
    marginTop: 50,
  },
  emptyText: {
    fontFamily: "Arial",
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
});
