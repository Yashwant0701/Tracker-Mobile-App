import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { styles } from "./styles";
import { AuthContext } from "../../AuthContext";
import { fetchRecentVisits } from "../../api/AuthService";

const RecentVisits = ({ navigation }) => {
  const { currentUser } = useContext(AuthContext);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format date as DD-MM-YYYY (Asia/Kolkata)
  const formatDate = (isoDate) => {
    if (!isoDate) return "N/A";
    const date = new Date(isoDate);
    const options = {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return new Intl.DateTimeFormat("en-GB", options).format(date);
  };

  // Format time as hh:mm AM/PM (Asia/Kolkata)
  const formatTime = (isoDate) => {
    if (!isoDate) return "N/A";
    const date = new Date(isoDate);
    const options = {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  // Duration calculation
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
    } catch (err) {
      return "N/A";
    }
  };

  // Fetch recent visits from API
  useEffect(() => {
    const getVisits = async () => {
      try {
        if (!currentUser?.accountId) return;

        const response = await fetchRecentVisits(currentUser.accountId);

        if (response?.status === 200 && Array.isArray(response.data)) {
          //  SORTING NEWEST FIRST
          const sortedVisits = response.data.sort(
            (a, b) => new Date(b.checkinTime) - new Date(a.checkinTime)
          );

          setVisits(sortedVisits);
        } else {
          setVisits([]);
        }
      } catch (error) {
        setVisits([]);
      } finally {
        setLoading(false);
      }
    };

    getVisits();
  }, [currentUser]);

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
        ) : visits.length > 0 ? (
          visits.map((visit, index) => {
            const datePart = formatDate(visit.checkinTime);
            const timePart = formatTime(visit.checkinTime);
            const duration = calculateDuration(
              visit.checkinTime,
              visit.checkoutTime
            );

            return (
              <View key={index} style={styles.card}>
                {/* Provider / Doctor name */}
                <Text style={styles.doctorName}>
                  {visit.providerId ? ` ${visit.providerId}` : "N/A"}
                </Text>

                {/* Date | Time */}
                <Text style={styles.dateTime}>{`${datePart} | ${timePart}`}</Text>

                {/* Location */}
                <Text style={styles.hospital}>
                  {visit.gpsLocation ? `${visit.gpsLocation}` : "N/A"}
                </Text>

                {/* Duration */}
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

      {/* Floating Filter Button */}
      <TouchableOpacity style={styles.filterButton}>
        <Image
          source={require("../../assets/images/filterIcon.png")}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

export default RecentVisits;
