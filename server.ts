import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { CURATED_MOVIES, CURATED_TV_SHOWS } from './src/data/curatedMovies';

dotenv.config();

const app = express();
const PORT = 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';

// Parse JSON request bodies
app.use(express.json());

// Helper function to fetch from TMDB with fallback
async function fetchFromTMDB(endpoint: string, queryParams: Record<string, string> = {}) {
  if (!TMDB_API_KEY) {
    console.error('❌ ERROR: TMDB_API_KEY is missing! Make sure your .env file is created and contains your key.');
    throw new Error('No TMDB API Key configured');
  }

  // PROXY FIX: Using api.tmdb.org instead of api.themoviedb.org to bypass ISP DNS blocks
  const url = new URL(`https://api.tmdb.org/3/${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  for (const [key, value] of Object.entries(queryParams)) {
    url.searchParams.append(key, value);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB responded with status ${response.status}`);
  }
  return response.json();
}

// 1. Trending Route
app.get('/api/trending', async (req: Request, res: Response) => {
  try {
    const data = await fetchFromTMDB('trending/all/week');
    // Ensure all items have a media_type
    const results = data.results.map((item: any) => ({
      ...item,
      media_type: item.media_type || (item.title ? 'movie' : 'tv')
    }));
    res.json({ results });
  } catch (error) {
    console.log('TMDB Trending fetch failed, using curated fallback:', (error as Error).message);
    const merged = [
      ...CURATED_MOVIES.slice(0, 5),
      ...CURATED_TV_SHOWS.slice(0, 5)
    ].sort(() => 0.5 - Math.random());
    res.json({ results: merged });
  }
});

// 2. Popular Movies Route
app.get('/api/movies/popular', async (req: Request, res: Response) => {
  try {
    const data = await fetchFromTMDB('movie/popular');
    const results = data.results.map((item: any) => ({
      ...item,
      media_type: 'movie'
    }));
    res.json({ results });
  } catch (error) {
    console.log('TMDB Popular Movies fetch failed, using curated fallback:', (error as Error).message);
    res.json({ results: CURATED_MOVIES });
  }
});

// 3. Popular TV Shows Route
app.get('/api/tv/popular', async (req: Request, res: Response) => {
  try {
    const data = await fetchFromTMDB('tv/popular');
    const results = data.results.map((item: any) => ({
      ...item,
      media_type: 'tv'
    }));
    res.json({ results });
  } catch (error) {
    console.log('TMDB Popular TV fetch failed, using curated fallback:', (error as Error).message);
    res.json({ results: CURATED_TV_SHOWS });
  }
});

// 4. Top Rated TV Shows Route
app.get('/api/tv/top-rated', async (req: Request, res: Response) => {
  try {
    const data = await fetchFromTMDB('tv/top_rated');
    const results = data.results.map((item: any) => ({
      ...item,
      media_type: 'tv'
    }));
    res.json({ results });
  } catch (error) {
    console.log('TMDB Top Rated TV fetch failed, using curated fallback:', (error as Error).message);
    res.json({ results: [...CURATED_TV_SHOWS].reverse() });
  }
});

// 5. Search Route
app.get('/api/search', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query) {
    return res.json({ results: [] });
  }

  try {
    const data = await fetchFromTMDB('search/multi', { query });
    const results = data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
    res.json({ results });
  } catch (error) {
    console.log(`TMDB Search failed for query "${query}", using curated fallback:`, (error as Error).message);
    const qLower = query.toLowerCase();
    const filteredMovies = CURATED_MOVIES.filter(m => 
      m.title?.toLowerCase().includes(qLower) || m.overview.toLowerCase().includes(qLower)
    );
    const filteredTV = CURATED_TV_SHOWS.filter(t => 
      t.name?.toLowerCase().includes(qLower) || t.overview.toLowerCase().includes(qLower)
    );
    res.json({ results: [...filteredMovies, ...filteredTV] });
  }
});

// 6. TV Season Detail Route
app.get('/api/tv/:id/season/:season', async (req: Request, res: Response) => {
  const showId = parseInt(req.params.id);
  const seasonNum = parseInt(req.params.season);

  try {
    const data = await fetchFromTMDB(`tv/${showId}/season/${seasonNum}`);
    res.json(data);
  } catch (error) {
    console.log(`TMDB Season fetch failed for show ${showId} S${seasonNum}, using curated fallback:`, (error as Error).message);
    
    // Find the show in curated TV shows
    const show = CURATED_TV_SHOWS.find(s => s.id === showId);
    if (show && show.seasons) {
      const seasonObj = show.seasons.find(s => s.season_number === seasonNum);
      if (seasonObj) {
        return res.json(seasonObj);
      }
    }

    // Fallback: Generate dynamic season episodes
    const episodeCount = 10;
    const episodes = Array.from({ length: episodeCount }, (_, i) => ({
      episode_number: i + 1,
      name: `Episode ${i + 1}`,
      overview: `This is a dynamically generated fallback description for Episode ${i + 1} of Season ${seasonNum}. Configured to stream flawlessly via the Vidking embedding engine.`
    }));

    res.json({
      season_number: seasonNum,
      name: `Season ${seasonNum}`,
      episode_count: episodeCount,
      episodes
    });
  }
});

// Start express server with Vite middleware support
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve client-side entry point
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RE-FLIX Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
