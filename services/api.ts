// API Configuration and Services for Fish Classify App

import Constants from "expo-constants";

// Get your computer's IP address
// For Expo Go: Use your computer's local IP (e.g., 192.168.1.x)
// For iOS Simulator: Use 'localhost'
// For Android Emulator: Use '10.0.2.2'

const getApiUrl = () => {
  // Using your computer's IP address for Expo Go
  // Your IP: 192.168.1.3
  // Make sure backend server is running on http://192.168.1.3:3000

  const devApiUrl = "http://192.168.1.3:3000/api";
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
      console.log("Classifying image:", imageUri);
      console.log("API URL:", `${API_BASE_URL}/classify`);

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

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || data.error || "Classification failed");
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

// Places Service (Public)
export const placesApi = {
  // Get all places
  async getPlaces(
    options: {
      limit?: number;
      offset?: number;
      trending?: boolean;
      region?: string;
      sortBy?: string;
      order?: string;
    } = {}
  ) {
    try {
      const queryParams = new URLSearchParams();
      if (options.limit) queryParams.append("limit", options.limit.toString());
      if (options.offset)
        queryParams.append("offset", options.offset.toString());
      if (options.trending !== undefined)
        queryParams.append("trending", options.trending.toString());
      if (options.region) queryParams.append("region", options.region);
      if (options.sortBy) queryParams.append("sortBy", options.sortBy);
      if (options.order) queryParams.append("order", options.order);

      const response = await fetch(
        `${API_BASE_URL}/places?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch places");
      }
      return data;
    } catch (error: any) {
      console.error("Get places error:", error);
      throw new Error(error.message || "Network error");
    }
  },

  // Get trending places
  async getTrending(limit: number = 6) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/places/trending?limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch trending places");
      }
      return data;
    } catch (error: any) {
      console.error("Get trending places error:", error);
      throw new Error(error.message || "Network error");
    }
  },

  // Get place by ID
  async getPlace(id: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/places/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch place");
      }
      return data;
    } catch (error: any) {
      console.error("Get place error:", error);
      throw new Error(error.message || "Network error");
    }
  },

  // Search places
  async searchPlaces(query: string, limit: number = 20) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/places/search?q=${encodeURIComponent(
          query
        )}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to search places");
      }
      return data;
    } catch (error: any) {
      console.error("Search places error:", error);
      throw new Error(error.message || "Network error");
    }
  },
};

// Saved Places Service (Protected)
export const savedPlacesApi = {
  // Save a place
  async savePlace(
    token: string,
    placeData: {
      place_id: number;
      notes?: string;
    }
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-places`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(placeData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save place");
      }
      return data;
    } catch (error: any) {
      console.error("Save place error:", error);
      throw new Error(error.message || "Network error");
    }
  },

  // Get all saved places
  async getSavedPlaces(token: string, limit: number = 100, offset: number = 0) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/saved-places?limit=${limit}&offset=${offset}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to get saved places");
      }
      return data;
    } catch (error: any) {
      console.error("Get saved places error:", error);
      throw new Error(error.message || "Network error");
    }
  },

  // Get a specific saved place
  async getSavedPlace(token: string, placeId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-places/${placeId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to get place");
      }
      return data;
    } catch (error: any) {
      console.error("Get saved place error:", error);
      throw new Error(error.message || "Network error");
    }
  },

  // Update saved place
  async updateSavedPlace(
    token: string,
    placeId: number,
    updates: { notes?: string; visited?: boolean; visit_date?: string }
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-places/${placeId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update place");
      }
      return data;
    } catch (error: any) {
      console.error("Update saved place error:", error);
      throw new Error(error.message || "Network error");
    }
  },

  // Delete saved place
  async deleteSavedPlace(token: string, placeId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-places/${placeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete place");
      }
      return data;
    } catch (error: any) {
      console.error("Delete saved place error:", error);
      throw new Error(error.message || "Network error");
    }
  },

  // Get statistics
  async getStats(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-places/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to get stats");
      }
      return data;
    } catch (error: any) {
      console.error("Get stats error:", error);
      throw new Error(error.message || "Network error");
    }
  },
};

// Saved Fishes Service
export const savedFishApi = {
  // Save a fish
  async saveFish(
    token: string,
    fishData: {
      fish_name: string;
      scientific_name?: string;
      common_names?: string;
      habitat?: string;
      location?: string;
      image_url?: string;
      notes?: string;
      confidence?: number;
    }
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-fishes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fishData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save fish");
      }
      return data;
    } catch (error: any) {
      console.error("Save fish error:", error);
      throw new Error(error.message || "Network error");
    }
  },

  // Get all saved fishes
  async getSavedFishes(token: string, limit: number = 100, offset: number = 0) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/saved-fishes?limit=${limit}&offset=${offset}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to get saved fishes");
      }
      return data;
    } catch (error: any) {
      console.error("Get saved fishes error:", error);
      throw new Error(error.message || "Network error");
    }
  },

  // Get a specific saved fish
  async getSavedFish(token: string, fishId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-fishes/${fishId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to get fish");
      }
      return data;
    } catch (error: any) {
      console.error("Get saved fish error:", error);
      throw new Error(error.message || "Network error");
    }
  },

  // Update saved fish
  async updateSavedFish(
    token: string,
    fishId: number,
    updates: { fish_name?: string; location?: string; notes?: string }
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-fishes/${fishId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update fish");
      }
      return data;
    } catch (error: any) {
      console.error("Update saved fish error:", error);
      throw new Error(error.message || "Network error");
    }
  },

  // Delete saved fish
  async deleteSavedFish(token: string, fishId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-fishes/${fishId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete fish");
      }
      return data;
    } catch (error: any) {
      console.error("Delete saved fish error:", error);
      throw new Error(error.message || "Network error");
    }
  },

  // Get statistics
  async getStats(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/saved-fishes/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to get stats");
      }
      return data;
    } catch (error: any) {
      console.error("Get stats error:", error);
      throw new Error(error.message || "Network error");
    }
  },
};
