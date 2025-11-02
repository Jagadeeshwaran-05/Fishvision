import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import fishDb from "@/services/fishDatabase";

export default function PlacesScreen() {
  const router = useRouter();
  const [places, setPlaces] = useState<any[]>([]);
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    loadAllPlaces();
    checkBookmarkedPlaces();
  }, []);

  const loadAllPlaces = async () => {
    try {
      await fishDb.initialize();
      // Get all popular places (increase limit to show more)
      const allPlaces = fishDb.getPopularPlaces(20);
      setPlaces(allPlaces);
    } catch (error) {
      console.error("Error loading places:", error);
    }
  };

  const checkBookmarkedPlaces = async () => {
    try {
      const bookmarksJson = await AsyncStorage.getItem("bookmarkedPlaces");
      if (bookmarksJson) {
        const bookmarks = JSON.parse(bookmarksJson);
        setBookmarkedPlaces(new Set(bookmarks));
      }
    } catch (error) {
      console.error("Error checking bookmarked places:", error);
    }
  };

  const handleToggleBookmark = async (place: any) => {
    try {
      const isBookmarked = bookmarkedPlaces.has(place.name);

      let updatedBookmarks: Set<string>;
      if (isBookmarked) {
        // Remove bookmark
        updatedBookmarks = new Set(bookmarkedPlaces);
        updatedBookmarks.delete(place.name);
        setBookmarkedPlaces(updatedBookmarks);
        Alert.alert("Removed", "Place removed from bookmarks");
      } else {
        // Add bookmark
        updatedBookmarks = new Set([...bookmarkedPlaces, place.name]);
        setBookmarkedPlaces(updatedBookmarks);
        Alert.alert("Saved", "Place added to bookmarks!");
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        "bookmarkedPlaces",
        JSON.stringify([...updatedBookmarks])
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update bookmark");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <SafeAreaView edges={["top"]} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#1e3a5f" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Popular Places</Text>
              <Text style={styles.headerSubtitle}>
                {places.length} fishing destinations
              </Text>
            </View>
            <View style={styles.offlineBadge}>
              <Ionicons name="leaf" size={16} color="#10b981" />
            </View>
          </View>
        </SafeAreaView>

        {/* Places Grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.placesGrid}>
            {places.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={styles.placeCard}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/fish-catalog",
                    params: {
                      region: place.region,
                      regionName: place.name,
                    },
                  })
                }
              >
                <Image
                  source={{ uri: place.image_url }}
                  style={styles.placeImage}
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.8)"]}
                  style={styles.placeGradient}
                />
                <TouchableOpacity
                  style={styles.bookmarkButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleToggleBookmark(place);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      bookmarkedPlaces.has(place.name)
                        ? "bookmark"
                        : "bookmark-outline"
                    }
                    size={20}
                    color={
                      bookmarkedPlaces.has(place.name) ? "#3b82f6" : "#fff"
                    }
                  />
                </TouchableOpacity>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <View style={styles.placeStats}>
                    <Ionicons name="fish" size={14} color="#e2e8f0" />
                    <Text style={styles.placeCount}>
                      {place.fish_species_count} species
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a5f",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  offlineBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  placesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  placeCard: {
    width: "48%",
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: "#f7fafc",
  },
  placeImage: {
    width: "100%",
    height: "100%",
  },
  placeGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  bookmarkButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  placeInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  placeStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  placeCount: {
    fontSize: 12,
    color: "#e2e8f0",
  },
});
