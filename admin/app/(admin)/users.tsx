import { Column, DataTable } from "@/components/DataTable";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatCard } from "@/components/StatCard";
import { Colors, Spacing } from "@/constants/theme";
import { AdminUser, usersApi } from "@/lib/services";
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

const COLUMNS: Column<AdminUser>[] = [
  { key: "name", label: "Name", flex: 1.2 },
  { key: "email", label: "Email", flex: 1.5 },
  { key: "city", label: "City", flex: 1 },
  {
    key: "lastLoginAt",
    label: "Last Login",
    flex: 1.3,
    render: (item) => (
      <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
        {formatDate(item.lastLoginAt)}
      </Text>
    ),
  },
];

export default function UsersScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await usersApi.getAll();
      console.log("[Users] API Response:", JSON.stringify(res.data, null, 2));
      return res.data.data.users;
    },
    refetchOnWindowFocus: true,
  });

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Users"
        subtitle={data ? `${data.length} total users` : "Loading..."}
      />

      {/* Stat Cards */}
      <View style={styles.stats}>
        <StatCard
          icon="👥"
          label="Total Users"
          value={data?.length ?? "—"}
          color={Colors.primary}
        />
        <StatCard
          icon="🏙️"
          label="Cities"
          value={
            data ? new Set(data.map((u) => u.city).filter(Boolean)).size : "—"
          }
          color={Colors.secondary}
        />
        <StatCard
          icon="📅"
          label="Active Today"
          value={
            data
              ? data.filter((u) => {
                  const d = new Date(u.lastLoginAt);
                  const today = new Date();
                  return d.toDateString() === today.toDateString();
                }).length
              : "—"
          }
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
        emptyText="No users found."
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
});
