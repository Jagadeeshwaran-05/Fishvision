import fishDb from "@/services/fishDatabase";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  PanResponder,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  offlineSavedFishApi,
  offlineSavedPlacesApi,
} from "../services/offlineStorage";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

interface SavedFish {
  id: number;
  fish_name: string;
  scientific_name?: string;
  habitat?: string;
  location?: string;
  image_url?: string;
  notes?: string;
  confidence?: number;
  saved_at: string;
}

interface SavedPlace {
  id: number;
  place_id: number;
  place_name: string;
  region: string;
  description?: string;
  image_url?: string;
  fish_species_count: number;
  notes?: string;
  visited?: boolean;
  visit_date?: string;
  saved_at: string;
}

export default function BookmarksScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"fishes" | "places">("fishes");
  const [savedFishes, setSavedFishes] = useState<SavedFish[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [fishStats, setFishStats] = useState({ total: 0, thisMonth: 0 });
  const [placeStats, setPlaceStats] = useState({ total: 0, visited: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // PanResponder to enable horizontal swipe between tabs
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        // only set when horizontal movement is significant and mostly horizontal
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const { dx } = gestureState;
        // swipe left -> next tab (fishes -> places)
        if (dx < -50) {
          setActiveTab("places");
        }
        // swipe right -> previous tab (places -> fishes)
        else if (dx > 50) {
          setActiveTab("fishes");
        }
      },
    })
  ).current;
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userToken = await AsyncStorage.getItem("authToken");
      if (!userToken) {
        console.log("⚠️ Not logged in - redirecting to sign-in");
        if (typeof window !== "undefined") {
          if (
            window.confirm(
              "Login required to view bookmarks. Go to login page?"
            )
          ) {
            router.push("/auth/sign-in");
          } else {
            router.push("/");
          }
        } else {
          Alert.alert(
            "Login Required",
            "Please login to view your saved fishes and places",
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => router.push("/"),
              },
              {
                text: "Login",
                onPress: () => router.push("/auth/sign-in"),
              },
            ]
          );
        }
        return;
      }
      console.log("✅ User authenticated, loading bookmarks...");
      setToken(userToken);
      await Promise.all([
        fetchSavedFishes(userToken),
        fetchSavedPlaces(userToken),
        fetchFishStats(userToken),
        fetchPlaceStats(userToken),
      ]);
    } catch (error) {
      console.error("❌ Load data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedFishes = async (userToken: string) => {
    try {
      const response = await offlineSavedFishApi.getSavedFishes();
      if (response.success) {
        setSavedFishes(response.data);
      }
    } catch (error: any) {
      console.error("Fetch saved fishes error:", error);
    }
  };

  const fetchSavedPlaces = async (userToken: string) => {
    try {
      console.log("📍 Fetching saved places...");
      const response = await offlineSavedPlacesApi.getSavedPlaces();
      console.log("📍 Saved places response:", response);
      if (response.success) {
        console.log(`📍 Found ${response.data.length} saved places`);
        setSavedPlaces(response.data);
      }
    } catch (error: any) {
      console.error("❌ Fetch saved places error:", error);
    }
  };

  const fetchFishStats = async (userToken: string) => {
    try {
      const response = await offlineSavedFishApi.getStats();
      if (response.success) {
        setFishStats({
          total: response.data.total_saved || 0,
          thisMonth: response.data.recent_saves?.length || 0,
        });
      }
    } catch (error: any) {
      console.error("Fetch fish stats error:", error);
    }
  };

  const fetchPlaceStats = async (userToken: string) => {
    try {
      const response = await offlineSavedPlacesApi.getStats();
      if (response.success) {
        // Count visited places from saved places
        const placesResponse = await offlineSavedPlacesApi.getSavedPlaces();
        const visitedCount =
          placesResponse.data?.filter((p: any) => p.visited).length || 0;

        setPlaceStats({
          total: response.data.total_saved || 0,
          visited: visitedCount,
        });
      }
    } catch (error: any) {
      console.error("Fetch place stats error:", error);
    }
  };

  const onRefresh = async () => {
    if (!token) return;
    setRefreshing(true);
    await Promise.all([
      fetchSavedFishes(token),
      fetchSavedPlaces(token),
      fetchFishStats(token),
      fetchPlaceStats(token),
    ]);
    setRefreshing(false);
  };

  const handleDeleteFish = async (fishId: number) => {
    if (!token) return;
    Alert.alert("Remove Fish", "Are you sure you want to remove this fish?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await offlineSavedFishApi.deleteSavedFish(fishId);
            setSavedFishes((prev) => prev.filter((f) => f.id !== fishId));
            setFishStats((prev) => ({
              ...prev,
              total: Math.max(0, prev.total - 1),
            }));
            Alert.alert("Success", "Fish removed from bookmarks");
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to remove fish");
          }
        },
      },
    ]);
  };

  const handleFishPress = async (fish: SavedFish) => {
    try {
      // Initialize fish database if not already
      await fishDb.initialize();

      // Search for the fish by name to get the correct species ID
      const allFish = await fishDb.getAllSpecies();
      const matchingFish = allFish.find(
        (f) => f.name.toLowerCase() === fish.fish_name.toLowerCase()
      );

      if (matchingFish) {
        router.push({
          pathname: "/fish-details",
          params: { fishId: matchingFish.id },
        });
      } else {
        Alert.alert("Error", "Fish details not found in database");
      }
    } catch (error) {
      console.error("Error finding fish:", error);
      Alert.alert("Error", "Failed to load fish details");
    }
  };

  const handleDeletePlace = async (placeId: number) => {
    if (!token) return;
    Alert.alert("Remove Place", "Are you sure you want to remove this place?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await offlineSavedPlacesApi.deleteSavedPlace(placeId);
            setSavedPlaces((prev) => prev.filter((p) => p.id !== placeId));
            setPlaceStats((prev) => ({
              ...prev,
              total: Math.max(0, prev.total - 1),
            }));
            Alert.alert("Success", "Place removed from bookmarks");
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to remove place");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading bookmarks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStats = activeTab === "fishes" ? fishStats : placeStats;
  const currentData = activeTab === "fishes" ? savedFishes : savedPlaces;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1e3a5f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bookmarks</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Ionicons name="reload" size={22} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "fishes" && styles.activeTab]}
            onPress={() => setActiveTab("fishes")}
          >
            <Ionicons
              name="fish"
              size={20}
              color={activeTab === "fishes" ? "#3b82f6" : "#64748b"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "fishes" && styles.activeTabText,
              ]}
            >
              Fishes ({fishStats.total})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "places" && styles.activeTab]}
            onPress={() => setActiveTab("places")}
          >
            <Ionicons
              name="location"
              size={20}
              color={activeTab === "places" ? "#3b82f6" : "#64748b"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "places" && styles.activeTabText,
              ]}
            >
              Places ({placeStats.total})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {activeTab === "fishes" ? (
            <>
              <View style={styles.statCard}>
                <Ionicons name="heart" size={24} color="#ef4444" />
                <Text style={styles.statValue}>{fishStats.total}</Text>
                <Text style={styles.statLabel}>Total Saved</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="calendar" size={24} color="#10b981" />
                <Text style={styles.statValue}>{fishStats.thisMonth}</Text>
                <Text style={styles.statLabel}>This Month</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.statCard}>
                <Ionicons name="location" size={24} color="#3b82f6" />
                <Text style={styles.statValue}>{placeStats.total}</Text>
                <Text style={styles.statLabel}>Total Saved</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text style={styles.statValue}>{placeStats.visited}</Text>
                <Text style={styles.statLabel}>Visited</Text>
              </View>
            </>
          )}
        </View>

        <ScrollView
          {...panResponder.panHandlers}
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {currentData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name={
                  activeTab === "fishes" ? "fish-outline" : "location-outline"
                }
                size={80}
                color="#cbd5e1"
              />
              <Text style={styles.emptyTitle}>
                No {activeTab === "fishes" ? "Fishes" : "Places"} Saved Yet
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === "fishes"
                  ? "Start exploring and save your favorite fish species"
                  : "Discover and bookmark amazing fishing locations"}
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() =>
                  router.push(
                    activeTab === "fishes" ? "/fish-catalog" : "/places"
                  )
                }
              >
                <Text style={styles.exploreButtonText}>Explore Now</Text>
              </TouchableOpacity>
            </View>
          ) : activeTab === "fishes" ? (
            <View style={styles.grid}>
              {savedFishes.map((fish) => (
                <View key={fish.id} style={styles.fishCard}>
                  <TouchableOpacity
                    style={styles.cardTouchable}
                    onPress={() => handleFishPress(fish)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{
                        uri:
                          fish.image_url || "https://via.placeholder.com/150",
                      }}
                      style={styles.cardImage}
                    />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.8)"]}
                      style={styles.cardGradient}
                    />
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{fish.fish_name}</Text>
                      <Text style={styles.cardSubtitle}>
                        {fish.scientific_name || fish.habitat}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteFish(fish.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="heart" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.placesList}>
              {savedPlaces.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.placeCard}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{
                      uri: place.image_url || "https://via.placeholder.com/400",
                    }}
                    style={styles.placeImage}
                  />
                  <View style={styles.placeContent}>
                    <View style={styles.placeHeader}>
                      <View style={styles.placeInfo}>
                        <Text style={styles.placeName}>{place.place_name}</Text>
                        <Text style={styles.placeRegion}>
                          <Ionicons
                            name="location-outline"
                            size={14}
                            color="#64748b"
                          />{" "}
                          {place.region}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.placeDeleteButton}
                        onPress={() => handleDeletePlace(place.id)}
                      >
                        <Ionicons name="bookmark" size={22} color="#3b82f6" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.placeSpecies}>
                      {place.fish_species_count} fish species
                    </Text>
                    {place.notes && (
                      <Text style={styles.placeNotes} numberOfLines={2}>
                        📝 {place.notes}
                      </Text>
                    )}
                    {place.visited && (
                      <View style={styles.visitedBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color="#10b981"
                        />
                        <Text style={styles.visitedText}>Visited</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a5f",
  },
  refreshButton: {
    width: 40,
    alignItems: "flex-end",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#eff6ff",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
  },
  activeTabText: {
    color: "#3b82f6",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: "#fff",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f7fafc",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e3a5f",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a5f",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  fishCard: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTouchable: {
    width: "100%",
    height: "100%",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
    elevation: 5,
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#e2e8f0",
  },
  placesList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  placeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  placeImage: {
    width: "100%",
    height: 160,
  },
  placeContent: {
    padding: 16,
  },
  placeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e3a5f",
    marginBottom: 4,
  },
  placeRegion: {
    fontSize: 14,
    color: "#64748b",
  },
  placeDeleteButton: {
    padding: 4,
  },
  placeSpecies: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
    marginBottom: 8,
  },
  placeNotes: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 8,
  },
  visitedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  visitedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
  },
});
