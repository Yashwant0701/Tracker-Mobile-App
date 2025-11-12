// App.js
import React, { useContext } from "react";
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, AuthContext } from "./src/AuthContext";

// Screens
import LoginScreen from "./src/screens/Login/LoginScreen";
import HomeScreen from "./src/screens/Home/HomeScreen";
import RecentVisits from "./src/screens/RecentVisits/RecentVisits";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { currentUser, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00B050" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={currentUser ? "Home" : "Login"}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="RecentVisits" component={RecentVisits} />
          </Stack.Navigator>
        </View>
      </SafeAreaView>
    </NavigationContainer>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      {/* Wrap everything in AuthProvider */}
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

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
});

export default App;
