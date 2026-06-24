import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import MovieRow from './components/MovieRow';
import DetailModal from './components/DetailModal';
import PlayerModal from './components/PlayerModal';
import BentoShowcase from './components/BentoShowcase';
import { MediaItem } from './types';
import { useContinueWatching } from './hooks/usePlayerProgress';
import { CURATED_MOVIES, CURATED_TV_SHOWS } from './data/curatedMovies';
import { RefreshCw, Play, Plus, Star } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'tv' | 'list'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Core metadata lists
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Player States
  const [selectedMovieForInfo, setSelectedMovieForInfo] = useState<MediaItem | null>(null);
  const [selectedMovieForPlay, setSelectedMovieForPlay] = useState<MediaItem | null>(null);
  const [playSeason, setPlaySeason] = useState<number>(1);
  const [playEpisode, setPlayEpisode] = useState<number>(1);

  // Favorites (My List)
  const [favorites, setFavorites] = useState<number[]>([]);

  // Continue Watching
  const continueWatching = useContinueWatching();

  // Load Favorites from LocalStorage on mount
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('reflix_favorites');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch (e) {
      console.error('Error loading favorites', e);
    }
  }, []);

  // Fetch core metadata lists on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      setIsLoading(true);
      try {
        const [resTrending, resPopularMovies, resPopularTV, resTopRatedTV] = await Promise.all([
          fetch('/api/trending').then(r => r.json()).catch(() => ({ results: [] })),
          fetch('/api/movies/popular').then(r => r.json()).catch(() => ({ results: [] })),
          fetch('/api/tv/popular').then(r => r.json()).catch(() => ({ results: [] })),
          fetch('/api/tv/top-rated').then(r => r.json()).catch(() => ({ results: [] }))
        ]);

        // Guard empty list results by injecting curated fallbacks
        setTrending(resTrending.results?.length ? resTrending.results : [
          ...CURATED_MOVIES.slice(0, 4),
          ...CURATED_TV_SHOWS.slice(0, 4)
        ]);

        setPopularMovies(resPopularMovies.results?.length ? resPopularMovies.results : CURATED_MOVIES);
        setPopularTV(resPopularTV.results?.length ? resPopularTV.results : CURATED_TV_SHOWS);
        setTopRatedTV(resTopRatedTV.results?.length ? resTopRatedTV.results : [...CURATED_TV_SHOWS].reverse());

      } catch (err) {
        console.error('Error fetching metadata:', err);
        // Fallbacks
        setTrending([...CURATED_MOVIES.slice(0, 4), ...CURATED_TV_SHOWS.slice(0, 4)]);
        setPopularMovies(CURATED_MOVIES);
        setPopularTV(CURATED_TV_SHOWS);
        setTopRatedTV([...CURATED_TV_SHOWS].reverse());
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  // Search fetching logic
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleToggleFavorite = (movie: MediaItem) => {
    let updated: number[];
    if (favorites.includes(movie.id)) {
      updated = favorites.filter(id => id !== movie.id);
    } else {
      updated = [...favorites, movie.id];
    }
    setFavorites(updated);
    localStorage.setItem('reflix_favorites', JSON.stringify(updated));
  };

  const handlePlayMovie = (movie: MediaItem, season?: number, episode?: number) => {
    setSelectedMovieForPlay(movie);
    setPlaySeason(season || 1);
    setPlayEpisode(episode || 1);
    // Auto-close info modal on play if open
    setSelectedMovieForInfo(null);
  };

  // Compile a list of all favorite items from both curated data and live results
  const allKnownMediaItems = [
    ...CURATED_MOVIES,
    ...CURATED_TV_SHOWS,
    ...trending,
    ...popularMovies,
    ...popularTV,
    ...topRatedTV,
    ...searchResults
  ];

  // De-duplicate known items
  const uniqueMediaMap = new Map<number, MediaItem>();
  allKnownMediaItems.forEach(item => {
    uniqueMediaMap.set(item.id, item);
  });

  const favoriteMovies = favorites
    .map(id => uniqueMediaMap.get(id))
    .filter((item): item is MediaItem => !!item);

  // Convert saved progress states into MediaItem mock elements for the "Continue Watching" row
  const continueMediaItems: MediaItem[] = continueWatching.items.map(state => {
    const originalItem = uniqueMediaMap.get(Number(state.id));
    
    return {
      id: Number(state.id),
      title: state.mediaType === 'movie' ? state.title : undefined,
      name: state.mediaType === 'tv' ? state.title : undefined,
      overview: originalItem?.overview || 'Resume streaming from where you left off.',
      poster_path: originalItem?.poster_path || state.backdrop_path,
      backdrop_path: state.backdrop_path,
      vote_average: originalItem?.vote_average || 8.0,
      media_type: state.mediaType,
      genre_ids: originalItem?.genre_ids || [],
      seasons: originalItem?.seasons || (state.mediaType === 'tv' ? [{
        season_number: state.season || 1,
        name: `Season ${state.season || 1}`,
        episode_count: 10
      }] : undefined)
    };
  });

  // Get prominent featured movie for the homepage (e.g. Interstellar or first trending movie)
  const featuredHeroMovie = trending[0] || CURATED_MOVIES[0];

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col font-sans selection:bg-[#e50914] selection:text-white pb-24">
      {/* Navigation Header */}
      <Header
        onSearch={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Browse Viewport */}
      {searchQuery ? (
        /* Search Overlay View */
        <main className="pt-28 px-4 md:px-12 space-y-6 flex-1">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold font-mono text-gray-400">
              Showing Results For: <span className="text-white font-sans font-bold italic">"{searchQuery}"</span>
            </h1>
            <p className="text-xs text-gray-500 font-mono">
              Search results synced across TMDB indexes and local cached nodes
            </p>
          </div>

          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <RefreshCw className="w-10 h-10 text-[#e50914] animate-spin" />
              <span className="text-xs text-gray-400 font-mono">Querying RE-FLIX archives...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => setSelectedMovieForInfo(movie)}
                  className="aspect-[2/3] bg-[#181818] rounded-md overflow-hidden relative group cursor-pointer border border-white/5 hover:border-white/20 transition-transform duration-300 transform hover:scale-[1.03]"
                >
                  <img
                    src={movie.poster_path && movie.poster_path.trim() !== '' ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`) : 'https://via.placeholder.com/500x750/141414/ffffff?text=RE-FLIX'}
                    alt={movie.title || movie.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <h3 className="font-bold text-xs md:text-sm text-white truncate">{movie.title || movie.name}</h3>
                    <div className="flex items-center text-[10px] text-green-500 font-mono mt-0.5">
                      <Star className="w-2.5 h-2.5 fill-green-500 mr-0.5" />
                      {movie.vote_average.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 space-y-2">
              <p className="text-gray-400 text-sm md:text-base">No titles matched your query.</p>
              <p className="text-gray-600 text-xs">Try searching for alternative keywords like "Stranger", "Dune", "Interstellar".</p>
            </div>
          )}
        </main>
      ) : (
        /* Categorized Tab Views */
        <main className="flex-1">
          {activeTab === 'home' && (
            <div className="space-y-12">
              {/* Feature Hero */}
              <HeroBanner
                movie={featuredHeroMovie}
                onPlay={handlePlayMovie}
                onInfo={setSelectedMovieForInfo}
              />

              {/* Browse Catalog */}
              <div className="space-y-10 md:space-y-14 -mt-16 md:-mt-24 relative z-20">
                {/* Bento Grid Dashboard Showcase */}
                <BentoShowcase
                  trendingItem={trending[1] || CURATED_MOVIES[1] || null}
                  recommendedItem={trending[2] || CURATED_TV_SHOWS[0] || null}
                  continueWatchingItem={continueWatching.items[0] || null}
                  onPlay={handlePlayMovie}
                  onInfo={setSelectedMovieForInfo}
                />
                {/* 1. Continue Watching Row (Conditional) */}
                {continueMediaItems.length > 0 && (
                  <MovieRow
                    id="continue-watching"
                    title="Continue Watching"
                    movies={continueMediaItems}
                    onPlay={(item) => {
                      const progress = localStorage.getItem(`vidking_progress_${item.id}`);
                      if (progress) {
                        const parsed = JSON.parse(progress);
                        handlePlayMovie(item, parsed.season, parsed.episode);
                      } else {
                        handlePlayMovie(item);
                      }
                    }}
                    onInfo={setSelectedMovieForInfo}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )}

                {/* 2. Trending Now Row */}
                <MovieRow
                  id="trending"
                  title="Trending Now"
                  movies={trending}
                  onPlay={handlePlayMovie}
                  onInfo={setSelectedMovieForInfo}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />

                {/* 3. Popular Movies Row */}
                <MovieRow
                  id="popular-movies"
                  title="Popular Movies"
                  movies={popularMovies}
                  onPlay={handlePlayMovie}
                  onInfo={setSelectedMovieForInfo}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />

                {/* 4. Popular TV Shows Row */}
                <MovieRow
                  id="popular-tv"
                  title="Popular TV Shows"
                  movies={popularTV}
                  onPlay={handlePlayMovie}
                  onInfo={setSelectedMovieForInfo}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />

                {/* 5. Top Rated TV Shows Row */}
                <MovieRow
                  id="top-rated-tv"
                  title="Top Rated TV Shows"
                  movies={topRatedTV}
                  onPlay={handlePlayMovie}
                  onInfo={setSelectedMovieForInfo}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            </div>
          )}

          {activeTab === 'movies' && (
            <div className="space-y-12">
              <HeroBanner
                movie={CURATED_MOVIES[0]}
                onPlay={handlePlayMovie}
                onInfo={setSelectedMovieForInfo}
              />
              <div className="space-y-10 -mt-16 md:-mt-24 relative z-20">
                <MovieRow
                  id="category-popular-movies"
                  title="Popular Movies"
                  movies={popularMovies}
                  onPlay={handlePlayMovie}
                  onInfo={setSelectedMovieForInfo}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
                <MovieRow
                  id="category-curated-movies"
                  title="RE-FLIX Curated Blockbusters"
                  movies={CURATED_MOVIES}
                  onPlay={handlePlayMovie}
                  onInfo={setSelectedMovieForInfo}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            </div>
          )}

          {activeTab === 'tv' && (
            <div className="space-y-12">
              <HeroBanner
                movie={CURATED_TV_SHOWS[0]}
                onPlay={handlePlayMovie}
                onInfo={setSelectedMovieForInfo}
              />
              <div className="space-y-10 -mt-16 md:-mt-24 relative z-20">
                <MovieRow
                  id="category-popular-tv"
                  title="Popular TV Series"
                  movies={popularTV}
                  onPlay={handlePlayMovie}
                  onInfo={setSelectedMovieForInfo}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
                <MovieRow
                  id="category-top-tv"
                  title="Top Rated TV Series"
                  movies={topRatedTV}
                  onPlay={handlePlayMovie}
                  onInfo={setSelectedMovieForInfo}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="pt-28 px-4 md:px-12 space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">My List</h1>
                <p className="text-xs text-gray-500 font-mono">Your personalized queue saved in client browser storage</p>
              </div>

              {favoriteMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {favoriteMovies.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => setSelectedMovieForInfo(movie)}
                      className="aspect-[2/3] bg-[#181818] rounded-md overflow-hidden relative group cursor-pointer border border-white/5 hover:border-white/20 transition-transform duration-300 transform hover:scale-[1.03]"
                    >
                      <img
                        src={movie.poster_path && movie.poster_path.trim() !== '' ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`) : 'https://via.placeholder.com/500x750/141414/ffffff?text=RE-FLIX'}
                        alt={movie.title || movie.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <h3 className="font-bold text-xs md:text-sm text-white truncate">{movie.title || movie.name}</h3>
                        <div className="flex items-center text-[10px] text-green-500 font-mono mt-0.5">
                          <Star className="w-2.5 h-2.5 fill-green-500 mr-0.5" />
                          {movie.vote_average.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-36 space-y-4">
                  <p className="text-gray-400 text-sm md:text-base">Your watchlist is currently empty.</p>
                  <p className="text-gray-600 text-xs">Add titles from the browse sections using the "+" button to populate your custom queue.</p>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="bg-white text-black font-bold text-xs px-5 py-2.5 rounded hover:bg-white/90 transition-transform active:scale-95 cursor-pointer"
                  >
                    Explore Popular Titles
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* Bottom Status Bar (Simulating App UI) */}
      <footer className="px-4 md:px-12 py-5 bg-[#141414] border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-500 space-y-2 sm:space-y-0 font-mono mt-12">
        <div className="flex space-x-4 uppercase tracking-widest text-center sm:text-left">
          <span>Session ID: RF-92384</span>
          <span>Vidking Player Active</span>
        </div>
        <div className="flex space-x-2">
          <span className="px-1.5 py-0.5 border border-white/10 rounded">4K UHD</span>
          <span className="px-1.5 py-0.5 border border-white/10 rounded">5.1 SURROUND</span>
        </div>
      </footer>

      {/* Detail Modal Overlay */}
      {selectedMovieForInfo && (
        <DetailModal
          movie={selectedMovieForInfo}
          onClose={() => setSelectedMovieForInfo(null)}
          onPlay={handlePlayMovie}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Full-Screen Video Player Overlay */}
      {selectedMovieForPlay && (
        <PlayerModal
          movie={selectedMovieForPlay}
          season={playSeason}
          episode={playEpisode}
          onClose={() => setSelectedMovieForPlay(null)}
          onProgressUpdate={() => continueWatching.refresh()}
        />
      )}
    </div>
  );
}
