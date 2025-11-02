import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import fishDb, { FishSpecies } from "@/services/fishDatabase";

export default function FishCatalogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    (params.search as string) || ""
  );
  const [selectedRegion, setSelectedRegion] = useState<string>(
    (params.region as string) || "All"
  );
  const [regionName, setRegionName] = useState<string>(
    (params.regionName as string) || ""
  );
  const [selectedHabitat, setSelectedHabitat] = useState<string>("All");
  const [fishList, setFishList] = useState<FishSpecies[]>([]);
  const [filteredFish, setFilteredFish] = useState<FishSpecies[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadDatabase();
  }, []);

  // Update search query and region when params change
  useEffect(() => {
    if (params.search) {
      setSearchQuery(params.search as string);
    }
    if (params.region) {
      setSelectedRegion(params.region as string);
    }
    if (params.regionName) {
      setRegionName(params.regionName as string);
    }
  }, [params.search, params.region, params.regionName]);

  useEffect(() => {
    filterFish();
  }, [searchQuery, selectedHabitat, selectedRegion, fishList]);

  const loadDatabase = async () => {
    try {
      console.log("📱 Starting database initialization...");

      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database load timeout")), 10000)
      );

      const loadPromise = fishDb.initialize();

      await Promise.race([loadPromise, timeoutPromise]);

      console.log("📱 Database initialized, loading species...");
      const allFish = await fishDb.getAllSpecies();
      const dbStats = fishDb.getStatistics();

      console.log(`📱 Loaded ${allFish.length} species`);
      setFishList(allFish);
      setFilteredFish(allFish);
      setStats(dbStats);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error loading database:", error);
      // Show error state but don't crash
      setLoading(false);
      alert(
        "Failed to load fish database. Please check your connection and try again."
      );
    }
  };

  const filterFish = async () => {
    let results = fishList;

    // Filter by region first (from popular places)
    if (selectedRegion !== "All") {
      results = results.filter((fish) =>
        fish.native_regions.some(
          (region) =>
            region.toLowerCase().includes(selectedRegion.toLowerCase()) ||
            selectedRegion.toLowerCase().includes(region.toLowerCase())
        )
      );
    }

    // Filter by habitat
    if (selectedHabitat !== "All") {
      results = results.filter((f) => f.habitat === selectedHabitat);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      results = results.filter(
        (fish) =>
          fish.name.toLowerCase().includes(searchLower) ||
          fish.scientific_name.toLowerCase().includes(searchLower) ||
          fish.common_names.some((name) =>
            name.toLowerCase().includes(searchLower)
          ) ||
          fish.family.toLowerCase().includes(searchLower)
      );
    }

    setFilteredFish(results);
  };

  const renderFishCard = ({ item }: { item: FishSpecies }) => (
    <TouchableOpacity
      style={styles.fishCard}
      onPress={() => {
        router.push({
          pathname: "/fish-details",
          params: { fishId: item.id },
        });
      }}
      activeOpacity={0.95}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.fishImage}
          resizeMode="cover"
        />
        <View
          style={[
            styles.habitatBadgeTop,
            {
              backgroundColor:
                item.habitat === "Freshwater"
                  ? "#10b981"
                  : item.habitat === "Marine"
                  ? "#3b82f6"
                  : "#f59e0b",
            },
          ]}
        >
          <Text style={styles.habitatTextTop}>{item.habitat}</Text>
        </View>
      </View>
      <View style={styles.fishInfo}>
        <Text style={styles.fishName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.scientificName} numberOfLines={1}>
          {item.scientific_name}
        </Text>
        <View style={styles.fishMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="resize-outline" size={14} color="#64748b" />
            <Text style={styles.metaText}>{item.max_length_cm}cm</Text>
          </View>
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={12} color="#64748b" />
          <Text style={styles.regionText} numberOfLines={1}>
            {item.native_regions[0]}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading Fish Database...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#1e3a5f" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {selectedRegion ? `Fish in ${selectedRegion}` : "Fish Catalog"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {filteredFish.length} of {fishList.length} species
            </Text>
          </View>
          <View style={styles.offlineBadge}>
            <Ionicons name="leaf" size={16} color="#10b981" />
          </View>
        </View>
      </SafeAreaView>

      {/* Stats Bar */}
      {stats && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Species</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.byHabitat.Freshwater || 0}
            </Text>
            <Text style={styles.statLabel}>Freshwater</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.byHabitat.Marine || 0}</Text>
            <Text style={styles.statLabel}>Marine</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.byHabitat.Brackish || 0}
            </Text>
            <Text style={styles.statLabel}>Brackish</Text>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#94a3b8"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search fish by name, family, region..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Habitat Filter */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {["All", "Freshwater", "Marine", "Brackish"].map((habitat) => (
            <TouchableOpacity
              key={habitat}
              style={[
                styles.filterChip,
                selectedHabitat === habitat && styles.filterChipActive,
              ]}
              onPress={() => setSelectedHabitat(habitat)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedHabitat === habitat && styles.filterTextActive,
                ]}
              >
                {habitat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Fish List */}
      <FlatList
        data={filteredFish}
        renderItem={renderFishCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fish-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No fish found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  safeArea: {
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  offlineBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  statsBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 0,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1e3a5f",
  },
  filterWrapper: {
    marginBottom: 8,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: "#e2e8f0",
    marginRight: 10,
    minWidth: 80,
    alignItems: "center",
  },
  filterChipActive: {
    backgroundColor: "#3b82f6",
  },
  filterText: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "700",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: "#f8fafc",
  },
  fishCard: {
    flex: 1,
    margin: 6,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    height: 150,
  },
  fishImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e2e8f0",
  },
  habitatBadgeTop: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  habitatTextTop: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "700",
  },
  fishInfo: {
    padding: 14,
  },
  fishName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  scientificName: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#64748b",
    marginBottom: 10,
    fontWeight: "500",
  },
  fishMeta: {
    flexDirection: "row",
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "700",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  regionText: {
    fontSize: 12,
    color: "#64748b",
    flex: 1,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
  },
});
