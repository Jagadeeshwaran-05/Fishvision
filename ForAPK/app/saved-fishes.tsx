import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { savedFishApi } from "../services/api";

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

interface Stats {
  total_saved: number;
  this_month: number;
  unique_habitats: number;
}

export default function SavedFishesScreen() {
  const router = useRouter();
  const [savedFishes, setSavedFishes] = useState<SavedFish[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_saved: 0,
    this_month: 0,
    unique_habitats: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userToken = await AsyncStorage.getItem("authToken");
      if (!userToken) {
        Alert.alert("Not Logged In", "Please log in to view your saved fishes");
        router.push("/");
        return;
      }
      setToken(userToken);
      await fetchSavedFishes(userToken);
      await fetchStats(userToken);
    } catch (error) {
      console.error("Load data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedFishes = async (userToken: string) => {
    try {
      const response = await savedFishApi.getSavedFishes(userToken);
      if (response.success) {
        setSavedFishes(response.data);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load saved fishes");
    }
  };

  const fetchStats = async (userToken: string) => {
    try {
      const response = await savedFishApi.getStats(userToken);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error("Fetch stats error:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (token) {
      await fetchSavedFishes(token);
      await fetchStats(token);
    }
    setRefreshing(false);
  };

  const handleFishPress = (fish: SavedFish) => {
    // Navigate to fish details with the saved fish data
    router.push({
      pathname: "/fish-details",
      params: { fishId: fish.id },
    });
  };

  const handleDeleteFish = async (fishId: number) => {
    Alert.alert(
      "Remove Fish",
      "Are you sure you want to remove this fish from your collection?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              if (!token) return;
              await savedFishApi.deleteSavedFish(token, fishId);
              // Refresh the list
              await fetchSavedFishes(token);
              await fetchStats(token);
              Alert.alert("Success", "Fish removed from your collection");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to remove fish");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading your collection...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Fishes</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="heart" size={28} color="#ef4444" />
            <Text style={styles.statNumber}>{stats.total_saved}</Text>
            <Text style={styles.statLabel}>Total Saved</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={28} color="#10b981" />
            <Text style={styles.statNumber}>{stats.this_month}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Collection</Text>
          <TouchableOpacity>
            <Ionicons name="filter-outline" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>
          {savedFishes.map((fish) => (
            <TouchableOpacity
              key={fish.id}
              style={styles.fishCard}
              onPress={() => handleFishPress(fish)}
              activeOpacity={0.7}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri:
                      fish.image_url ||
                      "https://images.unsplash.com/photo-1520990269312-a0d3cd73278b?w=400",
                  }}
                  style={styles.fishImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteFish(fish.id);
                  }}
                >
                  <Ionicons name="heart" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.fishName}>{fish.fish_name}</Text>
                <Text style={styles.scientificName}>
                  {fish.scientific_name || "Unknown"}
                </Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color="#94a3b8" />
                  <Text style={styles.locationText}>
                    {fish.location || fish.habitat || "Unknown"}
                  </Text>
                </View>
                <Text style={styles.dateText}>{formatDate(fish.saved_at)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {savedFishes.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Saved Fishes Yet</Text>
            <Text style={styles.emptyText}>
              Start scanning and saving fishes to build your collection
            </Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => router.push("/scan")}
            >
              <Ionicons name="scan-outline" size={20} color="#fff" />
              <Text style={styles.scanButtonText}>Scan a Fish</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a5f",
  },
  placeholder: {
    width: 32,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e3a5f",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e3a5f",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 20,
  },
  fishCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 140,
    backgroundColor: "#e8f2f7",
    position: "relative",
  },
  fishImage: {
    width: "100%",
    height: "100%",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: 12,
  },
  fishName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e3a5f",
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  dateText: {
    fontSize: 11,
    color: "#cbd5e1",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a5f",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 24,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
