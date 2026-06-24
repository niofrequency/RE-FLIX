export type MediaType = 'movie' | 'tv';

export interface Episode {
  episode_number: number;
  name: string;
  overview: string;
  still_path?: string;
}

export interface Season {
  season_number: number;
  name: string;
  episode_count: number;
  episodes?: Episode[];
}

export interface MediaItem {
  id: number;
  title?: string;     // For movies
  name?: string;      // For TV shows
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date?: string;   // For movies
  first_air_date?: string; // For TV shows
  media_type: MediaType;
  genre_ids: number[];
  seasons?: Season[];
}

export interface ProgressState {
  currentTime: number;
  duration: number;
  progress: number; // Percentage
  id: string;       // tmdbId as string
  mediaType: MediaType;
  season?: number;
  episode?: number;
  title: string;
  backdrop_path: string;
  lastUpdated: number;
}
