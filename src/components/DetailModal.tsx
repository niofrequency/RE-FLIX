import React, { useState, useEffect } from 'react';
import { X, Play, Plus, Check, Star, RefreshCw } from 'lucide-react';
import { MediaItem, Season, Episode } from '../types';
import { GENRES } from '../data/curatedMovies';
import { getProgress } from '../hooks/usePlayerProgress';

interface DetailModalProps {
  movie: MediaItem | null;
  onClose: () => void;
  onPlay: (movie: MediaItem, season?: number, episode?: number) => void;
  favorites: number[];
  onToggleFavorite: (movie: MediaItem) => void;
}

export default function DetailModal({
  movie,
  onClose,
  onPlay,
  favorites,
  onToggleFavorite
}: DetailModalProps) {
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [seasonData, setSeasonData] = useState<Season | null>(null);
  const [availableSeasons, setAvailableSeasons] = useState<Season[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [episodeError, setEpisodeError] = useState<string | null>(null);

  useEffect(() => {
    if (!movie) return;

    // Reset states on movie change
    setSelectedSeason(1);
    setSeasonData(null);
    setAvailableSeasons(movie.seasons || []);

    // NEW LOGIC: Fetch full show details to get seasons if they are missing (e.g. from search results)
    if (movie.media_type === 'tv' && (!movie.seasons || movie.seasons.length === 0)) {
      const fetchShowDetails = async () => {
        try {
          const res = await fetch(`/api/tv/${movie.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.seasons) {
              // Filter out "Specials" (Season 0) 
              const realSeasons = data.seasons.filter((s: any) => s.season_number > 0);
              setAvailableSeasons(realSeasons);
            }
          }
        } catch (err) {
          console.error('Error fetching show details:', err);
        }
      };
      fetchShowDetails();
    }
  }, [movie]);

  useEffect(() => {
    if (!movie || movie.media_type !== 'tv') return;

    const fetchSeasonDetails = async () => {
      setIsLoadingEpisodes(true);
      setEpisodeError(null);
      try {
        const res = await fetch(`/api/tv/${movie.id}/season/${selectedSeason}`);
        if (!res.ok) {
          throw new Error('Failed to fetch season episodes');
        }
        const data = await res.json();
        setSeasonData(data);
      } catch (err) {
        console.error('Error fetching season:', err);
        setEpisodeError('Could not load episodes for this season. Please try again.');
      } finally {
        setIsLoadingEpisodes(false);
      }
    };

    fetchSeasonDetails();
  }, [movie, selectedSeason]);

  if (!movie) return null;

  const titleText = movie.title || movie.name || 'Untitled';
  const isFavorite = favorites.includes(movie.id);
  const releaseYear = (movie.release_date || movie.first_air_date || '').split('-')[0] || 'N/A';

  const backdropUrl = movie.backdrop_path && movie.backdrop_path.trim() !== ''
    ? (movie.backdrop_path.startsWith('http') ? movie.backdrop_path : `https://wsrv.nl/?url=image.tmdb.org/t/p/original${movie.backdrop_path}`)
    : 'https://via.placeholder.com/1920x1080/141414/ffffff?text=RE-FLIX';

  const progress = getProgress(movie.id);

  return (
    <div
      id="detail-modal-overlay"
      className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        id="detail-modal-card"
        className="relative bg-[#181818] text-white w-full max-w-3xl rounded-lg overflow-hidden shadow-2xl border border-white/10 my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black text-white p-2 rounded-full border border-white/10 hover:border-white/30 transition-transform active:scale-95 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative aspect-[16/9] w-full bg-black select-none">
          <img
            src={backdropUrl}
            alt={titleText}
            className="w-full h-full object-cover brightness-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/30 to-transparent"></div>

          <div className="absolute bottom-6 left-6 md:left-10 z-10 space-y-3 pr-6">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">
              {titleText}
            </h2>
            <div className="flex items-center space-x-3">
              <button
                id="modal-play-btn"
                onClick={() => {
                  if (movie.media_type === 'tv' && seasonData && seasonData.episodes && seasonData.episodes.length > 0) {
                    onPlay(movie, selectedSeason, seasonData.episodes[0].episode_number);
                  } else {
                    onPlay(movie);
                  }
                }}
                className="flex items-center space-x-1.5 bg-white text-black font-bold px-6 py-2.5 rounded hover:bg-white/95 transition-transform active:scale-95 text-xs md:text-sm cursor-pointer shadow"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Play</span>
              </button>

              <button
                id="modal-watchlist-btn"
                onClick={() => onToggleFavorite(movie)}
                className={`p-2.5 border rounded-full hover:bg-white/10 transition-colors active:scale-90 cursor-pointer ${
                  isFavorite ? 'border-green-500 bg-green-500/15' : 'border-white/30'
                }`}
              >
                {isFavorite ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3.5 text-xs md:text-sm font-medium">
            <span className="text-green-500 font-bold flex items-center font-mono">
              <Star className="w-4 h-4 fill-green-500 text-green-500 inline mr-1" />
              {movie.vote_average.toFixed(1)} Rating
            </span>
            <span className="text-gray-400 font-mono">{releaseYear}</span>
            <span className="border border-white/30 px-1.5 py-0.2 rounded text-[10px] uppercase font-bold text-gray-300 font-sans tracking-wide">
              {movie.media_type === 'movie' ? 'Movie' : 'TV Series'}
            </span>
            {movie.media_type === 'tv' && availableSeasons.length > 0 && (
              <span className="text-gray-400 font-mono">
                {availableSeasons.length} Season{availableSeasons.length > 1 ? 's' : ''}
              </span>
            )}
            {progress && (
              <span className="text-[#e50914] bg-[#e50914]/10 border border-[#e50914]/20 px-2 py-0.5 rounded font-mono text-[11px]">
                Left off at {Math.floor(progress.currentTime / 60)}m ({Math.floor(progress.progress)}%)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed font-normal">
                {movie.overview}
              </p>
            </div>

            <div className="space-y-3 text-xs md:text-sm text-gray-400">
              <div>
                <span className="text-gray-500 block font-semibold">Genres</span>
                <span className="text-gray-300">
                  {movie.genre_ids.map((id) => GENRES[id] || 'Other').join(', ') || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block font-semibold">Original Language</span>
                <span className="text-gray-300 uppercase font-mono">English (EN)</span>
              </div>
            </div>
          </div>

          {movie.media_type === 'tv' && (
            <div className="border-t border-white/10 pt-6 space-y-4" id="series-episodes-section">
              <div className="flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-bold text-white tracking-wide">
                  Episodes
                </h3>

                {availableSeasons.length > 0 && (
                  <select
                    id="season-selector-dropdown"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="bg-[#242424] text-white border border-white/20 px-3.5 py-1.5 rounded-md outline-none text-xs md:text-sm font-semibold cursor-pointer focus:border-red-500 hover:bg-[#323232] transition-colors"
                  >
                    {availableSeasons.map((s) => (
                      <option key={s.season_number} value={s.season_number}>
                        {s.name || `Season ${s.season_number}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-4 pt-2">
                {isLoadingEpisodes ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <RefreshCw className="w-8 h-8 text-[#e50914] animate-spin" />
                    <span className="text-xs text-gray-400 font-mono">Loading Episodes...</span>
                  </div>
                ) : episodeError ? (
                  <div className="text-center py-8 text-gray-400 text-xs md:text-sm">
                    {episodeError}
                  </div>
                ) : seasonData && seasonData.episodes && seasonData.episodes.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {seasonData.episodes.map((episode) => {
                      const isEpisodeProgress =
                        progress &&
                        progress.season === selectedSeason &&
                        progress.episode === episode.episode_number;

                      return (
                        <div
                          key={episode.episode_number}
                          id={`episode-${episode.episode_number}`}
                          onClick={() => onPlay(movie, selectedSeason, episode.episode_number)}
                          className="flex items-start space-x-4 p-3 rounded-lg bg-[#222222] hover:bg-[#2e2e2e] transition-colors cursor-pointer border border-transparent hover:border-white/10 group relative"
                        >
                          <div className="flex-none w-8 text-gray-500 font-extrabold text-sm md:text-base flex items-center justify-center font-mono self-center">
                            <span className="group-hover:hidden">{episode.episode_number}</span>
                            <Play className="w-4 h-4 text-white fill-white hidden group-hover:block ml-1" />
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-1.5">
                              <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-[#e50914] transition-colors">
                                {episode.name}
                              </h4>
                              {isEpisodeProgress && (
                                <span className="text-[10px] text-red-500 font-mono font-bold bg-red-500/10 border border-red-500/20 px-1.5 py-0.2 rounded">
                                  Resumable ({Math.floor(progress.progress)}%)
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] md:text-xs text-gray-400 line-clamp-2 leading-relaxed">
                              {episode.overview}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-xs md:text-sm">
                    No episodes found for this season.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
