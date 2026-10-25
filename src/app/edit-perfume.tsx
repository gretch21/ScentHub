import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AppModal from "../components/AppModal";
import {
  Card,
  Field,
  PerfumePreview,
  PrimaryButton,
  ScreenHeader,
  SectionTitle,
} from "../components/ui";
import { Colors } from "../constants/colors";
import { useAuth } from "../context/auth-context";
import {
  deleteProduct,
  getProducts,
  getShopName,
  updateProduct,
} from "../database/db";

export default function EditPerfume() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shopName] = useState(() => getShopName());

  const [errorModal, setErrorModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const products = getProducts();
      const product = products.find((p: any) => p.id === Number(id));
      if (product) {
        setName(product.name);
        setBrand(product.brand);
        setPrice(product.price.toString());
        setQuantity(product.quantity.toString());
      }
    }, [id]),
  );

  const handleUpdate = () => {
    if (!name || !price || !quantity) {
      setErrorModal(true);
      return;
    }
    updateProduct(
      Number(id),
      name,
      brand,
      parseFloat(price),
      parseInt(quantity),
    );
    setSuccessModal(true);
  };

  const handleDelete = () => {
    deleteProduct(Number(id));
    setDeleteModal(false);
    router.push("/inventory");
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenHeader
            eyebrow={shopName}
            title="Edit Perfume"
            subtitle="Update the details or restock this scent."
            icon="create-outline"
            onBack={() => router.push("/inventory")}
          />

          <View style={styles.body}>
            <SectionTitle
              title="Perfume Details"
              style={{ marginBottom: 14 }}
            />
            <Card>
              <Field
                label="Name"
                icon="flask-outline"
                value={name}
                onChangeText={setName}
              />
              <Field
                label="Brand"
                icon="ribbon-outline"
                value={brand}
                onChangeText={setBrand}
              />
              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Price (₱)"
                    icon="pricetag-outline"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Quantity"
                    icon="cube-outline"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <PerfumePreview
                name={name}
                brand={brand}
                price={price}
                quantity={quantity}
              />

              <PrimaryButton
                title="Update Perfume"
                icon="save-outline"
                onPress={handleUpdate}
              />

              {user?.role === "owner" && (
                <PrimaryButton
                  title="Delete Perfume"
                  icon="trash-outline"
                  variant="danger"
                  style={{ marginTop: 12 }}
                  onPress={() => setDeleteModal(true)}
                />
              )}
            </Card>
          </View>
        </ScrollView>
      </View>

      <AppModal
        visible={errorModal}
        icon="alert-circle-outline"
        iconColor={Colors.red}
        title="Missing Info"
        message="Please fill in at least Name, Price, and Quantity."
        confirmText="OK"
        onConfirm={() => setErrorModal(false)}
      />

      <AppModal
        visible={successModal}
        icon="checkmark-circle-outline"
        iconColor={Colors.green}
        title="Updated"
        message={`${name} was updated successfully.`}
        confirmText="Great!"
        onConfirm={() => {
          setSuccessModal(false);
          router.push("/inventory");
        }}
      />

      <AppModal
        visible={deleteModal}
        icon="trash-outline"
        iconColor={Colors.red}
        title="Delete Perfume"
        message={`Remove ${name} from inventory? This can't be undone.`}
        confirmText="Delete"
        confirmColor={Colors.red}
        showCancel
        onCancel={() => setDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 20, paddingTop: 24 },
  twoCol: { flexDirection: "row", gap: 12 },
});
