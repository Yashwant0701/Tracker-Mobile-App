import React, { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useRoute } from "@react-navigation/native";
import { styles } from "./styles";
import { Colors } from "../../theme";
import { getLocation } from "../../api/AuthService";

const MapScreen = () => {
  const route = useRoute();
  const { accountId, fullName } = route.params || {};

  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const mapRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchLocation = async (isInitial = false) => {
      try {
        const resp = await getLocation(accountId);
        console.log("Location API response:", resp);

        // ---------- Handle Not Found ----------
        if (resp?.statusCode === 404 || resp?.message === "Not Found") {
          setErrorMsg("No location found for this user.");
          if (isInitial) setLoading(false);
          return;
        }

        // ---------- Generic API Error ----------
        if (!resp?.success) {
          setErrorMsg(resp?.message || "Unable to fetch location");
          if (isInitial) setLoading(false);
          return;
        }

        const { lat, lon } = resp;

        const updatedRegion = {
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        // Update state
        setRegion(updatedRegion);
        setErrorMsg("");

        // ----- Auto move map to new location -----
        if (mapRef.current && !isInitial) {
          mapRef.current.animateToRegion(updatedRegion, 1000); // smooth movement
        }

      } catch (error) {
        setErrorMsg("Something went wrong fetching location");
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    // First fetch
    fetchLocation(true);

    // Fetch every 5 seconds
    intervalRef.current = setInterval(() => {
      fetchLocation(false);
    }, 5000);

    // Cleanup
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [accountId]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.headerText}>
        Location of {fullName || "User"}
      </Text>

      {/* Loading */}
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching location...</Text>
        </View>
      )}

      {/* Error */}
      {!loading && errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* Map */}
      {!loading && region && (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}      // <-- use controlled region (important)
        >
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            title={fullName || "User"}
            description={`Account ID: ${accountId}`}
          />
        </MapView>
      )}
    </View>
  );
};

export default MapScreen;
