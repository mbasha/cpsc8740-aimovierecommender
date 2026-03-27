import { useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";
import MovieTile from "../components/MovieTile";
import MovieTileSkeleton from "../components/MovieTileSkeleton";
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
  const [loadedPosters, setLoadedPosters] = useState(new Set());

  const characterLabel = CHARACTER_LABELS[user?.character] || "your crew";
  const displayMovies = showHidden ? hiddenMovies : recommendations;

  // Fetch posters — each one resolves independently
  useEffect(() => {
    const allMovies = [...recommendations, ...hiddenMovies];
    const toFetch = allMovies.filter(r => !posters[r.movieId]);

    toFetch.forEach(async rec => {
      try {
        const res = await axios.get(`${API}/api/movie`, {
          params: { title: rec.title }
        });
        if (res.data.posterUrl) {
          setPosters(prev => ({ ...prev, [rec.movieId]: res.data.posterUrl }));
          setLoadedPosters(prev => new Set([...prev, rec.movieId]));
        } else {
          setLoadedPosters(prev => new Set([...prev, rec.movieId]));
        }
      } catch {
        setLoadedPosters(prev => new Set([...prev, rec.movieId]));
      }
    });
  }, [recommendations.length, hiddenMovies.length]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.nav}>
          <div style={styles.navLeft}>
            <span style={styles.logo}>AI Movie Recommender</span>
          </div>
          <div style={styles.navRight}>
            <button
              style={styles.navBtn}
              onClick={() => setShowHidden(!showHidden)}
            >
              {showHidden
                ? "← Back to recommendations"
                : `Hidden (${hiddenMovies.length})`}
            </button>
            <div style={styles.userBadge}>{user?.username}</div>
          </div>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>
            {showHidden
              ? "Hidden Movies"
              : `Your picks, courtesy of ${characterLabel}`}
          </h1>
          <p style={styles.subtitle}>
            {showHidden
              ? "Unhide a movie to add it back to your list."
              : "Click any title for details and where to stream."}
          </p>
        </div>

        {displayMovies.length === 0 && showHidden ? (
          <div style={styles.emptyState}>No hidden movies yet.</div>
        ) : (
          <div style={styles.grid}>
            {displayMovies.map(rec => {
              const posterLoaded = loadedPosters.has(rec.movieId);
              if (!posterLoaded) {
                return <MovieTileSkeleton key={rec.movieId} />;
              }
              return (
                <MovieTile
                  key={rec.movieId}
                  movie={{ ...rec, posterUrl: posters[rec.movieId] }}
                  onClick={() => setSelectedMovie({
                    ...rec,
                    posterUrl: posters[rec.movieId]
                  })}
                  onHide={() => showHidden
                    ? unhideMovie(rec.movieId)
                    : hideMovie(rec)
                  }
                  hideLabel={showHidden ? "Unhide" : "Hide"}
                />
              );
            })}
          </div>
        )}
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onHide={() => {
            if (!showHidden) hideMovie(selectedMovie);
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
    background: "#f7f6f2",
    padding: "0 0 48px",
  },
  container: {
    maxWidth: "1040px",
    margin: "0 auto",
    padding: "0 40px",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 0",
    borderBottom: "1px solid #e0dfd8",
    marginBottom: "40px",
  },
  navLeft: {},
  logo: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a1a1a",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  navBtn: {
    fontSize: "13px",
    color: "#888",
    background: "none",
    border: "1px solid #e0dfd8",
    borderRadius: "8px",
    padding: "7px 14px",
    cursor: "pointer",
  },
  userBadge: {
    fontSize: "13px",
    color: "#aaa",
    background: "#fff",
    border: "1px solid #e0dfd8",
    borderRadius: "8px",
    padding: "7px 14px",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#888",
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