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
import { authApi } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Web-friendly alert
  const showAlert = (title: string, message: string) => {
    console.log(`⚠️ ${title}: ${message}`);
    if (typeof window !== "undefined") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSignUp = async () => {
    // Validation
    if (!name.trim()) {
      showAlert("Invalid Name", "Please enter your name");
      return;
    }

    if (!email.trim()) {
      showAlert("Invalid Email", "Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showAlert("Invalid Email", "Please enter a valid email address");
      return;
    }

    if (!password) {
      showAlert("Invalid Password", "Please enter a password");
      return;
    }

    if (password.length < 6) {
      showAlert(
        "Invalid Password",
        "Password must be at least 6 characters long"
      );
      return;
    }

    if (!confirmPassword) {
      showAlert("Invalid Password", "Please confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      showAlert(
        "Invalid Password",
        "Passwords do not match. Please try again."
      );
      return;
    }

    try {
      setLoading(true);

      // Offline signup - store locally
      const usersData = await AsyncStorage.getItem("offlineUsers");
      const users = usersData ? JSON.parse(usersData) : [];

      // Check if user already exists
      const existingUser = users.find(
        (u: any) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (existingUser) {
        showAlert(
          "Invalid Email",
          "This email is already registered. Please sign in instead."
        );
        setLoading(false);
        return;
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem("offlineUsers", JSON.stringify(users));

      // Auto login
      const authToken = `offline_token_${Date.now()}`;
      await AsyncStorage.setItem("authToken", authToken);
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        })
      );

      console.log("✅ Offline signup successful:", newUser.email);
      console.log(`✅ Welcome, ${newUser.name}! Account created.`);

      // Navigate immediately
      router.replace("/home");
    } catch (error: any) {
      console.error("❌ Sign up error:", error);
      setLoading(false);

      // Web-friendly error display
      const errorMsg = error.message || "An error occurred. Please try again.";
      if (typeof window !== "undefined") {
        window.alert(errorMsg);
      } else {
        Alert.alert("Signup Failed", errorMsg);
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

        {/* Sign Up Card */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Create Account</Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          </View>

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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </Pressable>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.signupButton,
              loading && styles.signupButtonDisabled,
            ]}
            onPress={handleSignUp}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signinContainer}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <Link href="/auth/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.signinLink}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
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
  signupButton: {
    backgroundColor: "#2c5364",
    borderRadius: 8,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  signupButtonDisabled: {
    backgroundColor: "#7e8e96",
  },
  signupButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signinText: {
    fontSize: 15,
    color: "#666",
  },
  signinLink: {
    fontSize: 15,
    color: "#3b82f6",
    fontWeight: "600",
  },
});
