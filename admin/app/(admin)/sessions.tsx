import { Column, DataTable } from "@/components/DataTable";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatCard } from "@/components/StatCard";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { Session, sessionsApi } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
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

function formatDuration(seconds: number | null) {
  if (seconds == null) return "Active";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

const COLUMNS: Column<Session>[] = [
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
    key: "loginTime",
    label: "Login Time",
    flex: 1.2,
    render: (item) => (
      <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
        {formatDate(item.loginTime)}
      </Text>
    ),
  },
  {
    key: "logoutTime",
    label: "Logout Time",
    flex: 1.2,
    render: (item) => (
      <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
        {formatDate(item.logoutTime)}
      </Text>
    ),
  },
  {
    key: "duration",
    label: "Duration",
    flex: 0.8,
    render: (item) => {
      const isActive = item.logoutTime === null;
      return (
        <View
          style={[
            styles.durationBadge,
            isActive ? styles.durationActive : styles.durationDone,
          ]}
        >
          <Text
            style={[
              styles.durationText,
              isActive ? styles.durationTextActive : styles.durationTextDone,
            ]}
          >
            {isActive ? "● Active" : formatDuration(item.duration)}
          </Text>
        </View>
      );
    },
  },
];

export default function SessionsScreen() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-sessions"],
    queryFn: async () => {
      const res = await sessionsApi.getAll();
      return res.data.data.sessions || [];
    },
    refetchOnWindowFocus: true,
  });

  const activeSessions = data?.filter((s) => s.logoutTime === null).length ?? 0;
  const avgDuration = (() => {
    if (!data) return "—";
    const durations = data
      .filter((s) => s.duration != null)
      .map((s) => s.duration!);
    if (durations.length === 0) return "—";
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    return formatDuration(Math.round(avg));
  })();

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Sessions"
        subtitle={data ? `${data.length} total sessions` : "Loading..."}
      />

      <View style={styles.stats}>
        <StatCard
          icon="🕐"
          label="Total Sessions"
          value={data?.length ?? "—"}
          color={Colors.primary}
        />
        <StatCard
          icon="🟢"
          label="Active Now"
          value={activeSessions}
          color={Colors.success}
        />
        <StatCard
          icon="⏱️"
          label="Avg Duration"
          value={avgDuration}
          color={Colors.secondary}
        />
      </View>

      <DataTable
        columns={COLUMNS}
        data={data}
        isLoading={isLoading}
        isError={isError}
        onRefresh={refetch}
        keyExtractor={(item) => item.id}
        emptyText="No sessions found."
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
  durationBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  durationActive: {
    backgroundColor: Colors.success + "22",
  },
  durationDone: {
    backgroundColor: Colors.surfaceElevated,
  },
  durationText: {
    fontSize: 11,
    fontWeight: "600",
  },
  durationTextActive: {
    color: Colors.success,
  },
  durationTextDone: {
    color: Colors.textMuted,
  },
});
