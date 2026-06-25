import React, { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, AlertTriangle, Server } from 'lucide-react';
import { MediaItem } from '../types';
import { getProgress, saveProgress } from '../hooks/usePlayerProgress';

interface PlayerModalProps {
  movie: MediaItem | null;
  season?: number;
  episode?: number;
  onClose: () => void;
  onProgressUpdate?: () => void;
}

type Provider = 'vidking' | 'vidsrc' | 'vidsrcpro';

export default function PlayerModal({
  movie,
  season = 1,
  episode = 1,
  onClose,
  onProgressUpdate
}: PlayerModalProps) {
  const [provider, setProvider] = useState<Provider>('vidking');
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Lock the background from scrolling while the video player is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Generate the correct URL whenever the movie, episode, or PROVIDER changes
  useEffect(() => {
    if (!movie) return;

    setIsLoading(true);
    setHasError(false);

    const saved = getProgress(movie.id);
    const hasProgress = saved && saved.currentTime > 5;
    const progressQuery = hasProgress ? `&progress=${Math.floor(saved.currentTime)}` : '';

    let url = '';
    
    if (provider === 'vidking') {
      if (movie.media_type === 'movie') {
        url = `https://www.vidking.net/embed/movie/${movie.id}?color=e50914&autoPlay=true${progressQuery}`;
      } else {
        url = `https://www.vidking.net/embed/tv/${movie.id}/${season}/${episode}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true${progressQuery}`;
      }
    } else if (provider === 'vidsrc') {
      if (movie.media_type === 'movie') {
        url = `https://vidsrc.me/embed/movie?tmdb=${movie.id}`;
      } else {
        url = `https://vidsrc.me/embed/tv?tmdb=${movie.id}&season=${season}&episode=${episode}`;
      }
    } else if (provider === 'vidsrcpro') {
      if (movie.media_type === 'movie') {
        url = `https://vidsrc.pro/embed/movie/${movie.id}`;
      } else {
        url = `https://vidsrc.pro/embed/tv/${movie.id}/${season}/${episode}`;
      }
    }

    setIframeUrl(url);
  }, [movie, season, episode, provider]);

  // Vidking Progress Tracking Listener
  useEffect(() => {
    if (!movie || provider !== 'vidking') return;

    const handlePlayerMessage = (event: MessageEvent) => {
      try {
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (payload && payload.type === 'PLAYER_EVENT') {
          const { event: evType, currentTime, duration, progress: progressPercent, id: mediaId, mediaType, season: sNum, episode: eNum } = payload.data;
          
          if (['timeupdate', 'pause', 'ended'].includes(evType)) {
            saveProgress(
              mediaId || movie.id, currentTime, duration, progressPercent || (currentTime / duration) * 100,
              (mediaType as any) || movie.media_type, movie.title || movie.name || 'Untitled', movie.backdrop_path, sNum || season, eNum || episode
            );
            if (onProgressUpdate) onProgressUpdate();
          }
        }
      } catch (err) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [movie, season, episode, provider, onProgressUpdate]);

  if (!movie) return null;

  const titleText = movie.title || movie.name || 'Untitled';
  const playerLabel = movie.media_type === 'movie' ? titleText : `${titleText} — S${season} E${episode}`;

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center overflow-hidden">
      
      {/* 
        Sleek Auto-Hiding Top Control Bar 
        Note: Fixed height to h-24 so it DOES NOT block clicks on the iframe's center/bottom controls!
      */}
      <div className="absolute top-0 left-0 w-full h-24 flex items-start justify-between p-4 md:p-6 z-50 bg-gradient-to-b from-black/90 via-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
        
        {/* Left Side: Back Button & Title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-3 md:p-3.5 bg-black/60 hover:bg-black text-white rounded-full transition-all cursor-pointer backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-90"
            title="Back to Browse"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 drop-shadow-lg" />
          </button>
          <h2 className="text-white text-sm md:text-xl font-bold tracking-wide drop-shadow-md hidden sm:block">
            {playerLabel}
          </h2>
        </div>

        {/* Right Side: Server Switcher Dropdown */}
        <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-2 rounded-md border border-white/10 hover:border-white/30 transition-colors">
          <Server className="w-4 h-4 text-[#e50914]" />
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
            className="bg-transparent text-white text-xs md:text-sm font-semibold outline-none cursor-pointer appearance-none pr-4"
          >
            <option value="vidking" className="bg-[#141414]">Server 1 (Vidking UI)</option>
            <option value="vidsrc" className="bg-[#141414]">Server 2 (Backup A)</option>
            <option value="vidsrcpro" className="bg-[#141414]">Server 3 (Backup B)</option>
          </select>
        </div>

      </div>

      {/* Loading State Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
          <RefreshCw className="w-12 h-12 md:w-16 md:h-16 text-[#e50914] animate-spin mb-4" />
          <p className="text-white font-medium tracking-wider animate-pulse text-sm md:text-base font-mono">
            {provider === 'vidking' ? 'Loading Vidking Engine...' : 'Connecting to Backup Server...'}
          </p>
        </div>
      )}

      {/* Error State Overlay */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20 p-4 text-center">
          <AlertTriangle className="w-16 h-16 text-[#e50914] mb-4" />
          <h3 className="text-white text-xl md:text-2xl font-bold mb-2">Server Unavailable</h3>
          <p className="text-gray-400 mb-6 text-sm max-w-md">
            The current server refused connection. Try switching to a different server using the dropdown in the top right corner.
          </p>
          <button
            onClick={onClose}
            className="bg-white/10 text-white px-6 py-3 rounded-md font-bold hover:bg-white/20 transition-transform active:scale-95 cursor-pointer shadow-lg border border-white/10"
          >
            Go Back
          </button>
        </div>
      ) : iframeUrl ? (
        /* True Edge-to-Edge Iframe */
        <iframe
          id="streaming-player-iframe"
          src={iframeUrl}
          className="absolute inset-0 w-full h-full border-0 z-10 bg-black"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen={true}
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
