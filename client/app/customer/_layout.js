import {
  faClockRotateLeft,
  faUser,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Tabs } from "expo-router";

// Customer app tab navigation
// Contains three tabs: Restaurants, Order History, Account

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#222126",
          borderTopColor: "#DA583B",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#DA583B",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarLabelStyle: {
          fontFamily: "Arial",
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="restaurant"
        options={{
          title: "Restaurants",
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faUtensils} color={color} size={20} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Order History",
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faClockRotateLeft} color={color} size={20} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faUser} color={color} size={20} />
          ),
        }}
      />
    </Tabs>
  );
}
