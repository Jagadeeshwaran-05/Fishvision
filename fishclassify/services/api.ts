// API Configuration and Services for Fish Classify App

import Constants from "expo-constants";

// Get your computer's IP address
// For Expo Go: Use your computer's local IP (e.g., 192.168.1.x)
// For iOS Simulator: Use 'localhost'
// For Android Emulator: Use '10.0.2.2'

const getApiUrl = () => {
  // Using your computer's IP address for Expo Go
  // Your IP: 192.168.1.6
  // Make sure backend server is running on http://192.168.1.6:3000

  const devApiUrl = "http://192.168.1.6:3000/api";
  const prodApiUrl = "https://your-production-api.com/api";

  return __DEV__ ? devApiUrl : prodApiUrl;
};

export const API_BASE_URL = getApiUrl();

// Auth Service
export const authApi = {
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

      return data;
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw new Error(
        error.message || "Network error. Please check your connection."
      );
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

      return data;
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw new Error(
        error.message || "Network error. Please check your connection."
      );
    }
  },

  // Get Current User
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

      return data;
    } catch (error: any) {
      console.error("Get user error:", error);
      throw new Error(
        error.message || "Network error. Please check your connection."
      );
    }
  },

  // Update profile
  async updateProfile(token: string, profileData: Record<string, any>) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }
      return data;
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw new Error(error.message || "Network error");
    }
  },

  // Update password
  async updatePassword(
    token: string,
    currentPassword: string,
    newPassword: string
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }
      return data;
    } catch (error: any) {
      console.error("Update password error:", error);
      throw new Error(error.message || "Network error");
    }
  },

  // Upload avatar (multipart/form-data)
  async uploadAvatar(
    token: string,
    file: { uri: string; name: string; type: string }
  ) {
    try {
      const formData: any = new FormData();
      formData.append("avatar", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      const response = await fetch(`${API_BASE_URL}/auth/profile/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // NOTE: Do NOT set Content-Type; let fetch set the correct multipart boundary
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload avatar");
      }
      return data;
    } catch (error: any) {
      console.error("Upload avatar error:", error);
      throw new Error(error.message || "Network error");
    }
  },
};

// Fish Classification Service
export const classifyApi = {
  // Classify fish from image
  async classifyImage(imageUri: string, fileName: string = "fish.jpg") {
    try {
      const formData: any = new FormData();
      formData.append("image", {
        uri: imageUri,
        name: fileName,
        type: "image/jpeg",
      } as any);

      const response = await fetch(`${API_BASE_URL}/classify`, {
        method: "POST",
        headers: {
          // NOTE: Do NOT set Content-Type; let fetch set the correct multipart boundary
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Classification failed");
      }

      return data;
    } catch (error: any) {
      console.error("Classify image error:", error);
      throw new Error(
        error.message || "Network error. Please check your connection."
      );
    }
  },
};
