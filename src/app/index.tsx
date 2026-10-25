import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useAuth } from "../context/auth-context";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors, Shadow } from "../constants/colors";
import {
  getProducts,
  getRecentSales,
  getSales,
  roleLabel,
  getShopName,
  getTopSeller,
  getTotalRevenue,
} from "../database/db";
import { appFont, SectionTitle } from "../components/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  // Financial figures are visible to the owner only.
  const isOwner = user?.role === "owner";
  const [shopName] = useState(() => getShopName());
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [topSeller, setTopSeller] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    const products = getProducts();
    const sales = getSales();
    setTotalProducts(products.length);
    setTotalSales(sales.length);
    setLowStock(products.filter((p: any) => p.quantity < 5).length);
    setRevenue(getTotalRevenue());
    setTopSeller(getTopSeller());
    setRecentSales(getRecentSales(3));
  }, []);

  useFocusEffect(loadData);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 400);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
          />
        }
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/images/scenthub-mark.png")}
              style={styles.mark}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.eyebrow}>{shopName}</Text>
              <Text style={styles.title}>Dashboard</Text>
            </View>
          </View>
          <Pressable style={styles.userBadge} onPress={logout}>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.userName}>{user?.full_name}</Text>
              <Text style={styles.userRole}>
                {user ? roleLabel(user.role) : ""} • Log out
              </Text>
            </View>
            <Ionicons name="log-out-outline" size={20} color={Colors.red} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.snapshotCard}>
            <View style={styles.snapshotIcon}>
              <Ionicons name="sparkles-outline" size={22} color={Colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.snapshotTitle}>Business Snapshot</Text>
              <Text style={styles.snapshotSub}>
                {totalProducts === 0
                  ? "Add your first perfume to get started."
                  : `Tracking ${totalProducts} scent${totalProducts === 1 ? "" : "s"} in ScentHub`}
              </Text>
            </View>
          </View>

          <Text style={styles.overviewTitle}>Overview</Text>
          <View style={styles.statRow}>
            {[
              { icon: "flask-outline", value: totalProducts, label: "Perfumes", warn: false },
              { icon: "cash-outline", value: totalSales, label: "Sales", warn: false },
              { icon: "alert-circle-outline", value: lowStock, label: "Low Stock", warn: lowStock > 0 },
            ].map((it) => (
              <View key={it.label} style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    it.warn && { backgroundColor: Colors.redLight },
                  ]}
                >
                  <Ionicons
                    name={it.icon as any}
                    size={18}
                    color={it.warn ? Colors.red : Colors.gold}
                  />
                </View>
                <Text style={[styles.statValue, it.warn && { color: Colors.red }]}>
                  {it.value}
                </Text>
                <Text style={styles.statLabel}>{it.label}</Text>
              </View>
            ))}
          </View>

          {isOwner && (
            <View style={styles.revenueCard}>
              <View>
                <Text style={styles.revenueLabel}>Total revenue</Text>
                <Text style={styles.revenueAmount}>
                  ₱{revenue.toLocaleString()}
                </Text>
              </View>
              <Ionicons
                name="trending-up-outline"
                size={30}
                color={Colors.gold}
              />
            </View>
          )}

          {isOwner && topSeller && (
            <View style={styles.topSellerCard}>
              <View style={styles.topSellerIcon}>
                <Ionicons name="trophy-outline" size={20} color={Colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.topSellerLabel}>Best seller</Text>
                <Text style={styles.topSellerName}>
                  {topSeller.name} — {topSeller.brand}
                </Text>
              </View>
              <Text style={styles.topSellerCount}>
                {topSeller.total_sold} sold
              </Text>
            </View>
          )}

          {lowStock > 0 && (
            <View style={styles.warningCard}>
              <Ionicons name="warning-outline" size={18} color={Colors.red} />
              <Text style={styles.warningText}>
                {lowStock} perfume{lowStock === 1 ? "" : "s"} running low —
                check Inventory to restock.
              </Text>
            </View>
          )}

          <SectionTitle title="Recent activity" style={{ marginBottom: 12 }} />
          {recentSales.length === 0 ? (
            <Text style={styles.empty}>No sales recorded yet.</Text>
          ) : (
            recentSales.map((sale) => (
              <View key={sale.id} style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <Ionicons
                    name="receipt-outline"
                    size={16}
                    color={Colors.gold}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityName}>
                    {sale.product_name || "Unknown"}
                  </Text>
                  <Text style={styles.activityDetails}>
                    Qty: {sale.quantity_sold}
                    {sale.sold_by ? ` • by ${sale.sold_by}` : ""}
                  </Text>
                </View>
                <Text style={styles.activityAmount}>₱{sale.total_price}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  body: { paddingHorizontal: 20, paddingTop: 8 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  mark: { width: 36, height: 56 },
  eyebrow: {
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.goldDark,
  },
  title: {
    fontFamily: appFont,
    fontSize: 30,
    fontWeight: "700",
    color: Colors.brown,
    marginTop: 2,
  },
  snapshotCard: {
    backgroundColor: Colors.brown,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
    ...Shadow.strong,
  },
  snapshotIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(198,161,91,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  snapshotTitle: {
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gold,
  },
  snapshotSub: {
    fontFamily: appFont,
    fontSize: 12.5,
    color: "#D9C9AE",
    marginTop: 3,
  },
  overviewTitle: {
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.brown,
    marginBottom: 12,
  },
  statRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    ...Shadow.soft,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: Colors.goldLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  statValue: {
    fontFamily: appFont,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.brown,
  },
  statLabel: {
    fontFamily: appFont,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.brown,
  },
  userRole: {
    fontFamily: appFont,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  revenueCard: {
    backgroundColor: Colors.goldLight,
    ...Shadow.soft,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.gold,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  revenueLabel: {
    fontFamily: appFont,
    fontSize: 13,
    color: Colors.orange,
    fontWeight: "600",
  },
  revenueAmount: {
    fontFamily: appFont,
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textDark,
    marginTop: 4,
  },
  topSellerCard: {
    ...Shadow.soft,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  topSellerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  topSellerLabel: {
    fontFamily: appFont,
    fontSize: 12,
    color: Colors.textMuted,
  },
  topSellerName: {
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textDark,
    marginTop: 2,
  },
  topSellerCount: {
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.gold,
  },
  warningCard: {
    backgroundColor: Colors.redLight,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  warningText: {
    color: Colors.red,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  activityName: {
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textDark,
  },
  activityDetails: {
    fontFamily: appFont,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  activityAmount: {
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textDark,
  },
  empty: { textAlign: "center", color: Colors.textMuted, marginBottom: 10 },
});
