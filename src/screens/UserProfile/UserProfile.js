import React, { useState, useContext, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { AuthContext } from "../../AuthContext";
import { clearTokens } from "../../../tokenStorage";
import { logout } from "../../api/AuthService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "./styles";

const APP_STATE_KEY = "appState";

const UserProfile = ({ navigation }) => {
    const { currentUser, setCurrentUser } = useContext(AuthContext);

    // Local states for editable fields
    const [fullName, setFullName] = useState(currentUser?.fullName || "");
    const [email, setEmail] = useState(currentUser?.email || "");
    const [mobile, setMobile] = useState(currentUser?.mobile || "");

    // Sync local state whenever currentUser changes
    useEffect(() => {
        setFullName(currentUser?.fullName || "");
        setEmail(currentUser?.email || "");
        setMobile(currentUser?.mobile || "");
    }, [currentUser]);

    // Update global context when user edits input
    const handleUpdate = (key, value) => {
        setCurrentUser((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // -----------------------------
    // Proper Logout Function
    // -----------------------------
    const logoutUser = async () => {
        try {
            const result = await logout(currentUser);

            if (result?.status === 200) {
                await clearTokens();
                await AsyncStorage.multiRemove([APP_STATE_KEY, "currentUser"]);
                setCurrentUser(null);

                navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                });

            } else {
                Alert.alert("Logout Failed", "Unable to logout.");
            }
        } catch (error) {
            Alert.alert("Error", "Logout failed.");
        }
    };


    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image source={require("../../assets/images/ProfileBackIcon.png")} />
                </TouchableOpacity>

                <Image source={require("../../assets/images/profileImg.jpg")} style={styles.profileImage} />

                <Text style={styles.profileName}>{currentUser?.fullName || "User"}</Text>
            </View>

            {/* Bottom Section */}
            <View style={styles.whiteContainer}>

                {/* Full Name */}
                <View style={styles.inputBox}>
                    <Text style={styles.label}>Full name</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={(text) => {
                            setFullName(text);
                            handleUpdate("fullName", text);
                        }}
                    />
                </View>

                {/* Email */}
                <View style={styles.inputBox}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            handleUpdate("email", text);
                        }}
                    />
                </View>

                {/* Mobile Number */}
                <View style={styles.inputBox}>
                    <Text style={styles.label}>Mobile number</Text>
                    <TextInput
                        style={styles.input}
                        value={mobile}
                        onChangeText={(text) => {
                            setMobile(text);
                            handleUpdate("mobile", text);
                        }}
                    />
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={logoutUser}>
                    <Image source={require("../../assets/images/ProfileLogoutIcon.png")}/>
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
};

export default UserProfile;
