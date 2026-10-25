import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Shadow } from "../constants/colors";

export type IconName = keyof typeof Ionicons.glyphMap;

// Single app-wide typeface: Arial everywhere. (Android maps "Arial" to its
// built-in sans-serif; iOS and web use real Arial.)
export const appFont = Platform.select({
  ios: "Arial",
  android: "Arial",
  default: "Arial, Helvetica, sans-serif",
}) as string;

/* ------------------------------------------------------------------ */
/* ScreenHeader — cream hero band with title and icon badge            */
/* ------------------------------------------------------------------ */
export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  onBack,
  topRight,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon: IconName;
  onBack?: () => void;
  topRight?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[hs.wrap, { paddingTop: insets.top + 16 }]}>
      {(onBack || topRight) && (
        <View style={hs.topRow}>
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={12} style={hs.back}>
              <Ionicons name="chevron-back" size={18} color={Colors.brown} />
              <Text style={hs.backText}>Back</Text>
            </Pressable>
          ) : (
            <View />
          )}
          {topRight}
        </View>
      )}

      <View style={hs.row}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={hs.eyebrow}>{eyebrow}</Text>
          <Text style={hs.title}>{title}</Text>
          {subtitle ? <Text style={hs.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={hs.badge}>
          <Ionicons name={icon} size={24} color={Colors.gold} />
        </View>
      </View>
    </View>
  );
}

const hs = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.goldLight,
    paddingHorizontal: 22,
    paddingBottom: 38,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingRight: 8,
  },
  backText: {
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.brown,
  },
  row: { flexDirection: "row", alignItems: "center" },
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
  subtitle: {
    fontFamily: appFont,
    fontSize: 13,
    color: "#7A6A58",
    marginTop: 8,
    lineHeight: 18,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.soft,
  },
});

/* ------------------------------------------------------------------ */
/* SummaryStrip — dark brown stat bar that overlaps the header         */
/* ------------------------------------------------------------------ */
export function SummaryStrip({
  items,
}: {
  items: { value: string | number; label: string; warn?: boolean }[];
}) {
  return (
    <View style={ss.wrap}>
      {items.map((it, i) => (
        <View key={it.label} style={[ss.item, i > 0 && ss.divider]}>
          <Text
            style={[ss.value, it.warn && { color: "#F0A79D" }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {it.value}
          </Text>
          <Text style={ss.label}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

const ss = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: Colors.brown,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: -22,
    paddingVertical: 18,
    ...Shadow.strong,
  },
  item: { flex: 1, alignItems: "center", paddingHorizontal: 6 },
  divider: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(198,161,91,0.35)",
  },
  value: {
    fontFamily: appFont,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.gold,
    maxWidth: "100%",
  },
  label: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "400",
    color: "#D9C9AE",
    marginTop: 4,
  },
});

/* ------------------------------------------------------------------ */
/* SectionTitle — plain section heading                                */
/* ------------------------------------------------------------------ */
export function SectionTitle({
  title,
  right,
  style,
}: {
  title: string;
  right?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[st.row, style]}>
      <Text style={st.title}>{title}</Text>
      {right ? <Text style={st.right}>{right}</Text> : null}
    </View>
  );
}

const st = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.brown,
  },
  right: {
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.goldDark,
  },
});

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[cs.card, style]}>{children}</View>;
}

const cs = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.soft,
  },
});

/* ------------------------------------------------------------------ */
/* Field — labelled input with icon and gold focus ring                */
/* ------------------------------------------------------------------ */
export function Field({
  label,
  icon,
  hint,
  onFocus,
  onBlur,
  ...props
}: TextInputProps & { label: string; icon: IconName; hint?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={fs.label}>{label}</Text>
      <View style={[fs.box, focused && fs.boxFocused]}>
        <View
          style={[
            fs.iconWrap,
            focused && { backgroundColor: Colors.goldLight },
          ]}
        >
          <Ionicons
            name={icon}
            size={16}
            color={focused ? Colors.goldDark : Colors.textMuted}
          />
        </View>
        <TextInput
          {...props}
          style={fs.input}
          placeholderTextColor="#B5B0A6"
          selectionColor={Colors.gold}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
      </View>
      {hint ? <Text style={fs.hint}>{hint}</Text> : null}
    </View>
  );
}

