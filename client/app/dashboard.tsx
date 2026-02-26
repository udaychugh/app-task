import {
  NewsArticle,
  fetchCityNews,
  logoutUser,
} from "@/application/usecases/newsUsecases";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DashboardScreen() {
  const { clearSession, sessionId } = useAuth();

  const [city, setCity] = useState("");
  const [activeCity, setActiveCity] = useState("");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searched, setSearched] = useState(false);

  // Restore last searched city
  useEffect(() => {
    const restoreCity = async () => {
      const saved = await SecureStore.getItemAsync("userCity");
      if (saved) {
        setCity(saved);
      }
    };
    restoreCity();
  }, []);

  const searchNews = useCallback(
    async (targetCity: string, silent = false) => {
      if (!targetCity.trim()) {
        Alert.alert("Enter City", "Please enter a city name to search news.");
        return;
      }
      if (!silent) setLoading(true);
      setSearched(true);
      try {
        await SecureStore.setItemAsync("userCity", targetCity.trim());
        setActiveCity(targetCity.trim());
        const data = await fetchCityNews(targetCity.trim(), sessionId!);
        setArticles(data.news.articles ?? []);
      } catch (err: any) {
        console.log("Error in dashboard = ", err);
        const message =
          err?.response?.data?.message ?? "Failed to load news. Try again.";
        Alert.alert("Error", message);
        setArticles([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [sessionId],
  );

  const onRefresh = () => {
    if (!activeCity) return;
    setRefreshing(true);
    searchNews(activeCity, true);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logoutUser(sessionId!);
          } catch(err) {
            console.log("Error during logout API call:", err);
          }
          await clearSession();
          router.replace("/auth");
        },
      },
    ]);
  };

  const openArticle = (url: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open the article."),
    );
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const renderArticle = ({
    item,
    index,
  }: {
    item: NewsArticle;
    index: number;
  }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => openArticle(item.url)}
      activeOpacity={0.75}
    >
      <View style={styles.articleIndex}>
        <Text style={styles.articleIndexText}>{index + 1}</Text>
      </View>
      <View style={styles.articleBody}>
        <Text style={styles.articleTitle} numberOfLines={3}>
          {item.title}
        </Text>
        {item.snippet ? (
          <Text style={styles.articleDesc} numberOfLines={2}>
            {item.snippet}
          </Text>
        ) : null}
        <View style={styles.articleMeta}>
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceText}>{item.source}</Text>
          </View>
          <Text style={styles.dateText}>{item.publishedAt}</Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  const ListHeader = (
    <View>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>CityNews 📰</Text>
          <Text style={styles.subGreeting}>
            {activeCity
              ? `Showing news for ${activeCity}`
              : "Search news by city"}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <Text style={styles.searchLabel}>🏙️ City</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.cityInput}
            placeholder="Mumbai, Delhi, Chennai…"
            placeholderTextColor="#8a92a6"
            value={city}
            onChangeText={setCity}
            onSubmitEditing={() => searchNews(city)}
            returnKeyType="search"
            autoCapitalize="words"
          />
          <TouchableOpacity
            style={[styles.searchBtn, loading && styles.searchBtnDisabled]}
            onPress={() => searchNews(city)}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.searchBtnText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Results heading */}
      {searched && !loading && (
        <Text style={styles.resultsHeading}>
          {articles.length > 0
            ? `${articles.length} articles found`
            : "No articles found"}
        </Text>
      )}
    </View>
  );

  const EmptyComponent = () => {
    if (loading) return null;
    if (!searched) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🌆</Text>
          <Text style={styles.emptyTitle}>Search your city</Text>
          <Text style={styles.emptySubtitle}>
            Type a city name above and tap Search to get the latest news.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>😔</Text>
        <Text style={styles.emptyTitle}>No news found</Text>
        <Text style={styles.emptySubtitle}>
          Try a different city name or check your connection.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderArticle}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563eb"
            colors={["#2563eb"]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
      {loading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Fetching latest news…</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  listContent: {
    paddingBottom: 32,
    paddingTop: Platform.OS === "ios" ? 56 : 36,
  },
  // ── Top Bar ──
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
  },
  subGreeting: {
    fontSize: 13,
    color: "#8a92a6",
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#2d3748",
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
  },
  // ── Search ──
  searchSection: {
    backgroundColor: "#161b27",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  searchLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8a92a6",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
  },
  cityInput: {
    flex: 1,
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: "#ffffff",
  },
  searchBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  searchBtnDisabled: {
    opacity: 0.6,
  },
  searchBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  // ── Results ──
  resultsHeading: {
    fontSize: 13,
    color: "#8a92a6",
    marginHorizontal: 20,
    marginBottom: 12,
    fontWeight: "600",
  },
  // ── Article Card ──
  articleCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#161b27",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 12,
  },
  articleIndex: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#2563eb20",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  articleIndexText: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "700",
  },
  articleBody: {
    flex: 1,
    gap: 6,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#e2e8f0",
    lineHeight: 22,
  },
  articleDesc: {
    fontSize: 13,
    color: "#8a92a6",
    lineHeight: 19,
  },
  articleMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },
  sourceBadge: {
    backgroundColor: "#2563eb15",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#2563eb30",
  },
  sourceText: {
    fontSize: 11,
    color: "#60a5fa",
    fontWeight: "600",
  },
  dateText: {
    fontSize: 11,
    color: "#4b5563",
    fontWeight: "500",
  },
  chevron: {
    color: "#4b5563",
    fontSize: 22,
    lineHeight: 28,
    flexShrink: 0,
  },
  // ── Empty State ──
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8a92a6",
    textAlign: "center",
    lineHeight: 22,
  },
  // ── Loading Overlay ──
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0d111799",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    backgroundColor: "#161b27",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  loadingText: {
    color: "#8a92a6",
    fontSize: 14,
    fontWeight: "600",
  },
});
