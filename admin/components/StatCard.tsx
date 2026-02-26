import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { Platform, StyleSheet, Text, View } from "react-native";

interface Props {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}

export function StatCard({
  icon,
  label,
  value,
  color = Colors.primary,
}: Props) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 3,
    minWidth: 120,
    gap: 4,
    ...Platform.select({
      web: { boxShadow: "0 2px 12px rgba(0,0,0,0.15)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  value: {
    ...Typography.h2,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});
