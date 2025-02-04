import { StyleSheet } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

// Screens
import HomeScreen from "../HomeScreen";
import SettingScreen from "../SettingScreen";
import ProfileScreen from "../ProfileScreen";

const homeName = "Home";
const customerName = "Profile";
const settingsName = "Settings";

const Tab = createBottomTabNavigator();

const Dashboard = ({ route }) => {
  const { firstName, lastName, userId } = route.params; // Retrieve params

  return (
    <Tab.Navigator
      initialRouteName={homeName}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let rn = route.name;

          if (rn === homeName) {
            iconName = focused ? "home" : "home-outline";
          } else if (rn === customerName) {
            iconName = focused ? "person" : "person-outline";
          } else if (rn === settingsName) {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={20} color={color} />; // Adjust icon size here
        },
        tabBarLabelStyle: {
          fontSize: 12, // Adjust font size of labels here
        },
        tabBarActiveTintColor: "#442a54",
        tabBarInactiveTintColor: "#784F91",
        tabBarStyle: { paddingBottom: 10, height: 60 },
      })}
    >
      <Tab.Screen
        name={homeName}
        component={HomeScreen}
        initialParams={{ firstName, lastName, userId }} // Pass params here
      />
      <Tab.Screen
        name={customerName}
        component={ProfileScreen}
        initialParams={{ firstName, lastName, userId }} // Pass params here
      />
      <Tab.Screen
        name={settingsName}
        component={SettingScreen}
        initialParams={{ firstName, lastName, userId }} // Pass params here
      />
    </Tab.Navigator>
  );
};

export default Dashboard;

const styles = StyleSheet.create({});
