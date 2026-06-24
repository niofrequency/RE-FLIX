import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Check, Star } from 'lucide-react';
import { MediaItem } from '../types';
import { getProgress } from '../hooks/usePlayerProgress';
import { GENRES } from '../data/curatedMovies';

interface MovieCardProps {
  key?: any;
  movie: MediaItem;
  onPlay: (movie: MediaItem) => void;
  onInfo: (movie: MediaItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (movie: MediaItem) => void;
}

export default function MovieCard({ movie, onPlay, onInfo, isFavorite, onToggleFavorite }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);

  useEffect(() => {
    // Look up saved watching progress
    const saved = getProgress(movie.id);
    if (saved && saved.progress > 1) {
      setProgressPercent(saved.progress);
    } else {
      setProgressPercent(null);
    }
  }, [movie.id]);

  const titleText = movie.title || movie.name || 'Untitled';
  
  // PROXY FIX: Route images through wsrv.nl to bypass ISP DNS blocks
  const posterUrl = movie.poster_path && movie.poster_path.trim() !== ''
    ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://wsrv.nl/?url=image.tmdb.org/t/p/w500${movie.poster_path}`)
    : 'https://via.placeholder.com/500x750/141414/ffffff?text=RE-FLIX';

  const backdropUrl = movie.backdrop_path && movie.backdrop_path.trim() !== ''
    ? (movie.backdrop_path.startsWith('http') ? movie.backdrop_path : `https://wsrv.nl/?url=image.tmdb.org/t/p/w500${movie.backdrop_path}`)
    : posterUrl;

  // Resolve genres (first two genres)
  const resolvedGenres = (movie.genre_ids || [])
    .slice(0, 2)
    .map((gid) => GENRES[gid] || 'Other');

  return (
    <div
      id={`card-${movie.id}`}
      className="relative flex-none w-[130px] sm:w-[170px] md:w-[210px] aspect-[2/3] rounded-md overflow-hidden bg-[#181818] cursor-pointer group select-none shadow-md transition-all duration-300 transform hover:scale-[1.04] z-10 hover:z-20 border border-white/5 hover:border-white/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onInfo(movie)}
    >
      {/* Poster Image */}
      <img
        src={posterUrl}
        alt={titleText}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {/* Progress Bar overlay for Continue Watching items */}
      {progressPercent !== null && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 z-20">
          <div
            className="h-full bg-[#e50914]"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      )}

      {/* Hover Information Layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 sm:p-3.5 z-10">
        <div className="space-y-1 md:space-y-2">
          {/* Action icons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <button
                id={`card-play-btn-${movie.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(movie);
                }}
                className="w-7 h-7 sm:w-9 sm:h-9 bg-white text-black rounded-full flex items-center justify-center hover:bg-white/80 transition-transform active:scale-90 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 fill-black ml-0.5" />
              </button>

              <button
                id={`card-add-btn-${movie.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(movie);
                }}
                className={`w-7 h-7 sm:w-9 sm:h-9 border text-white rounded-full flex items-center justify-center hover:bg-white/10 transition-transform active:scale-90 cursor-pointer ${
                  isFavorite ? 'border-green-500 bg-green-500/10' : 'border-white/40'
                }`}
              >
                {isFavorite ? (
                  <Check className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-green-500" />
                ) : (
                  <Plus className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                )}
              </button>
            </div>

            <button
              id={`card-info-btn-${movie.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onInfo(movie);
              }}
              className="w-7 h-7 sm:w-9 sm:h-9 border border-white/40 text-white rounded-full flex items-center justify-center hover:bg-white/10 transition-transform active:scale-90 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>

          {/* Metadata */}
          <div className="space-y-0.5 sm:space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 truncate">
              {titleText}
            </h3>
            <div className="flex items-center space-x-1.5 text-[10px] text-gray-300">
              <span className="text-green-500 font-semibold flex items-center space-x-0.5 font-mono">
                <Star className="w-2.5 h-2.5 fill-green-500 text-green-500 inline mr-0.5" />
                {movie.vote_average.toFixed(1)}
              </span>
              <span>•</span>
              <span className="uppercase text-[9px] bg-white/10 px-1 py-0.2 rounded font-semibold font-sans">
                {movie.media_type === 'movie' ? 'Movie' : 'TV'}
              </span>
            </div>
            {resolvedGenres.length > 0 && (
              <div className="flex flex-wrap gap-1 text-[9px] text-gray-400">
                {resolvedGenres.map((g, idx) => (
                  <span key={idx} className="bg-white/5 px-1.5 py-0.5 rounded font-medium">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
