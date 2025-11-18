// src/screens/Login/LoginScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { login, fetchUserListByMobile } from "../../api/AuthService";
import { AuthContext } from "../../AuthContext";
import { styles } from "./styles";

const LoginScreen = ({ navigation }) => {
  const { loginUser, setLoginApiResult, setAllUsers } = useContext(AuthContext);

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const isFormValid = userName.trim() !== "" && password.trim() !== "";

  const handleLogin = async () => {
    if (!isFormValid) return;
    setLoading(true);

    try {
      let adminResult = await login(userName, password);

      if (adminResult?.status === 200 && adminResult.data) {
        const roleName = adminResult.data.roleName?.toUpperCase();

        if (roleName === "ADMIN") {
          //  Admin Login Flow
          await setLoginApiResult(adminResult.data);
          await loginUser(adminResult.data);
          navigation.replace("Analytics");
          return;
        }
      }

      // STEP 2 — If not admin, try Patient login (with 1: prefix)
      const formattedUserName = `1:${userName}`;
      const patientResult = await login(formattedUserName, password);

      if (patientResult?.status === 200 && patientResult.data) {
        await setLoginApiResult(patientResult.data);
        const usersResponse = await fetchUserListByMobile(formattedUserName);

        if (usersResponse?.status === 200) {
          const allUsers = Object.values(usersResponse.data || {})
            .filter(Array.isArray)
            .flat();

          if (allUsers.length > 0) {
            setUserList(allUsers);
            await setAllUsers(allUsers);
            setModalVisible(true);
          } else {
            Alert.alert("Error", "No linked users found.");
          }
        } else {
          Alert.alert("Error", "Failed to fetch linked users.");
        }
      } else {
        Alert.alert("Login Failed", "Invalid credentials or role.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user) => {
    await loginUser(user);
    setModalVisible(false);
    navigation.replace("Home");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Yellow Header Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Login to your account</Text>
          <Text style={styles.headerSubtitle}>
            Use your uniqueId, Mobile Number{"\n"}or mail Id to login
          </Text>
        </View>

        {/* White Card Section */}
        <View style={styles.cardContainer}>
          <Image
            source={require("../../assets/images/fernandezImg.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Username Input */}
          <CustomInput
            placeholder="Enter username"
            value={userName}
            onChangeText={setUserName}
          />

          {/* Password Input */}
          <CustomInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            maskCharacter="*"
          />

          {/* Login Button */}
          <CustomButton
            title={loading ? "Logging In..." : "Login"}
            onPress={handleLogin}
            disabled={!isFormValid || loading}
          />
        </View>

        {/* Footer Section */}
        <View style={styles.footerContainer}>
          <Text style={styles.versionText}>V 1.0.0</Text>
          <View style={styles.poweredByContainer}>
            <Text style={styles.poweredText}>Powered By</Text>
            <Image
              source={require("../../assets/images/sujaLogo.png")}
              style={styles.sujaLogo}
              resizeMode="contain"
            />
          </View>
        </View>
      </ScrollView>

      {/* User Selection Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select User</Text>
            <FlatList
              data={userList}
              keyExtractor={(item) => item.accountId.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => handleSelectUser(item)}
                >
                  <Text style={styles.userName}>{item.fullName}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
