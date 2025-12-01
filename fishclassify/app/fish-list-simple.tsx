import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Inline minimal data for testing - just 5 species to test if it works
const SAMPLE_FISH = [
  {
    id: 1,
    name: "Bangus",
    scientific_name: "Chanos chanos",
    habitat: "Marine",
    max_length_cm: 180,
  },
  {
    id: 2,
    name: "Catfish",
    scientific_name: "Silurus sp.",
    habitat: "Freshwater",
    max_length_cm: 150,
  },
  {
    id: 3,
    name: "Tilapia",
    scientific_name: "Oreochromis mossambicus",
    habitat: "Freshwater",
    max_length_cm: 39,
  },
  {
    id: 4,
    name: "Mullet",
    scientific_name: "Mugil cephalus",
    habitat: "Marine",
    max_length_cm: 100,
  },
  {
    id: 5,
    name: "Gold Fish",
    scientific_name: "Carassius auratus",
    habitat: "Freshwater",
    max_length_cm: 40,
  },
];

export default function SimpleFishListScreen() {
  const router = useRouter();

  const renderFishCard = ({ item }: { item: (typeof SAMPLE_FISH)[0] }) => (
    <TouchableOpacity style={styles.fishCard} activeOpacity={0.9}>
      <View style={styles.fishInfo}>
        <Text style={styles.fishName}>{item.name}</Text>
        <Text style={styles.scientificName}>{item.scientific_name}</Text>
        <View style={styles.fishMeta}>
          <View
            style={[
              styles.habitatBadge,
              {
                backgroundColor:
                  item.habitat === "Freshwater" ? "#10b981" : "#3b82f6",
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
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Fish List (Simple)</Text>
          <Text style={styles.headerSubtitle}>
            {SAMPLE_FISH.length} species
          </Text>
        </View>
      </View>

      {/* Fish List */}
      <FlatList
        data={SAMPLE_FISH}
        renderItem={renderFishCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  fishCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  fishInfo: {
    gap: 8,
  },
  fishName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e3a5f",
  },
  scientificName: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#64748b",
  },
  fishMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  habitatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  habitatText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  sizeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
  },
  sizeText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
});
