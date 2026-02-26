import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState("");

  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    try {
      await login(email.trim(), password);
      console.log("[Login] ✅ login() succeeded, navigating to users...");
      router.replace("/(admin)/users");
    } catch (err: any) {
      console.log("[Login] ❌ login() failed:", err?.response?.status, err?.message);
      const msg =
        err?.response?.data?.message ??
        "Invalid credentials. Please try again.";
      setError(msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        {/* Logo / Brand */}
        <View style={styles.brand}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.appName}>City News</Text>
          <Text style={styles.adminBadge}>Admin Portal</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your admin account</Text>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View
              style={[
                styles.inputWrapper,
                emailFocused && styles.inputWrapperFocused,
              ]}
            >
              <Text
                style={[
                  styles.inputIcon,
                  emailFocused && styles.inputIconFocused,
                ]}
              >
                ✉
              </Text>
              <TextInput
                style={styles.input}
                placeholder="admin@example.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                passwordFocused && styles.inputWrapperFocused,
              ]}
            >
              <Text
                style={[
                  styles.inputIcon,
                  passwordFocused && styles.inputIconFocused,
                ]}
              >
                🔒
              </Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.loginBtnText}>Sign In →</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>City News Admin © 2026</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  brand: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
    ...Platform.select({
      web: { boxShadow: `0 8px 24px ${Colors.primary}88` },
      default: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
      },
    }),
  },
  logoText: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.white,
  },
  appName: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  adminBadge: {
    ...Typography.bodySmall,
    color: Colors.primaryLight,
    backgroundColor: Colors.primary + "22",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginTop: 4,
    overflow: "hidden",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      web: { boxShadow: "0 16px 48px rgba(0,0,0,0.4)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.3,
        shadowRadius: 32,
        elevation: 12,
      },
    }),
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  errorBox: {
    backgroundColor: Colors.danger + "22",
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.danger,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 50,
    gap: Spacing.sm,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  inputIcon: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  inputIconFocused: {
    color: Colors.primary,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    height: "100%",
    outlineStyle: "none",
  } as any,
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.sm,
    ...Platform.select({
      web: { boxShadow: `0 4px 20px ${Colors.primary}66` },
      default: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    ...Typography.h4,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  footer: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.xl,
  },
});
