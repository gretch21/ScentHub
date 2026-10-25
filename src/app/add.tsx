import { useFocusEffect } from "expo-router";
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
import { addProduct, getShopName } from "../database/db";

export default function Add() {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shopName] = useState(() => getShopName());
  const [errorModal, setErrorModal] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    name: string;
  }>({ visible: false, name: "" });

  useFocusEffect(
    useCallback(() => {
      setName("");
      setBrand("");
      setPrice("");
      setQuantity("");
    }, []),
  );

  const handleSave = () => {
    if (!name || !price || !quantity) {
      setErrorModal(true);
      return;
    }
    addProduct(name, brand, parseFloat(price), parseInt(quantity));
    setSuccessModal({ visible: true, name });
    setName("");
    setBrand("");
    setPrice("");
    setQuantity("");
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
            title="Add a New Scent"
            subtitle="Add an original perfume to your inventory."
            icon="add-circle-outline"
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
                placeholder="e.g. Midnight Rose"
              />
              <Field
                label="Brand"
                icon="ribbon-outline"
                value={brand}
                onChangeText={setBrand}
                placeholder="e.g. Dior, YSL, DXTR"
              />
              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Price (₱)"
                    icon="pricetag-outline"
                    value={price}
                    onChangeText={setPrice}
                    placeholder="450"
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Quantity"
                    icon="cube-outline"
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="20"
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
                title="Save Perfume"
                icon="checkmark-circle-outline"
                onPress={handleSave}
              />
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
        visible={successModal.visible}
        icon="checkmark-circle-outline"
        iconColor={Colors.green}
        title="Saved"
        message={`${successModal.name} was added to inventory.`}
        confirmText="Great!"
        onConfirm={() => setSuccessModal({ visible: false, name: "" })}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { paddingHorizontal: 20, paddingTop: 24 },
  twoCol: { flexDirection: "row", gap: 12 },
});
