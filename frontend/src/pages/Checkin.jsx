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

const CHARACTER_NAMES = {
  randy: "Randy",
  valets: "The Valets",
  abed: "Abed",
};

function InlineStarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px", marginTop: "8px" }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          style={{
            fontSize: "22px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: star <= (hovered || value) ? "#1a1a1a" : "#e0dfd8",
            padding: "1px",
            lineHeight: 1,
          }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
      {value > 0 && (
        <span style={{ fontSize: "12px", color: "#aaa", marginLeft: "6px" }}>
          {value} / 5
        </span>
      )}
    </div>
  );
}

export default function Checkin() {
  const { user, setRecommendations } = useApp();
  const [watched, setWatched] = useState({});
  const [watchedRatings, setWatchedRatings] = useState({});
  const [loading, setLoading] = useState(false);

  const previousRecs = user?.recommendations || [];
  const characterId = user?.character || "default";
  const checkinLine = CHECKIN_LINES[characterId] || CHECKIN_LINES.default;
  const characterName = CHARACTER_NAMES[characterId];

  function toggleWatched(movieId, value) {
    setWatched(prev => ({ ...prev, [String(movieId)]: value }));
    if (!value) {
      setWatchedRatings(prev => {
        const next = { ...prev };
        delete next[String(movieId)];
        return next;
      });
    }
  }

  function setRating(movieId, rating) {
    setWatchedRatings(prev => ({ ...prev, [String(movieId)]: rating }));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const mergedRatings = {};
      Object.entries(watched).forEach(([movieId, didWatch]) => {
        if (didWatch) {
          mergedRatings[movieId] = watchedRatings[movieId] || 4.0;
        }
      });

      const res = await axios.post(`${API}/api/checkin`, {
        username: user.username,
        watched: mergedRatings,
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
        <div style={styles.container}>
          <div style={{ marginBottom: "40px" }}>
            <div className="skeleton" style={{ height: "32px", width: "300px", marginBottom: "16px", borderRadius: "6px" }} />
            <div className="skeleton" style={{ height: "80px", width: "100%", borderRadius: "12px" }} />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "68px", borderRadius: "10px", marginBottom: "10px" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome back, {user?.username}.</h1>
          <div style={styles.bubble}>{checkinLine}</div>
          {characterName && (
            <div style={styles.attribution}>— {characterName}</div>
          )}
        </div>

        <div style={styles.list}>
          {previousRecs.map(rec => (
            <div key={rec.movieId} style={styles.row}>
              <div style={styles.movieInfo}>
                <div style={styles.movieTitle}>{rec.title}</div>
                <div style={styles.movieGenres}>
                  {rec.genres.replaceAll("|", " · ")}
                </div>
                {watched[String(rec.movieId)] === true && (
                  <InlineStarRating
                    value={watchedRatings[String(rec.movieId)] || 0}
                    onChange={rating => setRating(rec.movieId, rating)}
                  />
                )}
              </div>
              <div style={styles.btnPair}>
                <button
                  style={{
                    ...styles.btnWatched,
                    ...(watched[String(rec.movieId)] === true
                      ? styles.btnWatchedActive
                      : {})
                  }}
                  onClick={() => toggleWatched(rec.movieId, true)}
                >
                  Watched it
                </button>
                <button
                  style={{
                    ...styles.btnNotYet,
                    ...(watched[String(rec.movieId)] === false
                      ? styles.btnNotYetActive
                      : {})
                  }}
                  onClick={() => toggleWatched(rec.movieId, false)}
                >
                  Not yet
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <button style={styles.btnSubmit} onClick={handleSubmit}>
            Update my list →
          </button>
          <button
            style={styles.btnSkip}
            onClick={() => setRecommendations(previousRecs)}
          >
            Skip, show my last list
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f7f6f2",
    padding: "64px 40px",
    display: "flex",
    justifyContent: "center",
  },
  container: {
    maxWidth: "640px",
    width: "100%",
  },
  header: {
    marginBottom: "36px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "500",
    marginBottom: "20px",
    color: "#1a1a1a",
  },
  bubble: {
    background: "#fff",
    border: "1px solid #e0dfd8",
    borderRadius: "14px",
    padding: "18px 22px",
    fontSize: "15px",
    color: "#444",
    lineHeight: "1.7",
    fontStyle: "italic",
    marginBottom: "8px",
  },
  attribution: {
    fontSize: "13px",
    color: "#aaa",
    paddingLeft: "4px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "32px",
  },
  row: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    background: "#fff",
    border: "1px solid #e0dfd8",
    borderRadius: "12px",
    padding: "14px 18px",
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: "3px",
  },
  movieGenres: {
    fontSize: "12px",
    color: "#aaa",
  },
  btnPair: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
    alignSelf: "flex-start",
  },
  btnWatched: {
    padding: "7px 14px",
    fontSize: "12px",
    background: "#fff",
    color: "#555",
    border: "1px solid #e0dfd8",
    borderRadius: "8px",
    cursor: "pointer",
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
    cursor: "pointer",
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
    padding: "12px 28px",
    fontSize: "14px",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "500",
    cursor: "pointer",
  },
  btnSkip: {
    padding: "12px 20px",
    fontSize: "13px",
    background: "#fff",
    color: "#888",
    border: "1px solid #e0dfd8",
    borderRadius: "10px",
    cursor: "pointer",
  },
};