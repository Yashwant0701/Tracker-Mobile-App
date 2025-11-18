// src/screens/Home/HomeScreen.js
import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  Alert,
  PermissionsAndroid,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "./styles";
import { AuthContext } from "../../AuthContext";
import {
  fetchProfileImage,
  fetchLocations,
  fetchDoctorsByLocation,
  addVisit,
  logout,
  onDutyLogin,
  offDutyLogout,
  updateLocation, // <-- new import
} from "../../api/AuthService";
import Icon from "react-native-vector-icons/Ionicons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import CustomDutyToggle from "../../components/CustomDutyToggle";
import { clearTokens } from "../../../tokenStorage";
import Geolocation from "react-native-geolocation-service";

const APP_STATE_KEY = "appState";
const LOCATION_INTERVAL_MS = 5000; // 5 seconds

const HomeScreen = ({ navigation }) => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const [profileImage, setProfileImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [location, setLocation] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [locationsList, setLocationsList] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedLocationObj, setSelectedLocationObj] = useState(null);
  const [doctorsList, setDoctorsList] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const [visitStarted, setVisitStarted] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [checkinTime, setCheckinTime] = useState(null);
  const [dayTrackerId, setDayTrackerId] = useState(null);

  const timerRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [gpsCoords, setGpsCoords] = useState(null);

  // location updater interval ref
  const locationIntervalRef = useRef(null);

  // derived state for logout icon visibility
  const isTimerRunning = visitStarted;

  // -------------------------
  // Location permission helpers
  // -------------------------
  const getLocationPermission = async () => {
    try {
      if (Platform.OS === "android") {
        const fine = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        const coarse = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        );

        if (
          fine === PermissionsAndroid.RESULTS.GRANTED ||
          coarse === PermissionsAndroid.RESULTS.GRANTED
        ) {
          return {
            granted: true,
            precise: fine === PermissionsAndroid.RESULTS.GRANTED,
          };
        } else {
          Alert.alert(
            "Permission Required",
            "Please allow location access for accurate site visits."
          );
          return { granted: false, precise: false };
        }
      }
      return { granted: true, precise: true };
    } catch (err) {
      console.error("Permission error:", err);
      return { granted: false, precise: false };
    }
  };

  // -------------------------
  // Fetch GPS + Reverse geocode (for display/address)
  // -------------------------
  const fetchCurrentAddress = async () => {
    try {
      const permission = await getLocationPermission();
      if (!permission.granted) return;

      const getPosition = (enableHighAccuracy, timeout) =>
        new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy,
            timeout,
            maximumAge: 10000,
          });
        });

      let pos;
      try {
        pos = await getPosition(permission.precise, 20000);
      } catch {
        pos = await getPosition(false, 30000);
      }

      const { latitude, longitude } = pos.coords;
      setGpsCoords({ latitude, longitude });

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            "User-Agent": "SujaTrackerApp/1.0",
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) {
        // handle 403/429 gracefully
        setCurrentAddress(`Unable to fetch address (status ${res.status})`);
        return;
      }

      const data = await res.json();
      if (data?.display_name) {
        const label = `${data.display_name} (${permission.precise ? "Precise" : "Approximate"})`;
        setCurrentAddress(label);
      } else setCurrentAddress("Unknown location");
    } catch (err) {
      // don't surface heavy errors to user here
      console.warn("Location fetch error:", err);
    }
  };

  // -------------------------
  // Location update: send to backend every 5s (always-on)
  // -------------------------
  const sendLocationUpdate = async () => {
    try {
      // Must have a logged-in user
      if (!currentUser?.accountId) return;

      const permission = await getLocationPermission();
      if (!permission.granted) return;

      // get a fresh position; use low-accuracy for speed (reduce battery)
      Geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setGpsCoords({ latitude, longitude });
          try {
          await updateLocation({
              userId: `${currentUser.accountId}`,
              lat: latitude,
              lon: longitude
            });
           

          } catch (err) {
            // just log; do not block
            console.warn("Failed to send location update:", err);
          }
        },
        (err) => {
          // location read failure — log but don't spam user
          // console.warn("Periodic location error:", err);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 2000 }
      );
    } catch (err) {
      console.warn("sendLocationUpdate fatal:", err);
    }
  };

  // start periodic updater (every 5s) on mount, persist across restarts because it runs at mount
  useEffect(() => {
    // start immediately, then every 5s
    sendLocationUpdate(); // initial immediate call
    locationIntervalRef.current = setInterval(sendLocationUpdate, LOCATION_INTERVAL_MS);

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    };
    // Intentionally run once on mount; depends on currentUser updated value if user logs in later
    // If you need it to restart when currentUser changes, include currentUser in deps.
  }, []); // run only once on component mount to persist across restarts

  // -------------------------
  // Persist / restore app state
  // -------------------------
  useEffect(() => {
    fetchCurrentAddress();
    restoreAppState();
  }, []);

  const persistAppState = async (data) => {
    try {
      await AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(data));
    } catch (e) {
      // ignore persist errors
    }
  };

  const restoreAppState = async () => {
    try {
      const saved = await AsyncStorage.getItem(APP_STATE_KEY);
      if (!saved) return;
      const state = JSON.parse(saved);

      setIsOnDuty(state.isOnDuty || false);
      setVisitStarted(state.visitStarted || false);
      setDayTrackerId(state.dayTrackerId || null);
      setCheckinTime(state.checkinTime || null);
      setSelectedProvider(state.selectedProvider || null);
      setDoctorName(state.doctorName || "");
      setLocation(state.location || "");
      setSelectedLocationObj(state.selectedLocationObj || null);

      // compute elapsed seconds since checkinTime (accurate)
      if (state.visitStarted && state.checkinTime) {
        const elapsed = Math.floor((Date.now() - new Date(state.checkinTime).getTime()) / 1000);
        setSecondsElapsed(isNaN(elapsed) ? 0 : elapsed);
      } else {
        setSecondsElapsed(state.secondsElapsed || 0);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    // persist important fields whenever they change
    persistAppState({
      isOnDuty,
      visitStarted,
      secondsElapsed,
      checkinTime,
      dayTrackerId,
      selectedProvider,
      doctorName,
      location,
      selectedLocationObj,
    });
  }, [isOnDuty, visitStarted, secondsElapsed, checkinTime, dayTrackerId, selectedProvider, doctorName, location, selectedLocationObj]);

  // -------------------------
  // Timer logic (pauses while editing)
  // -------------------------
  useEffect(() => {
    if (visitStarted && !isEditing) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setSecondsElapsed((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visitStarted, isEditing]);

  // -------------------------
  // Profile image loader
  // -------------------------
  useEffect(() => {
    const loadProfile = async () => {
      setLoadingImage(true);
      try {
        const res = await fetchProfileImage(currentUser);
        setProfileImage(res?.imageUrl ? { uri: res.imageUrl } : null);
      } catch {
        setProfileImage(null);
      } finally {
        setLoadingImage(false);
      }
    };
    loadProfile();
  }, [currentUser]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  // -------------------------
  // STOP VISIT (robust handling)
  // -------------------------
  const stopVisit = async () => {
    if (!selectedProvider || !checkinTime) {
      Alert.alert("Error", "No visit in progress.");
      return;
    }

    const checkoutTime = new Date().toISOString();
    const payload = {
      checkinTime,
      checkoutTime,
      locationId: selectedProvider.locationId,
      createdBy: currentUser.accountId,
      providerId: selectedProvider.providerId,
      gpsLocation: currentAddress || "Unknown",
    };

    try {
      const result = await addVisit(payload);

      const ok =
        result === "success" ||
        (result && result === "success") ||
        (result && result.data === "success") ||
        (typeof result === "string" && result.toLowerCase() === "success");

      if (ok) {
        // clear visit state & persisted appState
        setVisitStarted(false);
        setSecondsElapsed(0);
        setSelectedProvider(null);
        setCheckinTime(null);
        try {
          await AsyncStorage.removeItem(APP_STATE_KEY);
        } catch (e) {
          // ignore
        }
        setIsOnDuty(false); // optional per your business logic
        navigation.navigate("RecentVisits");
      } else {
        Alert.alert("Error", "Failed to add visit.");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong while adding visit.");
    }
  };

  // -------------------------
  // Locations (API)
  // -------------------------
  const fetchAllLocations = async () => {
    try {
      const data = await fetchLocations();
      //setLocationsList(data);
       const staticLocation = {
        id: 4,
        value: "",
        name: "Capital Park",
        optionalText1: null,
        optionalText: null,
      };
      setLocationsList([...(data || []), staticLocation]);
    } catch {
      setLocationsList([]);
    }
  };

  // -------------------------
  // Open modal (edit flag)
  // -------------------------
  const openVisitModal = async (isEdit = false) => {
    setIsEditing(isEdit);
    setModalVisible(true);
    await fetchAllLocations();
  };

  // -------------------------
  // CENTRAL closeModal() — ensures isEditing is cleared whenever closed
  // -------------------------
  const closeModal = () => {
    setModalVisible(false);
    setIsEditing(false);
  };

  // -------------------------
  // Select location -> fetch doctors
  // -------------------------
  const handleSelectLocation = async (loc) => {
    if (!currentAddress) await fetchCurrentAddress();

    const gpsLower = currentAddress?.toLowerCase() || "";
    const locLower = loc.name?.toLowerCase() || "";

    if (!gpsLower.includes(locLower)) {
      Alert.alert(
        "Location Mismatch",
        "Your GPS location does not match the selected facility."
      );
      return;
    }

    setLocation(loc.name);
    setFilteredLocations([]);
    setSelectedLocationObj(loc);
    Keyboard.dismiss();

    setLoadingDoctors(true);
    try {
      const providers = await fetchDoctorsByLocation(loc.name);
      //setDoctorsList(providers);
       const customDoctor = {
        providerId: 2603,
        specializationId: 101,
        accountId: 888888,
        providerName: "John Doe",
        experience: 10,
        gender: "M",
        specializations: "GENERAL PHYSICIAN",
        location: loc.name,
        consultationCharges: 500.0,
        currencySymbol: "₹",
        locationId: 1,
        isOnline: true,
        salutationName: "Dr",
      };

      setDoctorsList([...(providers || []), customDoctor]);
    } catch (err) {
      setDoctorsList([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // handleSelectDoctor -> CLOSE modal & clear isEditing so timer resumes if needed
  const handleSelectDoctor = (doc) => {
    setDoctorName(`${doc.salutationName ? doc.salutationName + " " : ""}${doc.providerName}`);
    setSelectedProvider(doc);
    setFilteredDoctors([]);
    Keyboard.dismiss();

    // Close modal and clear edit flag (so timer resumes if visitStarted)
    closeModal();

    // If visit not started and user is on duty — start visit
    if (!visitStarted && isOnDuty) {
      const now = new Date().toISOString();
      setCheckinTime(now);
      setVisitStarted(true);
      setSecondsElapsed(0);
    }
  };

  // Filtering helpers
  const handleLocationChange = (text) => {
    setLocation(text);
    setSelectedLocationObj(null);
    setDoctorsList([]);
    setFilteredDoctors([]);
    setSelectedProvider(null);

    if (!text.trim()) {
      setFilteredLocations([]);
      return;
    }

    const filtered = locationsList.filter((loc) =>
      loc.name?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredLocations(filtered);
  };

  const handleDoctorChange = (text) => {
    setDoctorName(text);
    setSelectedProvider(null);

    if (!text.trim()) {
      setFilteredDoctors([]);
      return;
    }

    const typed = text.toLowerCase();
    const filtered = doctorsList.filter((doc) =>
      doc.providerName?.toLowerCase().includes(typed)
    );
    setFilteredDoctors(filtered);
  };

  const doctorInputDisabled = !selectedLocationObj || loadingDoctors;

  const handleStartVisitPress = () => {
    if (!isOnDuty) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
      return;
    }
    openVisitModal(false);
  };

  // Logout
  const logoutUser = async () => {
    try {
      const result = await logout(currentUser);
      if (result.status === 200) {
        await clearTokens();
        await AsyncStorage.multiRemove([APP_STATE_KEY, "currentUser"]);
        setCurrentUser(null);
        navigation.replace("Login");
      } else Alert.alert("Logout Failed", "Unable to logout.");
    } catch {
      Alert.alert("Error", "Logout failed.");
    }
  };

  // Toggle duty (on/off)
  const handleToggleDuty = async () => {
    try {
      //  Prevent duty toggle while visit timer is running
      if (visitStarted) {
        Alert.alert(
          "Action Not Allowed",
          "You cannot change duty status while a visit is in progress. Please stop the visit first."
        );
        return;
      }

      if (!currentUser?.accountId)
        return Alert.alert("Error", "User account not found.");

      if (!isOnDuty) {
        const res = await onDutyLogin(currentUser.accountId, currentAddress);
        if (res?.status === 200 && res?.data) {
          setDayTrackerId(res.data);
          setIsOnDuty(true);
          Alert.alert("Success", "You are now On Duty!");
        } else Alert.alert("Failed", "Unable to mark On Duty.");
      } else {
        if (!dayTrackerId)
          return Alert.alert("Error", "Missing day tracker ID.");

        const res = await offDutyLogout(
          currentUser.accountId,
          currentAddress,
          dayTrackerId
        );
        if (res?.status === 200) {
          setIsOnDuty(false);
          setDayTrackerId(null);
          Alert.alert("Success", "You are now Off Duty!");
        } else Alert.alert("Failed", "Unable to mark Off Duty.");
      }
    } catch (error) {
      console.error("Toggle duty error:", error);
      Alert.alert(
        "Error",
        "Something went wrong while updating duty status."
      );
    }
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.userInfo}>
          {loadingImage ? (
            <ActivityIndicator size="small" color="#FFC20F" />
          ) : profileImage ? (
            <Image source={profileImage} style={styles.profileImage} />
          ) : (
            <Icon name="person-circle-outline" size={hp("6.5%")} color="#FFC20F" />
          )}
          <View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.userName}>{currentUser?.fullName || "User"}</Text>
          </View>
        </View>

        {/*  Logout Icon — hidden when timer is running */}
        {!isTimerRunning && (
          <TouchableOpacity style={styles.bellButton} onPress={logoutUser}>
            <Image
              source={require("../../assets/images/logoutIcon.png")}
              style={styles.logoutIcon}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.bellButton}>
          <Image source={require("../../assets/images/notificationsIcon.png")} style={styles.bellIcon} />
        </TouchableOpacity>
      </View>

      {/* Main Section */}
      <View style={styles.mainSection}>
        <View style={styles.outerCircle}>
          {!visitStarted ? (
            <TouchableOpacity
              style={[styles.innerCircle, { backgroundColor: isOnDuty ? "#FFC20F" : "#E8E7E7" }]}
              onPress={handleStartVisitPress}
            >
              <Text style={styles.startVisitText}>Start Visit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.innerCircleActive}>
              <Text style={styles.timerText}>{formatTime(secondsElapsed)}</Text>
              <TouchableOpacity onPress={stopVisit}>
                <Text style={styles.stopVisitText}>Stop Visit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Duty Toggle Section */}
        <View style={{ padding: hp("5%") }}>
          <CustomDutyToggle
            isOn={isOnDuty}
            onToggle={() => {
              if (visitStarted) {
                Alert.alert(
                  "Action Not Allowed",
                  "You cannot change duty status while a visit is in progress. Please stop the visit first."
                );
                return;
              }
              handleToggleDuty();
            }}
          />
        </View>
      </View>

      {showTooltip && (
        <View style={styles.tooltipOverlay}>
          <Image source={require("../../assets/images/tooltip.png")} style={styles.tooltipImageBelowToggle} />
        </View>
      )}

      {/* Footer */}
      <View style={styles.footerContainer}>
        {visitStarted && selectedProvider ? (
          <View style={styles.footerCardActive}>
            <View style={styles.footerTextContainer}>
              <Text style={styles.doctorNameText}>
                {selectedProvider.salutationName ? `${selectedProvider.salutationName} ` : ""}
                {selectedProvider.providerName}
              </Text>
              <Text style={styles.visitDetailText}>
                {new Date().toLocaleDateString()} |{" "}
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
              <Text style={styles.visitDetailText}>{selectedProvider.location || ""}</Text>
            </View>
            <TouchableOpacity onPress={() => openVisitModal(true)}>
              <Image source={require("../../assets/images/editIcon.png")} style={styles.editIcon} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.footerCard}>
            <Text style={styles.footerText}>Enable location before starting the visit</Text>
            <TouchableOpacity style={styles.myVisitsButton} onPress={() => navigation.navigate("RecentVisits")}>
              <Text style={styles.myVisitsText}>My Visits</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => closeModal()}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            closeModal();
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                {/* Location Input */}
                <TextInput
                  style={styles.inputField}
                  placeholder="Enter Location"
                  placeholderTextColor="#BCBCBC"
                  value={location}
                  onChangeText={handleLocationChange}
                />
                {filteredLocations.length > 0 && (
                  <View style={styles.dropdownContainer}>
                    <FlatList
                      data={filteredLocations}
                      keyExtractor={(item, i) => `${item.id || i}-${item.name}`}
                      renderItem={({ item }) => (
                        <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectLocation(item)}>
                          <Text style={styles.dropdownText}>{item.name}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}

                {/* Doctor Input */}
                <TextInput
                  style={[styles.inputField, doctorInputDisabled ? { opacity: 0.6 } : null]}
                  placeholder={selectedLocationObj ? "Enter Doctor Name" : "Select location first"}
                  placeholderTextColor="#BCBCBC"
                  value={doctorName}
                  onChangeText={handleDoctorChange}
                  editable={!doctorInputDisabled}
                />

                {loadingDoctors && <ActivityIndicator size="small" color="#FFC20F" style={{ marginTop: hp("1%") }} />}

                {filteredDoctors.length > 0 && (
                  <View style={styles.dropdownContainer}>
                    <FlatList
                      data={filteredDoctors}
                      keyExtractor={(item, i) => `${item.providerId}-${item.locationId}-${i}`}
                      renderItem={({ item }) => (
                        <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectDoctor(item)}>
                          <Text style={styles.dropdownText}>
                            {item.salutationName ? `${item.salutationName} ` : ""}
                            {item.providerName}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default HomeScreen;
