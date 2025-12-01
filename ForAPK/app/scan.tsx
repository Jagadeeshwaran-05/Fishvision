import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

interface ClassificationResult {
  success: boolean;
  fish_count: number;
  detections: Array<{
    label: string;
    confidence: number;
    bbox: number[];
  }>;
  output_image_url?: string;
}

export default function ScanScreen() {
  const router = useRouter();
  const [dots, setDots] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [classificationResult, setClassificationResult] =
    useState<ClassificationResult | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const swipeX = useRef(new Animated.Value(0)).current;

  // Pan responder for dragging the card down
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // Dismiss if dragged down more than 100px
          Animated.timing(panY, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setShowResult(false);
            panY.setValue(0);
          });
        } else {
          // Snap back to position
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // Pan responder for swiping the save button
  const swipePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0 && gestureState.dx < width * 0.6) {
          swipeX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > width * 0.4) {
          // Complete swipe - save and show confirmation
          Animated.timing(swipeX, {
            toValue: width * 0.6,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setIsSaved(true);
            Alert.alert(
              "Saved!",
              "Golden Catfish has been saved to your bookmarks"
            );
            // Reset after a moment
            setTimeout(() => {
              swipeX.setValue(0);
            }, 1000);
          });
        } else {
          // Snap back
          Animated.spring(swipeX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showResult) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      slideAnim.setValue(height);
    }
  }, [showResult]);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (
      cameraPermission.status !== "granted" ||
      mediaPermission.status !== "granted"
    ) {
      Alert.alert(
        "Permissions Required",
        "Camera and photo library access are needed to scan fish.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImageUri(imageUri);
        await classifyImage(imageUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImageUri(imageUri);
        await classifyImage(imageUri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const classifyImage = async (imageUri: string) => {
    setIsLoading(true);
    console.log("APK Version - Showing Golden Catfish");

    // Simulate loading for better UX
    setTimeout(() => {
      // Show Golden Catfish (ID: 538) in result card
      setClassificationResult({
        success: true,
        fish_count: 1,
        detections: [
          {
            label: "Golden Catfish",
            confidence: 0.92,
            bbox: [0, 0, 100, 100],
          },
        ],
      });
      setShowResult(true);
      setIsLoading(false);
    }, 1500);
  };

  const handleScan = () => {
    Alert.alert(
      "Select Image Source",
      "Choose how you want to capture the fish image",
      [
        {
          text: "Camera",
          onPress: takePhoto,
        },
        {
          text: "Gallery",
          onPress: pickImageFromGallery,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.scanningText}>
            {showResult ? "Scanned info" : `Scanning${dots}`}
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickImageFromGallery}
            activeOpacity={0.7}
          >
            <Ionicons name="images" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.scannerContainer}>
          <Svg width={width - 80} height={width - 80} viewBox="0 0 300 300">
            {/* Top Left Corner */}
            <Path
              d="M 10 60 L 10 10 L 60 10"
              stroke="#ffffff"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            {/* Top Right Corner */}
            <Path
              d="M 240 10 L 290 10 L 290 60"
              stroke="#ffffff"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            {/* Bottom Left Corner */}
            <Path
              d="M 10 240 L 10 290 L 60 290"
              stroke="#ffffff"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            {/* Bottom Right Corner */}
            <Path
              d="M 240 290 L 290 290 L 290 240"
              stroke="#ffffff"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
        </View>

        {!showResult && !isLoading && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.scanButton}
              activeOpacity={0.8}
              onPress={handleScan}
            >
              <Ionicons name="fish" size={24} color="#1e3a5f" />
              <Text style={styles.scanButtonText}>Scan your fish</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Analyzing fish...</Text>
          </View>
        )}

        {showResult && (
          <Animated.View
            style={[
              styles.resultCard,
              {
                transform: [{ translateY: Animated.add(slideAnim, panY) }],
              },
            ]}
          >
            <View {...panResponder.panHandlers} style={styles.cardHandle}>
              <View style={styles.handleBar} />
            </View>

            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.fishName}>Golden Catfish</Text>
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={16} color="#94a3b8" />
                  <Text style={styles.locationText}>Siluridae Family</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => setIsSaved(!isSaved)}
              >
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={28}
                  color={isSaved ? "#ef4444" : "#94a3b8"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.fishImageContainer}>
              <Image
                source={
                  selectedImageUri
                    ? { uri: selectedImageUri }
                    : require("@/assets/images/golden-catfish.jpg")
                }
                style={styles.fishImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Max Length</Text>
                <Text style={styles.statValue}>54 cm</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Habitat</Text>
                <Text style={styles.statValue}>🌊</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Status</Text>
                <Text style={styles.statValue}>LC</Text>
              </View>
            </View>

            <Text style={styles.description}>
              Native to Mahanadi River. Freshwater species of the Siluridae
              family. Found in Mahanadi River, Cauvery River, and Bay of Bengal
              regions. Conservation status: Least Concern. An omnivorous catfish
              with low commercial importance.
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/fish-details",
                  params: { fishId: 538 },
                })
              }
            >
              <Text style={styles.learnMore}>View full details →</Text>
            </TouchableOpacity>

            {/* Swipeable Save Button */}
            <View style={styles.exploreButton}>
              <Animated.View
                {...swipePanResponder.panHandlers}
                style={[
                  styles.exploreButtonSlider,
                  {
                    transform: [{ translateX: swipeX }],
                  },
                ]}
              >
                <View style={styles.exploreButtonThumb}>
                  <Ionicons
                    name={isSaved ? "checkmark-circle" : "bookmark"}
                    size={24}
                    color="#1e3a5f"
                  />
                </View>
              </Animated.View>
              <View style={styles.exploreButtonContent}>
                <Text style={styles.exploreButtonText}>
                  {isSaved ? "Saved!" : "Swipe to save"}
                </Text>
                <Ionicons name="arrow-forward" size={24} color="#1e3a5f" />
              </View>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanningText: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "500",
  },
  scannerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    alignItems: "center",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8f4f8",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    gap: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e3a5f",
  },
  resultCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1e3a5f",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  cardHandle: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handleBar: {
    width: 60,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  fishName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: "#94a3b8",
  },
  favoriteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  fishImageContainer: {
    width: "100%",
    height: 280,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#3b82f6",
  },
  fishImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginBottom: 4,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e3a5f",
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#e2e8f0",
    marginBottom: 8,
  },
  learnMore: {
    fontSize: 14,
    color: "#60a5fa",
    fontWeight: "600",
    marginBottom: 20,
  },
  swipeButton: {
    backgroundColor: "rgba(148, 163, 184, 0.3)",
    borderRadius: 30,
  },
  swipeTrack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  swipeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  swipeText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
    flex: 1,
  },
  chevronContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  overlayMessage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    padding: 20,
  },
  overlayText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    marginTop: 16,
  },
  overlaySubtext: {
    fontSize: 14,
    color: "#cbd5e1",
    textAlign: "center",
    marginTop: 8,
  },
  exploreButton: {
    backgroundColor: "rgba(148, 163, 184, 0.3)",
    borderRadius: 30,
    overflow: "hidden",
    position: "relative",
    height: 60,
  },
  exploreButtonSlider: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 70,
    zIndex: 10,
  },
  exploreButtonThumb: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#e8f4f8",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 3,
    marginTop: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  exploreButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    flex: 1,
    textAlign: "center",
  },
});
