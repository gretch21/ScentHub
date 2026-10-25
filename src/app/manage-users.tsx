import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import AppModal from "../components/AppModal";
import {
  Card,
  EmptyState,
  Field,
  type IconName,
  Pill,
  PrimaryButton,
  ScreenHeader,
  SectionTitle,
  SummaryStrip,
  appFont,
} from "../components/ui";
import { Colors, Shadow } from "../constants/colors";
import { useAuth } from "../context/auth-context";
import {
  addUser,
  countOwners,
  deleteUser,
  getShopName,
  getUsers,
  roleLabel,
  setShopName,
  type User,
  type UserRole,
  usernameExists,
} from "../database/db";

const ROLE_OPTIONS: {
  key: UserRole;
  title: string;
  desc: string;
  icon: IconName;
}[] = [
  {
    key: "staff",
    title: "Staff",
    desc: "Manages stock and records sales",
    icon: "briefcase-outline",
  },
  {
    key: "cashier",
    title: "Cashier",
    desc: "Records sales, views stock",
    icon: "cash-outline",
  },
  {
    key: "owner",
    title: "Owner",
    desc: "Full access, revenue and users",
    icon: "star-outline",
  },
];

function roleStyle(role: UserRole) {
  if (role === "owner") return { bg: Colors.goldLight, color: Colors.goldDark };
  if (role === "cashier")
    return { bg: Colors.orangeLight, color: Colors.orange };
  return { bg: Colors.greenLight, color: Colors.green };
}

