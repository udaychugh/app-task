import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuthStore } from "@/store/authStore";
import { Slot, usePathname, useRouter } from "expo-router";
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const NAV_ITEMS = [
  { label: "Users", icon: "👥", route: "/(admin)/users" },
  { label: "Search Logs", icon: "🔍", route: "/(admin)/searches" },
  { label: "Sessions", icon: "🕐", route: "/(admin)/sessions" },
];

function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <View style={styles.sidebar}>
      {/* Logo */}
      <View style={styles.sidebarLogo}>
        <View style={styles.logoMark}>
          <Text style={styles.logoMarkText}>CN</Text>
        </View>
        <View>
          <Text style={styles.sidebarTitle}>City News</Text>
          <Text style={styles.sidebarSubtitle}>Admin Dashboard</Text>
        </View>
      </View>

      {/* Admin Info Chip */}
      {admin && (
        <View style={styles.adminChip}>
          <View style={styles.adminAvatar}>
            <Text style={styles.adminAvatarText}>
              {admin.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminName} numberOfLines={1}>
              {admin.name}
            </Text>
            <Text style={styles.adminEmail} numberOfLines={1}>
              {admin.email}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.navSection}>NAVIGATION</Text>

      {/* Nav Items */}
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.route.replace("(admin)/", "");
        return (
          <TouchableOpacity
            key={item.route}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
            {isActive && <View style={styles.navActiveDot} />}
          </TouchableOpacity>
        );
      })}

      <View style={{ flex: 1 }} />

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutLabel}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function BottomTabNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View style={styles.bottomTab}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.includes(item.route.replace("/(admin)/", ""));
        return (
          <TouchableOpacity
            key={item.route}
            style={styles.tabItem}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
              {item.icon}
            </Text>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {item.label}
            </Text>
            {isActive && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AdminLayout() {
  useAuthGuard();
  const isWeb = Platform.OS === "web";

  if (isWeb) {
    return (
      <View style={styles.webRoot}>
        <SidebarNav />
        <View style={styles.webContent}>
          <Slot />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mobileRoot}>
      <View style={styles.mobileContent}>
        <Slot />
      </View>
      <BottomTabNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Web layout
  webRoot: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Colors.background,
  },
  webContent: {
    flex: 1,
    overflow: "hidden" as any,
  },
  // Sidebar
  sidebar: {
    width: 240,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  sidebarLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logoMarkText: {
    ...Typography.h4,
    color: Colors.white,
  },
  sidebarTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  sidebarSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  adminChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  adminAvatar: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  adminAvatarText: {
    ...Typography.label,
    color: Colors.white,
  },
  adminName: {
    ...Typography.label,
    color: Colors.textPrimary,
  },
  adminEmail: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  navSection: {
    ...Typography.caption,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: 4,
    position: "relative",
  },
  navItemActive: {
    backgroundColor: Colors.primary + "22",
  },
  navIcon: {
    fontSize: 18,
  },
  navLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
  },
  navLabelActive: {
    color: Colors.primaryLight,
    fontWeight: "600",
  },
  navActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutIcon: {
    fontSize: 16,
  },
  logoutLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  // Mobile layout
  mobileRoot: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mobileContent: {
    flex: 1,
  },
  // Bottom tabs
  bottomTab: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingTop: Spacing.sm,
    paddingBottom: 4,
    position: "relative",
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.primaryLight,
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    top: 0,
    left: "30%" as any,
    right: "30%" as any,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
});
