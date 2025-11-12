// src/components/CustomButton.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors, Typography } from "../theme";

const CustomButton = ({ title, onPress, disabled, style }) => (
  <TouchableOpacity
    style={[
      styles.button,
      { backgroundColor: disabled ? "#ACACAC" : "#FFC20F" },
      style,
    ]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
  >
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: hp("1.8%"),
    borderRadius: wp("3%"),
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("4%"),
  },
  text: {
    color: Colors.background,
    fontSize: wp("4.5%"),
    fontFamily: Typography.fontFamilyOutfitMedium,
    letterSpacing: 0.5,
  },
});

export default CustomButton;