function initials(name: string) {
  const parts = (name || "?").trim().split(/\s+/);
  return (parts[0]?.[0] || "?").concat(parts[1]?.[0] || "").toUpperCase();
}

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [shopNameInput, setShopNameInput] = useState(() => getShopName());
  const [shopNameHeader, setShopNameHeader] = useState(() => getShopName());

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("staff");

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });
  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  useFocusEffect(
    useCallback(() => {
      setUsers(getUsers());
    }, []),
  );

  const resetForm = () => {
    setFullName("");
    setUsername("");
    setPassword("");
    setRole("staff");
  };

  const handleAddUser = () => {
    if (!fullName || !username || !password) {
      setErrorModal({
        visible: true,
        message: "Fill in full name, username, and password.",
      });
      return;
    }
    if (usernameExists(username.trim())) {
      setErrorModal({
        visible: true,
        message: "That username is already taken.",
      });
      return;
    }
    addUser(username.trim(), password, fullName.trim(), role);
    setUsers(getUsers());
    setSuccessModal({
      visible: true,
      message: `${fullName} was added as ${roleLabel(role).toLowerCase()}.`,
    });
    resetForm();
  };

  const handleSaveShopName = () => {
    if (!shopNameInput.trim()) {
      setErrorModal({
        visible: true,
        message: "Shop name can't be empty.",
      });
      return;
    }
    setShopName(shopNameInput.trim());
    setShopNameHeader(shopNameInput.trim());
    setSuccessModal({ visible: true, message: "Shop name updated." });
  };

  const requestDelete = (target: User) => {
    if (target.id === currentUser?.id) {
      setErrorModal({
        visible: true,
        message: "You can't remove your own account while logged in.",
      });
      return;
    }
    if (target.role === "owner" && countOwners() <= 1) {
      setErrorModal({
        visible: true,
        message: "You can't remove the last remaining owner account.",
      });
      return;
    }
    setDeleteTarget(target);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteUser(deleteTarget.id);
      setUsers(getUsers());
    }
    setDeleteTarget(null);
  };

  const ownerCount = users.filter((u) => u.role === "owner").length;
  const staffCount = users.filter((u) => u.role === "staff").length;
  const cashierCount = users.filter((u) => u.role === "cashier").length;

  return (
    <>
      <View style={styles.container}>
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          data={users}
          keyExtractor={(item) => item.id.toString()}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View>
              <ScreenHeader
                eyebrow={shopNameHeader}
                title="Manage Users"
                subtitle="Create accounts for your staff and cashiers. Only owners can see this screen."
                icon="people-outline"
              />
              <SummaryStrip
                items={[
                  { value: ownerCount, label: "Owners" },
                  { value: staffCount, label: "Staff" },
                  { value: cashierCount, label: "Cashiers" },
                ]}
              />

              <View style={styles.body}>
                <SectionTitle title="Shop Name" style={{ marginBottom: 14 }} />
                <Card>
                  <Field
                    label="Shop Name"
                    icon="storefront-outline"
                    value={shopNameInput}
                    onChangeText={setShopNameInput}
                    placeholder="e.g. DXTR Parfum"
                    hint="Shown on the login, dashboard and every screen header."
                  />
                  <PrimaryButton
                    title="Save Shop Name"
                    icon="save-outline"
                    onPress={handleSaveShopName}
                  />
                </Card>

                <SectionTitle
                  title="Add a User"
                  style={{ marginTop: 28, marginBottom: 14 }}
                />
                <Card>
                  <Field
                    label="Full Name"
                    icon="person-outline"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="e.g. Maria Santos"
                  />
                  <Field
                    label="Username"
                    icon="at-outline"
                    value={username}
                    onChangeText={setUsername}
                    placeholder="e.g. maria"
                    autoCapitalize="none"
                  />
                  <Field
                    label="Password"
                    icon="lock-closed-outline"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Temporary password"
                    secureTextEntry
                    autoCapitalize="none"
                  />

                  <Text style={styles.roleLabel}>Role</Text>
                  <View style={styles.roleList}>
                    {ROLE_OPTIONS.map((opt) => {
                      const active = role === opt.key;
                      return (
                        <Pressable
                          key={opt.key}
                          onPress={() => setRole(opt.key)}
                          style={[styles.roleCard, active && styles.roleActive]}
                        >
                          <View
                            style={[
                              styles.roleIcon,
                              active && { backgroundColor: Colors.card },
                            ]}
                          >
                            <Ionicons
                              name={opt.icon}
                              size={18}
                              color={active ? Colors.goldDark : Colors.gold}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.roleTitle}>{opt.title}</Text>
                            <Text style={styles.roleDesc}>{opt.desc}</Text>
                          </View>
                          <Ionicons
                            name={
                              active ? "radio-button-on" : "radio-button-off"
                            }
                            size={20}
                            color={active ? Colors.goldDark : Colors.border}
                          />
                        </Pressable>
                      );
                    })}
                  </View>

                  <PrimaryButton
                    title="Add User"
                    icon="person-add-outline"
                    onPress={handleAddUser}
                    style={{ marginTop: 6 }}
                  />
                </Card>

                <SectionTitle
                  title="Current Users"
                  right={users.length > 0 ? `${users.length} total` : undefined}
                  style={{ marginTop: 28, marginBottom: 14 }}
                />
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const rs = roleStyle(item.role);
            return (
              <View style={styles.userCard}>
                <View style={styles.avatarRing}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {initials(item.full_name)}
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {item.full_name}
                    {item.id === currentUser?.id ? " (you)" : ""}
                  </Text>
                  <Text style={styles.userDetails}>@{item.username}</Text>
                  <View style={{ flexDirection: "row", marginTop: 6 }}>
                    <Pill
                      label={roleLabel(item.role)}
                      bg={rs.bg}
                      color={rs.color}
                    />
                  </View>
                </View>
                <Pressable
                  style={styles.trashBtn}
                  hitSlop={8}
                  onPress={() => requestDelete(item)}
                >
                  <Ionicons name="trash-outline" size={17} color={Colors.red} />
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No users yet"
              message="Add your first team member using the form above."
            />
          }
        />
      </View>

      <AppModal
        visible={errorModal.visible}
        icon="alert-circle-outline"
        iconColor={Colors.red}
        title="Can't Do That"
        message={errorModal.message}
        confirmText="OK"
        onConfirm={() => setErrorModal({ visible: false, message: "" })}
      />

      <AppModal
        visible={successModal.visible}
        icon="checkmark-circle-outline"
        iconColor={Colors.green}
        title="Saved"
        message={successModal.message}
        confirmText="Great!"
        onConfirm={() => setSuccessModal({ visible: false, message: "" })}
      />

      <AppModal
        visible={deleteTarget !== null}
        icon="trash-outline"
        iconColor={Colors.red}
        title="Remove User"
        message={
          deleteTarget
            ? `Remove ${deleteTarget.full_name}'s account? They won't be able to log in anymore.`
            : ""
        }
        confirmText="Remove"
        confirmColor={Colors.red}
        showCancel
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 20, paddingTop: 24 },
  roleLabel: {
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.brown,
    marginBottom: 8,
  },
  roleList: { gap: 8, marginBottom: 16 },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  roleActive: { backgroundColor: Colors.goldLight, borderColor: Colors.gold },
  roleIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.goldLight,
    alignItems: "center",
    justifyContent: "center",
  },
  roleTitle: {
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.brown,
  },
  roleDesc: {
    fontFamily: appFont,
    fontSize: 11.5,
    color: Colors.textMuted,
    marginTop: 1,
  },
  userCard: {
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
  avatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brown,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gold,
  },
  userName: {
    fontFamily: appFont,
    fontSize: 15.5,
    fontWeight: "700",
    color: Colors.brown,
  },
  userDetails: {
    fontFamily: appFont,
    fontSize: 12.5,
    color: Colors.textMuted,
    marginTop: 2,
  },
  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.redLight,
    alignItems: "center",
    justifyContent: "center",
  },
});
