import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  flex?: number;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRefresh?: () => void;
  keyExtractor: (item: T, index: number) => string;
  emptyText?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  isError,
  onRefresh,
  keyExtractor,
  emptyText = "No records found.",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Failed to load</Text>
        <Text style={styles.errorSubtitle}>
          Check your connection and try again
        </Text>
        {onRefresh && (
          <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Table Header */}
      <View style={styles.tableHeader}>
        {columns.map((col) => (
          <Text
            key={String(col.key)}
            style={[styles.headerCell, { flex: col.flex ?? 1 }]}
          >
            {col.label.toUpperCase()}
          </Text>
        ))}
      </View>

      {/* Table Rows */}
      {data.map((item, index) => (
        <View
          key={keyExtractor(item, index)}
          style={[styles.row, index % 2 === 1 && styles.rowAlt]}
        >
          {columns.map((col) => (
            <View
              key={String(col.key)}
              style={[styles.cell, { flex: col.flex ?? 1 }]}
            >
              {col.render ? (
                col.render(item)
              ) : (
                <Text style={styles.cellText} numberOfLines={2}>
                  {String((item as any)[col.key] ?? "—")}
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  errorEmoji: { fontSize: 40 },
  errorTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  errorSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  retryBtnText: {
    ...Typography.label,
    color: Colors.white,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  headerCell: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: "row",
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + "66",
  },
  rowAlt: {
    backgroundColor: Colors.surface + "55",
  },
  cell: {
    paddingRight: Spacing.xs,
  },
  cellText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
});
