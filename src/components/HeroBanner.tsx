import { Play, Info, RotateCcw } from 'lucide-react';
import { MediaItem } from '../types';
import { getProgress } from '../hooks/usePlayerProgress';

interface HeroBannerProps {
  movie: MediaItem | null;
  onPlay: (movie: MediaItem) => void;
  onInfo: (movie: MediaItem) => void;
}

export default function HeroBanner({ movie, onPlay, onInfo }: HeroBannerProps) {
  if (!movie) {
    return (
      <div className="relative h-[45vw] min-h-[400px] w-full bg-[#141414] animate-pulse flex items-center justify-center">
        <span className="text-gray-500 font-mono text-sm">RE-FLIX STREAMING LIVE...</span>
      </div>
    );
  }

  const titleText = movie.title || movie.name || '';
  const backdropUrl = movie.backdrop_path && movie.backdrop_path.trim() !== ''
    ? (movie.backdrop_path.startsWith('http') ? movie.backdrop_path : `https://image.tmdb.org/t/p/original${movie.backdrop_path}`)
    : 'https://via.placeholder.com/1920x1080/141414/ffffff?text=RE-FLIX';

  // Check if there is saved watching progress to display a resume icon/indicator
  const progress = getProgress(movie.id);
  const isResumable = progress && progress.currentTime > 5;

  return (
    <div className="relative h-[56vw] min-h-[500px] md:h-[48vw] w-full bg-black overflow-hidden" id={`hero-${movie.id}`}>
      {/* Background Backdrop Image */}
      <div className="absolute inset-0 select-none">
        <img
          src={backdropUrl}
          alt={titleText}
          className="w-full h-full object-cover object-top brightness-[0.75] md:brightness-90 transition-all duration-700"
          referrerPolicy="no-referrer"
        />
        {/* Ambient Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/35"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/60 via-transparent to-transparent"></div>
      </div>

      {/* Cinematic Text Contents */}
      <div className="absolute bottom-[10%] md:bottom-[20%] left-4 md:left-12 max-w-xl z-10 space-y-4 px-2">
        {/* Category Label */}
        <div className="flex items-center space-x-2">
          <span className="bg-[#e50914] text-[10px] md:text-xs font-bold px-2 py-0.5 rounded tracking-widest text-white uppercase select-none">
            {movie.media_type === 'movie' ? 'Movie' : 'Series'}
          </span>
          <span className="text-gray-300 text-xs font-medium font-mono">
            ★ {movie.vote_average.toFixed(1)} Rating
          </span>
        </div>

        {/* Cinematic Large Title */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-xl leading-none">
          {titleText}
        </h1>

        {/* Plot Overview */}
        <p className="text-gray-300 text-xs md:text-sm lg:text-base line-clamp-3 md:line-clamp-4 leading-relaxed font-normal text-slate-200 drop-shadow-md">
          {movie.overview}
        </p>

        {/* Interaction Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            id={`hero-play-btn-${movie.id}`}
            onClick={() => onPlay(movie)}
            className="flex items-center space-x-2 bg-white text-black font-bold px-5 py-2 md:px-8 md:py-3 rounded-md hover:bg-white/85 transition-all text-xs md:text-sm shadow-lg transform active:scale-95 cursor-pointer"
          >
            {isResumable ? (
              <>
                <RotateCcw className="w-4 h-4 md:w-5 md:h-5 fill-black" />
                <span>Resume ({Math.floor(progress!.progress)}%)</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 md:w-5 md:h-5 fill-black" />
                <span>Play Now</span>
              </>
            )}
          </button>

          <button
            id={`hero-info-btn-${movie.id}`}
            onClick={() => onInfo(movie)}
            className="flex items-center space-x-2 bg-gray-500/50 hover:bg-gray-500/40 text-white font-bold px-5 py-2 md:px-8 md:py-3 rounded-md transition-all text-xs md:text-sm border border-white/10 shadow-lg transform active:scale-95 cursor-pointer"
          >
            <Info className="w-4 h-4 md:w-5 md:h-5" />
            <span>More Info</span>
          </button>
        </div>
      </div>

      {/* Subtle Bottom Glow Overlay */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#141414] to-transparent pointer-events-none"></div>
    </div>
  );
}
