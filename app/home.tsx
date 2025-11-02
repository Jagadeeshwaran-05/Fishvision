import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import fishDb, { FishSpecies } from "@/services/fishDatabase";
import { placesApi, savedPlacesApi, savedFishApi } from "@/services/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.45;

export default function HomeScreen() {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("User");
  const [userAvatar, setUserAvatar] = useState(
    "https://api.dicebear.com/7.x/avataaars/png?seed=default"
  );
  const [recentFish, setRecentFish] = useState<FishSpecies[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);
  const [popularPlaces, setPopularPlaces] = useState<any[]>([]);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [savedFishCount, setSavedFishCount] = useState(0);
  const [savedFishIds, setSavedFishIds] = useState<Set<string>>(new Set());
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<Set<string>>(
    new Set()
  );
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    // Load user data and auth token from AsyncStorage
    (async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const token = await AsyncStorage.getItem("authToken");

        setAuthToken(token);

        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name || "User");

          // Set avatar - use profile image if available, otherwise gender-based default
          if (user.profile_image) {
            setUserAvatar(`http://192.168.1.3:3000/${user.profile_image}`);
          } else {
            const genderAvatar =
              user.gender === "Female"
                ? "https://api.dicebear.com/7.x/avataaars/png?seed=female&backgroundColor=b6e3f4"
                : user.gender === "Male"
                ? "https://api.dicebear.com/7.x/avataaars/png?seed=male&backgroundColor=c0aede"
                : "https://api.dicebear.com/7.x/avataaars/png?seed=default&backgroundColor=d1d4f9";
            setUserAvatar(genderAvatar);
          }
        }

        // Load saved fish stats if authenticated
        if (token) {
          try {
            const statsResponse = await savedFishApi.getStats(token);
            setSavedFishCount(statsResponse.data.total || 0);

            // Load saved fish IDs for heart state
            const savedResponse = await savedFishApi.getSavedFishes(token);
            const ids = new Set<string>(
              savedResponse.data.map((fish: any) => String(fish.fish_name))
            );
            setSavedFishIds(ids);
          } catch (error) {
            console.error("Error loading saved fish stats:", error);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    })();
  }, []);

  useEffect(() => {
    // Load fish database and extract places offline
    (async () => {
      try {
        setPlacesLoading(true);
        await fishDb.initialize();
        const stats = fishDb.getStatistics();
        setDbStats(stats);

        // Get random fish species for "Recent Discoveries"
        const randomFish = await fishDb.getRandomSpecies(4);
        setRecentFish(randomFish);

        // Get popular places from offline database (regions with most species)
        const offlinePlaces = fishDb.getPopularPlaces(6);
        setPopularPlaces(offlinePlaces);

        // Load bookmarked places from AsyncStorage
        const bookmarksJson = await AsyncStorage.getItem("bookmarkedPlaces");
        if (bookmarksJson) {
          const bookmarks = JSON.parse(bookmarksJson);
          setBookmarkedPlaces(new Set(bookmarks));
        }
      } catch (error) {
        console.error("Error loading fish database:", error);
      } finally {
        setPlacesLoading(false);
      }
    })();
  }, []);

  const stats = [
    {
      label: "Total Fish",
      value: dbStats?.total?.toString() || "31",
      icon: "fish" as const,
      color: "#3b82f6",
    },
    { label: "Scanned", value: "12", icon: "scan" as const, color: "#10b981" },
    {
      label: "Saved",
      value: savedFishCount.toString(),
      icon: "bookmark" as const,
      color: "#8b5cf6",
    },
  ];

  const quickActions = [
    {
      id: 1,
      icon: "scan-outline" as const,
      label: "Scan",
      color: "#3b82f6",
      route: "/scan" as const,
    },
    {
      id: 2,
      icon: "book" as const,
      label: "Catalog",
      color: "#10b981",
      route: "/fish-list-simple" as const,
    },
    {
      id: 3,
      icon: "bookmark" as const,
      label: "Bookmarks",
      color: "#8b5cf6",
      route: "/bookmarks" as const,
    },
    {
      id: 4,
      icon: "trophy-outline" as const,
      label: "Achievements",
      color: "#f59e0b",
      route: undefined,
    },
  ];

  // Handle search functionality
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: "/fish-catalog",
        params: { search: searchQuery.trim() },
      });
    }
  };

  // Handle fish like/save
  const handleToggleSaveFish = async (fish: FishSpecies) => {
    if (!authToken) {
      Alert.alert("Login Required", "Please sign in to save fish", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign In",
          onPress: () => router.push("/auth/sign-in"),
        },
      ]);
      return;
    }

    try {
      const fishName = fish.name;
      const isSaved = savedFishIds.has(fishName);

      if (isSaved) {
        // Find and delete the saved fish
        const savedResponse = await savedFishApi.getSavedFishes(authToken);
        const savedFish = savedResponse.data.find(
          (f: any) => f.fish_name === fishName
        );
        if (savedFish) {
          await savedFishApi.deleteSavedFish(authToken, savedFish.id);
          setSavedFishIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(fishName);
            return newSet;
          });
          setSavedFishCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        // Save the fish
        await savedFishApi.saveFish(authToken, {
          fish_name: fish.name,
          scientific_name: fish.scientific_name,
          common_names: fish.common_names?.join(", "),
          habitat: fish.habitat,
          image_url: fish.image_url,
        });
        setSavedFishIds((prev) => new Set(prev).add(fishName));
        setSavedFishCount((prev) => prev + 1);
      }
    } catch (error: any) {
      console.error("Error toggling save fish:", error);
      Alert.alert("Error", error.message || "Failed to save fish");
    }
  };

  // Handle place bookmark
  const handleToggleSavePlace = async (place: any) => {
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
        Alert.alert("Saved", `${place.name} added to bookmarks!`);
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color="#3b82f6" />
            <Text style={styles.locationText}>
              You''re in <Text style={styles.locationBold}>Kerala</Text>
            </Text>
          </View>
          <View style={styles.profileContainer}>
            <View>
              <Text style={styles.greeting}>Hi!</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowProfileMenu(true)}>
              <Image source={{ uri: userAvatar }} style={styles.profileImage} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={[styles.statCard, { borderLeftColor: stat.color }]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: stat.color + "15" },
                ]}
              >
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Discover <Text style={styles.titleHighlight}>fish</Text>
          </Text>
          <Text style={styles.title}>world</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#a0aec0"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search fish species..."
            placeholderTextColor="#a0aec0"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.voiceButton} onPress={handleSearch}>
            <Ionicons name="arrow-forward" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={() => action.route && router.push(action.route as any)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: action.color },
                ]}
              >
                <Ionicons name={action.icon} size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Places */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular places</Text>
          <TouchableOpacity onPress={() => router.push("/places")}>
            <Text style={styles.showAllText}>Show all</Text>
          </TouchableOpacity>
        </View>

        {placesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : popularPlaces.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No places available</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
          >
            {popularPlaces.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={styles.card}
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
                  style={styles.cardImage}
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.8)"]}
                  style={styles.cardGradient}
                />
                <TouchableOpacity
                  style={styles.placeBookmark}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleToggleSavePlace(place);
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
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{place.name}</Text>
                  <Text style={styles.cardSubtitle}>
                    {place.fish_species_count} fish species
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* What you saw */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent discoveries</Text>
          <TouchableOpacity onPress={() => router.push("/fish-catalog")}>
            <Text style={styles.showAllText}>Show all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fishGrid}>
          {recentFish.map((fish) => (
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
                <Text style={styles.fishName}>{fish.name}</Text>
                <Text style={styles.fishScientific}>
                  {fish.scientific_name}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.fishLike}
                onPress={(e) => {
                  e.stopPropagation();
                  handleToggleSaveFish(fish);
                }}
              >
                <Ionicons
                  name={savedFishIds.has(fish.name) ? "heart" : "heart-outline"}
                  size={18}
                  color={savedFishIds.has(fish.name) ? "#ef4444" : "#fff"}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#3b82f6" />
          <View style={styles.navIndicator} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/bookmarks")}
        >
          <Ionicons name="bookmark-outline" size={24} color="#a0aec0" />
        </TouchableOpacity>
      </View>

      {/* Floating Scan Button */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => router.push("/scan")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#3b82f6", "#2563eb"]}
          style={styles.scanButtonInner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="scan-outline" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Profile Menu Modal */}
      <Modal
        visible={showProfileMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileMenu(false)}
        >
          <View style={styles.profileMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowProfileMenu(false);
                router.push("/profile");
              }}
            >
              <Ionicons name="person-outline" size={20} color="#1e3a5f" />
              <Text style={styles.menuText}>Edit Profile</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowProfileMenu(false);
                router.replace("/auth/sign-in");
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={[styles.menuText, { color: "#ef4444" }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: "#64748b",
  },
  locationBold: {
    fontWeight: "700",
    color: "#1e3a5f",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  greeting: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "right",
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e3a5f",
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderLeftWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e3a5f",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1e3a5f",
    lineHeight: 42,
  },
  titleHighlight: {
    color: "#3b82f6",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1e3a5f",
  },
  voiceButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
  quickActionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a5f",
  },
  showAllText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  cardsContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 16,
    marginBottom: 28,
  },
  card: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  trendingBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  trendingText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  bookmarkButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 8,
    borderRadius: 20,
    backdropFilter: "blur(10px)",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#e2e8f0",
  },
  fishGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  fishCard: {
    width: (width - 52) / 2,
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
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
    height: "50%",
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
  },
  fishLike: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 6,
    borderRadius: 16,
  },
  placeBookmark: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  scanButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 100,
  },
  scanButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingBottom: 20,
    paddingHorizontal: 60,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  navItem: {
    alignItems: "center",
    padding: 8,
  },
  navIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3b82f6",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 20,
  },
  profileMenu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
  },
  menuText: {
    fontSize: 15,
    color: "#1e3a5f",
    fontWeight: "600",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 4,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
});
