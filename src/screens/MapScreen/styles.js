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

  headerText: {
    fontSize: wp("4%"),
    padding: wp("4%"),
    color: Colors.primaryText,
    fontFamily: Typography.fontFamilyOutfitMedium,
    
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

   // Error UI
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp("10%"),
  },
  errorText: {
    fontSize: wp("4%"),
    color: Colors.primaryText,
    textAlign: "center",
    fontFamily: Typography.fontFamilyOutfitRegular,
  },
   headerContainer:{
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1%"),
   }


});
