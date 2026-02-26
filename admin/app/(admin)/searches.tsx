import { Column, DataTable } from "@/components/DataTable";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatCard } from "@/components/StatCard";
import { Colors, Spacing } from "@/constants/theme";
import { SearchLog, searchesApi } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

const COLUMNS: Column<SearchLog>[] = [
  {
    key: "userEmail",
    label: "User",
    flex: 1.5,
    render: (item) => (
      <View>
        <Text style={{ fontWeight: "600", color: Colors.textPrimary, marginBottom: 2 }}>
          {item.userName || "Unknown User"}
        </Text>
        <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
          {item.userEmail}
        </Text>
      </View>
    ),
  },
  {
    key: "city",
    label: "City",
    flex: 1.5,
    render: (item) => (
      <View style={styles.queryBadge}>
        <Text style={styles.queryText} numberOfLines={2}>
          {item.city}
        </Text>
      </View>
    ),
  },
  {
    key: "timestamp",
    label: "Date / Time",
    flex: 1.2,
    render: (item) => (
      <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
        {formatDate(item.timestamp)}
      </Text>
    ),
  },
];

export default function SearchesScreen() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-searches"],
    queryFn: async () => {
      const res = await searchesApi.getAll();
      return res.data.data.searches || [];
    },
    refetchOnWindowFocus: true,
  });

  // Most searched city
  const topCity = (() => {
    if (!data || data.length === 0) return "—";
    const freq: Record<string, number> = {};
    data.forEach((s) => {
      if (s.city) {
        freq[s.city] = (freq[s.city] ?? 0) + 1;
      }
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  })();

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Search Logs"
        subtitle={data ? `${data.length} total searches` : "Loading..."}
      />

      <View style={styles.stats}>
        <StatCard
          icon="🔍"
          label="Total Searches"
          value={data?.length ?? "—"}
          color={Colors.primary}
        />
        <StatCard
          icon="🏙️"
          label="Unique Cities"
          value={data ? new Set(data.map((s) => s.city).filter(Boolean)).size : "—"}
          color={Colors.warning}
        />
        <StatCard
          icon="📈"
          label="Top City"
          value={topCity.length > 12 ? topCity.slice(0, 12) + "…" : topCity}
          color={Colors.success}
        />
      </View>

      <DataTable
        columns={COLUMNS}
        data={data}
        isLoading={isLoading}
        isError={isError}
        onRefresh={refetch}
        keyExtractor={(item) => item.id}
        emptyText="No search logs found."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stats: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexWrap: "wrap",
  },
  queryBadge: {
    backgroundColor: Colors.primary + "22",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  queryText: {
    fontSize: 12,
    color: Colors.primaryLight,
  },
});
