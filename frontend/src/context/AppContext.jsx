import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  return (
    <AppContext.Provider value={{
      user, setUser,
      character, setCharacter,
      recommendations, setRecommendations
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}