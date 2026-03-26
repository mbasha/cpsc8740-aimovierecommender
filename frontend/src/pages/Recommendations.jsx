import { useState } from "react";
import { useApp } from "../context/AppContext";
import MovieTile from "../components/MovieTile";
import MovieModal from "../components/MovieModal";

export default function Recommendations() {
  const { user, recommendations } = useApp();
  const [selectedMovie, setSelectedMovie] = useState(null);

  const characterLabel = {
    randy: "Randy Meeks",
    valets: "The Valets",
    abed: "Abed Nadir",
  }[user?.character] || "your recommendations";

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.nav}>
            <span style={styles.logo}>🎬 AI Movie Recommender</span>
            <span style={styles.username}>{user?.username}</span>
          </div>
          <h1 style={styles.title}>
            your picks, courtesy of {characterLabel}
          </h1>
          <p style={styles.subtitle}>
            click any title for details and where to stream
          </p>
        </div>

        <div style={styles.grid}>
          {recommendations.map(rec => (
            <MovieTile
              key={rec.movieId}
              movie={rec}
              onClick={() => setSelectedMovie(rec)}
            />
          ))}
        </div>
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 24px",
  },
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "32px",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e0dfd8",
  },
  logo: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#1a1a1a",
  },
  username: {
    fontSize: "13px",
    color: "#aaa",
  },
  title: {
    fontSize: "22px",
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#aaa",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "16px",
  },
};