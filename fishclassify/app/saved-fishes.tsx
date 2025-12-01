import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

export default function SavedFishesScreen() {
  const router = useRouter();
  
  // Sample saved fishes data
  const savedFishes = [
    {
      id: 1,
      name: "Bagnus",
      scientificName: "Chanos chanos",
      location: "Wayanad, Kerala",
      image: "https://images.unsplash.com/photo-1520990269312-a0d3cd73278b?w=400",
      date: "Oct 24, 2025",
    },
    {
      id: 2,
      name: "Blue Tang",
      scientificName: "Paracanthurus hepatus",
      location: "Maldives",
      image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400",
      date: "Oct 22, 2025",
    },
    {
      id: 3,
      name: "Clownfish",
      scientificName: "Amphiprioninae",
      location: "Great Barrier Reef",
      image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400",
      date: "Oct 20, 2025",
    },
    {
      id: 4,
      name: "Angelfish",
      scientificName: "Pterophyllum",
      location: "Amazon River",
      image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400",
      date: "Oct 18, 2025",
    },
  ];

  const handleFishPress = (fishId: number) => {
    router.push("/fish-details");
  };

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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="bookmark" size={28} color="#3b82f6" />
            <Text style={styles.statNumber}>{savedFishes.length}</Text>
            <Text style={styles.statLabel}>Total Saved</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={28} color="#10b981" />
            <Text style={styles.statNumber}>12</Text>
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
              onPress={() => handleFishPress(fish.id)}
              activeOpacity={0.7}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: fish.image }}
                  style={styles.fishImage}
                  resizeMode="cover"
                />
                <TouchableOpacity style={styles.favoriteButton}>
                  <Ionicons name="heart" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.fishName}>{fish.name}</Text>
                <Text style={styles.scientificName}>{fish.scientificName}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color="#94a3b8" />
                  <Text style={styles.locationText}>{fish.location}</Text>
                </View>
                <Text style={styles.dateText}>{fish.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {savedFishes.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={80} color="#cbd5e1" />
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
