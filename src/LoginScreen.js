import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../supabase"; // Import Supabase client

const LoginScreen = () => {
  const navigation = useNavigation();

  // State to store form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  // Handle Sign Up Navigation
  const handleSignUp = () => {
    navigation.navigate("SignUpScreen");
  };

  // Handle Login
  const handleLogin = async () => {
    setLoading(true); // Start loading
    try {
      // Attempt to log in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Fetch user details from the "users" table in Supabase
      const { data: userDetails, error: userDetailsError } = await supabase
        .from("users")
        .select("user_id, firstName, lastName")
        .eq("email", email)
        .single();

      if (userDetailsError) {
        throw userDetailsError;
      }

      console.log("Retrieved user_id", userDetails.user_id)

      // Show success message
      Alert.alert("Success", "Logged in successfully!");

      // Navigate to HomeScreen and pass user details as params
      navigation.navigate("BottomNavigator", {
        userId: userDetails.user_id,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
      });
    } catch (error) {
      // Show error message
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image source={require("../assets/blog.png")} style={styles.image} />
      </View>

      {/* Input Fields Section */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Password"
          secureTextEntry={true} // To hide password input
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Button Section */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Create Account Section */}
      <View style={styles.accountContainer}>
        <Text style={styles.accountText}>Don't have an account? </Text>
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.accountSubText}>Create an account.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  accountContainer: {
    flexDirection: "row",
    alignSelf: "center",
    bottom: 50,
  },
  accountText: {
    fontSize: 15,
    color: "#000",
  },
  accountSubText: {
    fontSize: 15,
    color: "#b028ff",
  },
  imageContainer: {
    alignItems: "center",
  },
  image: {
    height: 350,
    width: 350,
  },
  inputContainer: {
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    width: "90%",
    borderRadius: 10,
    bottom: 100,
    padding: 20,
    marginBottom: 15,
  },
  buttonContainer: {
    width: "50%",
    alignSelf: "center",
    bottom: 80,
  },
  button: {
    backgroundColor: "#e2bef7",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});
