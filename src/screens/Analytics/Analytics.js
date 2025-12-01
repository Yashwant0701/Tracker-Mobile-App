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
} from "react-native";
import { styles } from "./styles";
import { logout, fetchRecentVisits, getSalesUsers } from "../../api/AuthService";
import { AuthContext } from "../../AuthContext";
import { clearTokens } from "../../../tokenStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Typography } from "../../theme";

// PAGE SIZE for visits (you selected 10)
const VISITS_PAGE_SIZE = 10;

const Analytics = ({ navigation }) => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const [salesUsers, setSalesUsers] = useState([]); // objects from GetSalesUsers
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null); // will hold user object
  const [modalVisible, setModalVisible] = useState(false);

  // Visits pagination
  const allVisitsRef = useRef([]); // store full visits array once fetched
  const [visits, setVisits] = useState([]); // currently displayed (paged)
  const [pageIndex, setPageIndex] = useState(1); // 1-based
  const [totalPages, setTotalPages] = useState(0);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [visitsError, setVisitsError] = useState("");

  // -------------------------- LOGOUT --------------------------
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

  // -------------------------- FORMAT HELPERS --------------------------
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

  // -------------------------- GET SALES USERS --------------------------
  useEffect(() => {
    let mounted = true;
    const loadUsers = async () => {
      setUsersLoading(true);
      setUsersError("");
      try {
        // Get first page of sales users (PageSize 10, PageIndex 1)
        const resp = await getSalesUsers({ pageSize: 10, pageIndex: 1 });
        // expect resp to be an array
        if (!mounted) return;

        if (Array.isArray(resp)) {
          // remove duplicates by accountId and keep first occurrence
          const uniqueMap = new Map();
          for (const u of resp) {
            if (!uniqueMap.has(u.accountId)) uniqueMap.set(u.accountId, u);
          }
          const uniqueUsers = Array.from(uniqueMap.values());
          setSalesUsers(uniqueUsers);
          // default select first user if none selected
          if (!selectedUser && uniqueUsers.length > 0) {
            setSelectedUser(uniqueUsers[0]);
          }
        } else {
          setSalesUsers([]);
          setUsersError("No users found");
        }
      } catch (err) {
        console.error("GetSalesUsers error:", err);
        setSalesUsers([]);
        setUsersError("Failed to fetch users");
      } finally {
        if (mounted) setUsersLoading(false);
      }
    };

    loadUsers();
    return () => {
      mounted = false;
    };
  }, []); // run once on mount

  // -------------------------- FETCH VISITS (all) FOR SELECTED USER --------------------------
  useEffect(() => {
    const loadVisitsForUser = async () => {
      if (!selectedUser?.accountId) {
        allVisitsRef.current = [];
        setVisits([]);
        setPageIndex(1);
        setTotalPages(0);
        setVisitsError("");
        return;
      }

      setVisitsLoading(true);
      setVisitsError("");
      setVisits([]); // clear while loading
      allVisitsRef.current = [];
      setPageIndex(1);

      try {
        const response = await fetchRecentVisits(selectedUser.accountId);
        if (response?.status === 200 && Array.isArray(response.data)) {
          // sort newest-first
          const sorted = response.data.sort(
            (a, b) => new Date(b.checkinTime) - new Date(a.checkinTime)
          );

          // store full list
          allVisitsRef.current = sorted;

          // compute pages and set initial slice (page 1)
          const total = sorted.length;
          const pages = Math.ceil(total / VISITS_PAGE_SIZE) || 0;
          setTotalPages(pages);
          const initialSlice = sorted.slice(0, VISITS_PAGE_SIZE);
          setVisits(initialSlice);
        } else {
          allVisitsRef.current = [];
          setVisits([]);
          setTotalPages(0);
        }
      } catch (err) {
        console.error("fetchRecentVisits error:", err);
        allVisitsRef.current = [];
        setVisits([]);
        setTotalPages(0);
        setVisitsError("Failed to fetch visits");
      } finally {
        setVisitsLoading(false);
      }
    };

    loadVisitsForUser();
  }, [selectedUser]);

  // -------------------------- PAGE CHANGE EFFECT --------------------------
  // When pageIndex changes, update current visits slice from allVisitsRef
  useEffect(() => {
    const total = allVisitsRef.current.length;
    if (total === 0) {
      setVisits([]);
      setTotalPages(0);
      return;
    }

    const pages = Math.ceil(total / VISITS_PAGE_SIZE);
    setTotalPages(pages);

    // clamp pageIndex in range
    let p = pageIndex;
    if (p < 1) p = 1;
    if (p > pages) p = pages;
    if (p !== pageIndex) setPageIndex(p);

    const start = (p - 1) * VISITS_PAGE_SIZE;
    const end = start + VISITS_PAGE_SIZE;
    const slice = allVisitsRef.current.slice(start, end);
    setVisits(slice);
  }, [pageIndex]);

  // -------------------------- PAGINATION HANDLERS --------------------------
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPageIndex(p);
    // scroll to top of scroll view would be nice — left to caller if needed
  };

  const goPrev = () => {
    if (pageIndex > 1) setPageIndex((prev) => prev - 1);
  };

  const goNext = () => {
    if (pageIndex < totalPages) setPageIndex((prev) => prev + 1);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    // Create array [1..totalPages]
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          onPress={goPrev}
          disabled={pageIndex === 1}
          style={[
            styles.paginationButton,
            pageIndex === 1 && styles.paginationButtonDisabled,
          ]}
        >
          <Text style={styles.paginationButtonText}>Prev</Text>
        </TouchableOpacity>

        {pages.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => goToPage(p)}
            style={[
              styles.paginationPageNumber,
              pageIndex === p && styles.paginationPageNumberActive,
            ]}
          >
            <Text
              style={[
                styles.paginationPageNumberText,
                pageIndex === p && styles.paginationPageNumberTextActive,
              ]}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={goNext}
          disabled={pageIndex === totalPages}
          style={[
            styles.paginationButton,
            pageIndex === totalPages && styles.paginationButtonDisabled,
          ]}
        >
          <Text style={styles.paginationButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // -------------------------- UI --------------------------
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Analytics</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={logoutUser}>
          <Image source={require("../../assets/images/AdminLogoutIcon.png")} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Users loader/error */}
        {usersLoading ? (
          <ActivityIndicator size="small" color="#FFC20F" style={{ marginVertical: 10 }} />
        ) : usersError ? (
          <Text style={{ color: "red", marginVertical: 10 }}>{usersError}</Text>
        ) : null}

        {/* Visits list */}
        {visitsLoading ? (
          <ActivityIndicator size="large" color="#FFC20F" style={{ marginTop: 50 }} />
        ) : visitsError ? (
          <Text style={{ color: "red", marginTop: 20 }}>{visitsError}</Text>
        ) : visits.length > 0 ? (
          visits.map((visit, index) => {
            const date = formatDate(visit.checkinTime);
            const time = formatTime(visit.checkinTime);
            const duration = calculateDuration(visit.checkinTime, visit.checkoutTime);

            return (
              <View key={`${visit.salesVisitId ?? index}-${index}`} style={styles.card}>
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
                      style={{ width: 30, height: 30, marginLeft: 10 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noDataText}>No recent visits found</Text>
        )}

        {/* Pagination (bottom only) */}
        {renderPagination()}
      </ScrollView>

      {/* Bottom Bar (User dropdown + filter) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.dropdownText}>{selectedUser?.fullName || "Select user"}</Text>
          <Image source={require("../../assets/images/downArrow.png")} style={styles.dropdownIcon} />
        </TouchableOpacity>

        <TouchableOpacity>
          <Image source={require("../../assets/images/filterIcon.png")} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* User Selection Modal (no pagination) */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select a user</Text>

            {salesUsers.map((user, index) => (
              <Pressable
                key={`${user.accountId}-${index}`}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedUser(user);
                  setModalVisible(false);
                }}
              >
                <View style={[styles.radioOuter, selectedUser?.accountId === user.accountId && { borderColor: "#2E7D32" }]}>
                  {selectedUser?.accountId === user.accountId && (
                    <View style={[styles.radioInner, { backgroundColor: "#2E7D32" }]} />
                  )}
                </View>

                <Text style={styles.modalOptionText}>{user.fullName}</Text>
              </Pressable>
            ))}

            {salesUsers.length === 0 && !usersLoading && (
              <Text style={{ textAlign: "center", marginTop: 10 }}>No users available.</Text>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Analytics;
