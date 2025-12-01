import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL, authApi } from "../services/api";
import * as ImagePicker from "expo-image-picker";
import { Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const apiBaseNoApi = API_BASE_URL.replace(/\/api$/, "");

  const getDefaultAvatar = (gender: string) => {
    // Return gender-based cartoon avatar URLs
    if (gender === "Female") {
      return "https://api.dicebear.com/7.x/avataaars/png?seed=female&backgroundColor=b6e3f4";
    } else if (gender === "Male") {
      return "https://api.dicebear.com/7.x/avataaars/png?seed=male&backgroundColor=c0aede";
    }
    return "https://api.dicebear.com/7.x/avataaars/png?seed=default&backgroundColor=d1d4f9";
  };

  useEffect(() => {
    // Load user data
    (async () => {
      try {
        // Try to get token from AsyncStorage first, then global
        let token = await AsyncStorage.getItem("authToken");
        if (!token) {
          token = (global as any).authToken;
        }

        if (!token) {
          Alert.alert("Not authenticated", "Please sign in first.", [
            { text: "OK", onPress: () => router.replace("/auth/sign-in") },
          ]);
          return;
        }

        setLoading(true);
        const res = await authApi.getCurrentUser(token);
        const user = res.data.user;

        setName(user.name || "");
        setEmail(user.email || "");
        setFirstName(user.first_name || "");
        setLastName(user.last_name || "");
        setPhoneNumber(user.phone_number || "");
        setGender(user.gender || "");
        setDateOfBirth(
          user.date_of_birth ? new Date(user.date_of_birth) : new Date()
        );

        if (user.profile_image) {
          // profile_image stored like 'uploads/<file>'
          setAvatarUri(`${apiBaseNoApi}/${user.profile_image}`);
        } else {
          // Set default avatar based on gender
          setAvatarUri(getDefaultAvatar(user.gender || ""));
        }
      } catch (err: any) {
        console.error("Failed to load profile:", err);
        Alert.alert("Error", err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      let token = await AsyncStorage.getItem("authToken");
      if (!token) {
        token = (global as any).authToken;
      }
      if (!token) {
        Alert.alert("Not authenticated", "Please sign in again.");
        return;
      }

      const payload: any = {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        gender,
        date_of_birth: dateOfBirth.toISOString(),
        name,
        email,
      };

      setLoading(true);
      const res = await authApi.updateProfile(token, payload);

      if (res && res.success) {
        // Update local storage with new user data
        await AsyncStorage.setItem("userData", JSON.stringify(res.data.user));

        // Update displayed data
        const user = res.data.user;
        setName(user.name || "");
        setEmail(user.email || "");

        // Update default avatar if gender changed
        if (!user.profile_image) {
          setAvatarUri(getDefaultAvatar(user.gender || ""));
        }

        Alert.alert("Success", "Profile updated successfully!");
      }
    } catch (err: any) {
      console.error("Update profile failed:", err);
      Alert.alert("Error", err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const token = (global as any).authToken;
      if (!token) {
        Alert.alert("Not authenticated", "Please sign in again.");
        return;
      }
      if (!currentPassword || !newPassword) {
        Alert.alert("Validation", "Please fill both password fields.");
        return;
      }

      setLoading(true);
      const res = await authApi.updatePassword(
        token,
        currentPassword,
        newPassword
      );
      setLoading(false);

      if (res && res.success) {
        Alert.alert("Success", "Password updated");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err: any) {
      setLoading(false);
      console.error("Change password failed:", err);
      Alert.alert("Error", err.message || "Failed to change password");
    }
  };

  const handlePickAvatar = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Permission to access photos is required."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      const localUri =
        result.assets && result.assets[0]
          ? result.assets[0].uri
          : (result as any).uri;
      const filename = localUri.split("/").pop() || `avatar_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      const token = (global as any).authToken;
      if (!token) {
        Alert.alert("Not authenticated", "Please sign in again.");
        return;
      }

      setLoading(true);
      const res = await authApi.uploadAvatar(token, {
        uri: localUri,
        name: filename,
        type,
      });
      setLoading(false);

      if (res && res.success && res.data && res.data.user) {
        const user = res.data.user;
        if (user.profile_image) {
          setAvatarUri(`${apiBaseNoApi}/${user.profile_image}`);
        }
        Alert.alert("Success", "Avatar uploaded");
      }
    } catch (err: any) {
      setLoading(false);
      console.error("Upload avatar failed:", err);
      Alert.alert("Error", err.message || "Failed to upload avatar");
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bio-data</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={handlePickAvatar}
          activeOpacity={0.7}
        >
          {loading && !avatarUri ? (
            <View style={styles.profileImage}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : (
            <Image
              source={{ uri: avatarUri || getDefaultAvatar(gender) }}
              style={styles.profileImage}
            />
          )}
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{name || "User"}</Text>
        <Text style={styles.userEmail}>{email || "user@example.com"}</Text>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>What's your first name?</Text>
          <TextInput
            style={styles.input}
            placeholder="What's your first name?"
            placeholderTextColor="#999"
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={styles.inputLabel}>And your last name?</Text>
          <TextInput
            style={styles.input}
            placeholder="And your last name?"
            placeholderTextColor="#999"
            value={lastName}
            onChangeText={setLastName}
          />

          <Text style={styles.inputLabel}>Phone number</Text>
          <View style={styles.phoneInputContainer}>
            <View style={styles.flagContainer}>
              <Text style={styles.flag}>🇮🇳</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Phone number"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.inputLabel}>Select your gender</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowGenderDropdown(!showGenderDropdown)}
          >
            <Text
              style={gender ? styles.dropdownTextSelected : styles.dropdownText}
            >
              {gender || "Select your gender"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>

          {showGenderDropdown && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setGender("Male");
                  setShowGenderDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setGender("Female");
                  setShowGenderDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>Female</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setGender("Other");
                  setShowGenderDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>Other</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.inputLabel}>What is your date of birth?</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {dateOfBirth.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#1e3a5f" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.updateButtonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>
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
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  placeholder: {
    width: 32,
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: 24,
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e2e8f0",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: "40%",
    backgroundColor: "#3b82f6",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a5f",
    textAlign: "center",
    marginTop: 16,
  },
  userEmail: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 32,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1e3a5f",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  flagContainer: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  flag: {
    fontSize: 24,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1e3a5f",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dropdownText: {
    fontSize: 15,
    color: "#999",
  },
  dropdownTextSelected: {
    fontSize: 15,
    color: "#1e3a5f",
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#1e3a5f",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dateText: {
    fontSize: 15,
    color: "#1e3a5f",
  },
  updateButton: {
    backgroundColor: "#1e3a5f",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
    marginBottom: 40,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
