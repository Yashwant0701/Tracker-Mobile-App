import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { styles } from "./styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { AuthContext } from "../../AuthContext";
import { fetchRecentVisits } from "../../api/AuthService";
import { Typography } from "../../theme";

const RecentVisits = ({ navigation }) => {
  const { currentUser } = useContext(AuthContext);

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date range states
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // Picker control
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState(null); // "from" or "to"

  // Format date DD-MM-YYYY
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

  // Format hh:mm AM/PM
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

  // Duration calculator
  const calculateDuration = (checkinTime, checkoutTime) => {
    if (!checkinTime || !checkoutTime) return "0 sec";

    try {
      const start = new Date(checkinTime);
      const end = new Date(checkoutTime);
      const diffMs = Math.abs(end - start);

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      if (hours === 0 && minutes === 0 && seconds < 60) {
        return `${seconds} sec${seconds !== 1 ? "s" : ""} spent`;
      }
      if (hours === 0 && minutes === 0) {
        return "<1 mts spent";
      }
      if (hours === 0) {
        return `${minutes} mt${minutes !== 1 ? "s" : ""} spent`;
      }
      if (minutes === 0) {
        return `${hours} hr${hours > 1 ? "s" : ""} spent`;
      }

      return `${hours} hr${hours > 1 ? "s" : ""} ${minutes} mt${
        minutes > 1 ? "s" : ""
      } spent`;
    } catch {
      return "N/A";
    }
  };

  // Fetch visits
  useEffect(() => {
    const getVisits = async () => {
      try {
        if (!currentUser?.accountId) return;

        const response = await fetchRecentVisits(currentUser.accountId);

        if (response?.status === 200 && Array.isArray(response.data)) {
          const sortedVisits = response.data.sort(
            (a, b) => new Date(b.checkinTime) - new Date(a.checkinTime)
          );
          setVisits(sortedVisits);
        } else {
          setVisits([]);
        }
      } catch {
        setVisits([]);
      } finally {
        setLoading(false);
      }
    };

    getVisits();
  }, [currentUser]);

  // Apply range filter
  const getFilteredVisits = () => {
    if (!fromDate || !toDate) return visits;

    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    return visits.filter((v) => {
      const visitTime = new Date(v.checkinTime);
      return visitTime >= from && visitTime <= to;
    });
  };

  const filteredVisits = getFilteredVisits();

  const clearFilter = () => {
    setFromDate(null);
    setToDate(null);
  };

  // Date Picker Handler
  const onDateChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }

    if (pickerMode === "from") {
      setFromDate(selectedDate);
      setShowPicker(false);

      // Open TO date picker automatically
      setTimeout(() => {
        setPickerMode("to");
        setShowPicker(true);
      }, 300);
    }

    if (pickerMode === "to") {
      setToDate(selectedDate);
      setShowPicker(false);
    }
  };

  // Open range picker
  const openRangePicker = () => {
    setPickerMode("from");
    setShowPicker(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("../../assets/images/BackIcon.png")}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Recent Visits</Text>
      </View>

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          value={
            pickerMode === "from"
              ? fromDate || new Date()
              : toDate || fromDate || new Date()
          }
          maximumDate={
            pickerMode === "from"
              ? new Date() // FROM cannot select future
              : new Date() // TO cannot select future
          }
          minimumDate={
            pickerMode === "to" && fromDate ? fromDate : undefined
          }
        />
      )}

      {/* Visits List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FFC20F"
            style={{ marginTop: 50 }}
          />
        ) : filteredVisits.length > 0 ? (
          filteredVisits.map((visit, index) => {
            const datePart = formatDate(visit.checkinTime);
            const timePart = formatTime(visit.checkinTime);
            const duration = calculateDuration(
              visit.checkinTime,
              visit.checkoutTime
            );

            return (
              <View key={index} style={styles.card}>
                <Text style={styles.doctorName}>
                  {visit.providerId ? ` ${visit.providerId}` : "N/A"}
                </Text>

                <Text style={styles.dateTime}>{`${datePart} | ${timePart}`}</Text>

                <Text style={styles.hospital}>
                  {visit.gpsLocation ? `${visit.gpsLocation}` : "N/A"}
                </Text>

                <View style={styles.durationContainer}>
                  <Text style={styles.durationText}>{duration}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noDataText}>No recent visits found</Text>
        )}
      </ScrollView>

      {/* Filter Buttons */}
      <View style={styles.filterButton}>
        {(fromDate || toDate) && (
          <View
            style={{
              marginRight: wp("4%"),
              alignItems: "center",
              marginTop: hp("0.5%"),
            }}
          >
            <TouchableOpacity
              onPress={clearFilter}
              style={{ alignItems: "center", padding: wp("1%") }}
            >
              <Ionicons name="close-circle-outline" size={28} color="#BCBCBC" />
              <Text
                style={{
                  fontSize: wp("3%"),
                  color: "#BCBCBC",
                  marginTop: hp("0.2%"),
                  fontFamily: Typography.fontFamilyOutfitRegular,
                }}
              >
                Clear Filter
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={openRangePicker}
          style={{ marginLeft: wp("2%") }}
        >
          <Image
            source={require("../../assets/images/filterIcon.png")}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RecentVisits;
