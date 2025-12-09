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

    // Yellow header
    headerContainer: {
        backgroundColor: "#FFC700",
        height: hp("38%"),
        alignItems: "center",
        paddingTop: hp("2%"),
    },

    backButton: {
        position: "absolute",
        top: hp("2%"),
        left: wp("5%"),
        zIndex: 20,
    },


    profileImage: {
        width: wp("35%"),
        height: wp("35%"),
        borderRadius: wp("17.5%"),
        marginTop: hp("4%"),
        borderWidth: 4,
        borderColor: "#D8D8D8",
    },

    profileName: {
        fontSize: hp("3%"),
        fontFamily: Typography.fontFamilySatoshiBold,
        color: "#000",
        marginTop: hp("2%"),
    },

    // Bottom white card
    whiteContainer: {
        marginTop: -hp("5%"),
        backgroundColor: "#fff",
        width: wp("100%"),
        alignSelf: "center",
        borderRadius: wp("12%"),
        paddingVertical: hp("5%"),
        paddingHorizontal: wp("5%"),
    },

    inputBox: {
        backgroundColor: "#F8F8F8",
        borderRadius: wp("3%"),
        paddingHorizontal: wp("4%"),
        paddingTop: hp("1%"),
        marginBottom: hp("2.5%"),
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },

    label: {
        fontSize: hp("1.8%"),
        color: Colors.primaryColor,
        fontFamily: Typography.fontFamilySatoshiMedium,

    },

    input: {
        fontSize: hp("1.8%"),
        color: "#000",
        fontFamily: Typography.fontFamilySatoshiMedium,
    },

    logoutButton: {
        marginTop: hp("6%"),
        width: wp("12%"),
        height: wp("12%"),
        justifyContent: "center",
        alignItems: "flex-start",

    },


});
