import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { appFont } from "./ui";

// Full-screen branded launch screen shown for a moment when the app opens.
// The background matches the logo's cream so the logo blends in seamlessly.
export default function BrandSplash() {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;
  const bar = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(bar, {
        toValue: 1,
        duration: 1500,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, scale, bar]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{ alignItems: "center", opacity: fade, transform: [{ scale }] }}
      >
        <Image
          source={require("../../assets/images/scenthub-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>Inventory & Sales Manager</Text>
      </Animated.View>

      <View style={styles.barTrack}>
        <Animated.View
          style={[styles.barFill, { transform: [{ scaleX: bar }] }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF9EE",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: { width: 270, height: 229 },
  tagline: {
    marginTop: 10,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.gold,
  },
  barTrack: {
    position: "absolute",
    bottom: 70,
    width: 120,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.goldLight,
    overflow: "hidden",
  },
  barFill: {
    width: 120,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },
});
