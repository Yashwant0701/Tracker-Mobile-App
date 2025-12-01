// styles.js
import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors, Typography } from "../../theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  headerTitle: {
    fontSize: wp("4.8%"),
    fontFamily: Typography.fontFamilyOutfitMedium,
    color: "#000",
  },

  logoutButton: {
    position: "absolute",
    right: wp("5%"),
    padding: wp("2%"),
  },

  // Scroll Content
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
    fontFamily: Typography.fontFamilyOutfitRegular,
    color: "#000000",
    marginBottom: hp("0.5%"),
  },
  dateTime: {
    fontSize: wp("3.8%"),
    color: "#9A9A9A",
    marginBottom: hp("0.3%"),
    fontFamily: Typography.fontFamilyOutfitLight,
  },
  hospital: {
    fontSize: wp("3.8%"),
    color: "#9A9A9A",
    marginBottom: hp("1.5%"),
    fontFamily: Typography.fontFamilyOutfitLight,
  },

  durationContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#FFC20F",
    borderRadius: wp("2%"),
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("4%"),
  },
  durationText: {
    color: "#FFFFFF",
    fontSize: wp("3.6%"),
    fontFamily: Typography.fontFamilyOutfitMedium,
  },

  // Bottom
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp("5%"),
    marginBottom: hp("3%"),
    marginTop: hp("1%"),
  },

  dropdownButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp("3%"),
    borderWidth: 1,
    borderColor: "#DADADA",
    width: wp("35%"),
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("4%"),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: wp("4%"),
    fontFamily: Typography.fontFamilyOutfitRegular,
    color: "#212121",
  },
  dropdownIcon: {
    width: wp("5%"),
    height: wp("5%"),
    marginLeft: wp("2%"),
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: wp("80%"),
    backgroundColor: "#FFFFFF",
    borderRadius: wp("3%"),
    padding: wp("5%"),
  },
  modalTitle: {
    fontSize: wp("5%"),
    fontFamily: Typography.fontFamilyOutfitMedium,
    marginBottom: hp("2%"),
    textAlign: "center",
  },

  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp("1.5%"),
  },
  modalOptionText: {
    fontSize: wp("4%"),
    fontFamily: Typography.fontFamilyOutfitRegular,
    marginLeft: wp("3%"),
  },

  radioOuter: {
    width: wp("5%"),
    height: wp("5%"),
    borderRadius: wp("5%"),
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: wp("3%"),
    height: wp("3%"),
    borderRadius: wp("3%"),
    
  },
  bottomRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 10,
},

paginationContainer: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginVertical: 12,
  flexWrap: "wrap"
},
paginationButton: {
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: "#E5E5E5",
  marginHorizontal: 6,
  backgroundColor: "#FFFFFF"
},
paginationButtonDisabled: {
  opacity: 0.5
},
paginationButtonText: {
  fontSize: 14,
  fontFamily: Typography.fontFamilyOutfitLight,
  color: "#000"
},
paginationPageNumber: {
  paddingVertical: 6,
  paddingHorizontal: 10,
  marginHorizontal: 4,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: "#E5E5E5",
  backgroundColor: "#FFFFFF"
},
paginationPageNumberActive: {
  backgroundColor: "#FFC20F",
  borderColor: "#FFC20F"
},
paginationPageNumberText: {
  fontSize: 14,
  fontFamily: Typography.fontFamilyOutfitLight,
  color: "#000"
},
paginationPageNumberTextActive: {
  color: "#FFF"
},

});
