import { useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";

const API = import.meta.env.VITE_API_URL;

const CHECKIN_LINES = {
  randy: "You're back. Good. Rule number two of movie recommendations: always report back. Did you watch anything on the list? Be straight with me.",
  valets: "YOOOO you're back! Did you watch anything?? Tell us everything.",
  abed: "You're back. Consistent return behavior suggests investment in the system. Did you watch anything from the list? I'd like to update my model.",
  default: "Welcome back. Did you watch anything from your last list?",
};

const CHARACTER_NAMES = { randy: "Randy", valets: "The Valets", abed: "Abed" };
const CHARACTER_ACCENT = {
  randy: "var(--tsr-red)",
  valets: "var(--tsr-teal)",
  abed: "var(--tsr-purple)",
};

function InlineStarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={inlineStyles.row}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          style={{
            ...inlineStyles.star,
            color: star <= (hovered || value) ? "var(--tsr-yellow)" : "var(--tsr-border)",
          }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >★</button>
      ))}
      {value > 0 && <span style={inlineStyles.label}>{value} / 5</span>}
    </div>
  );
}

const inlineStyles = {
  row: { display: "flex", alignItems: "center", gap: "2px", marginTop: "8px" },
  star: {
    fontSize: "20px", background: "none", border: "none",
    cursor: "pointer", padding: "1px", lineHeight: 1,
    transition: "color 0.1s", fontFamily: "inherit",
  },
  label: { fontSize: "11px", color: "var(--tsr-text-muted)", marginLeft: "4px" },
};

