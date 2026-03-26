import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [hiddenMovies, setHiddenMovies] = useState([]);
  const [showHidden, setShowHidden] = useState(false);

  function hideMovie(movie) {
    setHiddenMovies(prev => {
      if (prev.find(m => m.movieId === movie.movieId)) return prev;
      return [...prev, movie];
    });
    setRecommendations(prev => prev.filter(r => r.movieId !== movie.movieId));
  }

  function unhideMovie(movieId) {
    const movie = hiddenMovies.find(m => m.movieId === movieId);
    setHiddenMovies(prev => prev.filter(m => m.movieId !== movieId));
    if (movie) {
      setRecommendations(prev => [...prev, movie]);
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