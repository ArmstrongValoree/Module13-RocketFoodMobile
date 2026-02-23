import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="customer" />
          <Stack.Screen name="selection" />
          <Stack.Screen name="courier" />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
