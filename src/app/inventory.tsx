import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  EmptyState,
  Pill,
  ScreenHeader,
  SummaryStrip,
  appFont,
} from "../components/ui";
import { Colors, Shadow } from "../constants/colors";
import { useAuth } from "../context/auth-context";
import { getProducts, getShopName } from "../database/db";

function getStockStatus(qty: number) {
  if (qty === 0)
    return { label: "Out of Stock", bg: Colors.redLight, text: Colors.red };
  if (qty < 5)
    return { label: "Low Stock", bg: Colors.orangeLight, text: Colors.orange };
  return { label: "In Stock", bg: Colors.greenLight, text: Colors.green };
}

type Filter = "all" | "in" | "low" | "out";

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [shopName] = useState(() => getShopName());
  const router = useRouter();
  const { user } = useAuth();
  const isCashier = user?.role === "cashier";

  useFocusEffect(
    useCallback(() => {
      setProducts(getProducts());
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    setProducts(getProducts());
    setTimeout(() => setRefreshing(false), 400);
  };

  const inCount = products.filter((p) => p.quantity >= 5).length;
  const lowCount = products.filter(
    (p) => p.quantity > 0 && p.quantity < 5,
  ).length;
  const outCount = products.filter((p) => p.quantity === 0).length;
  const totalUnits = products.reduce((sum, p) => sum + (p.quantity || 0), 0);

  const filteredProducts = products.filter((item) => {
    const query = search.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      (item.brand && item.brand.toLowerCase().includes(query));
    const matchesFilter =
      filter === "all" ||
      (filter === "in" && item.quantity >= 5) ||
      (filter === "low" && item.quantity > 0 && item.quantity < 5) ||
      (filter === "out" && item.quantity === 0);
    return matchesSearch && matchesFilter;
  });

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: products.length },
    { key: "in", label: "In Stock", count: inCount },
    { key: "low", label: "Low", count: lowCount },
    { key: "out", label: "Out", count: outCount },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
          />
        }
        ListHeaderComponent={
          <View>
            <ScreenHeader
              eyebrow={shopName}
              title="Inventory"
              subtitle={
                isCashier
                  ? "Browse the collection and check what's available."
                  : "Tap any perfume to edit its details or restock."
              }
              icon="flask-outline"
            />
            <SummaryStrip
              items={[
                { value: products.length, label: "Scents" },
                { value: totalUnits, label: "Units" },
                {
                  value: lowCount + outCount,
                  label: "Restock",
                  warn: lowCount + outCount > 0,
                },
              ]}
            />

            <View style={styles.body}>
              <View style={styles.searchBar}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={Colors.goldDark}
                />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search by name or brand..."
                  placeholderTextColor="#B5B0A6"
                  selectionColor={Colors.gold}
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch("")} hitSlop={10}>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={Colors.textMuted}
                    />
                  </Pressable>
                )}
              </View>

              <View style={styles.filterRow}>
                {filters.map((f) => {
                  const active = filter === f.key;
                  return (
                    <Pressable
                      key={f.key}
                      onPress={() => setFilter(f.key)}
                      style={[styles.filterChip, active && styles.filterActive]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          active && styles.filterTextActive,
                        ]}
                      >
                        {f.label}
                      </Text>
                      <View
                        style={[
                          styles.filterCount,
                          active && { backgroundColor: Colors.gold },
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterCountText,
                            active && { color: Colors.primary },
                          ]}
                        >
                          {f.count}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const status = getStockStatus(item.quantity);
          const pct = Math.min(
            100,
            Math.max(item.quantity > 0 ? 8 : 0, (item.quantity / 20) * 100),
          );
          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && !isCashier && { opacity: 0.9 },
              ]}
              // Cashiers can view stock but not open the edit screen.
              onPress={
                isCashier
                  ? undefined
                  : () =>
                      router.push({
                        pathname: "/edit-perfume",
                        params: { id: item.id },
                      })
              }
            >
              <View style={[styles.accent, { backgroundColor: status.text }]} />
              <View style={styles.cardIcon}>
                <Ionicons name="flask-outline" size={22} color={Colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.brand} numberOfLines={1}>
                  {item.brand || "Unbranded"}
                </Text>
                <View style={styles.meterRow}>
                  <View style={styles.meterTrack}>
                    <View
                      style={[
                        styles.meterFill,
                        { width: `${pct}%`, backgroundColor: status.text },
                      ]}
                    />
                  </View>
                  <Text style={styles.qtyText}>{item.quantity} left</Text>
                </View>
              </View>
              <View style={styles.right}>
                <Text style={styles.price}>₱{item.price}</Text>
                <Pill label={status.label} bg={status.bg} color={status.text} />
              </View>
              {!isCashier && (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.border}
                  style={{ marginLeft: 2 }}
                />
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon={
              search || filter !== "all" ? "search-outline" : "flask-outline"
            }
            title={
              search || filter !== "all"
                ? "No matches found"
                : "No perfumes yet"
            }
            message={
              search || filter !== "all"
                ? "Try a different search or filter."
                : "Add your first perfume from the Add tab to get started."
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  searchBar: {
    ...Shadow.soft,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  searchInput: { flex: 1, paddingVertical: 13, color: Colors.textDark },
  filterRow: { flexDirection: "row", gap: 8, marginTop: 14, marginBottom: 16 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingLeft: 13,
    paddingRight: 7,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontFamily: appFont,
    fontSize: 12.5,
    fontWeight: "700",
    color: Colors.textDark,
  },
  filterTextActive: { color: "#fff" },
  filterCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.goldLight,
  },
  filterCountText: {
    fontFamily: appFont,
    fontSize: 10.5,
    fontWeight: "800",
    color: Colors.goldDark,
  },
  card: {
    ...Shadow.soft,
    backgroundColor: Colors.card,
    borderRadius: 18,
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 18,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  accent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontFamily: appFont,
    fontSize: 16.5,
    fontWeight: "700",
    color: Colors.brown,
  },
  brand: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "400",
    color: Colors.textMuted,
    marginTop: 2,
  },
  meterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 9,
  },
  meterTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    overflow: "hidden",
  },
  meterFill: { height: 5, borderRadius: 3 },
  qtyText: {
    fontFamily: appFont,
    fontSize: 11.5,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  right: { alignItems: "flex-end", gap: 8 },
  price: {
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.goldDark,
  },
});
