import { createContext, useContext, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [hiddenMovies, setHiddenMovies] = useState([]);
  const [showHidden, setShowHidden] = useState(false);

  async function hideMovie(movie) {
    const newHidden = [...hiddenMovies, movie];
    const newRecs = recommendations.filter(r => r.movieId !== movie.movieId);

    setHiddenMovies(newHidden);
    setRecommendations(newRecs);

    try {
      const currentIds = newRecs.map(r => r.movieId);
      const hiddenIds = newHidden.map(r => r.movieId);

      const res = await axios.post(`${API}/api/next`, {
        username: user.username,
        currentIds,
        hiddenIds,
      });

      const replacement = res.data.recommendation;
      if (replacement) {
        setRecommendations(prev => [...prev, replacement]);
      }
    } catch (e) {
      console.error("Failed to fetch replacement", e);
    }
  }

  function unhideMovie(movieId) {
    const movie = hiddenMovies.find(m => m.movieId === movieId);
    setHiddenMovies(prev => prev.filter(m => m.movieId !== movieId));
    if (movie) {
      setRecommendations(prev => [...prev, { ...movie, isNew: true }]);
    }
  }

  return (
    <AppContext.Provider value={{
      user, setUser,
      character, setCharacter,
      recommendations, setRecommendations,
      hiddenMovies,
      hideMovie,
      unhideMovie,
      showHidden, setShowHidden,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}