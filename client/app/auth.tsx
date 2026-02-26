import { loginUser, registerUser } from "@/application/usecases/authUsecases";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Mode = "login" | "register";

export default function AuthScreen() {
  const { saveSession } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation", "Email and password are required.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      Alert.alert("Validation", "Name is required to register.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        console.log("going to call register user call");
        const result = await registerUser({ name, email, password });
        console.log("Register response:", result);
        Alert.alert("Registration Successful", "Login to continue");
        // Switch to login mode and clear fields
        setMode("login");
        setName("");
        setEmail("");
        setPassword("");
      } else {
        const response = await loginUser({ email, password });
        await saveSession(response.token, response.sessionId);
        router.replace("/dashboard");
      }
    } catch (err: any) {
      console.log("Error in auth = ", err);
      const message =
        err?.response?.data?.message ?? "Something went wrong. Try again.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>📰</Text>
          </View>
          <Text style={styles.appName}>CityNews</Text>
          <Text style={styles.tagline}>Your city. Your stories.</Text>
        </View>

        {/* ─── Card ─── */}
        <View style={styles.card}>
          {/* ─── Tab Toggle ─── */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, mode === "login" && styles.tabActive]}
              onPress={() => setMode("login")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "login" && styles.tabTextActive,
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === "register" && styles.tabActive]}
              onPress={() => setMode("register")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "register" && styles.tabTextActive,
                ]}
              >
                Register
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.formTitle}>
            {mode === "login" ? "Welcome back 👋" : "Create account 🚀"}
          </Text>

          {/* ─── Name (register only) ─── */}
          {mode === "register" && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={inputStyle("name")}
                placeholder="John Doe"
                placeholderTextColor="#8a92a6"
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="words"
              />
            </View>
          )}

          {/* ─── Email ─── */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={inputStyle("email")}
              placeholder="you@email.com"
              placeholderTextColor="#8a92a6"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* ─── Password ─── */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={inputStyle("password")}
              placeholder="••••••••"
              placeholderTextColor="#8a92a6"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              secureTextEntry
            />
          </View>

          {/* ─── Submit ─── */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === "login" ? "Sign In" : "Create Account"}
              </Text>
            )}
          </TouchableOpacity>

          {/* ─── Toggle link ─── */}
          <TouchableOpacity onPress={toggleMode} style={styles.switchRow}>
            <Text style={styles.switchText}>
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <Text style={styles.switchLink}>
                {mode === "login" ? "Register" : "Login"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  // ── Header ──
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#1a2235",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2563eb30",
  },
  logoEmoji: {
    fontSize: 34,
  },
  appName: {
    fontSize: 30,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: "#8a92a6",
    marginTop: 4,
  },
  // ── Card ──
  card: {
    backgroundColor: "#161b27",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  // ── Tab Toggle ──
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#0d1117",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#2563eb",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8a92a6",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  // ── Form ──
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8a92a6",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#ffffff",
  },
  inputFocused: {
    borderColor: "#2563eb",
  },
  // ── Button ──
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  // ── Switch ──
  switchRow: {
    alignItems: "center",
    marginTop: 20,
  },
  switchText: {
    fontSize: 14,
    color: "#8a92a6",
  },
  switchLink: {
    color: "#2563eb",
    fontWeight: "700",
  },
});
