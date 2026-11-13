// src/types/briefing.ts
// Interface definitions for Modul 3 (Async & External API Call)

export interface WeatherCurrent {
  temperature: number;
  humidity: number;
  weatherCode: number;
  windSpeed: number;
  conditionLabel: string;
  campusAdvice: string;
}

export interface MorningQuote {
  id: number;
  quote: string;
  author: string;
}

export interface CampusTip {
  id: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
  actionItems: string[];
}

export interface BriefingData {
  weather: WeatherCurrent;
  quote: MorningQuote;
  tips: CampusTip[];
  fetchedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}
