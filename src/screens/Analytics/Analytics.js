// Analytics.js
import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "./styles";
import { logout, fetchRecentVisits, getSalesUsers } from "../../api/AuthService";
import { AuthContext } from "../../AuthContext";
import { clearTokens } from "../../../tokenStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Typography } from "../../theme";

const PAGE_SIZE = 10;

const Analytics = ({ navigation }) => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  // User selection
  const [salesUsers, setSalesUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // search inside modal
  const [searchQuery, setSearchQuery] = useState("");

  // Visits + Pagination
  const allVisitsRef = useRef([]);
  const filteredVisitsRef = useRef([]);
  const [visits, setVisits] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const scrollViewRef = useRef(null);

  // Date range filter (two pickers)
  const [showDatePickerFrom, setShowDatePickerFrom] = useState(false);
  const [showDatePickerTo, setShowDatePickerTo] = useState(false);
  const [rangeFrom, setRangeFrom] = useState(null);
  const [rangeTo, setRangeTo] = useState(null);

  // Temporary date for Android flow
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());

  // ---------------- LOGOUT ----------------
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

  // ---------------- Helpers ----------------
  const formatDate = (isoDate) => {
    if (!isoDate) return "N/A";
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (isoDate) => {
    if (!isoDate) return "N/A";
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const calculateDuration = (checkinTime, checkoutTime) => {
    if (!checkinTime || !checkoutTime) return "0 sec";
    const start = new Date(checkinTime);
    const end = new Date(checkoutTime);

    const diffMs = Math.abs(end - start);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (hours === 0 && minutes === 0 && seconds < 60) return `${seconds} sec spent`;
    if (hours === 0 && minutes === 0) return "<1 mt spent";
    if (hours === 0) return `${minutes} mts spent`;
    if (minutes === 0) return `${hours} hrs spent`;

    return `${hours} hrs ${minutes} mts spent`;
  };

  // ---------------- LOAD SALES USERS ----------------
  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const resp = await getSalesUsers({ pageSize: 10, pageIndex: 1 });

        if (Array.isArray(resp)) {
          const map = new Map();
          resp.forEach((u) => {
            if (!map.has(u.accountId)) map.set(u.accountId, u);
          });

          const finalList = Array.from(map.values());
          setSalesUsers(finalList);

          if (!selectedUser && finalList.length > 0) {
            setSelectedUser(finalList[0]);
          }
        } else {
          setSalesUsers([]);
        }
      } catch (err) {
        console.error("getSalesUsers error:", err);
        setSalesUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, []);

  // ---------------- LOAD VISITS ----------------
  useEffect(() => {
    const loadVisits = async () => {
      if (!selectedUser?.accountId) return;

      setLoadingInitial(true);
      setVisits([]);
      allVisitsRef.current = [];
      filteredVisitsRef.current = [];
      setRangeFrom(null);
      setRangeTo(null);
      setTempSelectedDate(new Date());

      try {
        const resp = await fetchRecentVisits(selectedUser.accountId);

        if (resp?.status === 200 && Array.isArray(resp.data)) {
          const sorted = resp.data.sort(
            (a, b) => new Date(b.checkinTime) - new Date(a.checkinTime)
          );

          allVisitsRef.current = sorted;

          const firstPage = sorted.slice(0, PAGE_SIZE);
          setVisits(firstPage);

          setHasMore(sorted.length > PAGE_SIZE);
        } else {
          allVisitsRef.current = [];
          setVisits([]);
          setHasMore(false);
        }
      } catch (err) {
        console.error("fetchRecentVisits error:", err);
        allVisitsRef.current = [];
        setVisits([]);
        setHasMore(false);
      } finally {
        setLoadingInitial(false);
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
        }, 250);
      }
    };

    loadVisits();
  }, [selectedUser]);

  // ---------------- GET BASE LIST for pagination ----------------
  const getBaseList = () => {
    if (rangeFrom && rangeTo) return filteredVisitsRef.current;
    return allVisitsRef.current;
  };

  // ---------------- APPLY RANGE FILTER ----------------
  const applyRangeFilter = (fromDate, toDate) => {
    if (!fromDate || !toDate) {
      // nothing to do
      return;
    }

    // ensure from <= to
    let start = new Date(fromDate);
    let end = new Date(toDate);
    // normalize time bounds to include whole days
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const filtered = allVisitsRef.current.filter((v) => {
      try {
        const vt = new Date(v.checkinTime).getTime();
        return vt >= start.getTime() && vt <= end.getTime();
      } catch {
        return false;
      }
    });

    filteredVisitsRef.current = filtered;
    setVisits(filtered.slice(0, PAGE_SIZE));
    setHasMore(filtered.length > PAGE_SIZE);

    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  };

  // ---------------- CLEAR FILTERS ----------------
  const clearFilter = () => {
    setRangeFrom(null);
    setRangeTo(null);
    filteredVisitsRef.current = [];
    const firstPage = allVisitsRef.current.slice(0, PAGE_SIZE);
    setVisits(firstPage);
    setHasMore(allVisitsRef.current.length > PAGE_SIZE);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }, 150);
  };

  // ---------------- LOAD MORE ----------------
  const loadMore = () => {
    if (loadingMore) return;

    const baseList = getBaseList();
    const count = visits.length;

    if (count >= baseList.length) return;

    setLoadingMore(true);

    setTimeout(() => {
      const more = baseList.slice(count, count + PAGE_SIZE);
      setVisits((prev) => [...prev, ...more]);
      setHasMore(count + PAGE_SIZE < baseList.length);
      setLoadingMore(false);
    }, 600);
  };

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 40;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      loadMore();
    }
  };

  // ---------------- DATE PICKER HANDLERS (range) ----------------
  // Start by opening FROM picker: setShowDatePickerFrom(true)
  // After FROM selected, open TO picker automatically.

  const openRangePickers = () => {
    // start FROM flow
    setTempSelectedDate(new Date());
    setShowDatePickerFrom(true);
  };

  const onFromChange = (event, selected) => {
    // Android behaviour: event.type can be 'set' or 'dismissed'
    if (Platform.OS === "android") {
      if (event.type === "dismissed") {
        setShowDatePickerFrom(false);
        return;
      }
      if (event.type === "set") {
        const chosen = selected || tempSelectedDate;
        setRangeFrom(chosen);
        setShowDatePickerFrom(false);
        // open TO picker
        setTimeout(() => setShowDatePickerTo(true), 120);
      }
      return;
    }

    // iOS: selected will be updated continuously; user will confirm by closing picker UI in native
    if (selected) {
      setRangeFrom(selected);
      // open to picker if desired — on iOS we still open to picker immediately
      setTimeout(() => setShowDatePickerTo(true), 120);
    }
  };

  const onToChange = (event, selected) => {
    if (Platform.OS === "android") {
      if (event.type === "dismissed") {
        setShowDatePickerTo(false);
        return;
      }
      if (event.type === "set") {
        const chosen = selected || tempSelectedDate;
        setRangeTo(chosen);
        setShowDatePickerTo(false);
        // apply filter
        setTimeout(() => applyRangeFilter(rangeFrom || chosen, chosen), 80);
      }
      return;
    }

    if (selected) {
      setRangeTo(selected);
      setTimeout(() => applyRangeFilter(rangeFrom || selected, selected), 80);
    }
  };

  // ---------------- SEARCHED USERS (modal) ----------------
  // live-filter the salesUsers by searchQuery
  const filteredSalesUsers = salesUsers.filter((u) => {
    if (!searchQuery?.trim()) return true;
    return u.fullName?.toLowerCase().includes(searchQuery.trim().toLowerCase());
  });

  // ---------------- UI ----------------
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Analytics</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={logoutUser}>
          <Image source={require("../../assets/images/logoutIcon.png")} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={250}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loadingInitial ? (
          <ActivityIndicator size="large" color="#FFC20F" style={{ marginTop: 50 }} />
        ) : visits.length > 0 ? (
          visits.map((visit, index) => {
            const date = formatDate(visit.checkinTime);
            const time = formatTime(visit.checkinTime);
            const duration = calculateDuration(visit.checkinTime, visit.checkoutTime);

            return (
              <View key={`${visit.salesVisitId}-${index}`} style={styles.card}>
                <Text style={styles.doctorName}>
                  {visit.providerId ? `${visit.providerId}` : "N/A"}
                </Text>

                <Text style={styles.dateTime}>{`${date} | ${time}`}</Text>

                <Text style={styles.hospital}>
                  {visit.gpsLocation ? `${visit.gpsLocation}` : "N/A"}
                </Text>

                <View style={styles.bottomRow}>
                  <View style={styles.durationContainer}>
                    <Text style={styles.durationText}>{duration}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("Map", {
                        accountId: visit.createdBy,
                        fullName: selectedUser?.fullName || "",
                      })
                    }
                  >
                    <Image
                      source={require("../../assets/images/mapIcon.png")}
                      resizeMode="contain"
                      style={{ width: wp("8%"), height: wp("7%"), marginLeft: wp("2%") }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noDataText}>No recent visits found</Text>
        )}

        {loadingMore && (
          <ActivityIndicator size="small" color="#FFC20F" style={{ marginVertical: hp("2%") }} />
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => {
            setSearchQuery("");
            setModalVisible(true);
          }}
        >
          <Text style={styles.dropdownText}>{selectedUser?.fullName || "Select user"}</Text>
          <Image
            source={require("../../assets/images/downArrow.png")}
            style={styles.dropdownIcon}
          />
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {(rangeFrom && rangeTo) ? (
            <View style={styles.activeFilterContainer}>
              <TouchableOpacity onPress={clearFilter} style={styles.clearFilterButton}>
                <Ionicons name="close-circle-outline" size={24} color="#BCBCBC" />
                <Text style={styles.clearFilterText}>
                  Clear Filter
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={() => {
              // open range pickers
              openRangePickers();
            }}
            style={{ marginLeft: wp("2%") }}
          >
            <Image
              source={require("../../assets/images/filterIcon.png")}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date pickers (FROM & TO). They open sequentially. */}

      {showDatePickerFrom && (
        <DateTimePicker
          value={rangeFrom || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "calendar"}
          // FROM picker: prevent future dates (can't pick dates after today)
          maximumDate={new Date()}
          onChange={onFromChange}
        />
      )}

      {showDatePickerTo && (
        <DateTimePicker
          value={rangeTo || (rangeFrom || new Date())}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "calendar"}
          // -------------------------
          // DATE PICKER LOGIC UPDATED HERE
          // TO picker should NOT allow selecting dates earlier than FROM
          // and should NOT allow selecting future dates.
          // We set:
          //   - minimumDate = rangeFrom (if provided)
          //   - maximumDate = today
          // -------------------------
          minimumDate={rangeFrom || undefined}
          maximumDate={new Date()}
          onChange={onToChange}
        />
      )}

      {/* User Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select a user</Text>

           
            {/* Users list inside a scrollable area within modal */}
            <ScrollView
              style={{ marginTop: hp("1%"), maxHeight: hp("35%") }}
              contentContainerStyle={{ paddingBottom: hp("1%") }}
            >
              {filteredSalesUsers.map((user, index) => (
                <Pressable
                  key={`${user.accountId}-${index}`}
                  style={styles.modalUserBox}
                  onPress={() => {
                    setSelectedUser(user);
                    setModalVisible(false);
                  }}
                >
                  {/* Radio button */}
                  <View
                    style={[
                      styles.modalRadioOuter,
                      selectedUser?.accountId === user.accountId && { borderColor: "#2E7D32" }
                    ]}
                  >
                    {selectedUser?.accountId === user.accountId && (
                      <View style={styles.modalRadioInner} />
                    )}
                  </View>

                  {/* User Name */}
                  <Text style={styles.modalUserName}>{user.fullName}</Text>
                </Pressable>
              ))}

              {filteredSalesUsers.length === 0 && !usersLoading && (
                <Text style={{ textAlign: "center", marginTop: 10 }}>
                  No users match your search.
                </Text>
              )}
            </ScrollView>
             {/* Search box (replica UI) */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#BDBDBD" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search with name"
                placeholderTextColor="#BCBCBC"
                style={{
                  flex: 1,
                  marginLeft: wp("2%"),
                  fontSize: wp("4%"),
                  height: "100%",
                  color: "#000",
                  fontFamily: Typography.fontFamilySatoshiRegular,
                }}
                returnKeyType="search"
                underlineColorAndroid="transparent"
              />
            </View>


            {/* If users are still loading show a small loader */}
            {usersLoading && (
              <View style={{ alignItems: "center", marginTop: hp("2%") }}>
                <ActivityIndicator size="small" color="#FFC20F" />
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Analytics;
