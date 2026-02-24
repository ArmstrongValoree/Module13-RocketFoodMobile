import { faClockRotateLeft, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Tabs } from "expo-router";

// Courier app tab navigation
// Contains two tabs: Deliveries and Account

export default function CourierLayout() {
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
        name="deliveries"
        options={{
          title: "Deliveries",
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