export default function Checkin() {
  const { user, setRecommendations } = useApp();
  const [watched, setWatched] = useState({});
  const [watchedRatings, setWatchedRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [posters, setPosters] = useState({});

  const previousRecs = user?.recommendations || [];
  const characterId = user?.character || "default";
  const checkinLine = CHECKIN_LINES[characterId] || CHECKIN_LINES.default;
  const characterName = CHARACTER_NAMES[characterId];
  const accentColor = CHARACTER_ACCENT[characterId] || "var(--tsr-navy)";

  // Fetch posters for checkin movies
  useEffect(() => {
    previousRecs.forEach(async rec => {
      if (posters[rec.movieId]) return;
      try {
        const res = await axios.get(`${API}/api/movie`, { params: { title: rec.title } });
        if (res.data.posterUrl) {
          setPosters(prev => ({ ...prev, [rec.movieId]: res.data.posterUrl }));
        }
      } catch {}
    });
  }, [previousRecs.length]);

  function toggleWatched(movieId, value) {
    setWatched(prev => ({ ...prev, [String(movieId)]: value }));
    if (!value) {
      setWatchedRatings(prev => { const n = { ...prev }; delete n[String(movieId)]; return n; });
    }
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const mergedRatings = {};
      Object.entries(watched).forEach(([movieId, didWatch]) => {
        if (didWatch) mergedRatings[movieId] = watchedRatings[movieId] || 4.0;
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
        <div style={styles.loadingContainer}>
          <div className="skeleton" style={{ height: "36px", width: "280px", marginBottom: "20px", borderRadius: "6px" }} />
          <div className="skeleton" style={{ height: "80px", width: "100%", marginBottom: "32px", borderRadius: "12px" }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "64px", borderRadius: "10px", marginBottom: "10px" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div className="cyber-bg" style={styles.left}>
        <div style={styles.gridFade} />
        <div style={styles.leftContent}>
          <img src="/topshelficon.png" alt="" style={styles.icon} />
          <div style={styles.eyebrow}>Welcome back, {user?.username}</div>
          <h1 style={styles.title}>Did you watch anything?</h1>
          <div style={styles.bubble}>{checkinLine}</div>
          {characterName && <div style={styles.attribution}>— {characterName}</div>}
          <div style={styles.leftActions}>
            <button style={{ ...styles.btnSubmit, background: accentColor }} onClick={handleSubmit}>
              Update my list →
            </button>
            <button style={styles.btnSkip} onClick={() => setRecommendations(previousRecs)}>
              Skip, show my last list
            </button>
          </div>
        </div>
      </div>

      <div className="light-grid-bg" style={styles.right}>
        <div style={styles.listHeader}>
          <span style={styles.listHeaderText}>Your last recommendations</span>
          <span style={styles.listHeaderCount}>{previousRecs.length} titles</span>
        </div>
        <div style={styles.list}>
          {previousRecs.map(rec => (
            <div key={rec.movieId} style={styles.row}>
              <div style={styles.rowPoster}>
                {posters[rec.movieId] ? (
                  <img src={posters[rec.movieId]} alt="" style={styles.rowPosterImg} />
                ) : (
                  <div className="skeleton" style={{ width: "100%", height: "100%" }} />
                )}
              </div>
              <div style={styles.movieInfo}>
                <div style={styles.movieTitle}>{rec.title}</div>
                <div style={styles.movieGenres}>{rec.genres.replaceAll("|", " · ")}</div>
                {watched[String(rec.movieId)] === true && (
                  <InlineStarRating
                    value={watchedRatings[String(rec.movieId)] || 0}
                    onChange={r => setWatchedRatings(prev => ({ ...prev, [String(rec.movieId)]: r }))}
                  />
                )}
              </div>
              <div style={styles.btnPair}>
                <button
                  style={{
                    ...styles.btnWatched,
                    ...(watched[String(rec.movieId)] === true
                      ? { background: accentColor, color: "#fff", borderColor: accentColor }
                      : {})
                  }}
                  onClick={() => toggleWatched(rec.movieId, true)}
                >Watched</button>
                <button
                  style={{
                    ...styles.btnNotYet,
                    ...(watched[String(rec.movieId)] === false ? styles.btnNotYetActive : {})
                  }}
                  onClick={() => toggleWatched(rec.movieId, false)}
                >Not yet</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" },
  left: {
    position: "relative",
    display: "flex", flexDirection: "column",
    overflow: "hidden",
  },
  gridFade: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse 65% 60% at 50% 45%, #000 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 0,
  },
  leftContent: {
    padding: "56px", flex: 1,
    display: "flex", flexDirection: "column", justifyContent: "center",
    position: "relative", zIndex: 1,
  },
  icon: { width: "40px", height: "40px", objectFit: "contain", marginBottom: "20px" },
  eyebrow: {
    fontSize: "12px", fontWeight: "700", color: "#555e7a",
    textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px",
  },
  title: { fontSize: "36px", fontWeight: "700", color: "#fff", lineHeight: "1.2", marginBottom: "28px" },
  bubble: {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px", padding: "18px 22px", fontSize: "14px",
    color: "#ccc", lineHeight: "1.7", fontStyle: "italic", marginBottom: "8px",
  },
  attribution: { fontSize: "13px", color: "#555e7a", paddingLeft: "4px", marginBottom: "32px" },
  leftActions: { display: "flex", flexDirection: "column", gap: "12px" },
  btnSubmit: {
    padding: "13px 24px", fontSize: "15px", color: "#fff",
    border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer",
  },
  btnSkip: {
    padding: "13px 24px", fontSize: "14px", background: "none",
    color: "#555e7a", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px", cursor: "pointer",
  },
  right: { padding: "48px 40px", overflowY: "auto", maxHeight: "100vh" },
  listHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "16px", paddingBottom: "12px", borderBottom: "1.5px solid var(--tsr-border)",
  },
  listHeaderText: { fontSize: "13px", fontWeight: "700", color: "var(--tsr-navy)" },
  listHeaderCount: { fontSize: "12px", color: "var(--tsr-text-muted)" },
  loadingContainer: { maxWidth: "600px", margin: "0 auto", padding: "64px 40px" },
  list: { display: "flex", flexDirection: "column", gap: "8px" },
  row: {
    display: "flex", gap: "12px", alignItems: "flex-start",
    background: "#fff", border: "1px solid var(--tsr-border)",
    borderRadius: "10px", padding: "10px 14px",
  },
  rowPoster: {
    width: "36px", height: "50px", borderRadius: "4px",
    overflow: "hidden", background: "var(--tsr-warm-gray)", flexShrink: 0,
  },
  rowPosterImg: { width: "100%", height: "100%", objectFit: "cover" },
  movieInfo: { flex: 1 },
  movieTitle: { fontSize: "13px", fontWeight: "500", color: "var(--tsr-navy)", marginBottom: "2px", lineHeight: "1.4" },
  movieGenres: { fontSize: "11px", color: "var(--tsr-text-muted)" },
  btnPair: { display: "flex", gap: "6px", flexShrink: 0, alignSelf: "flex-start" },
  btnWatched: {
    padding: "5px 10px", fontSize: "11px", background: "#fff",
    color: "var(--tsr-text-muted)", border: "1px solid var(--tsr-border)",
    borderRadius: "8px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
  },
  btnNotYet: {
    padding: "5px 10px", fontSize: "11px", background: "#fff",
    color: "var(--tsr-text-muted)", border: "1px solid var(--tsr-border)",
    borderRadius: "8px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
  },
  btnNotYetActive: { background: "var(--tsr-warm-gray)", color: "var(--tsr-navy)" },
};