import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BrandSplash from "../components/BrandSplash";
import { appFont } from "../components/ui";
import { Colors } from "../constants/colors";
import { AuthProvider, useAuth } from "../context/auth-context";
import "../database/db";
import Login from "./login";

function RootLayoutNav() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  if (!user) {
    return <Login />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 8,
          // Lift the tabs above the phone's own navigation buttons.
          height: 63 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          elevation: 18,
          shadowColor: Colors.brown,
          shadowOpacity: 0.12,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarLabelStyle: {
          fontFamily: appFont,
          fontSize: 10.5,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flask-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          // Cashiers can only sell and view stock, not add perfumes.
          href: user.role === "cashier" ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: "Sales",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="manage-users"
        options={{
          title: "Users",
          // Only owners see/can navigate to this tab — staff accounts
          // never get access to account management.
          href: user.role === "owner" ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="edit-perfume" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null }} />
    </Tabs>
  );
}

export default function TabLayout() {
  // Branded launch screen: shows the ScentHub logo for a moment, then the app.
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) return <BrandSplash />;

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
