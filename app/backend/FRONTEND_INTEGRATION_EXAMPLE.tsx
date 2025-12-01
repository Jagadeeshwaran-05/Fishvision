// Example: Testing Authentication from React Native Frontend
// Save this in your fishclassify app for testing

import { useState } from "react";

const API_BASE_URL = "http://localhost:3000/api";

// Authentication Service
export const authService = {
  // Sign Up
  async signup(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Sign up failed");
      }

      return data; // { success: true, data: { user, token } }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  },

  // Sign In
  async signin(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Sign in failed");
      }

      return data; // { success: true, data: { user, token } }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  },

  // Get Current User (Protected)
  async getCurrentUser(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get user");
      }

      return data; // { success: true, data: { user } }
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  },
};

// Example Usage in Sign In Screen
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.signin(email, password);

      // Store token (use AsyncStorage in production)
      console.log("Login successful!");
      console.log("User:", result.data.user);
      console.log("Token:", result.data.token);

      // TODO: Store token in AsyncStorage
      // await AsyncStorage.setItem('authToken', result.data.token);

      return result.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.signup(
        name,
        email,
        password,
        confirmPassword
      );

      console.log("Sign up successful!");
      console.log("User:", result.data.user);
      console.log("Token:", result.data.token);

      // TODO: Store token in AsyncStorage
      // await AsyncStorage.setItem('authToken', result.data.token);

      return result.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { handleSignIn, handleSignUp, loading, error };
}

// Update your sign-in.tsx
// Replace the handleLogin function with:
/*
const { handleSignIn, loading, error } = useAuth();
const router = useRouter();

const onLogin = async () => {
  const result = await handleSignIn(email, password);
  
  if (result) {
    // Navigate to home page
    router.replace("/home");
  } else {
    // Show error
    alert(error || 'Login failed');
  }
};
*/

// Update your sign-up.tsx
// Replace the handleSignUp function with:
/*
const { handleSignUp, loading, error } = useAuth();
const router = useRouter();

const onSignUp = async () => {
  const result = await handleSignUp(name, email, password, confirmPassword);
  
  if (result) {
    // Navigate to home page
    router.replace("/home");
  } else {
    // Show error
    alert(error || 'Sign up failed');
  }
};
*/
