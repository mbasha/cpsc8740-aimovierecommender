import { useApp } from "./context/AppContext";
import Login from "./pages/Login";
import CharacterSelect from "./pages/CharacterSelect";
import RatingFlow from "./pages/RatingFlow";
import Recommendations from "./pages/Recommendations";
import Checkin from "./pages/Checkin";

export default function App() {
  const { user, character, recommendations } = useApp();

  // Not logged in
  if (!user) return <Login />;

  // Returning user with existing recommendations — go to checkin
  if (!user.isNew && user.recommendations?.length > 0 && recommendations.length === 0) {
    return <Checkin />;
  }

  // Has fresh recommendations from this session — show library
  if (recommendations.length > 0) return <Recommendations />;

  // New user needs to pick character
  if (!character) return <CharacterSelect />;

  // Character picked, no recommendations yet — go to rating flow
  return <RatingFlow />;
}