// src/components/CustomInput.js
import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors, Typography } from "../theme"

const CustomInput = ({ label, ...props }) => (
  <View style={styles.container}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={styles.input}
      placeholderTextColor={Colors.tertiaryText}
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: hp("2%"), // responsive vertical spacing
  },
  label: {
    marginBottom: hp("1%"),
    fontSize: wp("3.5%"), // responsive font size
    fontFamily: Typography.fontFamilyPoppinsMedium,
    color: Colors.primaryText,
  },
  input: {
    backgroundColor: "#FBFAFA",
    borderRadius: wp("2.5%"),
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
    borderWidth: 1,
    borderColor: "#ECECEC",
    fontFamily: Typography.fontFamilyInterRegular,
    fontSize: wp("4%"),
    color: Colors.tertiaryText,
    width: wp("75%"),
  },
});

export default CustomInput;
