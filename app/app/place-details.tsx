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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import fishDb, { FishSpecies } from "@/services/fishDatabase";

const { width } = Dimensions.get("window");

export default function PlaceDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [fishList, setFishList] = useState<FishSpecies[]>([]);
  const placeName = params.placeName as string;
  const region = params.region as string;

  useEffect(() => {
    loadFishForRegion();
  }, []);

  const loadFishForRegion = async () => {
    try {
      setLoading(true);
      await fishDb.initialize();

      // Get all fish and filter by region
      const allFish = await fishDb.getAllSpecies();

      // Filter fish that have this region in their native_regions
      const regionalFish = allFish.filter((fish) =>
        fish.native_regions?.some(
          (nativeRegion) =>
            nativeRegion.toLowerCase().includes(region.toLowerCase()) ||
            region.toLowerCase().includes(nativeRegion.toLowerCase())
        )
      );

      setFishList(regionalFish);
    } catch (error) {
      console.error("Error loading fish for region:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{placeName}</Text>
          <Text style={styles.headerSubtitle}>
            <Ionicons name="location" size={14} color="#e2e8f0" /> {region}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading fish species...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="fish" size={32} color="#3b82f6" />
              <Text style={styles.statValue}>{fishList.length}</Text>
              <Text style={styles.statLabel}>Species Found</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="water" size={32} color="#10b981" />
              <Text style={styles.statValue}>
                {fishList.filter((f) => f.habitat === "Marine").length}
              </Text>
              <Text style={styles.statLabel}>Marine</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="rainy" size={32} color="#06b6d4" />
              <Text style={styles.statValue}>
                {fishList.filter((f) => f.habitat === "Freshwater").length}
              </Text>
              <Text style={styles.statLabel}>Freshwater</Text>
            </View>
          </View>

          {fishList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="fish-outline" size={80} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No Fish Data Available</Text>
              <Text style={styles.emptyText}>
                We don't have specific fish data for this region yet.
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push("/fish-catalog")}
              >
                <Text style={styles.exploreButtonText}>Explore All Fish</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Fish Species in {region}
                </Text>
              </View>

              <View style={styles.fishGrid}>
                {fishList.map((fish) => (
                  <TouchableOpacity
                    key={fish.id}
                    style={styles.fishCard}
                    onPress={() =>
                      router.push({
                        pathname: "/fish-details",
                        params: { fishId: fish.id },
                      })
                    }
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: fish.image_url }}
                      style={styles.fishImage}
                    />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.7)"]}
                      style={styles.fishGradient}
                    />
                    <View style={styles.fishInfo}>
                      <Text style={styles.fishName} numberOfLines={1}>
                        {fish.name}
                      </Text>
                      <Text style={styles.fishScientific} numberOfLines={1}>
                        {fish.scientific_name}
                      </Text>
                      <View style={styles.habitatBadge}>
                        <Ionicons
                          name={
                            fish.habitat === "Marine"
                              ? "water"
                              : fish.habitat === "Freshwater"
                              ? "rainy"
                              : "leaf"
                          }
                          size={10}
                          color="#fff"
                        />
                        <Text style={styles.habitatText}>{fish.habitat}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#3b82f6",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#e2e8f0",
    marginTop: 4,
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a5f",
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
  fishGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  fishCard: {
    width: (width - 52) / 2,
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
  fishImage: {
    width: "100%",
    height: "100%",
  },
  fishGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
  },
  fishInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  fishName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  fishScientific: {
    fontSize: 11,
    color: "#e2e8f0",
    fontStyle: "italic",
    marginBottom: 6,
  },
  habitatBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  habitatText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
});
