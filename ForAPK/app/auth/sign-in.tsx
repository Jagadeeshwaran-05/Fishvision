import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { authApi } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Web-friendly alert
  const showAlert = (title: string, message: string) => {
    console.log(`⚠️ ${title}: ${message}`);
    if (typeof window !== "undefined") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      showAlert("Invalid Email", "Please enter your email address");
      return;
    }
    if (!password.trim()) {
      showAlert("Invalid Password", "Please enter your password");
      return;
    }

    setLoading(true);

    try {
      // Offline authentication - check local storage
      const usersData = await AsyncStorage.getItem("offlineUsers");
      const users = usersData ? JSON.parse(usersData) : [];

      const user = users.find(
        (u: any) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!user) {
        showAlert(
          "Invalid Email",
          "This email is not registered. Please sign up first."
        );
        setLoading(false);
        return;
      }

      if (user.password !== password) {
        showAlert(
          "Invalid Password",
          "The password you entered is incorrect. Please try again."
        );
        setLoading(false);
        return;
      }

      // Store as logged in user
      const authToken = `offline_token_${Date.now()}`;
      await AsyncStorage.setItem("authToken", authToken);
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
        })
      );

      console.log("✅ Offline login successful:", user.email);
      console.log("✅ User data saved to AsyncStorage");
      console.log(`✅ Welcome back, ${user.name}!`);

      // Navigate immediately - better UX for web
      router.replace("/home");
    } catch (error: any) {
      console.error("❌ Login error:", error);
      setLoading(false);

      // Web-friendly error display
      if (typeof window !== "undefined" && window.alert) {
        window.alert(error.message || "Login failed. Please try again.");
      } else {
        Alert.alert(
          "Login Failed",
          error.message || "An error occurred. Please try again."
        );
      }
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>FishVision</Text>
          <Text style={styles.subtitle}>Discover the underwater world</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Welcome Back</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </Pressable>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Link href="/auth/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Login Later Option */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={async () => {
              // Clear any existing user data before going to home as guest
              await AsyncStorage.multiRemove(["authToken", "userData"]);
              console.log("🔓 Entering as guest - cleared auth data");
              router.replace("/home");
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Login Later</Text>
            <Ionicons name="arrow-forward" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Debug Info (remove in production) */}
        {__DEV__ && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>
              🔧 API: http://192.168.1.6:3000
            </Text>
            <Text style={styles.debugText}>
              💡 Make sure backend is running!
            </Text>
            <Text style={styles.debugText}>
              ✅ Using AsyncStorage for persistence
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2c5364",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#b8d4e0",
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#2c5364",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: "#2c5364",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: "#2c5364",
    borderRadius: 8,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  debugInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    alignItems: "center",
  },
  debugText: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 4,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 15,
    color: "#666",
  },
  signupLink: {
    fontSize: 15,
    color: "#3b82f6",
    fontWeight: "600",
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginTop: 12,
    gap: 8,
  },
  skipButtonText: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "600",
  },
});
