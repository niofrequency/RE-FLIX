import React from 'react';
import { Play } from 'lucide-react';
import { MediaItem, ProgressState } from '../types';

// PROXY FIX: Route images through wsrv.nl to bypass ISP DNS blocks
function getSafeBackdropUrl(path: string | undefined | null): string {
  if (!path || path.trim() === '') {
    return 'https://via.placeholder.com/1920x1080/141414/ffffff?text=RE-FLIX';
  }
  return path.startsWith('http') ? path : `https://wsrv.nl/?url=image.tmdb.org/t/p/w500${path}`;
}

interface BentoShowcaseProps {
  trendingItem: MediaItem | null;
  recommendedItem: MediaItem | null;
  continueWatchingItem: ProgressState | null;
  onPlay: (movie: MediaItem, season?: number, episode?: number) => void;
  onInfo: (movie: MediaItem) => void;
}

export default function BentoShowcase({
  trendingItem,
  recommendedItem,
  continueWatchingItem,
  onPlay,
  onInfo
}: BentoShowcaseProps) {
  return (
    <div className="px-4 md:px-12 py-6 select-none" id="bento-dashboard-showcase">
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm md:text-lg lg:text-xl font-bold tracking-wider text-white uppercase font-sans">
            Sleek Bento Hub
          </h2>
          <span className="text-[#e50914] bg-[#e50914]/15 border border-[#e50914]/35 px-1.5 py-0.2 rounded font-extrabold text-[9px] uppercase tracking-wider">
            PREMIUM
          </span>
        </div>
        <p className="text-gray-400 text-xs mt-1 font-mono">
          Interactive streaming bento panels
        </p>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="bento-grid-wrapper">
        {/* Panel 1: Continue Watching / Recent Stream Progress */}
        <div 
          className="bg-[#1a1a1a] rounded-xl border border-white/5 hover:border-red-500/35 p-5 flex flex-col justify-between min-h-[190px] relative overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
          id="bento-panel-continue"
        >
          {continueWatchingItem ? (
            <>
              {/* Backdrop image behind continue panel */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={getSafeBackdropUrl(continueWatchingItem.backdrop_path)} 
                  alt="Backdrop"
                  className="w-full h-full object-cover brightness-[0.25] group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent"></div>
              </div>

              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[#e50914] text-[9px] font-bold tracking-widest uppercase bg-[#e50914]/20 border border-[#e50914]/30 px-1.5 py-0.5 rounded font-mono">
                    RESUME PLAYING
                  </span>
                  <h3 className="text-white text-base md:text-lg font-black truncate max-w-[200px] md:max-w-[320px] pt-1">
                    {continueWatchingItem.title}
                  </h3>
                  {continueWatchingItem.season && (
                    <p className="text-gray-400 text-xs font-mono">
                      Season {continueWatchingItem.season}, Episode {continueWatchingItem.episode}
                    </p>
                  )}
                </div>

                <button 
                  onClick={() => {
                    const fallbackItem: MediaItem = {
                      id: Number(continueWatchingItem.id),
                      title: continueWatchingItem.mediaType === 'movie' ? continueWatchingItem.title : undefined,
                      name: continueWatchingItem.mediaType === 'tv' ? continueWatchingItem.title : undefined,
                      overview: 'Resume playback',
                      poster_path: continueWatchingItem.backdrop_path,
                      backdrop_path: continueWatchingItem.backdrop_path,
                      vote_average: 8.0,
                      media_type: continueWatchingItem.mediaType,
                      genre_ids: []
                    };
                    onPlay(fallbackItem, continueWatchingItem.season, continueWatchingItem.episode);
                  }}
                  className="w-10 h-10 bg-white hover:bg-[#e50914] hover:text-white text-black rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-lg cursor-pointer flex-none"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>

              <div className="relative z-10 space-y-2 mt-4">
                <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                  <span>Progress</span>
                  <span className="text-[#e50914] font-bold">{Math.floor(continueWatchingItem.progress)}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-[#e50914] h-full rounded-full transition-all duration-300" 
                    style={{ width: `${continueWatchingItem.progress}%` }}
                  ></div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-gray-500 text-[10px] font-extrabold tracking-widest uppercase font-mono">
                  No Recent Stream
                </span>
                <h3 className="text-white text-base md:text-lg font-black pt-1">
                  Ready to Start Watching?
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
                  Stream any blockbuster movie or TV series seamlessly. Playback checkpoints sync in real-time.
                </p>
              </div>

              <button 
                onClick={() => recommendedItem && onPlay(recommendedItem)}
                className="w-full bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs py-2 rounded-lg transition-transform active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Quick Play Spotlight</span>
              </button>
            </div>
          )}
        </div>

        {/* Panel 2: Interactive Featured Spotlight */}
        <div 
          className="bg-[#1a1a1a] rounded-xl border border-white/5 hover:border-red-500/35 p-5 flex flex-col justify-between min-h-[190px] relative overflow-hidden group transition-all duration-300"
          id="bento-panel-recommend"
        >
          {recommendedItem ? (
            <>
              {/* Backdrop poster block */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={getSafeBackdropUrl(recommendedItem.backdrop_path)} 
                  alt="Backdrop"
                  className="w-full h-full object-cover brightness-[0.25] group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent"></div>
              </div>

              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-amber-500 text-[9px] font-bold tracking-widest uppercase bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono">
                    ★ CRITICS CHOICE
                  </span>
                  <h3 
                    onClick={() => onInfo(recommendedItem)}
                    className="text-white text-base md:text-lg font-black truncate max-w-[200px] md:max-w-[320px] pt-1 cursor-pointer hover:text-red-500 transition-colors"
                  >
                    {recommendedItem.title || recommendedItem.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-[10px] text-gray-300 font-mono">
                    <span className="text-green-500">★ {recommendedItem.vote_average.toFixed(1)}</span>
                    <span>•</span>
                    <span className="uppercase">{recommendedItem.media_type}</span>
                  </div>
                </div>

                <button 
                  onClick={() => onPlay(recommendedItem)}
                  className="w-10 h-10 bg-[#e50914] text-white rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:rotate-12 shadow-lg cursor-pointer flex-none"
                >
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </button>
              </div>

              <p className="relative z-10 text-gray-400 text-xs line-clamp-2 leading-relaxed max-w-sm mt-3">
                {recommendedItem.overview}
              </p>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <span className="text-gray-500 text-xs font-mono">Loading recommendations...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
