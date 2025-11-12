// src/screens/Login/styles.js
import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors, Typography } from "../../theme"

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
  },

  // Yellow header section
  headerContainer: {
    backgroundColor: Colors.primaryColor,
    height: hp("37%"),
    //justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp("5%"),

  },

  headerTitle: {
    fontSize: wp("7%"),
    fontFamily: Typography.fontFamilyOutfitMedium,
    color: Colors.primaryText,
    marginBottom: hp("1%"),
    marginTop: hp("10%"),
  },

  headerSubtitle: {
    fontSize: wp("5%"),
    fontFamily: Typography.fontFamilyOutfitRegular,
    color: Colors.secondaryText,
    textAlign: "center",
  },

  // White login card
  cardContainer: {
    backgroundColor: Colors.background,
    marginHorizontal: wp("5%"),
    marginTop: -hp("8%"),
    borderRadius: wp("4%"),
    padding: wp("6%"),
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    height: hp("48%"),
  },

  logo: {
    width: wp("50%"),
    height: hp("10%"),
    marginBottom: hp("3%"),
  },


  loginButton: {
    width: "100%",
    paddingVertical: hp("1.8%"),
    borderRadius: wp("3%"),
    alignItems: "center",
    marginTop: hp("4%"),
  },

  loginButtonText: {
    color: Colors.background,
    fontSize: wp("4.5%"),
    fontFamily: Typography.fontFamilyOutfitMedium,
  },

  // Footer
  footerContainer: {
    alignItems: "center",
    marginTop: hp("5%"),
  },

  versionText: {
    fontSize: wp("4%"),
    color: "#9E9E9E",
    fontFamily: Typography.fontFamilyInterRegular,
    marginBottom: hp("0.5%"),
  },

  poweredText: {
    fontSize: wp("4%"),
    color: "#9E9E9E",
    fontFamily: Typography.fontFamilyInterRegular,
  },
  poweredByContainer:{
    display:"flex",
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    marginTop:hp("0.5%")
  },
  sujaLogo:{
    marginLeft:wp("3%"),
  },

  // Modal styles (unchanged)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: wp("80%"),
    backgroundColor: "#fff",
    borderRadius: wp("3%"),
    padding: wp("5%"),
  },
  modalTitle: {
    fontSize: wp("5%"),
    marginBottom: hp("2%"),
    textAlign: "center",
    fontFamily: Typography.fontFamilyOutfitMedium,
  },
  userItem: {
    padding: wp("3%"),
    borderBottomWidth: 0,
  },
  userName: {
    fontSize: wp("4%"),
    fontFamily: Typography.fontFamilyOutfitMedium,
  },
  closeButton: {
    marginTop: hp("2%"),
    backgroundColor: Colors.primaryColor,
    padding: wp("3%"),
    borderRadius: wp("3%"),
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontFamily: Typography.fontFamilyOutfitMedium,
  },
});
