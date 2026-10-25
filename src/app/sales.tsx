import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AppModal from "../components/AppModal";
import {
  Card,
  EmptyState,
  PrimaryButton,
  ScreenHeader,
  SectionTitle,
  SummaryStrip,
  appFont,
} from "../components/ui";
import { Colors, Shadow } from "../constants/colors";
import { useAuth } from "../context/auth-context";
import {
  deleteSale,
  getProducts,
  getSales,
  getShopName,
  recordSale,
} from "../database/db";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${MONTHS[d.getMonth()]} ${d.getDate()} • ${h}:${mm} ${ampm}`;
}

export default function Sales() {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [qty, setQty] = useState("");
  const [shopName] = useState(() => getShopName());

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });
  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      setProducts(getProducts());
      setSales(getSales());
    }, []),
  );

  const selected = products.find((p) => p.id === selectedId) || null;
  const qtyNum = parseInt(qty) || 0;
  const orderTotal = selected && qtyNum > 0 ? selected.price * qtyNum : 0;

  const unitsSold = sales.reduce((s, x) => s + (x.quantity_sold || 0), 0);
  const revenue = sales.reduce((s, x) => s + (x.total_price || 0), 0);

  const adjustQty = (delta: number) => {
    const max = selected ? selected.quantity : 999;
    const next = Math.min(Math.max(1, qtyNum + delta), Math.max(1, max));
    setQty(String(next));
  };

  const selectProduct = (p: any) => {
    if (p.quantity === 0) return;
    setSelectedId(p.id);
    if (!qty) setQty("1");
  };

  const handleRecordSale = () => {
    if (!selectedId || !qty) {
      setErrorModal({
        visible: true,
        message: "Select a perfume and enter quantity sold.",
      });
      return;
    }
    const product = products.find((p) => p.id === selectedId);

    if (!product || qtyNum <= 0) {
      setErrorModal({ visible: true, message: "Enter a valid quantity." });
      return;
    }
    if (qtyNum > product.quantity) {
      setErrorModal({
        visible: true,
        message: `Only ${product.quantity} left in stock.`,
      });
      return;
    }

    const total = product.price * qtyNum;
    recordSale(selectedId, qtyNum, total, user?.id ?? null);
    setQty("");
    setSelectedId(null);
    setProducts(getProducts());
    setSales(getSales());
    setSuccessModal({
      visible: true,
      message: `Sold ${qtyNum} × ${product.name} for ₱${total}`,
    });
  };

  const getProductName = (productId: number) => {
    const p = products.find((prod) => prod.id === productId);
    return p ? p.name : "Unknown";
  };

  const stripItems = [
    { value: sales.length, label: "Sales" },
    { value: unitsSold, label: "Units Sold" },
  ];
  if (isOwner) {
    stripItems.push({
      value: `₱${revenue.toLocaleString()}`,
      label: "Revenue",
    });
  }

  return (
    <>
      <View style={styles.container}>
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          data={sales}
          keyExtractor={(item) => item.id.toString()}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View>
              <ScreenHeader
                eyebrow={shopName}
                title="Record a Sale"
                subtitle="Pick a scent, set the quantity and ring it up."
                icon="cash-outline"
              />
              <SummaryStrip items={stripItems} />

              <View style={styles.body}>
                <SectionTitle title="New Sale" style={{ marginBottom: 14 }} />
                <Card style={{ paddingHorizontal: 0 }}>
                  <Text style={[styles.label, { paddingHorizontal: 18 }]}>
                    SELECT PERFUME
                  </Text>
                  {products.length === 0 ? (
                    <Text style={styles.noProducts}>
                      No perfumes in stock yet. Add one first.
                    </Text>
                  ) : (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      contentContainerStyle={styles.pickerRow}
                    >
                      {products.map((p) => {
                        const active = selectedId === p.id;
                        const soldOut = p.quantity === 0;
                        return (
                          <Pressable
                            key={p.id}
                            onPress={() => selectProduct(p)}
                            style={[
                              styles.pick,
                              active && styles.pickActive,
                              soldOut && { opacity: 0.45 },
                            ]}
                          >
                            <View style={styles.pickTop}>
                              <View
                                style={[
                                  styles.pickIcon,
                                  active && { backgroundColor: Colors.card },
                                ]}
                              >
                                <Ionicons
                                  name="flask-outline"
                                  size={16}
                                  color={Colors.gold}
                                />
                              </View>
                              {active && (
                                <Ionicons
                                  name="checkmark-circle"
                                  size={20}
                                  color={Colors.goldDark}
                                />
                              )}
                            </View>
                            <Text style={styles.pickName} numberOfLines={1}>
                              {p.name}
                            </Text>
                            <Text style={styles.pickPrice}>₱{p.price}</Text>
                            <Text
                              style={[
                                styles.pickStock,
                                p.quantity > 0 &&
                                  p.quantity < 5 && {
                                    color: Colors.orange,
                                  },
                                soldOut && { color: Colors.red },
                              ]}
                            >
                              {soldOut ? "Sold out" : `${p.quantity} left`}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  )}

                  <View style={{ paddingHorizontal: 18 }}>
                    <Text style={[styles.label, { marginTop: 18 }]}>
                      QUANTITY SOLD
                    </Text>
                    <View style={styles.stepper}>
                      <Pressable
                        style={styles.stepBtn}
                        onPress={() => adjustQty(-1)}
                      >
                        <Ionicons
                          name="remove"
                          size={20}
                          color={Colors.brown}
                        />
                      </Pressable>
                      <TextInput
                        style={styles.stepInput}
                        value={qty}
                        onChangeText={setQty}
                        placeholder="0"
                        placeholderTextColor="#B5B0A6"
                        keyboardType="numeric"
                        selectionColor={Colors.gold}
                        textAlign="center"
                      />
                      <Pressable
                        style={styles.stepBtn}
                        onPress={() => adjustQty(1)}
                      >
                        <Ionicons name="add" size={20} color={Colors.brown} />
                      </Pressable>
                    </View>

                    <View style={styles.totalBox}>
                      <View>
                        <Text style={styles.totalLabel}>Order total</Text>
                        <Text style={styles.totalHint} numberOfLines={1}>
                          {selected
                            ? `${qtyNum || 0} × ${selected.name}`
                            : "No perfume selected"}
                        </Text>
                      </View>
                      <Text style={styles.totalAmount}>
                        ₱{orderTotal.toLocaleString()}
                      </Text>
                    </View>

                    <PrimaryButton
                      title="Record Sale"
                      icon="receipt-outline"
                      onPress={handleRecordSale}
                    />
                  </View>
                </Card>

                <SectionTitle
                  title="Sales History"
                  right={sales.length > 0 ? `${sales.length} total` : undefined}
                  style={{ marginTop: 28, marginBottom: 14 }}
                />
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.saleCard}>
              <View style={styles.saleIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={20}
                  color={Colors.gold}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.saleName} numberOfLines={1}>
                  {getProductName(item.product_id)}
                </Text>
                <Text style={styles.saleDetails} numberOfLines={1}>
                  Qty {item.quantity_sold}
                  {item.sold_by ? ` • by ${item.sold_by}` : ""}
                </Text>
                {formatDate(item.sale_date) ? (
                  <Text style={styles.saleDate}>
                    {formatDate(item.sale_date)}
                  </Text>
                ) : null}
              </View>
              <View style={{ alignItems: "flex-end", gap: 8 }}>
                <Text style={styles.saleAmount}>₱{item.total_price}</Text>
                {isOwner && (
                  <Pressable
                    style={styles.trashBtn}
                    hitSlop={8}
                    onPress={() => setDeleteTarget(item.id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={15}
                      color={Colors.red}
                    />
                  </Pressable>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title="No sales yet"
              message="Recorded sales will appear here as a running history."
            />
          }
        />
      </View>

      <AppModal
        visible={errorModal.visible}
        icon="alert-circle-outline"
        iconColor={Colors.red}
        title="Missing Info"
        message={errorModal.message}
        confirmText="OK"
        confirmColor={Colors.primary}
        onConfirm={() => setErrorModal({ visible: false, message: "" })}
      />

      <AppModal
        visible={successModal.visible}
        icon="checkmark-circle-outline"
        iconColor={Colors.green}
        title="Sale Recorded"
        message={successModal.message}
        confirmText="Great!"
        confirmColor={Colors.primary}
        onConfirm={() => setSuccessModal({ visible: false, message: "" })}
      />

      <AppModal
        visible={deleteTarget !== null}
        icon="trash-outline"
        iconColor={Colors.red}
        title="Delete Sale"
        message="Are you sure you want to delete this record?"
        confirmText="Delete"
        confirmColor={Colors.red}
        showCancel
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget !== null) {
            deleteSale(deleteTarget);
            setSales(getSales());
          }
          setDeleteTarget(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 20, paddingTop: 24 },
  label: {
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.brown,
    marginBottom: 10,
  },
  noProducts: {
    paddingHorizontal: 18,
    fontFamily: appFont,
    fontSize: 13,
    color: Colors.textMuted,
  },
  pickerRow: { paddingHorizontal: 18, gap: 10 },
  pick: {
    width: 138,
    padding: 12,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pickActive: { backgroundColor: Colors.goldLight, borderColor: Colors.gold },
  pickTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  pickIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  pickName: {
    fontFamily: appFont,
    fontSize: 14.5,
    fontWeight: "700",
    color: Colors.brown,
  },
  pickPrice: {
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.goldDark,
    marginTop: 3,
  },
  pickStock: {
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "700",
    color: Colors.green,
    marginTop: 4,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.goldLight,
    borderWidth: 1,
    borderColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  stepInput: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    fontFamily: appFont,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.brown,
  },
  totalBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.brown,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  totalLabel: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "400",
    color: "#D9C9AE",
  },
  totalHint: {
    fontFamily: appFont,
    fontSize: 12,
    color: "#B9A98F",
    marginTop: 3,
    maxWidth: 170,
  },
  totalAmount: {
    fontFamily: appFont,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.gold,
  },
  saleCard: {
    ...Shadow.soft,
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  saleName: {
    fontFamily: appFont,
    fontSize: 15.5,
    fontWeight: "700",
    color: Colors.brown,
  },
  saleDetails: {
    fontFamily: appFont,
    fontSize: 12.5,
    color: Colors.textMuted,
    marginTop: 2,
  },
  saleDate: {
    fontFamily: appFont,
    fontSize: 11,
    color: Colors.goldDark,
    marginTop: 3,
    fontWeight: "600",
  },
  saleAmount: {
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.goldDark,
  },
  trashBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.redLight,
    alignItems: "center",
    justifyContent: "center",
  },
});
