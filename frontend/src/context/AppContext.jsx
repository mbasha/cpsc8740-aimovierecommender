import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [hiddenMovies, setHiddenMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  // movieMeta: {[movieId]: {title, genres}} — populated from all sources
  const [movieMeta, setMovieMeta] = useState({});

  function registerMovieMeta(movies) {
    if (!movies?.length) return;
    setMovieMeta(prev => {
      const next = { ...prev };
      movies.forEach(m => {
        if (m.movieId && m.title) {
          next[m.movieId] = { title: m.title, genres: m.genres || "" };
        }
      });
      return next;
    });
  }

  function initFromLogin(userData) {
    setUser(userData);
    setHiddenMovies(userData.hidden || []);
    setWatchlist(userData.watchlist || []);

    // Seed movieMeta from ALL sources including ratedMovies
    const allMovies = [
      ...(userData.recommendations || []),
      ...(userData.hidden || []),
      ...(userData.watchlist || []),
      ...(userData.ratedMovies || []),
    ];
    registerMovieMeta(allMovies);

    if (userData.recommendations?.length > 0 && !userData.isNew) {
      // Don't pre-populate — checkin handles routing
    }
  }

  const refreshRecommendations = useCallback(async (currentUser, currentHidden, newRecs) => {
    const hiddenIds = new Set(currentHidden.map(h => h.movieId));

    // Preserve isNew only for genuinely new movies
    const prevIds = new Set(recommendations.map(r => r.movieId));
    let filtered = newRecs
      .filter(r => !hiddenIds.has(r.movieId))
      .map(r => ({ ...r, isNew: !prevIds.has(r.movieId) }));

    registerMovieMeta(filtered);

    // Fill to 10 if needed
    let attempts = 0;
    while (filtered.length < 10 && attempts < 5) {
      try {
        const res = await axios.post(`${API}/api/next`, {
          username: currentUser.username,
          currentIds: filtered.map(r => r.movieId),
          hiddenIds: [...hiddenIds, ...filtered.map(r => r.movieId)],
        });
        if (res.data.recommendation) {
          const rep = { ...res.data.recommendation, isNew: true };
          filtered = [...filtered, rep];
          registerMovieMeta([rep]);
        } else break;
      } catch { break; }
      attempts++;
    }

    setRecommendations(filtered);
  }, [recommendations]);

  const hideMovie = useCallback(async (movie) => {
    const newHidden = [...hiddenMovies, movie];
    const newRecs = recommendations.filter(r => r.movieId !== movie.movieId);
    setHiddenMovies(newHidden);

    try {
      await axios.post(`${API}/api/hidden/add`, { username: user.username, movie });
    } catch {}

    try {
      const res = await axios.post(`${API}/api/next`, {
        username: user.username,
        currentIds: newRecs.map(r => r.movieId),
        hiddenIds: newHidden.map(r => r.movieId),
      });
      if (res.data.recommendation) {
        const rep = { ...res.data.recommendation, isNew: true };
        registerMovieMeta([rep]);
        setRecommendations([...newRecs, rep]);
      } else {
        setRecommendations(newRecs);
      }
    } catch {
      setRecommendations(newRecs);
    }
  }, [hiddenMovies, recommendations, user]);

  const unhideMovie = useCallback(async (movieId) => {
    const movie = hiddenMovies.find(m => m.movieId === movieId);
    setHiddenMovies(prev => prev.filter(m => m.movieId !== movieId));
    try {
      await axios.post(`${API}/api/hidden/remove`, { username: user.username, movieId });
    } catch {}
    if (movie) setRecommendations(prev => [...prev, { ...movie, isNew: false }]);
  }, [hiddenMovies, user]);

  const addToWatchlist = useCallback(async (movie) => {
    if (watchlist.find(m => m.movieId === movie.movieId)) return;
    const item = { movieId: movie.movieId, title: movie.title, genres: movie.genres, estimatedRating: movie.estimatedRating };
    setWatchlist(prev => [...prev, item]);
    try {
      await axios.post(`${API}/api/watchlist/add`, { username: user.username, movie: item });
    } catch {}
  }, [watchlist, user]);

  const removeFromWatchlist = useCallback(async (movieId) => {
    setWatchlist(prev => prev.filter(m => m.movieId !== movieId));
    try {
      await axios.post(`${API}/api/watchlist/remove`, { username: user.username, movieId });
    } catch {}
  }, [user]);

  const rateMovie = useCallback(async (movieId, rating, removeFromWatchlistAfter = false) => {
    if (!user) return;

    // Ensure meta is stored
    const knownMovie = [...recommendations, ...hiddenMovies, ...watchlist].find(m => m.movieId === movieId);
    if (knownMovie) registerMovieMeta([knownMovie]);

    const updatedUser = { ...user, ratings: { ...user.ratings, [String(movieId)]: rating } };
    setUser(updatedUser);

    if (removeFromWatchlistAfter) {
      setWatchlist(prev => prev.filter(m => m.movieId !== movieId));
      try {
        await axios.post(`${API}/api/watchlist/remove`, { username: user.username, movieId });
      } catch {}
    }

    try {
      // Send movieMeta so the server can store title/genres in catalog
      const metaToSend = knownMovie
        ? [{ movieId: knownMovie.movieId, title: knownMovie.title, genres: knownMovie.genres }]
        : [];

      const res = await axios.post(`${API}/api/rate`, {
        username: user.username,
        character: user.character || character?.id || "",
        ratings: { [String(movieId)]: rating },
        movieMeta: metaToSend,
      });
      await refreshRecommendations(updatedUser, hiddenMovies, res.data.recommendations);
    } catch (e) {
      console.error("Failed to rate movie", e);
    }
  }, [user, character, hiddenMovies, recommendations, watchlist, refreshRecommendations]);

  const rateWatchlistMovie = useCallback((movieId, rating) => {
    return rateMovie(movieId, rating, true);
  }, [rateMovie]);

  return (
    <AppContext.Provider value={{
      user, setUser,
      character, setCharacter,
      recommendations, setRecommendations,
      hiddenMovies,
      watchlist,
      movieMeta,
      registerMovieMeta,
      hideMovie,
      unhideMovie,
      addToWatchlist,
      removeFromWatchlist,
      rateMovie,
      rateWatchlistMovie,
      initFromLogin,
      refreshRecommendations,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}