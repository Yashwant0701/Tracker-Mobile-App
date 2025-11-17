// Analytics.js
import React, { useState , useContext} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
  Alert
} from "react-native";
import { styles } from "./styles";
import { logout } from "../../api/AuthService";
import { AuthContext } from "../../AuthContext";
import { clearTokens } from "../../../tokenStorage"
import AsyncStorage from "@react-native-async-storage/async-storage";

const apiResponse = {
  item1: [
    {
      accountId: 611922,
      roleId: 4,
      roleName: "PATIENT",
      referenceId: 736041,
      saltKey: "04ZO208HPC",
      fullName: "uma bindu",
      createdDate: "2025-04-03T13:06:42.915903",
      umrNo: "UMR915640",
    },
    {
      accountId: 630776,
      roleId: 4,
      roleName: "PATIENT",
      referenceId: 755854,
      saltKey: "VYOAX61YAI",
      fullName: "Andy joe",
      createdDate: "2025-08-12T13:40:06.970679",
      umrNo: "UMR915637",
    },
    {
      accountId: 630778,
      roleId: 4,
      roleName: "PATIENT",
      referenceId: 755856,
      saltKey: "VYOAX61YAI",
      fullName: "poonam sharma",
      createdDate: "2025-08-12T13:58:42.398129",
      umrNo: "UMR915639",
    }
  ],
  item2: null
};

const Analytics = ({ navigation }) => {

  // Extract item1 array
  const analyticsData = apiResponse?.item1 ?? [];

  // Use fullName list instead of dummy names
  const users = analyticsData.map((item) => item.fullName);

  const [selectedUser, setSelectedUser] = useState(users[0] || "");
  const [modalVisible, setModalVisible] = useState(false);
  
// Your API Response (replace later when API integrated)
  const { currentUser, setCurrentUser } = useContext(AuthContext);


 // Logout
  const logoutUser = async () => {
    try {
      const result = await logout(currentUser);
      if (result.status === 200) {
        await clearTokens();
        await AsyncStorage.removeItem("currentUser");
        setCurrentUser(null);
        navigation.replace("Login");
      } else Alert.alert("Logout Failed", "Unable to logout.");
    } catch {
      Alert.alert("Error", "Logout failed.");
    }
  };
  // Format date to dd-mm-yyyy
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Analytics</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={logoutUser}>
          <Image source={require("../../assets/images/AdminLogoutIcon.png")} />
        </TouchableOpacity>
      </View>

      {/* Analytics Cards */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {analyticsData.map((item, index) => (
          <View key={index} style={styles.card}>

            {/* fullName */}
            <Text style={styles.doctorName}>{item.fullName}</Text>

            {/* createdDate formatted */}
            <Text style={styles.dateTime}>
              {formatDate(item.createdDate)}
            </Text>

            {/* roleName */}
            <Text style={styles.hospital}>{item.roleName}</Text>

           {/* UMR + MAP ICON ROW */}
<View style={styles.bottomRow}>
  
  {/* UMR No (Yellow Box) */}
  <View style={styles.durationContainer}>
    <Text style={styles.durationText}>{item.umrNo}</Text>
  </View>

  {/* Map Icon */}
  <TouchableOpacity
    onPress={() =>
      navigation.navigate("Map", {
        accountId: item.accountId,
        fullName: item.fullName,
      })
    }
  >
    <Image
      source={require("../../assets/images/mapIcon.png")}
      resizeMode="contain"
      style={{ width: 30, height: 30, marginLeft: 10 }}
    />
  </TouchableOpacity>

</View>


          </View>
        ))}
      </ScrollView>

      {/* Bottom Dropdown */}
      <View style={styles.bottomBar}>
        
        {/* User Dropdown */}
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.dropdownText}>{selectedUser}</Text>
          <Image
            source={require("../../assets/images/downArrow.png")}
            style={styles.dropdownIcon}
          />
        </TouchableOpacity>

        {/* Filter Button */}
        <TouchableOpacity>
          <Image
            source={require("../../assets/images/filterIcon.png")}
            resizeMode="contain"
          />
        </TouchableOpacity>

      </View>

      {/* Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select a user</Text>

            {users.map((user, index) => (
              <Pressable
                key={index}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedUser(user);
                  setModalVisible(false);
                }}
              >
                <View
                  style={[
                    styles.radioOuter,
                    selectedUser === user && { borderColor: "#2E7D32" }
                  ]}
                >
                  {selectedUser === user && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: "#2E7D32" }
                      ]}
                    />
                  )}
                </View>

                <Text style={styles.modalOptionText}>{user}</Text>
              </Pressable>
            ))}

          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
};

export default Analytics;
