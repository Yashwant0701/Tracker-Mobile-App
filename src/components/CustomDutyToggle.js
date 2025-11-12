// CustomDutyToggle.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Typography } from "../theme";

/**
 * Props:
 *  - isOn (bool) : current state (true = On Duty)
 *  - onToggle (fn) : callback toggles the state
 *
 * Behavior:
 *  - Off state: outer bg light gray, left label "Off Duty" (grey), pill on right shows white circle at left and "On" text to its right
 *  - On state: outer bg dark green, left label "On Duty" (white), pill shows white circle at right and "Off" text to its left
 *  - Animated slide of circle and text when toggled
 */

const PILL_WIDTH = wp("18%"); // pill total width
const PILL_HEIGHT = hp("3.2%");
const CIRCLE_SIZE = hp("2.4%");
const PILL_HORIZONTAL_PADDING = wp("1.2%"); // left+right inside pill

const CustomDutyToggle = ({ isOn = false, onToggle = () => {} }) => {
  // animation value: 0 => Off, 1 => On
  const anim = useRef(new Animated.Value(isOn ? 1 : 0)).current;

  // measure internal positions based on known sizes
  const innerAvailable = PILL_WIDTH - PILL_HORIZONTAL_PADDING * 1;
  // position for circle when off = small left offset (0)
  const circleLeftOff = 4;
  // when on, circle moves to rightmost inside pill: innerAvailable - CIRCLE_SIZE
  const circleLeftOn = innerAvailable - CIRCLE_SIZE;

  // Text offsets (we slide the text opposite direction)
  // We'll center the text vertically and animate translateX to shift it left/right a bit
  const textShift = circleLeftOn / 1.3; // tuned constant so text visually moves opposite the circle

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isOn ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // layout positions use style left/transform (not all are supported with native driver)
    }).start();
  }, [isOn, anim]);

  // interpolated values
  const circleLeft = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [circleLeftOff, circleLeftOn],
  });

  const pillBgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#A2A2A2", "#0F8C30"], // inner pill color changes slightly
  });

  const outerBgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E8E7E7", "#004B14"],
  });

  const leftLabelColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#979797", "#FFFFFF"],
  });

  const textTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -textShift],
  });

  // pill text to display: when OFF show "On", when ON show "Off"
  const pillText = isOn ? "Off" : "On";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onToggle}
      style={[styles.containerOuter]}
    >
      {/* Outer background color animated */}
      <Animated.View
        style={[
          styles.innerWrapper,
          {
            backgroundColor: outerBgColor,
          },
        ]}
      >
        {/* Left label */}
        <Animated.Text
          style={[
            styles.leftLabel,
            {
              color: leftLabelColor,
            },
          ]}
        >
          {isOn ? "On Duty" : "Off Duty"}
        </Animated.Text>

        {/* Right pill */}
        <Animated.View
          style={[
            styles.pill,
            {
              backgroundColor: pillBgColor,
            },
          ]}
        >
          {/* Animated text inside pill (will slide a little) */}
          <Animated.View
            style={[
              styles.pillTextContainer,
              {
                transform: [{ translateX: textTranslate }],
                // when On state, we want slightly different inner background for the right small area;
                // keep overall color via pillBgColor and keep this container transparent so text sits on top
              },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.pillText}>{pillText}</Text>
          </Animated.View>

          {/* Animated circle positioned absolutely inside pill */}
          <Animated.View
            style={[
              styles.circle,
              {
                left: circleLeft,
              },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerOuter: {
    // container to ensure full clickable area and spacing
    paddingHorizontal: wp("2%"),
  },

  innerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: wp("3.5%"),
    height: hp("5%"),
    minWidth: wp("44%"),
    justifyContent: "space-between",
    paddingHorizontal: wp("3%"),
  },

  leftLabel: {
    fontSize: wp("3.6%"),
    // marginLeft tuned to match provided images (slightly inset)
    marginLeft: wp("1%"),
    fontFamily:Typography.fontFamilySemibold,
  },

  pill: {
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    paddingHorizontal: PILL_HORIZONTAL_PADDING,
    justifyContent: "center",
    overflow: "hidden",
  },

  pillTextContainer: {
    position: "absolute",
    right: PILL_HORIZONTAL_PADDING, // keep right aligned so sliding moves it left when animated
    height: PILL_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    // ensure text sits visibly above circle (z-index not guaranteed across platforms)
    zIndex: 2,
  },

  pillText: {
    color: "#FFFFFF",
    fontSize: wp("3.2%"),
    fontFamily: Typography.fontFamilySemibold,
  },

  circle: {
    position: "absolute",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#FFFFFF",
    top: (PILL_HEIGHT - CIRCLE_SIZE) / 2,
    // left is animated
    zIndex: 3,
    // small shadow for better look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default CustomDutyToggle;