const fs = StyleSheet.create({
  label: {
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.brown,
    marginBottom: 6,
  },
  box: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    gap: 6,
  },
  boxFocused: {
    borderColor: Colors.gold,
    backgroundColor: Colors.card,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontFamily: appFont,
    fontSize: 15,
    color: Colors.textDark,
  },
  hint: {
    fontFamily: appFont,
    fontSize: 11.5,
    color: Colors.textMuted,
    marginTop: 5,
  },
});

/* ------------------------------------------------------------------ */
/* PrimaryButton                                                       */
/* ------------------------------------------------------------------ */
export function PrimaryButton({
  title,
  icon,
  onPress,
  variant = "dark",
  style,
}: {
  title: string;
  icon?: IconName;
  onPress: () => void;
  variant?: "dark" | "danger" | "outline";
  style?: StyleProp<ViewStyle>;
}) {
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        bs.btn,
        isDanger && bs.danger,
        isOutline && bs.outline,
        pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={isOutline ? Colors.brown : isDanger ? "#fff" : Colors.gold}
        />
      ) : null}
      <Text style={[bs.text, isOutline && { color: Colors.brown }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const bs = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    ...Shadow.soft,
  },
  danger: { backgroundColor: Colors.red },
  outline: {
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: "#fff",
    fontWeight: "800",
    fontFamily: appFont,
    fontSize: 15,
  },
});

/* ------------------------------------------------------------------ */
/* Pill                                                                */
/* ------------------------------------------------------------------ */
export function Pill({
  label,
  bg,
  color,
}: {
  label: string;
  bg: string;
  color: string;
}) {
  return (
    <View style={[ps.pill, { backgroundColor: bg }]}>
      <Text style={[ps.text, { color }]}>{label}</Text>
    </View>
  );
}

const ps = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  text: {
    fontFamily: appFont,
    fontSize: 10.5,
    fontWeight: "800",
  },
});

/* ------------------------------------------------------------------ */
/* EmptyState                                                          */
/* ------------------------------------------------------------------ */
export function EmptyState({
  icon,
  title,
  message,
}: {
  icon: IconName;
  title: string;
  message: string;
}) {
  return (
    <View style={es.wrap}>
      <View style={es.circle}>
        <Ionicons name={icon} size={28} color={Colors.gold} />
      </View>
      <Text style={es.title}>{title}</Text>
      <Text style={es.message}>{message}</Text>
    </View>
  );
}

const es = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 36, paddingHorizontal: 30 },
  circle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.goldLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.brown,
  },
  message: {
    fontFamily: appFont,
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 19,
  },
});

/* ------------------------------------------------------------------ */
/* PerfumePreview — live preview shown while typing a perfume          */
/* ------------------------------------------------------------------ */
export function PerfumePreview({
  name,
  brand,
  price,
  quantity,
}: {
  name: string;
  brand: string;
  price: string;
  quantity: string;
}) {
  return (
    <View style={pv.wrap}>
      <Text style={pv.tag}>Preview</Text>
      <View style={pv.row}>
        <View style={pv.icon}>
          <Ionicons name="flask-outline" size={20} color={Colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={pv.name} numberOfLines={1}>
            {name.trim() || "Perfume name"}
          </Text>
          <Text style={pv.brand} numberOfLines={1}>
            {brand.trim() || "Brand"}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={pv.price}>₱{price.trim() || "0"}</Text>
          <Text style={pv.qty}>{quantity.trim() || "0"} in stock</Text>
        </View>
      </View>
    </View>
  );
}

const pv = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.goldLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 18,
  },
  tag: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    color: Colors.goldDark,
    marginBottom: 10,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.brown,
  },
  brand: {
    fontFamily: appFont,
    fontSize: 10.5,
    fontWeight: "700",
    color: Colors.textMuted,
    marginTop: 2,
  },
  price: {
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.goldDark,
  },
  qty: {
    fontFamily: appFont,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
