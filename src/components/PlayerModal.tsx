import React, { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { MediaItem } from '../types';
import { getProgress, saveProgress } from '../hooks/usePlayerProgress';

interface PlayerModalProps {
  movie: MediaItem | null;
  season?: number;
  episode?: number;
  onClose: () => void;
  onProgressUpdate?: () => void;
}

export default function PlayerModal({
  movie,
  season = 1,
  episode = 1,
  onClose,
  onProgressUpdate
}: PlayerModalProps) {
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Lock the background from scrolling while the video player is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (!movie) return;

    setIsLoading(true);
    setHasError(false);

    // 1. Check for saved watching progress
    const saved = getProgress(movie.id);
    const hasProgress = saved && saved.currentTime > 5;
    const progressQuery = hasProgress ? `&progress=${Math.floor(saved.currentTime)}` : '';

    // 2. Format embedding URL
    let url = '';
    if (movie.media_type === 'movie') {
      url = `https://vidsrc.me/embed/movie?tmdb=${movie.id}`;
    } else {
      url = `https://vidsrc.me/embed/tv?tmdb=${movie.id}&season=${season}&episode=${episode}`;
    }

    setIframeUrl(url);
  }, [movie, season, episode]);

  useEffect(() => {
    if (!movie) return;

    const handlePlayerMessage = (event: MessageEvent) => {
      try {
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (payload && payload.type === 'PLAYER_EVENT') {
          const {
            event: evType,
            currentTime,
            duration,
            progress: progressPercent,
            id: mediaId,
            mediaType,
            season: sNum,
            episode: eNum
          } = payload.data;

          if (['timeupdate', 'pause', 'ended'].includes(evType)) {
            saveProgress(
              mediaId || movie.id,
              currentTime,
              duration,
              progressPercent || (currentTime / duration) * 100,
              (mediaType as any) || movie.media_type,
              movie.title || movie.name || 'Untitled',
              movie.backdrop_path,
              sNum || season,
              eNum || episode
            );

            if (onProgressUpdate) {
              onProgressUpdate();
            }
          }
        }
      } catch (err) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [movie, season, episode, onProgressUpdate]);

  if (!movie) return null;

  const titleText = movie.title || movie.name || 'Untitled';
  const playerLabel =
    movie.media_type === 'movie'
      ? titleText
      : `${titleText} — S${season} E${episode}`;

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden">
      
      {/* Sleek Auto-Hiding Top Control Bar */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/90 to-transparent z-30 opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-start px-6 py-8">
        <button
          onClick={onClose}
          className="group flex items-center space-x-3 text-white hover:text-white/80 transition-colors cursor-pointer"
          title="Back to Browse"
        >
          <ArrowLeft className="w-8 h-8 md:w-10 md:h-10 drop-shadow-lg" />
          <span className="text-base md:text-xl font-bold tracking-wide drop-shadow-md hidden sm:block">
            {playerLabel}
          </span>
        </button>
      </div>

      {/* Loading State Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
          <RefreshCw className="w-12 h-12 md:w-16 md:h-16 text-[#e50914] animate-spin mb-4" />
          <p className="text-white font-medium tracking-wider animate-pulse text-sm md:text-base">
            Establishing Secure Stream...
          </p>
        </div>
      )}

      {/* Error State Overlay */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
          <AlertTriangle className="w-16 h-16 text-[#e50914] mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">Stream Unavailable</h3>
          <p className="text-gray-400 mb-6 text-sm">The streaming server refused connection.</p>
          <button
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              const url = iframeUrl;
              setIframeUrl('');
              setTimeout(() => setIframeUrl(url), 100);
            }}
            className="bg-[#e50914] text-white px-6 py-2.5 rounded font-bold hover:bg-red-700 transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : iframeUrl ? (
        /* True Edge-to-Edge Iframe */
        <iframe
          id="streaming-player-iframe"
          src={iframeUrl}
          className="absolute inset-0 w-full h-full border-0 z-10 bg-black"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={() => {
            setIsLoading(false);
            setTimeout(() => setIsLoading(false), 2000);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      ) : null}

    </div>
  );
}
