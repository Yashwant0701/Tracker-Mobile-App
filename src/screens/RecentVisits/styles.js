import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors, Typography } from "../../theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // Header
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("2%"),
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  backButton: {
    position: "absolute",
    left: wp("4%"),
    padding: wp("2%"),
  },
  headerTitle: {
    fontSize: wp("4.8%"),
    fontFamily: Typography.fontFamilyOutfitMedium,
    color: "#000000",
  },

  // ScrollView content
  scrollContent: {
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("5%"),
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp("3%"),
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("5%"),
    marginBottom: hp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  doctorName: {
    fontSize: wp("4.5%"),
    fontFamily: Typography.fontFamilyOutfitMedium,
    color: "#000000",
    marginBottom: hp("0.5%"),
  },
  dateTime: {
    fontSize: wp("4%"),
    color: "#9A9A9A",
    marginBottom: hp("0.3%"),
    fontFamily: Typography.fontFamilyOutfitRegular,
  },
  hospital: {
    fontSize: wp("4%"),
    color: "#9A9A9A",
    marginBottom: hp("1.5%"),
    fontFamily: Typography.fontFamilyOutfitRegular,
  },
  durationContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#FFC20F",
    borderRadius: wp("2%"),
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("4%"),
  },
  durationText: {
    color: "#FFFFFF",
    fontSize: wp("3.6%"),
    fontFamily: Typography.fontFamilyOutfitMedium,
  },

  // Floating Filter Button
  filterButton: {
     flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: wp("5%"),
    marginBottom: hp("3%"),
    marginTop: hp("1%"),
  },

  noDataText: {
    textAlign: "center",
    color: "#9A9A9A",
    fontFamily: Typography.fontFamilyOutfitRegular,
    fontSize: wp("3.8%"),
    marginTop: hp("5%"),
  },
});
