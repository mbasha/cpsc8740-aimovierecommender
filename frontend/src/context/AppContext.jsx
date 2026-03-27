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

  // Called after login — seeds state from server response
  function initFromLogin(userData) {
    setUser(userData);
    setHiddenMovies(userData.hidden || []);
    setWatchlist(userData.watchlist || []);
    if (userData.recommendations?.length > 0 && !userData.isNew) {
      // Don't pre-populate — let checkin handle it
    }
  }

  // Hide a movie and fetch a replacement
  const hideMovie = useCallback(async (movie) => {
    const newHidden = [...hiddenMovies, movie];
    const newRecs = recommendations.filter(r => r.movieId !== movie.movieId);

    setHiddenMovies(newHidden);
    setRecommendations(newRecs);

    // Persist to server
    try {
      await axios.post(`${API}/api/hidden/add`, {
        username: user.username,
        movie,
      });
    } catch (e) {
      console.error("Failed to persist hidden movie", e);
    }

    // Fetch replacement
    try {
      const currentIds = newRecs.map(r => r.movieId);
      const hiddenIds = newHidden.map(r => r.movieId);
      const watchlistIds = watchlist.map(r => r.movieId);

      const res = await axios.post(`${API}/api/next`, {
        username: user.username,
        currentIds,
        hiddenIds: [...hiddenIds, ...watchlistIds],
      });

      if (res.data.recommendation) {
        setRecommendations(prev => [...prev, res.data.recommendation]);
      }
    } catch (e) {
      console.error("Failed to fetch replacement", e);
    }
  }, [hiddenMovies, recommendations, watchlist, user]);

  // Unhide a movie
  const unhideMovie = useCallback(async (movieId) => {
    const movie = hiddenMovies.find(m => m.movieId === movieId);
    setHiddenMovies(prev => prev.filter(m => m.movieId !== movieId));

    try {
      await axios.post(`${API}/api/hidden/remove`, {
        username: user.username,
        movieId,
      });
    } catch (e) {
      console.error("Failed to remove from hidden", e);
    }

    if (movie) {
      setRecommendations(prev => [...prev, { ...movie, isNew: true }]);
    }
  }, [hiddenMovies, user]);

  // Add to watchlist
  const addToWatchlist = useCallback(async (movie) => {
    if (watchlist.find(m => m.movieId === movie.movieId)) return;

    const item = {
      movieId: movie.movieId,
      title: movie.title,
      genres: movie.genres,
      estimatedRating: movie.estimatedRating,
    };

    setWatchlist(prev => [...prev, item]);

    try {
      await axios.post(`${API}/api/watchlist/add`, {
        username: user.username,
        movie: item,
      });
    } catch (e) {
      console.error("Failed to add to watchlist", e);
    }
  }, [watchlist, user]);

  // Remove from watchlist
  const removeFromWatchlist = useCallback(async (movieId) => {
    setWatchlist(prev => prev.filter(m => m.movieId !== movieId));

    try {
      await axios.post(`${API}/api/watchlist/remove`, {
        username: user.username,
        movieId,
      });
    } catch (e) {
      console.error("Failed to remove from watchlist", e);
    }
  }, [user]);

  // Rate a movie from watchlist
  const rateWatchlistMovie = useCallback(async (movieId, rating) => {
    try {
      await axios.post(`${API}/api/rate`, {
        username: user.username,
        character: user.character || character?.id || "",
        ratings: { [String(movieId)]: rating },
      });

      // Remove from watchlist after rating
      removeFromWatchlist(movieId);
    } catch (e) {
      console.error("Failed to rate watchlist movie", e);
    }
  }, [user, character, removeFromWatchlist]);

  return (
    <AppContext.Provider value={{
      user, setUser,
      character, setCharacter,
      recommendations, setRecommendations,
      hiddenMovies,
      watchlist,
      hideMovie,
      unhideMovie,
      addToWatchlist,
      removeFromWatchlist,
      rateWatchlistMovie,
      initFromLogin,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}