// Offline Storage Service for APK Version
// All data stored locally in AsyncStorage

import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys for AsyncStorage
const KEYS = {
  SAVED_FISHES: "offline_saved_fishes",
  SAVED_PLACES: "offline_saved_places",
  USER_PROFILE: "userData",
};

// Saved Fishes
export const offlineSavedFishApi = {
  async getSavedFishes() {
    try {
      const data = await AsyncStorage.getItem(KEYS.SAVED_FISHES);
      const fishes = data ? JSON.parse(data) : [];
      return {
        success: true,
        data: fishes,
        count: fishes.length,
      };
    } catch (error) {
      console.error("Get saved fishes error:", error);
      return { success: false, data: [], count: 0 };
    }
  },

  async saveFish(fishData: any) {
    try {
      const existing = await this.getSavedFishes();
      const fishes = existing.data || [];

      // Check if already saved
      const alreadySaved = fishes.find(
        (f: any) =>
          f.fish_name === fishData.fish_name ||
          f.scientific_name === fishData.scientific_name
      );

      if (alreadySaved) {
        return {
          success: false,
          message: "Fish already in your collection",
        };
      }

      const newFish = {
        id: Date.now().toString(),
        ...fishData,
        saved_at: new Date().toISOString(),
      };

      fishes.push(newFish);
      await AsyncStorage.setItem(KEYS.SAVED_FISHES, JSON.stringify(fishes));

      return {
        success: true,
        message: "Fish saved successfully",
        data: newFish,
      };
    } catch (error) {
      console.error("Save fish error:", error);
      return { success: false, message: "Failed to save fish" };
    }
  },

  async deleteSavedFish(fishId: string | number) {
    try {
      const existing = await this.getSavedFishes();
      const fishes = existing.data || [];

      const filtered = fishes.filter((f: any) => f.id !== fishId.toString());
      await AsyncStorage.setItem(KEYS.SAVED_FISHES, JSON.stringify(filtered));

      return {
        success: true,
        message: "Fish removed from collection",
      };
    } catch (error) {
      console.error("Delete fish error:", error);
      return { success: false, message: "Failed to delete fish" };
    }
  },

  async getStats() {
    try {
      const existing = await this.getSavedFishes();
      const fishes = existing.data || [];

      return {
        success: true,
        data: {
          total_saved: fishes.length,
          recent_saves: fishes.slice(-5).reverse(),
        },
      };
    } catch (error) {
      console.error("Get stats error:", error);
      return { success: false, data: { total_saved: 0, recent_saves: [] } };
    }
  },
};

// Saved Places
export const offlineSavedPlacesApi = {
  async getSavedPlaces() {
    try {
      const data = await AsyncStorage.getItem(KEYS.SAVED_PLACES);
      const places = data ? JSON.parse(data) : [];
      return {
        success: true,
        data: places,
        count: places.length,
      };
    } catch (error) {
      console.error("Get saved places error:", error);
      return { success: false, data: [], count: 0 };
    }
  },

  async savePlace(placeData: any) {
    try {
      const existing = await this.getSavedPlaces();
      const places = existing.data || [];

      // Check if already saved
      const alreadySaved = places.find(
        (p: any) =>
          p.place_id === placeData.place_id || p.name === placeData.name
      );

      if (alreadySaved) {
        return {
          success: false,
          message: "Place already bookmarked",
        };
      }

      const newPlace = {
        id: Date.now().toString(),
        ...placeData,
        saved_at: new Date().toISOString(),
      };

      places.push(newPlace);
      await AsyncStorage.setItem(KEYS.SAVED_PLACES, JSON.stringify(places));

      return {
        success: true,
        message: "Place saved successfully",
        data: newPlace,
      };
    } catch (error) {
      console.error("Save place error:", error);
      return { success: false, message: "Failed to save place" };
    }
  },

  async deleteSavedPlace(placeId: string | number) {
    try {
      const existing = await this.getSavedPlaces();
      const places = existing.data || [];

      const filtered = places.filter((p: any) => p.id !== placeId.toString());
      await AsyncStorage.setItem(KEYS.SAVED_PLACES, JSON.stringify(filtered));

      return {
        success: true,
        message: "Place removed from bookmarks",
      };
    } catch (error) {
      console.error("Delete place error:", error);
      return { success: false, message: "Failed to delete place" };
    }
  },

  async getStats() {
    try {
      const existing = await this.getSavedPlaces();
      const places = existing.data || [];

      return {
        success: true,
        data: {
          total_saved: places.length,
          recent_saves: places.slice(-5).reverse(),
        },
      };
    } catch (error) {
      console.error("Get stats error:", error);
      return { success: false, data: { total_saved: 0, recent_saves: [] } };
    }
  },
};

// User Profile (offline)
export const offlineAuthApi = {
  async updateProfile(updates: any) {
    try {
      const userData = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      if (!userData) {
        return { success: false, message: "User not found" };
      }

      const user = JSON.parse(userData);
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem(
        KEYS.USER_PROFILE,
        JSON.stringify(updatedUser)
      );

      return {
        success: true,
        message: "Profile updated successfully",
        data: { user: updatedUser },
      };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, message: "Failed to update profile" };
    }
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    try {
      const usersData = await AsyncStorage.getItem("offlineUsers");
      const userData = await AsyncStorage.getItem(KEYS.USER_PROFILE);

      if (!usersData || !userData) {
        return { success: false, message: "User not found" };
      }

      const users = JSON.parse(usersData);
      const currentUser = JSON.parse(userData);

      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      if (userIndex === -1) {
        return { success: false, message: "User not found" };
      }

      if (users[userIndex].password !== currentPassword) {
        return { success: false, message: "Current password is incorrect" };
      }

      users[userIndex].password = newPassword;
      await AsyncStorage.setItem("offlineUsers", JSON.stringify(users));

      return {
        success: true,
        message: "Password updated successfully",
      };
    } catch (error) {
      console.error("Update password error:", error);
      return { success: false, message: "Failed to update password" };
    }
  },

  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      if (!userData) {
        return { success: false, message: "Not logged in" };
      }

      const user = JSON.parse(userData);
      return {
        success: true,
        data: { user },
      };
    } catch (error) {
      console.error("Get current user error:", error);
      return { success: false, message: "Failed to get user" };
    }
  },
};
