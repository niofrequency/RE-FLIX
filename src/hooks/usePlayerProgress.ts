import { useState, useEffect } from 'react';
import { ProgressState, MediaType } from '../types';

export function getProgress(id: string | number): ProgressState | null {
  try {
    const data = localStorage.getItem(`vidking_progress_${id}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading progress from localStorage', e);
  }
  return null;
}

export function saveProgress(
  id: string | number,
  currentTime: number,
  duration: number,
  progress: number,
  mediaType: MediaType,
  title: string,
  backdropPath: string,
  season?: number,
  episode?: number
) {
  try {
    const state: ProgressState = {
      id: String(id),
      currentTime,
      duration,
      progress,
      mediaType,
      title,
      backdrop_path: backdropPath,
      season,
      episode,
      lastUpdated: Date.now()
    };
    localStorage.setItem(`vidking_progress_${id}`, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving progress to localStorage', e);
  }
}

export function clearProgress(id: string | number) {
  try {
    localStorage.removeItem(`vidking_progress_${id}`);
  } catch (e) {
    console.error('Error clearing progress from localStorage', e);
  }
}

export function useContinueWatching() {
  const [items, setItems] = useState<ProgressState[]>([]);

  const refresh = () => {
    try {
      const allProgress: ProgressState[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('vidking_progress_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            allProgress.push(JSON.parse(raw));
          }
        }
      }
      // Sort by lastUpdated descending
      allProgress.sort((a, b) => b.lastUpdated - a.lastUpdated);
      setItems(allProgress);
    } catch (e) {
      console.error('Error loading continue watching list', e);
    }
  };

  useEffect(() => {
    refresh();
    // Listen for storage events in case of multiple tabs
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  return { items, refresh };
}
