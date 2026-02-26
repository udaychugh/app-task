import axios from 'axios';
import { NewsArticle, NewsResult } from '../../domain/entities';
import { logger } from '../../shared/logger';

interface SerpApiNewsResult {
  title: string;
  source: { name: string };
  link: string;
  snippet?: string;
  date?: string;
  thumbnail?: string;
}

interface SerpApiResponse {
  news_results?: SerpApiNewsResult[];
  search_information?: {
    total_results?: number;
  };
  error?: string;
}

export class SerpApiService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://serpapi.com/search';

  constructor() {
    const apiKey = process.env.SERP_API_KEY;
    if (!apiKey) throw new Error('SERP_API_KEY is not configured');
    this.apiKey = apiKey;
  }

  async searchNews(city: string): Promise<NewsResult> {
    const query = `${city} news today`;

    logger.info('Fetching news from SERP API', { city, query });

    const response = await axios.get<SerpApiResponse>(this.baseUrl, {
      params: {
        q: query,
        tbm: 'nws',        // news search
        api_key: this.apiKey,
        num: 10,
        hl: 'en',
        gl: 'in',          // India locale (adjust as needed)
      },
      timeout: 10_000,
    });

    const data = response.data;

    if (data.error) {
      logger.error('SERP API returned error', { error: data.error });
      throw new Error(`SERP API Error: ${data.error}`);
    }

    const rawArticles = data.news_results ?? [];

    const articles: NewsArticle[] = rawArticles.map((item) => ({
      title: item.title,
      source: item.source?.name ?? 'Unknown',
      url: item.link,
      snippet: item.snippet ?? '',
      publishedAt: item.date,
      thumbnail: item.thumbnail,
    }));

    return {
      query,
      city,
      articles,
      totalResults: articles.length,
    };
  }
}
