// src/screens/Home/styles.js
import { StyleSheet } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Colors, Typography } from "../../theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // Header
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("5%"),
    paddingTop: hp("2%"),
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: wp("12%"),
    height: wp("12%"),
    borderRadius: wp("6%"),
    marginRight: wp("3%"),
  },
  welcomeText: {
    fontSize: wp("4%"),
    color: "#929292",
    fontFamily: Typography.fontFamilyOutfitRegular,
  },
  userName: {
    fontSize: wp("4.5%"),
    color: "#000",
    fontFamily: Typography.fontFamilyOutfitMedium,
  },
  bellIcon: {
    width: wp("12%"),
    height: wp("12%"),
  },
  logoutIcon: {
    width: wp("12%"),
    height: wp("12%"),
    marginLeft: wp("15%"),
  },

  // Main section (circle)
  mainSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    top: hp("5%"),
  },
  outerCircle: {
    width: wp("60%"),
    height: wp("60%"),
    borderRadius: wp("30%"),
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  innerCircle: {
    width: wp("52%"),
    height: wp("52%"),
    borderRadius: wp("26%"),
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircleActive: {
    width: wp("52%"),
    height: wp("52%"),
    borderRadius: wp("26%"),
    backgroundColor: "#FFC20F",
    justifyContent: "center",
    alignItems: "center",
  },
  startVisitText: {
    fontSize: wp("6%"),
    color: "#000000",
    fontFamily: Typography.fontFamilyOutfitMedium,
  },
  timerText: {
    fontSize: wp("8%"),
    fontFamily: Typography.fontFamilyOutfitMedium,
    color: "#000",
  },
  stopVisitText: {
    fontSize: wp("4%"),
    color: "#585858",
    fontFamily: Typography.fontFamilyOutfitMedium,
    marginTop: hp("1%"),
  },

  // Toggle row (Off Duty / On Duty)
  toggleRow: {
    marginTop: hp("4%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleLabel: {
    marginHorizontal: wp("3%"),
    fontSize: wp("3.8%"),
    color: "#000",
    fontFamily: Typography.fontFamilyOutfitRegular,
  },
  toggleSwitch: {
    width: wp("22%"),
    height: hp("4.2%"),
    borderRadius: hp("2.1%"),
    justifyContent: "center",
    padding: wp("1.5%"),
  },
  toggleOn: {
    backgroundColor: "#0A7A2F", // green when ON
  },
  toggleOff: {
    backgroundColor: "#E5E5E5", // grey when OFF
  },
  toggleCircle: {
    width: wp("8%"),
    height: wp("8%"),
    borderRadius: wp("4%"),
    backgroundColor: "#FFF",
  },
  toggleCircleOn: {
    alignSelf: "flex-end",
  },
  toggleCircleOff: {
    alignSelf: "flex-start",
  },

  // Footer
  footerContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: hp("4%"),
  },
  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderRadius: wp("4%"),
    width: wp("90%"),
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
    borderWidth: 1,
    borderColor: "#ECECEC",
    elevation: 1,
  },
  footerCardActive: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // keep vertical center
    backgroundColor: "#FFF",
    borderRadius: wp("4%"),
    width: wp("90%"),
    paddingLeft: wp("5%"),
    paddingRight: wp("3%"),
    paddingVertical: hp("2%"),
    borderWidth: 1,
    borderColor: "#ECECEC",
    elevation: 3,
  },
  footerTextContainer: {
    flex: 1,
    paddingRight: wp("3%"),
  },
  doctorNameText: {
    color: "#000000",
    fontSize: wp("4.5%"),
    fontFamily: Typography.fontFamilyOutfitRegular,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  visitDetailText: {
    color: "#9A9A9A",
    fontSize: wp("3.5%"),
    fontFamily: Typography.fontFamilyOutfitLight,
    marginTop: hp("0.3%"),
    flexShrink: 1,
    flexWrap: "wrap",
  },

  // Keep icon large but fully visible
  editIcon: {
    width: wp("15%"),
    height: wp("15%"),
    marginLeft: wp("1%"),
  },

  footerText: {
    color: "#000",
    fontSize: wp("4%"),
    fontFamily: Typography.fontFamilyOutfitRegular,
    flex: 1,
  },

  myVisitsButton: {
    backgroundColor: "#FFC20F",
    borderRadius: wp("2.5%"),
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("1%"),
  },
  myVisitsText: {
    color: Colors.background,
    fontSize: wp("4%"),
    fontFamily: Typography.fontFamilyOutfitMedium,
  },

// Tooltip overlay (full-screen)
tooltipOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.8)", // entire screen dimmed
  justifyContent: "flex-end", // changed to position tooltip below toggle
  alignItems: "center",
  zIndex: 9999,
  elevation: 9999,
  pointerEvents: "auto",
},

// Tooltip image positioned just below Off Duty / On Duty toggle
tooltipImageBelowToggle: {
  //width: wp("60%"),
  //height: hp("10%"),
  position: "absolute",
  top: hp("68%"), // 
  alignSelf: "center",
  marginRight: wp("6%"),
},


  // Modal & dropdowns
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: wp("85%"),
    backgroundColor: "#FFF",
    borderRadius: wp("4%"),
    paddingVertical: hp("3%"),
    paddingHorizontal: wp("5%"),
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  inputField: {
    width: "100%",
    height: hp("6%"),
    borderRadius: wp("3%"),
    backgroundColor: "#FAFAFA",
    marginBottom: hp("1%"),
    paddingHorizontal: wp("4%"),
    fontSize: wp("4%"),
    color: "#000",
    borderWidth: 1,
    borderColor: "#F2F2F2",
    fontFamily: Typography.fontFamilyOutfitMedium,
  },
  dropdownContainer: {
    maxHeight: hp("20%"),
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: wp("3%"),
    marginBottom: hp("2%"),
    elevation: 5,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("4%"),
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
  dropdownText: {
    fontSize: wp("4%"),
    color: "#000",
    fontFamily: Typography.fontFamilyOutfitRegular,
  },
});
