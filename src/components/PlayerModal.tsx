import React, { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
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

  useEffect(() => {
    if (!movie) return;

    setIsLoading(true);
    setHasError(false);

    // 1. Check for saved watching progress for this specific asset ID
    const saved = getProgress(movie.id);
    const hasProgress = saved && saved.currentTime > 5;
    const progressQuery = hasProgress ? `&progress=${Math.floor(saved.currentTime)}` : '';

    // 2. Format embedding URL based on asset type
    let url = '';
    if (movie.media_type === 'movie') {
      url = `https://www.vidking.net/embed/movie/${movie.id}?color=e50914&autoPlay=true${progressQuery}`;
    } else {
      url = `https://www.vidking.net/embed/tv/${movie.id}/${season}/${episode}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true${progressQuery}`;
    }

    setIframeUrl(url);
  }, [movie, season, episode]);

  // 3. Central Window Message Listener for Vidking PLAYER_EVENT
  useEffect(() => {
    if (!movie) return;

    const handlePlayerMessage = (event: MessageEvent) => {
      try {
        // Parse payload if it comes as a string, otherwise use directly
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
            // Save state immediately to localStorage
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

            // Notify parent to refresh list (like Continue Watching)
            if (onProgressUpdate) {
              onProgressUpdate();
            }
          }
        }
      } catch (err) {
        // Benign: Ignore non-JSON messages or messages from other extensions/iframes
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
      : `${titleText} — Season ${season}, Episode ${episode}`;

  return (
    <div
      id="video-player-overlay"
      className="fixed inset-0 bg-black z-50 flex flex-col justify-between overflow-hidden"
    >
      {/* Immersive Top Control Bar */}
      <div
        id="player-control-bar"
        className="absolute top-0 left-0 w-full bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 md:p-6 flex items-center justify-between z-30 transition-opacity duration-300 hover:opacity-100 opacity-100 group"
      >
        <div className="flex items-center space-x-4">
          <button
            id="player-back-btn"
            onClick={onClose}
            className="p-2 md:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-95 cursor-pointer flex items-center justify-center border border-white/10"
            title="Back to Browse"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div>
            <span className="text-[10px] md:text-xs font-bold text-red-500 uppercase tracking-widest font-mono">
              Streaming on RE-FLIX
            </span>
            <h2 className="text-white text-sm md:text-lg font-bold truncate max-w-[50vw] drop-shadow-md">
              {playerLabel}
            </h2>
          </div>
        </div>

        {/* Outer Direct Link indicator for player */}
        <div className="flex items-center space-x-2">
          <a
            href={iframeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-[11px] md:text-xs text-gray-300 hover:text-white bg-black/40 border border-white/20 px-3 py-1.5 rounded-md hover:bg-black/60 transition-colors cursor-pointer font-medium"
          >
            <span>External Stream</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Primary Video Canvas - 16:9 Responsive Ratio Box */}
      <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 space-y-4">
            <RefreshCw className="w-10 h-10 text-[#e50914] animate-spin" />
            <div className="text-center">
              <p className="text-white font-bold text-sm md:text-base tracking-wide animate-pulse">
                Establishing Stream...
              </p>
              <p className="text-gray-400 text-xs mt-1 font-mono">
                Connecting to Vidking Player Engine
              </p>
            </div>
          </div>
        )}

        {hasError ? (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md">
            <AlertTriangle className="w-12 h-12 text-[#e50914]" />
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg">Unable to stream title</h3>
              <p className="text-gray-400 text-xs md:text-sm">
                There was a problem establishing connection to the streaming iframe hosts. Please check your network or try refreshing the page.
              </p>
            </div>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                // Force URL reload
                const url = iframeUrl;
                setIframeUrl('');
                setTimeout(() => setIframeUrl(url), 100);
              }}
              className="bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded transition-transform active:scale-95 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : iframeUrl ? (
          <iframe
            id="vidking-player-iframe"
            src={iframeUrl}
            className="w-full h-full border-0 absolute inset-0 z-0 bg-black aspect-video"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            onLoad={() => {
              setIsLoading(false);
              // Set up safe check timeout in case page crashes
              setTimeout(() => setIsLoading(false), 2000);
            }}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
      </div>

      {/* Progress Track Status Strip (at the bottom) */}
      <div className="bg-[#141414] py-1 text-center border-t border-white/5 select-none text-[9px] md:text-[10px] text-gray-500 font-mono">
        RE-FLIX Vidking Engine • Hex Color Red #e50914 Applied • Autoplay Enabled
      </div>
    </div>
  );
}
