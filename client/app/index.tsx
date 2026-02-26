import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function IndexScreen() {
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/auth");
    }
  }, [token, isLoading]);

  // Show a splash-like loader while SecureStore loads the saved token
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    justifyContent: "center",
    alignItems: "center",
  },
});
