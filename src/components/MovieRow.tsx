import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '../types';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  movies: MediaItem[];
  onPlay: (movie: MediaItem) => void;
  onInfo: (movie: MediaItem) => void;
  favorites: number[];
  onToggleFavorite: (movie: MediaItem) => void;
  id: string;
}

export default function MovieRow({
  title,
  movies,
  onPlay,
  onInfo,
  favorites,
  onToggleFavorite,
  id
}: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const el = rowRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      // Run once on load to see if scrolling is possible
      handleScroll();
    }
    return () => {
      if (el) {
        el.removeEventListener('scroll', handleScroll);
      }
    };
  }, [movies]);

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 relative group px-4 md:px-12 select-none" id={`row-container-${id}`}>
      {/* Category Heading */}
      <h2 className="text-sm md:text-lg lg:text-xl font-bold text-white tracking-wide hover:text-red-500 transition-colors cursor-pointer select-none inline-block">
        {title}
      </h2>

      {/* Row Scrolling Wrapper */}
      <div className="relative">
        {/* Left Chevron Controller */}
        {showLeftArrow && (
          <button
            id={`scroll-left-${id}`}
            onClick={() => scroll('left')}
            className="absolute left-[-16px] md:left-[-48px] top-0 bottom-0 w-8 md:w-12 bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 cursor-pointer border-r border-white/5"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Scrollable Thumbnails Container */}
        <div
          ref={rowRef}
          id={`scroll-row-${id}`}
          className="flex space-x-3.5 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onPlay={onPlay}
              onInfo={onInfo}
              isFavorite={favorites.includes(movie.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>

        {/* Right Chevron Controller */}
        {showRightArrow && (
          <button
            id={`scroll-right-${id}`}
            onClick={() => scroll('right')}
            className="absolute right-[-16px] md:right-[-48px] top-0 bottom-0 w-8 md:w-12 bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 cursor-pointer border-l border-white/5"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 hover:scale-110 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}
