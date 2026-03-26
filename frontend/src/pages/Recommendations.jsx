import { useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";
import MovieTile from "../components/MovieTile";
import MovieModal from "../components/MovieModal";

const API = import.meta.env.VITE_API_URL;

const CHARACTER_LABELS = {
  randy: "Randy Meeks",
  valets: "The Valets",
  abed: "Abed Nadir",
};

export default function Recommendations() {
  const {
    user,
    recommendations,
    hiddenMovies,
    hideMovie,
    unhideMovie,
    showHidden,
    setShowHidden,
  } = useApp();

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [posters, setPosters] = useState({});

  const characterLabel = CHARACTER_LABELS[user?.character] || "your crew";

  // Fetch all posters in parallel on load
  useEffect(() => {
    async function fetchPosters() {
      const allMovies = [...recommendations, ...hiddenMovies];
      const results = await Promise.allSettled(
        allMovies.map(async rec => {
          try {
            const res = await axios.get(`${API}/api/movie`, {
              params: { title: rec.title }
            });
            return { movieId: rec.movieId, posterUrl: res.data.posterUrl };
          } catch {
            return { movieId: rec.movieId, posterUrl: null };
          }
        })
      );
      const posterMap = {};
      results.forEach(result => {
        if (result.status === "fulfilled" && result.value.posterUrl) {
          posterMap[result.value.movieId] = result.value.posterUrl;
        }
      });
      setPosters(posterMap);
    }
    if (recommendations.length > 0) {
      fetchPosters();
    }
  }, [recommendations.length]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.nav}>
          <span style={styles.logo}>🎬 AI Movie Recommender</span>
          <div style={styles.navRight}>
            <button
              style={styles.navBtn}
              onClick={() => setShowHidden(!showHidden)}
            >
              {showHidden ? "Back to recommendations" : `Hidden movies (${hiddenMovies.length})`}
            </button>
            <span style={styles.username}>{user?.username}</span>
          </div>
        </div>

        {showHidden ? (
          <div>
            <h1 style={styles.title}>Hidden Movies</h1>
            <p style={styles.subtitle}>
              Unhide a movie to add it back to your recommendations.
            </p>
            {hiddenMovies.length === 0 ? (
              <p style={styles.emptyState}>No hidden movies yet.</p>
            ) : (
              <div style={styles.grid}>
                {hiddenMovies.map(rec => (
                  <MovieTile
                    key={rec.movieId}
                    movie={{ ...rec, posterUrl: posters[rec.movieId] }}
                    onClick={() => setSelectedMovie({ ...rec, posterUrl: posters[rec.movieId] })}
                    onHide={() => unhideMovie(rec.movieId)}
                    hideLabel="Unhide"
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={styles.header}>
              <h1 style={styles.title}>
                Your picks, courtesy of {characterLabel}
              </h1>
              <p style={styles.subtitle}>
                Click any title for details and where to stream.
              </p>
            </div>
            <div style={styles.grid}>
              {recommendations.map(rec => (
                <MovieTile
                  key={rec.movieId}
                  movie={{ ...rec, posterUrl: posters[rec.movieId] }}
                  onClick={() => setSelectedMovie({ ...rec, posterUrl: posters[rec.movieId] })}
                  onHide={() => hideMovie(rec)}
                  hideLabel="Hide"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onHide={() => {
            hideMovie(selectedMovie);
            setSelectedMovie(null);
          }}
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
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e0dfd8",
  },
  logo: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#1a1a1a",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  navBtn: {
    fontSize: "12px",
    color: "#888",
    background: "none",
    border: "1px solid #e0dfd8",
    borderRadius: "8px",
    padding: "6px 12px",
    cursor: "pointer",
  },
  username: {
    fontSize: "13px",
    color: "#aaa",
  },
  header: {
    marginBottom: "24px",
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
  emptyState: {
    fontSize: "14px",
    color: "#aaa",
    marginTop: "24px",
  },
};