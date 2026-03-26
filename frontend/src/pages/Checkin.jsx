import { useState } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";

const API = import.meta.env.VITE_API_URL;

const CHECKIN_LINES = {
  randy: "You're back. Good. Rule number two of movie recommendations: always report back. Did you watch anything on the list? Be straight with me.",
  valets: "YOOOO you're back! Did you watch anything?? Tell us everything.",
  abed: "You're back. Consistent return behavior suggests investment in the system. Did you watch anything from the list? I'd like to update my model.",
  default: "Welcome back. Did you watch anything from your last list?",
};

export default function Checkin() {
  const { user, setRecommendations } = useApp();
  const [watched, setWatched] = useState({});
  const [loading, setLoading] = useState(false);

  const previousRecs = user?.recommendations || [];
  const characterId = user?.character || "default";
  const checkinLine = CHECKIN_LINES[characterId] || CHECKIN_LINES.default;

  function toggleWatched(movieId, value) {
    setWatched(prev => ({ ...prev, [String(movieId)]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/checkin`, {
        username: user.username,
        watched,
      });
      setRecommendations(res.data.recommendations);
    } catch (e) {
      console.error("Checkin failed", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.emoji}>🎬</div>
          <p style={styles.loadingText}>Updating your list...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>welcome back, {user?.username}.</h1>
          <div style={styles.bubble}>{checkinLine}</div>
          {characterId !== "default" && (
            <div style={styles.attribution}>
              — {characterId === "randy" ? "Randy" : characterId === "valets" ? "The Valets" : "Abed"}
            </div>
          )}
        </div>

        <div style={styles.list}>
          {previousRecs.map(rec => (
            <div key={rec.movieId} style={styles.row}>
              <div style={styles.posterThumb}>🎬</div>
              <div style={styles.movieInfo}>
                <div style={styles.movieTitle}>{rec.title}</div>
                <div style={styles.movieGenres}>{rec.genres.replaceAll("|", " · ")}</div>
              </div>
              <div style={styles.btnPair}>
                <button
                  style={{
                    ...styles.btnWatched,
                    ...(watched[String(rec.movieId)] === true ? styles.btnWatchedActive : {})
                  }}
                  onClick={() => toggleWatched(rec.movieId, true)}
                >
                  watched it
                </button>
                <button
                  style={{
                    ...styles.btnNotYet,
                    ...(watched[String(rec.movieId)] === false ? styles.btnNotYetActive : {})
                  }}
                  onClick={() => toggleWatched(rec.movieId, false)}
                >
                  not yet
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <button style={styles.btnSubmit} onClick={handleSubmit}>
            update my list
          </button>
          <button
            style={styles.btnSkip}
            onClick={() => setRecommendations(previousRecs)}
          >
            skip, show my last list
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "48px 24px",
    display: "flex",
    justifyContent: "center",
  },
  container: {
    maxWidth: "600px",
    width: "100%",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "500",
    marginBottom: "16px",
    color: "#1a1a1a",
  },
  bubble: {
    background: "#f5f4ef",
    border: "1px solid #e0dfd8",
    borderRadius: "12px",
    padding: "16px 20px",
    fontSize: "14px",
    color: "#333",
    lineHeight: "1.6",
    fontStyle: "italic",
    marginBottom: "6px",
  },
  attribution: {
    fontSize: "12px",
    color: "#aaa",
    paddingLeft: "4px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "28px",
  },
  row: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    background: "#fff",
    border: "1px solid #e0dfd8",
    borderRadius: "10px",
    padding: "12px 16px",
  },
  posterThumb: {
    width: "44px",
    height: "44px",
    background: "#f0efea",
    border: "1px solid #e0dfd8",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: "2px",
  },
  movieGenres: {
    fontSize: "12px",
    color: "#aaa",
  },
  btnPair: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },
  btnWatched: {
    padding: "7px 14px",
    fontSize: "12px",
    background: "#fff",
    color: "#555",
    border: "1px solid #e0dfd8",
    borderRadius: "8px",
  },
  btnWatchedActive: {
    background: "#1a1a1a",
    color: "#fff",
    border: "1px solid #1a1a1a",
  },
  btnNotYet: {
    padding: "7px 14px",
    fontSize: "12px",
    background: "#fff",
    color: "#555",
    border: "1px solid #e0dfd8",
    borderRadius: "8px",
  },
  btnNotYetActive: {
    background: "#f0efea",
    color: "#1a1a1a",
    border: "1px solid #ccc",
  },
  footer: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  btnSubmit: {
    padding: "11px 28px",
    fontSize: "14px",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "500",
  },
  btnSkip: {
    padding: "11px 20px",
    fontSize: "13px",
    background: "#fff",
    color: "#888",
    border: "1px solid #e0dfd8",
    borderRadius: "8px",
  },
  loadingCard: {
    background: "#fff",
    border: "1px solid #e0dfd8",
    borderRadius: "16px",
    padding: "48px 40px",
    textAlign: "center",
    maxWidth: "420px",
    margin: "100px auto",
  },
  emoji: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  loadingText: {
    fontSize: "15px",
    color: "#555",
  },
};