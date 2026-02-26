import apiClient from "../api/axiosInstance";

export interface NewsArticle {
  title: string;
  snippet: string | null;
  source: string;
  publishedAt: string;
  url: string;
  thumbnail: string | null;
}

export interface NewsData {
  news: {
    query: string;
    city: string;
    articles: NewsArticle[];
    totalResults: number;
  };
}

interface ApiNewsResponse {
  success: boolean;
  message: string;
  data: NewsData;
}

export const fetchCityNews = async (
  city: string,
  sessionId: string,
): Promise<NewsData> => {
  const response = await apiClient.get<ApiNewsResponse>("/api/news", {
    params: { city, sessionId },
  });
  return response.data.data;
};

export const logoutUser = async (sessionId: string): Promise<any> => {
  const response = await apiClient.post("/api/auth/logout", {
    sessionId,
  });
  return response;
};
