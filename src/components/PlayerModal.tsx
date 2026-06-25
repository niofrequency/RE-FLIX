import React, { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, AlertTriangle, Server, SkipBack, SkipForward, ChevronDown } from 'lucide-react';
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
  const [isPaused, setIsPaused] = useState(false);
  
  // Custom Dropdown States
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [showEpisodeDropdown, setShowEpisodeDropdown] = useState(false);

  // Local state to manage seasons and episodes dynamically
  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);
  const [episodeCount, setEpisodeCount] = useState<number>(24);
  const [availableSeasons, setAvailableSeasons] = useState<number[]>([season]);
  
  // Default to the working vidsrc provider
  const [provider, setProvider] = useState<'vidking' | 'vidsrc'>('vidsrc');

  // Lock the background from scrolling
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Fetch available seasons on mount
  useEffect(() => {
    if (movie?.media_type === 'tv') {
      fetch(`/api/tv/${movie.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.seasons) {
            const sNums = data.seasons
              .map((s: any) => s.season_number)
              .filter((n: number) => n > 0);
            if (sNums.length > 0) setAvailableSeasons(sNums);
          }
        })
        .catch(() => {});
    }
  }, [movie]);

  // Fetch the total number of episodes for the current season
  useEffect(() => {
    if (movie?.media_type === 'tv') {
      fetch(`/api/tv/${movie.id}/season/${currentSeason}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.episodes && data.episodes.length > 0) {
            setEpisodeCount(data.episodes.length);
          }
        })
        .catch(() => {
          setEpisodeCount(24);
        });
    }
  }, [movie, currentSeason]);

  // Format embedding URL
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
        url = `https://www.vidking.net/embed/tv/${movie.id}/${currentSeason}/${currentEpisode}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true${progressQuery}`;
      }
    } else {
      if (movie.media_type === 'movie') {
        url = `https://vidsrc.me/embed/movie?tmdb=${movie.id}`;
      } else {
        url = `https://vidsrc.me/embed/tv?tmdb=${movie.id}&season=${currentSeason}&episode=${currentEpisode}`;
      }
    }

    setIframeUrl(url);
  }, [movie, currentSeason, currentEpisode, provider]);

  // Save Player Progress & Detect Pause State
  useEffect(() => {
    if (!movie) return; 

    const handlePlayerMessage = (event: MessageEvent) => {
      try {
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (payload && payload.type === 'PLAYER_EVENT') {
          const { event: evType, currentTime, duration, progress: progressPercent, id: mediaId, mediaType, season: sNum, episode: eNum } = payload.data;

          // Track Pause/Play state for the UI Overlay
          if (evType === 'pause') setIsPaused(true);
          if (evType === 'play' || evType === 'playing') setIsPaused(false);

          if (['timeupdate', 'pause', 'ended'].includes(evType)) {
            saveProgress(
              mediaId || movie.id, currentTime, duration,
              progressPercent || (currentTime / duration) * 100,
              (mediaType as any) || movie.media_type,
              movie.title || movie.name || 'Untitled',
              movie.backdrop_path, sNum || currentSeason, eNum || currentEpisode
            );
            if (onProgressUpdate) onProgressUpdate();
          }
        }
      } catch (err) {}
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [movie, currentSeason, currentEpisode, onProgressUpdate]);

  if (!movie) return null;

  const serverSwitcherUI = (
    <div className="bg-black/80 backdrop-blur-md border border-white/10 p-1 md:p-1.5 rounded-lg flex items-center space-x-1 shadow-lg">
      <Server className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 ml-1.5 md:ml-2 mr-1" />
      <span className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 md:mr-2 hidden lg:block">Server:</span>
      <button
        onClick={() => setProvider('vidsrc')}
        className={`px-2 md:px-3 py-1 md:py-1.5 rounded text-[10px] md:text-xs font-bold transition-colors cursor-pointer ${
          provider === 'vidsrc' ? 'bg-[#e50914] text-white shadow' : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
      >
        Main Stream
      </button>
      <button
        onClick={() => setProvider('vidking')}
        className={`px-2 md:px-3 py-1 md:py-1.5 rounded text-[10px] md:text-xs font-bold transition-colors cursor-pointer ${
          provider === 'vidking' ? 'bg-[#e50914] text-white shadow' : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
      >
        VidKing
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center overflow-hidden">
      
      {/* Invisible overlay to close dropdowns when clicking outside */}
      {(showSeasonDropdown || showEpisodeDropdown) && (
        <div 
          className="absolute inset-0 z-40" 
          onClick={() => { setShowSeasonDropdown(false); setShowEpisodeDropdown(false); }}
        />
      )}

      {/* Top Controls & Netflix-Style Info Overlay */}
      {/* Opacity remains 100 if Paused OR if a dropdown is open OR on hover */}
      <div className={`absolute top-0 left-0 w-full p-4 md:p-8 z-50 bg-gradient-to-b from-black/95 via-black/60 to-transparent transition-opacity duration-500 ${isPaused || showSeasonDropdown || showEpisodeDropdown ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full relative z-50">
          
          <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-start">
            <button
              onClick={onClose}
              className="p-3 bg-black/60 hover:bg-white hover:text-black text-white rounded-full transition-all cursor-pointer backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-90 shadow-lg"
              title="Back to Browse"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="block md:hidden">
              {serverSwitcherUI}
            </div>
          </div>

          {/* Sleek Custom Episode & Season Picker Widget */}
          {movie.media_type === 'tv' && (
            <div className="flex-1 flex justify-center w-full md:w-auto">
              <div className="bg-black/80 backdrop-blur-md border border-white/10 p-1.5 rounded-full flex items-center shadow-2xl max-w-full">
                
                <button
                  onClick={() => setCurrentEpisode(prev => Math.max(1, prev - 1))}
                  disabled={currentEpisode <= 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-full hover:bg-white/10"
                >
                  <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                <div className="flex items-center px-2 md:px-4 space-x-2 md:space-x-4">
                  {/* Custom Season Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => { setShowSeasonDropdown(!showSeasonDropdown); setShowEpisodeDropdown(false); }}
                      className="flex items-center space-x-1 text-xs md:text-sm font-bold text-white hover:text-gray-300 transition-colors py-1"
                    >
                      <span>Season {currentSeason}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showSeasonDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showSeasonDropdown && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-36 bg-[#141414] border border-gray-800 rounded shadow-2xl max-h-64 overflow-y-auto py-2 z-50">
                        {availableSeasons.map(num => (
                          <button
                            key={`s-${num}`}
                            onClick={() => { setCurrentSeason(num); setCurrentEpisode(1); setShowSeasonDropdown(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs md:text-sm transition-colors ${
                              currentSeason === num
                                ? 'bg-white/10 text-white font-bold border-l-2 border-[#e50914]'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            Season {num}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-gray-600 font-bold">:</span>
                  
                  {/* Custom Episode Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => { setShowEpisodeDropdown(!showEpisodeDropdown); setShowSeasonDropdown(false); }}
                      className="flex items-center space-x-1 text-xs md:text-sm font-bold text-white hover:text-gray-300 transition-colors py-1"
                    >
                      <span>Ep {currentEpisode}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showEpisodeDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showEpisodeDropdown && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-36 bg-[#141414] border border-gray-800 rounded shadow-2xl max-h-64 overflow-y-auto py-2 z-50">
                        {Array.from({ length: Math.max(episodeCount, currentEpisode) }, (_, i) => i + 1).map(num => (
                          <button
                            key={`e-${num}`}
                            onClick={() => { setCurrentEpisode(num); setShowEpisodeDropdown(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs md:text-sm transition-colors ${
                              currentEpisode === num
                                ? 'bg-white/10 text-white font-bold border-l-2 border-[#e50914]'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            Episode {num}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentEpisode(prev => prev + 1)}
                  disabled={currentEpisode >= episodeCount}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-full hover:bg-white/10"
                >
                  <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
                </button>

              </div>
            </div>
          )}

          <div className="hidden md:block">
            {serverSwitcherUI}
          </div>
        </div>

        {/* Netflix-Style Title & Description (Visible on Hover or Pause) */}
        <div className="mt-8 md:mt-12 max-w-2xl px-2 relative z-0 pointer-events-none">
          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-2xl mb-2 md:mb-3">
            {movie.title || movie.name}
          </h1>
          {movie.media_type === 'tv' && (
            <h2 className="text-lg md:text-xl font-bold text-gray-300 drop-shadow-lg mb-3 md:mb-4">
              Season {currentSeason} • Episode {currentEpisode}
            </h2>
          )}
          <p className="text-xs md:text-sm text-gray-200 line-clamp-3 md:line-clamp-4 drop-shadow-xl leading-relaxed">
            {movie.overview}
          </p>
        </div>

      </div>

      {/* Loading State Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
          <RefreshCw className="w-10 h-10 md:w-16 md:h-16 text-[#e50914] animate-spin mb-4" />
          <p className="text-white font-medium tracking-wider animate-pulse text-xs md:text-base font-mono">
            Loading {provider === 'vidking' ? 'VidKing' : 'Stream'} Engine...
          </p>
        </div>
      )}

      {/* Error State Overlay */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20 p-4 text-center">
          <AlertTriangle className="w-12 h-12 md:w-16 md:h-16 text-[#e50914] mb-4" />
          <h3 className="text-white text-lg md:text-2xl font-bold mb-2">Stream Unavailable</h3>
          <p className="text-gray-400 mb-6 text-xs md:text-sm max-w-md">
            The streaming server refused connection. Try switching to an alternate server using the toggle.
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
              className="bg-[#e50914] text-white px-5 py-2.5 md:px-6 md:py-3 rounded-md font-bold text-xs md:text-base hover:bg-red-700 transition-transform active:scale-95 cursor-pointer shadow-lg"
            >
              Retry
            </button>
            <button
              onClick={onClose}
              className="bg-white/10 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-md font-bold text-xs md:text-base hover:bg-white/20 transition-transform active:scale-95 cursor-pointer shadow-lg border border-white/10"
            >
              Go Back
            </button>
          </div>
        </div>
      ) : iframeUrl ? (
        <iframe
          id="streaming-player-iframe"
          src={iframeUrl}
          className="absolute inset-0 w-full h-full border-0 z-10 bg-black"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
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
