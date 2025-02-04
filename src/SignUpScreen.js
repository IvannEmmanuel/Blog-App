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
import bcrypt from "react-native-bcrypt"; // Import bcrypt

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSignUp = async () => {
    if (!email || !password || !firstName || !lastName || !address) {
      return Alert.alert("Error", "All fields are required!");
    }

    setLoading(true); // Start loading

    try {
      // Hash password asynchronously
      const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) reject(err);
          resolve(hash);
        });
      });

      // Perform sign-up and user data insertion in one step
      const { data: user, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Insert user data into the database
      const { error: dbError } = await supabase
        .from("users")
        .insert([
          { firstName, lastName, email, password: hashedPassword, address },
        ]);

      if (dbError) throw dbError;

      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("LoginScreen");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require("../assets/blog.png")} style={styles.image} />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="First Name"
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          placeholder="Last Name"
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          placeholder="Address"
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.accountContainer}>
        <Text style={styles.accountText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
          <Text style={styles.accountSubText}>Login here.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
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
  accountContainer: {
    flexDirection: "row",
    alignSelf: "center",
    bottom: 60,
  },
  accountText: {
    fontSize: 15,
    color: "#000",
  },
  accountSubText: {
    fontSize: 15,
    color: "#b028ff",
  },
});
