import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function FishDetailsScreen() {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const images = [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600",
    "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600",
    "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=600",
  ];

  const relatedSpecies = [
    {
      id: 1,
      name: "Blue Tang",
      scientific: "Paracanthurus hepatus",
      image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=200",
    },
    {
      id: 2,
      name: "Clownfish",
      scientific: "Amphiprioninae",
      image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=200",
    },
    {
      id: 3,
      name: "Angelfish",
      scientific: "Pterophyllum",
      image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200",
    },
  ];

  const facts = [
    { icon: "water", text: "Can live in both saltwater and freshwater", color: "#3b82f6" },
    { icon: "restaurant", text: "Feeds on algae and small organisms", color: "#10b981" },
    { icon: "navigate", text: "Known for seasonal migration patterns", color: "#8b5cf6" },
    { icon: "shield", text: "Plays important role in ecosystem", color: "#f59e0b" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: images[selectedImage] }} style={styles.mainImage} />
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
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="share-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setIsSaved(!isSaved)}
              >
                <Ionicons
                  name={isSaved ? "bookmark" : "bookmark-outline"}
                  size={24}
                  color={isSaved ? "#3b82f6" : "#fff"}
                />
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
            <Text style={styles.conservationText}>Least Concern</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <View>
              <Text style={styles.title}>Bagnus</Text>
              <Text style={styles.scientificName}>Mugil cephalus</Text>
              <View style={styles.habitatRow}>
                <Ionicons name="location" size={16} color="#64748b" />
                <Text style={styles.habitatText}>Tropical & Temperate Waters</Text>
              </View>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#dbeafe" }]}>
                <Ionicons name="scale-outline" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.statValue}>4.8 oz</Text>
              <Text style={styles.statLabel}>Avg Weight</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#ede9fe" }]}>
                <Ionicons name="resize-outline" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.statValue}>3.1 in</Text>
              <Text style={styles.statLabel}>Avg Size</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: "#d1fae5" }]}>
                <Ionicons name="hourglass-outline" size={24} color="#10b981" />
              </View>
              <Text style={styles.statValue}>2 yrs</Text>
              <Text style={styles.statLabel}>Lifespan</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>
              Mugil is a genus of mullet in the family Mugilidae found worldwide in
              tropical and temperate coastal waters, and in some species in fresh water.
              These fish are known for their distinctive appearance and important role in
              marine ecosystems.
            </Text>
          </View>

          {/* Habitat Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habitat</Text>
            <View style={styles.habitatCard}>
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                style={styles.habitatGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.habitatInfo}>
                  <Ionicons name="water" size={32} color="#fff" />
                  <View style={styles.habitatTextContainer}>
                    <Text style={styles.habitatTitle}>Coastal Waters</Text>
                    <Text style={styles.habitatDescription}>
                      Found in shallow coastal waters, estuaries, and sometimes freshwater
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
                  <View style={[styles.factIcon, { backgroundColor: fact.color + "20" }]}>
                    <Ionicons name={fact.icon as any} size={20} color={fact.color} />
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
                <TouchableOpacity key={species.id} style={styles.relatedCard}>
                  <Image source={{ uri: species.image }} style={styles.relatedImage} />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={styles.relatedGradient}
                  />
                  <View style={styles.relatedInfo}>
                    <Text style={styles.relatedName}>{species.name}</Text>
                    <Text style={styles.relatedScientific}>{species.scientific}</Text>
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
});
