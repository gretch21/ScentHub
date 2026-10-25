import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { useAuth } from "../context/auth-context";
import { getShopName } from "../database/db";
import { appFont } from "../components/ui";

const CREAM = "#FDF9EE";

export default function Login() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [shopName] = useState(() => getShopName());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focus, setFocus] = useState<"user" | "pass" | null>(null);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      setError("Enter both username and password.");
      return;
    }
    const success = login(username, password);
    if (!success) {
      setError("Incorrect username or password.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Brand area — scent rings radiate from behind the logo */}
        <View style={[styles.brandArea, { paddingTop: insets.top + 24 }]}>
          <View pointerEvents="none" style={styles.ringCenter}>
            <View style={[styles.ring, { width: 420, height: 420, opacity: 0.1 }]} />
            <View style={[styles.ring, { width: 320, height: 320, opacity: 0.18 }]} />
            <View style={[styles.ring, { width: 220, height: 220, opacity: 0.3 }]} />
          </View>
          <Image
            source={require("../../assets/images/scenthub-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.shop}>{shopName}</Text>
        </View>

        {/* Sign-in sheet */}
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 28 }]}>
          <View style={styles.grip} />
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <Text style={styles.label}>Username</Text>
          <View style={[styles.field, focus === "user" && styles.fieldFocus]}>
            <Ionicons
              name="person-outline"
              size={18}
              color={focus === "user" ? Colors.gold : "#A89A86"}
            />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                setError("");
              }}
              onFocus={() => setFocus("user")}
              onBlur={() => setFocus(null)}
              placeholder="e.g. owner"
              placeholderTextColor="#8A7C6A"
              selectionColor={Colors.gold}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={[styles.field, focus === "pass" && styles.fieldFocus]}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={focus === "pass" ? Colors.gold : "#A89A86"}
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError("");
              }}
              onFocus={() => setFocus("pass")}
              onBlur={() => setFocus(null)}
              placeholder="••••••••"
              placeholderTextColor="#8A7C6A"
              selectionColor={Colors.gold}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={12}
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#A89A86"
              />
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={15} color="#F0A79D" />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
            ]}
          >
            <Text style={styles.buttonText}>Log In</Text>
          </Pressable>

          <View style={styles.hintRow}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#A89A86"
            />
            <Text style={styles.hintText}>
              Default owner account — username: owner / password: owner123. Once
              logged in, create staff accounts from Manage Users.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.brown },
  scroll: { flexGrow: 1 },
  brandArea: {
    flex: 1,
    minHeight: 280,
    backgroundColor: CREAM,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 36,
    overflow: "hidden",
  },
  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  logo: { width: 200, height: 170 },
  shop: {
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.goldDark,
    marginTop: 6,
  },
  sheet: {
    backgroundColor: Colors.brown,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    marginTop: -28,
    paddingHorizontal: 28,
    paddingTop: 14,
  },
  grip: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(198,161,91,0.45)",
    marginBottom: 22,
  },
  heading: {
    fontFamily: appFont,
    fontSize: 26,
    fontWeight: "700",
    color: CREAM,
  },
  subtitle: {
    fontFamily: appFont,
    fontSize: 14,
    color: "#BBAA90",
    marginTop: 4,
    marginBottom: 24,
  },
  label: {
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    color: "#D9C9AE",
    marginBottom: 8,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(253,249,238,0.07)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(198,161,91,0.22)",
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  fieldFocus: {
    borderColor: Colors.gold,
    backgroundColor: "rgba(253,249,238,0.11)",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: appFont,
    fontSize: 15,
    color: CREAM,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
    marginTop: -4,
  },
  error: {
    flex: 1,
    color: "#F0A79D",
    fontFamily: appFont,
    fontSize: 13,
  },
  button: {
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: Colors.brown,
    fontWeight: "800",
    fontFamily: appFont,
    fontSize: 16,
  },
  hintRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 22,
  },
  hintText: {
    flex: 1,
    fontFamily: appFont,
    fontSize: 12,
    color: "#A89A86",
    lineHeight: 17,
  },
});
