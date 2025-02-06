import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { supabase } from "../supabase";
import { CommonActions, useNavigation } from '@react-navigation/native';

// Get screen dimensions
const { width, height } = Dimensions.get("screen");

const ProfileScreen = ({ route, navigation }) => {
  const { firstName, lastName, userId } = route.params;
  const [totalLikes, setTotalLikes] = useState(0);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);

  // Fetch total likes for the user's posts
  const fetchUserLikes = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("likes")
        .eq("user_id", userId);
      if (error) throw error;
      const likesSum = data.reduce((sum, post) => sum + (post.likes || 0), 0);
      setTotalLikes(likesSum);
    } catch (err) {
      console.error("Error fetching user likes:", err.message);
    }
  };

  // Fetch additional user details (e.g., email, bio, address)
  const fetchUserDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("email, bio, address")
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      setUserDetails(data);
      setBio(data.bio || "");
    } catch (err) {
      console.error("Error fetching user details:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save the updated bio to the database
  const handleSaveBio = async () => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ bio: bio })
        .eq("user_id", userId);
      if (error) throw error;
      setUserDetails((prevDetails) => ({ ...prevDetails, bio: bio }));
      setIsEditingBio(false);
    } catch (err) {
      console.error("Error updating bio:", err.message);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Navigate back to the login screen after logout
      navigation.navigate('LoginScreen')
    } catch (err) {
      console.error("Error logging out:", err.message);
      alert("Failed to log out. Please try again.");
    }
  };

  // Set up real-time listener for likes
  useEffect(() => {
    fetchUserLikes();
    fetchUserDetails();

    // Real-time subscription for posts table
    const postsSubscription = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "posts",
        },
        (payload) => {
          console.log("Change received in posts table:", payload);
          fetchUserLikes(); // Refetch likes when any change occurs
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      postsSubscription.unsubscribe();
    };
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#784F91" />
      </View>
    );
  }

  return (
    <>
      {/* Add StatusBar */}
      <StatusBar backgroundColor="#F7F7F7" barStyle="dark-content" />
      <ScrollView style={styles.container}>
        {/* User Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>{firstName[0]}</Text>
          </View>
          <Text style={styles.userName}>
            {firstName} {lastName}
          </Text>
          <Text style={styles.totalLikes}>❤️ {totalLikes} likes</Text>
        </View>

        {/* Bio Section */}
        <View style={styles.bioCard}>
          <Text style={styles.sectionTitle}>About Me</Text>
          {isEditingBio ? (
            <View style={styles.bioEditContainer}>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Add your bio here..."
                multiline
                numberOfLines={3}
                style={styles.bioInput}
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveBio}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.bioViewContainer}>
              <Text style={styles.bioText}>{userDetails?.bio || "No bio available"}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditingBio(true)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>📧 Email:</Text>
            <Text style={styles.detailText}>{userDetails?.email || "Not provided"}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>📍 Address:</Text>
            <Text style={styles.detailText}>{userDetails?.address || "Not provided"}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    top: height * 0.05,
    padding: width * 0.06, // 4% of screen width
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: height * 0.03, // 3% of screen height
  },
  userAvatar: {
    width: width * 0.27, // ~27% of screen width
    height: width * 0.27, // ~27% of screen width
    borderRadius: width * 0.135, // Half of width for a circle
    backgroundColor: "#784F91",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: height * 0.015, // ~1.5% of screen height
  },
  avatarText: {
    color: "#FFF",
    fontSize: width * 0.11, // ~11% of screen width
    fontWeight: "bold",
  },
  userName: {
    fontSize: width * 0.053, // ~5.3% of screen width
    fontWeight: "bold",
    color: "#333",
    marginBottom: height * 0.01, // ~1% of screen height
  },
  totalLikes: {
    fontSize: width * 0.048, // ~4.8% of screen width
    color: "#666",
  },
  bioCard: {
    backgroundColor: "#FFF",
    borderRadius: width * 0.032, // ~3.2% of screen width
    padding: width * 0.04, // ~4% of screen width
    marginBottom: height * 0.02, // ~2% of screen height
    shadowColor: "#000",
    shadowOffset: { width: 0, height: height * 0.005 }, // ~0.5% of screen height
    shadowOpacity: 0.1,
    shadowRadius: width * 0.01, // ~1% of screen width
    elevation: 2,
  },
  detailsCard: {
    backgroundColor: "#FFF",
    borderRadius: width * 0.032, // ~3.2% of screen width
    padding: width * 0.04, // ~4% of screen width
    shadowColor: "#000",
    shadowOffset: { width: 0, height: height * 0.005 }, // ~0.5% of screen height
    shadowOpacity: 0.1,
    shadowRadius: width * 0.01, // ~1% of screen width
    elevation: 2,
  },
  sectionTitle: {
    fontSize: width * 0.048, // ~4.8% of screen width
    fontWeight: "bold",
    color: "#333",
    marginBottom: height * 0.015, // ~1.5% of screen height
  },
  bioEditContainer: {
    width: "100%",
  },
  bioInput: {
    borderWidth: width * 0.003, // ~0.3% of screen width
    borderColor: "#E5E5E5",
    borderRadius: width * 0.02, // ~2% of screen width
    padding: width * 0.03, // ~3% of screen width
    marginBottom: height * 0.015, // ~1.5% of screen height
    fontSize: width * 0.042, // ~4.2% of screen width
    textAlignVertical: "top",
  },
  bioViewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bioText: {
    fontSize: width * 0.042, // ~4.2% of screen width
    color: "#333",
    flex: 1,
  },
  editButton: {
    padding: width * 0.02, // ~2% of screen width
    backgroundColor: "#784F91",
    borderRadius: width * 0.02, // ~2% of screen width
  },
  editButtonText: {
    color: "#FFF",
    fontSize: width * 0.037, // ~3.7% of screen width
    fontWeight: "bold",
  },
  saveButton: {
    alignSelf: "flex-end",
    backgroundColor: "#784F91",
    paddingHorizontal: width * 0.04, // ~4% of screen width
    paddingVertical: height * 0.01, // ~1% of screen height
    borderRadius: width * 0.02, // ~2% of screen width
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: width * 0.042, // ~4.2% of screen width
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: height * 0.01, // ~1% of screen height
  },
  detailLabel: {
    fontSize: width * 0.042, // ~4.2% of screen width
    fontWeight: "bold",
    color: "#333",
    marginRight: width * 0.02, // ~2% of screen width
  },
  detailText: {
    fontSize: width * 0.042, // ~4.2% of screen width
    color: "#333",
    flex: 1,
  },
  logoutButton: {
    marginTop: height * 0.06, // ~6% of screen height
    backgroundColor: "#d62929",
    paddingVertical: height * 0.015, // ~1.5% of screen height
    borderRadius: width * 0.02, // ~2% of screen width
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: width * 0.042, // ~4.2% of screen width
    fontWeight: "bold",
  },
});

export default ProfileScreen;