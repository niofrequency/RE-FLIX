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
    // Store original overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    // Cleanup on unmount (when modal closes)
    return () => {
      document.body.style.overflow = originalStyle;
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
      : `${titleText} — Season ${season} Episode ${episode}`;

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center overflow-hidden">
      
      {/* Sleek Auto-Hiding Top Control Bar */}
      <div className="absolute top-0 left-0 w-full p-6 md:p-8 flex items-center justify-between z-50 bg-gradient-to-b from-black/90 via-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-3 md:p-4 bg-black/40 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-90"
            title="Back to Browse"
          >
            <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          <h2 className="text-white text-lg md:text-2xl font-bold tracking-wide drop-shadow-md hidden sm:block">
            {playerLabel}
          </h2>
        </div>
      </div>

      {/* Loading State Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
          <RefreshCw className="w-12 h-12 md:w-16 md:h-16 text-[#e50914] animate-spin mb-4" />
          <p className="text-white font-medium tracking-wider animate-pulse text-sm md:text-base font-mono">
            Establishing Secure Stream...
          </p>
        </div>
      )}

      {/* Error State Overlay */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20 p-4 text-center">
          <AlertTriangle className="w-16 h-16 text-[#e50914] mb-4" />
          <h3 className="text-white text-xl md:text-2xl font-bold mb-2">Stream Unavailable</h3>
          <p className="text-gray-400 mb-6 text-sm max-w-md">
            The streaming server refused connection. Please check your network or try a different title.
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                const url = iframeUrl;
                setIframeUrl('');
                setTimeout(() => setIframeUrl(url), 100);
              }}
              className="bg-[#e50914] text-white px-6 py-3 rounded-md font-bold hover:bg-red-700 transition-transform active:scale-95 cursor-pointer shadow-lg"
            >
              Retry Connection
            </button>
            <button
              onClick={onClose}
              className="bg-white/10 text-white px-6 py-3 rounded-md font-bold hover:bg-white/20 transition-transform active:scale-95 cursor-pointer shadow-lg border border-white/10"
            >
              Go Back
            </button>
          </div>
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
            // Fallback clear just in case load fires prematurely
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
