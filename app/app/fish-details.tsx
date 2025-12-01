import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import fishDb, { FishSpecies } from "@/services/fishDatabase";
import { savedFishApi } from "@/services/api";

const { width } = Dimensions.get("window");

export default function FishDetailsScreen() {
  const router = useRouter();
  const { fishId } = useLocalSearchParams();
  const [isSaved, setIsSaved] = useState(false);
  const [savedFishId, setSavedFishId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [fish, setFish] = useState<FishSpecies | null>(null);
  const [relatedSpecies, setRelatedSpecies] = useState<FishSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFishData();
  }, [fishId]);

  useEffect(() => {
    if (fish) {
      checkSavedStatus();
    }
  }, [fish]);

  const loadFishData = async () => {
    try {
      await fishDb.initialize();

      // Get the fish by ID
      const fishData = await fishDb.getSpeciesById(Number(fishId));
      setFish(fishData || null);

      // Get related species (same habitat or family)
      if (fishData) {
        const related = await fishDb.filterByHabitat(fishData.habitat);
        const filtered = related
          .filter((f) => f.id !== fishData.id)
          .slice(0, 3);
        setRelatedSpecies(filtered);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading fish data:", error);
      setLoading(false);
    }
  };

  const checkSavedStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token || !fish) {
        setIsSaved(false);
        setSavedFishId(null);
        return;
      }

      const response = await savedFishApi.getSavedFishes(token);
      const savedFishList = response.data || response;
      const savedFish = savedFishList.find(
        (sf: any) => sf.fish_name === fish.name
      );

      if (savedFish) {
        setIsSaved(true);
        setSavedFishId(savedFish.id);
      } else {
        setIsSaved(false);
        setSavedFishId(null);
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
      setIsSaved(false);
      setSavedFishId(null);
    }
  };

  const handleShare = async () => {
    if (!fish) return;

    try {
      const message = `Check out this fish: ${fish.name} (${
        fish.scientific_name
      })\n\n${fish.description}\n\nFound in: ${fish.native_regions.join(", ")}`;

      await Share.share({
        message: message,
        title: fish.name,
      });
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share fish details");
    }
  };

  const handleSaveFish = async () => {
    if (!fish) return;

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Not Logged In", "Please log in to save fishes", [
          { text: "Cancel" },
          { text: "Log In", onPress: () => router.push("/") },
        ]);
        setSaving(false);
        return;
      }

      if (isSaved && savedFishId) {
        // Delete the saved fish
        await savedFishApi.deleteSavedFish(token, savedFishId);
        setIsSaved(false);
        setSavedFishId(null);
        Alert.alert("Removed", "Fish removed from your collection");
      } else {
        // Save the fish
        const result = await savedFishApi.saveFish(token, {
          fish_name: fish.name,
          scientific_name: fish.scientific_name,
          common_names: fish.common_names?.join(", "),
          habitat: fish.habitat,
          image_url: fish.image_url,
        });
        setIsSaved(true);
        const newFishId = result.data?.id || result.id || result.fishId;
        setSavedFishId(newFishId);
        Alert.alert("Success", "Fish saved to your collection!");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save fish");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading fish details...</Text>
      </View>
    );
  }

  if (!fish) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="fish-outline" size={64} color="#cbd5e1" />
          <Text style={styles.errorText}>Fish not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const images = [fish.image_url];

  const facts = [
    {
      icon: "water",
      text: `Found in ${fish.habitat.toLowerCase()} habitats`,
      color: "#3b82f6",
    },
    { icon: "restaurant", text: fish.diet, color: "#10b981" },
    {
      icon: "location",
      text: `Native to ${fish.native_regions[0]}`,
      color: "#8b5cf6",
    },
    { icon: "shield", text: fish.commercial_importance, color: "#f59e0b" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images[selectedImage] }}
            style={styles.mainImage}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "transparent", "rgba(0,0,0,0.8)"]}
            style={styles.imageGradient}
          />

          {/* Header Buttons */}
          <SafeAreaView style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleSaveFish}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons
                    name={isSaved ? "heart" : "heart-outline"}
                    size={24}
                    color={isSaved ? "#ef4444" : "#fff"}
                  />
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  selectedImage === index && styles.indicatorActive,
                ]}
                onPress={() => setSelectedImage(index)}
              />
            ))}
          </View>

          {/* Conservation Status Badge */}
          <View style={styles.conservationBadge}>
            <Ionicons name="leaf" size={16} color="#10b981" />
            <Text style={styles.conservationText}>
              {fish.conservation_status}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <View>
              <Text style={styles.title}>{fish.name}</Text>
              <Text style={styles.scientificName}>{fish.scientific_name}</Text>
              <View style={styles.habitatRow}>
                <Ionicons name="location" size={16} color="#64748b" />
                <Text style={styles.habitatText}>
                  {fish.native_regions.join(", ")}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#dbeafe" },
                ]}
              >
                <Ionicons name="scale-outline" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.statValue}>{fish.max_weight_kg} kg</Text>
              <Text style={styles.statLabel}>Max Weight</Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#ede9fe" },
                ]}
              >
                <Ionicons name="resize-outline" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.statValue}>{fish.max_length_cm} cm</Text>
              <Text style={styles.statLabel}>Max Length</Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#d1fae5" },
                ]}
              >
                <Ionicons name="hourglass-outline" size={24} color="#10b981" />
              </View>
              <Text style={styles.statValue}>{fish.max_age_years} yrs</Text>
              <Text style={styles.statLabel}>Lifespan</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{fish.description}</Text>
            <View style={styles.familyBadge}>
              <Text style={styles.familyLabel}>Family:</Text>
              <Text style={styles.familyValue}>{fish.family}</Text>
            </View>
          </View>

          {/* Habitat Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habitat</Text>
            <View style={styles.habitatCard}>
              <LinearGradient
                colors={
                  fish.habitat === "Freshwater"
                    ? ["#10b981", "#059669"]
                    : fish.habitat === "Marine"
                    ? ["#3b82f6", "#2563eb"]
                    : ["#f59e0b", "#d97706"]
                }
                style={styles.habitatGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.habitatInfo}>
                  <Ionicons name="water" size={32} color="#fff" />
                  <View style={styles.habitatTextContainer}>
                    <Text style={styles.habitatTitle}>{fish.habitat}</Text>
                    <Text style={styles.habitatDescription}>
                      Native to: {fish.native_regions.slice(0, 2).join(", ")}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Did You Know */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={24} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Did you know?</Text>
            </View>
            <View style={styles.factsContainer}>
              {facts.map((fact, index) => (
                <View key={index} style={styles.factCard}>
                  <View
                    style={[
                      styles.factIcon,
                      { backgroundColor: fact.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={fact.icon as any}
                      size={20}
                      color={fact.color}
                    />
                  </View>
                  <Text style={styles.factText}>{fact.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Related Species */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Related Species</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedContainer}
            >
              {relatedSpecies.map((species) => (
                <TouchableOpacity
                  key={species.id}
                  style={styles.relatedCard}
                  onPress={() =>
                    router.push({
                      pathname: "/fish-details",
                      params: { fishId: species.id },
                    })
                  }
                >
                  <Image
                    source={{ uri: species.image_url }}
                    style={styles.relatedImage}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={styles.relatedGradient}
                  />
                  <View style={styles.relatedInfo}>
                    <Text style={styles.relatedName}>{species.name}</Text>
                    <Text style={styles.relatedScientific}>
                      {species.scientific_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Learn More Link */}
          <TouchableOpacity style={styles.learnMoreCard}>
            <View style={styles.learnMoreContent}>
              <Ionicons name="book-outline" size={24} color="#3b82f6" />
              <View style={styles.learnMoreText}>
                <Text style={styles.learnMoreTitle}>Want to learn more?</Text>
                <Text style={styles.learnMoreSubtitle}>
                  Explore detailed information and research
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    width: width,
    height: 400,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerButtons: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  imageIndicators: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  indicatorActive: {
    backgroundColor: "#fff",
    width: 24,
  },
  conservationBadge: {
    position: "absolute",
    top: 70,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  conservationText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10b981",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1e3a5f",
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#64748b",
    marginBottom: 8,
  },
  habitatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  habitatText: {
    fontSize: 14,
    color: "#64748b",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f7fafc",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e3a5f",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a5f",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
  description: {
    fontSize: 15,
    color: "#64748b",
    lineHeight: 24,
  },
  habitatCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  habitatGradient: {
    padding: 20,
  },
  habitatInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  habitatTextContainer: {
    flex: 1,
  },
  habitatTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  habitatDescription: {
    fontSize: 14,
    color: "#e2e8f0",
    lineHeight: 20,
  },
  factsContainer: {
    gap: 12,
  },
  factCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f7fafc",
    padding: 16,
    borderRadius: 12,
  },
  factIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  factText: {
    flex: 1,
    fontSize: 14,
    color: "#1e3a5f",
    lineHeight: 20,
  },
  relatedContainer: {
    gap: 12,
  },
  relatedCard: {
    width: 140,
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f7fafc",
  },
  relatedImage: {
    width: "100%",
    height: "100%",
  },
  relatedGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  relatedInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  relatedName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  relatedScientific: {
    fontSize: 11,
    color: "#e2e8f0",
    fontStyle: "italic",
  },
  learnMoreCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f7fafc",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  learnMoreContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  learnMoreText: {
    flex: 1,
  },
  learnMoreTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e3a5f",
    marginBottom: 4,
  },
  learnMoreSubtitle: {
    fontSize: 13,
    color: "#64748b",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  familyBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  familyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginRight: 8,
  },
  familyValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e3a5f",
  },
});
