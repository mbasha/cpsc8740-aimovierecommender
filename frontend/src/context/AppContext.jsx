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
  // movieMeta: {[movieId]: {title, genres, estimatedRating}} — persists across tab changes
  const [movieMeta, setMovieMeta] = useState({});

  function initFromLogin(userData) {
    setUser(userData);
    setHiddenMovies(userData.hidden || []);
    setWatchlist(userData.watchlist || []);
    // Seed movieMeta from all known movies
    const meta = {};
    const allMovies = [
      ...(userData.recommendations || []),
      ...(userData.hidden || []),
      ...(userData.watchlist || []),
    ];
    allMovies.forEach(m => {
      meta[m.movieId] = { title: m.title, genres: m.genres, estimatedRating: m.estimatedRating };
    });
    setMovieMeta(meta);
  }

  // Register movie metadata whenever we encounter a movie
  function registerMovieMeta(movies) {
    setMovieMeta(prev => {
      const next = { ...prev };
      movies.forEach(m => {
        if (m.movieId && m.title) {
          next[m.movieId] = { title: m.title, genres: m.genres, estimatedRating: m.estimatedRating };
        }
      });
      return next;
    });
  }

  const refreshRecommendations = useCallback(async (currentUser, currentHidden, newRecs) => {
    const hiddenIds = currentHidden.map(h => h.movieId);
    let filtered = newRecs.filter(r => !hiddenIds.includes(r.movieId));
    registerMovieMeta(filtered);

    let attempts = 0;
    while (filtered.length < 10 && attempts < 5) {
      try {
        const res = await axios.post(`${API}/api/next`, {
          username: currentUser.username,
          currentIds: filtered.map(r => r.movieId),
          hiddenIds: [...hiddenIds, ...filtered.map(r => r.movieId)],
        });
        if (res.data.recommendation) {
          filtered = [...filtered, res.data.recommendation];
          registerMovieMeta([res.data.recommendation]);
        } else break;
      } catch { break; }
      attempts++;
    }
    setRecommendations(filtered);
  }, []);

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
        const replacement = res.data.recommendation;
        registerMovieMeta([replacement]);
        setRecommendations([...newRecs, replacement]);
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
    if (movie) setRecommendations(prev => [...prev, { ...movie, isNew: true }]);
  }, [hiddenMovies, user]);

  const addToWatchlist = useCallback(async (movie) => {
    if (watchlist.find(m => m.movieId === movie.movieId)) return;
    const item = {
      movieId: movie.movieId, title: movie.title,
      genres: movie.genres, estimatedRating: movie.estimatedRating,
    };
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

    // Ensure we have meta for this movie
    const knownMovie = [...recommendations, ...hiddenMovies, ...watchlist]
      .find(m => m.movieId === movieId);
    if (knownMovie) {
      registerMovieMeta([knownMovie]);
    }

    const updatedUser = { ...user, ratings: { ...user.ratings, [String(movieId)]: rating } };
    setUser(updatedUser);

    if (removeFromWatchlistAfter) {
      setWatchlist(prev => prev.filter(m => m.movieId !== movieId));
      try {
        await axios.post(`${API}/api/watchlist/remove`, { username: user.username, movieId });
      } catch {}
    }

    try {
      const res = await axios.post(`${API}/api/rate`, {
        username: user.username,
        character: user.character || character?.id || "",
        ratings: { [String(movieId)]: rating },
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