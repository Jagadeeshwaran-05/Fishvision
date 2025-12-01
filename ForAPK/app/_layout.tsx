import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import fishDb from "@/services/fishDatabase";

export const unstable_settings = {
  initialRouteName: "auth/sign-in",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Preload fish database on app start for faster performance
  useEffect(() => {
    fishDb.initialize().catch((error) => {
      console.error("Failed to preload fish database:", error);
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="scan" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="fish-catalog" options={{ headerShown: false }} />
        <Stack.Screen name="fish-details" options={{ headerShown: false }} />
        <Stack.Screen name="saved-fishes" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
