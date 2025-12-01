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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import fishDb, { FishSpecies } from "@/services/fishDatabase";

export default function FishCatalogScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHabitat, setSelectedHabitat] = useState<string>("All");
  const [fishList, setFishList] = useState<FishSpecies[]>([]);
  const [filteredFish, setFilteredFish] = useState<FishSpecies[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadDatabase();
  }, []);

  useEffect(() => {
    filterFish();
  }, [searchQuery, selectedHabitat, fishList]);

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
      const allFish = fishDb.getAllSpecies();
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

  const filterFish = () => {
    let results = fishList;

    // Filter by habitat
    if (selectedHabitat !== "All") {
      results = fishDb.filterByHabitat(selectedHabitat as any);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      results = fishDb.searchByName(searchQuery);

      // Further filter by habitat if selected
      if (selectedHabitat !== "All") {
        results = results.filter((f) => f.habitat === selectedHabitat);
      }
    }

    setFilteredFish(results);
  };

  const renderFishCard = ({ item }: { item: FishSpecies }) => (
    <TouchableOpacity
      style={styles.fishCard}
      onPress={() => {
        // Navigate to fish details (we'll create this screen)
        router.push({
          pathname: "/fish-details",
          params: { fishId: item.id },
        });
      }}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.fishImage}
        resizeMode="cover"
      />
      <View style={styles.fishInfo}>
        <Text style={styles.fishName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.scientificName} numberOfLines={1}>
          {item.scientific_name}
        </Text>
        <View style={styles.fishMeta}>
          <View
            style={[
              styles.habitatBadge,
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
            <Text style={styles.habitatText}>{item.habitat}</Text>
          </View>
          <View style={styles.sizeBadge}>
            <Ionicons name="resize" size={12} color="#64748b" />
            <Text style={styles.sizeText}>{item.max_length_cm}cm</Text>
          </View>
        </View>
        <Text style={styles.regionText} numberOfLines={1}>
          📍 {item.native_regions[0]}
        </Text>
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#1e3a5f" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Fish Catalog</Text>
          <Text style={styles.headerSubtitle}>
            {filteredFish.length} of {fishList.length} species
          </Text>
        </View>
        <View style={styles.offlineBadge}>
          <Ionicons name="cloud-offline" size={16} color="#10b981" />
        </View>
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
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
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  statsBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a5f",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1e3a5f",
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  filterText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#fff",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  fishCard: {
    flex: 1,
    margin: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  fishImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#f1f5f9",
  },
  fishInfo: {
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
    fontStyle: "italic",
    color: "#64748b",
    marginBottom: 8,
  },
  fishMeta: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  habitatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  habitatText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  sizeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
  },
  sizeText: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
  },
  regionText: {
    fontSize: 11,
    color: "#64748b",
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
