// App.tsx
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NetInfo from "@react-native-community/netinfo";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";

import { AuthProvider, AuthContext } from "./src/AuthContext";

import LoginScreen from "./src/screens/Login/Login";
import HomeScreen from "./src/screens/Home/Home";
import RecentVisits from "./src/screens/RecentVisits/RecentVisits";
import Analytics from "./src/screens/Analytics/Analytics";
import MapScreen from "./src/screens/MapScreen/MapScreen";
import UserProfile from "./src/screens/UserProfile/UserProfile";
const Stack = createNativeStackNavigator();

// ---------------------
// NAVIGATOR
// ---------------------
const AppNavigator = () => {
  const { currentUser, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00B050" />
      </View>
    );
  }

  const getInitialRoute = () => {
    if (!currentUser) return "Login";
    if (currentUser.roleName === "ADMIN") return "Analytics";
    return "Home";
  };

  return (
    <NavigationContainer>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={getInitialRoute()}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="RecentVisits" component={RecentVisits} />
            <Stack.Screen name="Analytics" component={Analytics} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="UserProfile" component={UserProfile} />
          </Stack.Navigator>
        </View>
      </SafeAreaView>
    </NavigationContainer>
  );
};

// ---------------------
// MAIN APP + INTERNET CHECK
// ---------------------
const App = () => {
  const isDarkMode = useColorScheme() === "dark";

  const [isConnected, setIsConnected] = useState(true);
  const [message, setMessage] = useState("");
  const [icon, setIcon] = useState("");
  const prevIsConnected = useRef(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = !!state.isConnected;

      if (connected && !prevIsConnected.current) {
        setMessage("Back Online");
        setIcon("checkmark-circle-outline");
        setTimeout(() => setMessage(""), 3000);
      } else if (!connected) {
        setMessage("No Internet Connection");
        setIcon("cloud-offline-outline");
      }

      setIsConnected(connected);
      prevIsConnected.current = connected;
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <AuthProvider>
        {/* APP UI */}
        <View style={{ flex: 1 }}>
          <AppNavigator />

          {/* 🚀 INTERNET BANNER (Overlay, NO EXTRA SPACE) */}
          {message ? (
            <View
              style={[
                styles.banner,
                isConnected ? styles.backOnline : styles.noConnection,
              ]}
            >
              <Ionicons name={icon} size={20} color="white" style={styles.bannerIcon} />
              <Text style={styles.bannerText}>{message}</Text>
            </View>
          ) : null}

          {/* Disable UI clicks when offline */}
          {!isConnected && (
            <View style={styles.disableLayer} pointerEvents="auto" />
          )}
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

// ---------------------
// STYLES
// ---------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  // INTERNET BANNER (Overlay)
  banner: {
    height: hp("3.5%"),
    paddingHorizontal: wp("3%"),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: hp("0.5%"),
  },

  bannerIcon: { marginRight: wp("1%") },
  bannerText: {
    color: "white",
    fontSize: hp("1.8%"),
    textAlign: "center",
    fontWeight: "500",
  },

  noConnection: { backgroundColor: "black" },
  backOnline: { backgroundColor: "green" },

  disableLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 900,
  },
});

export default App;
