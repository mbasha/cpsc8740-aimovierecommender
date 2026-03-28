import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function MovieModal({
  movie,
  onClose,
  onHide,
  onAddToWatchlist,
  isInWatchlist,
}) {
  const [details, setDetails] = useState(movie.tmdbData || null);
  const [loading, setLoading] = useState(!movie.tmdbData);

  useEffect(() => {
    if (movie.tmdbData) {
      setDetails(movie.tmdbData);
      setLoading(false);
      return;
    }
    async function fetchDetails() {
      try {
        const res = await axios.get(`${API}/api/movie`, {
          params: { title: movie.title }
        });
        setDetails(res.data);
      } catch (e) {
        console.error("Failed to fetch movie details", e);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [movie.title, movie.tmdbData]);

  const genres = movie.genres ? movie.genres.split("|").join(" · ") : "";

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        <div style={styles.modalRow}>
          <div style={styles.poster}>
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} style={styles.posterImg} />
            ) : (
              <div className="skeleton" style={{ width: "100%", height: "100%" }} />
            )}
          </div>
          <div style={styles.content}>
            <div style={styles.title}>{movie.title}</div>
            <div style={styles.metaRow}>
              {loading ? (
                <>
                  <div className="skeleton" style={{ height: "26px", width: "56px", borderRadius: "20px" }} />
                  <div className="skeleton" style={{ height: "26px", width: "130px", borderRadius: "20px" }} />
                  <div className="skeleton" style={{ height: "26px", width: "110px", borderRadius: "20px" }} />
                </>
              ) : (
                <>
                  {details?.releaseDate && (
                    <span style={styles.metaItem}>
                      {details.releaseDate.split("-")[0]}
                    </span>
                  )}
                  {details?.rating > 0 && (
                    <span style={styles.metaItem}>
                      ★ {Number(details.rating).toFixed(1)} community
                    </span>
                  )}
                  {movie.estimatedRating && (
                    <span style={{ ...styles.metaItem, ...styles.metaItemAccent }}>
                      {movie.estimatedRating.toFixed(2)} / 5.0 match
                    </span>
                  )}
                </>
              )}
            </div>
            {genres && <div style={styles.genres}>{genres}</div>}

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div className="skeleton" style={{ height: "14px", width: "100%", borderRadius: "4px" }} />
                <div className="skeleton" style={{ height: "14px", width: "95%", borderRadius: "4px" }} />
                <div className="skeleton" style={{ height: "14px", width: "85%", borderRadius: "4px" }} />
                <div className="skeleton" style={{ height: "14px", width: "70%", borderRadius: "4px" }} />
              </div>
            ) : (
              details?.overview && (
                <p style={styles.overview}>{details.overview}</p>
              )
            )}

            {loading ? (
              <div>
                <div className="skeleton" style={{ height: "12px", width: "100px", marginBottom: "10px", borderRadius: "4px" }} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <div className="skeleton" style={{ height: "32px", width: "80px", borderRadius: "20px" }} />
                  <div className="skeleton" style={{ height: "32px", width: "90px", borderRadius: "20px" }} />
                </div>
              </div>
            ) : details?.streaming?.length > 0 ? (
              <div>
                <div style={styles.streamLabel}>Where to watch</div>
                <div style={styles.streamPills}>
                  {details.streaming.map(s => (
                    <a
                      key={s.name}
                      href={s.link}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.pill}
                    >
                      {s.name}
                    </a>
                  ))}
                </div>
              </div>
            ) : !loading && (
              <div style={styles.noStream}>
                Not currently available on major streaming platforms.
              </div>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <div style={styles.footerLeft}>
            {onHide && (
              <button style={styles.btnSecondary} onClick={onHide}>
                Not for me
              </button>
            )}
            {onAddToWatchlist && (
              <button
                style={{
                  ...styles.btnWatchlist,
                  opacity: isInWatchlist ? 0.5 : 1,
                }}
                onClick={onAddToWatchlist}
                disabled={isInWatchlist}
              >
                {isInWatchlist ? "In watchlist" : "+ Add to watchlist"}
              </button>
            )}
          </div>
          <button style={styles.btnClose} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(26,31,58,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: 100,
  },
  modal: {
    background: "#fff",
    border: "1.5px solid var(--tsr-border)",
    borderRadius: "16px",
    padding: "28px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "85vh",
    overflowY: "auto",
  },
  modalRow: {
    display: "flex",
    gap: "24px",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  poster: {
    width: "120px",
    height: "178px",
    background: "var(--tsr-warm-gray)",
    borderRadius: "10px",
    flexShrink: 0,
    overflow: "hidden",
  },
  posterImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: 0,
  },
  title: {
    fontSize: "20px",
    fontWeight: "600",
    color: "var(--tsr-navy)",
    lineHeight: "1.3",
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    minHeight: "32px",
  },
  metaItem: {
    fontSize: "12px",
    color: "var(--tsr-text-muted)",
    background: "var(--tsr-warm-gray)",
    border: "1px solid var(--tsr-border)",
    borderRadius: "20px",
    padding: "4px 12px",
    whiteSpace: "nowrap",
  },
  metaItemAccent: {
    background: "var(--tsr-accent-light)",
    color: "var(--tsr-purple)",
    borderColor: "var(--tsr-purple)",
  },
  genres: {
    fontSize: "13px",
    color: "var(--tsr-text-muted)",
  },
  overview: {
    fontSize: "14px",
    color: "#3a3550",
    lineHeight: "1.7",
  },
  streamLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--tsr-text-muted)",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  streamPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  pill: {
    background: "var(--tsr-warm-gray)",
    border: "1px solid var(--tsr-border)",
    borderRadius: "20px",
    padding: "6px 16px",
    fontSize: "13px",
    color: "var(--tsr-navy)",
    textDecoration: "none",
    whiteSpace: "nowrap",
    fontWeight: "500",
  },
  noStream: {
    fontSize: "13px",
    color: "var(--tsr-text-muted)",
    fontStyle: "italic",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1.5px solid var(--tsr-border)",
    paddingTop: "16px",
  },
  footerLeft: {
    display: "flex",
    gap: "8px",
  },
  btnSecondary: {
    padding: "9px 16px",
    fontSize: "13px",
    background: "#fff",
    color: "var(--tsr-text-muted)",
    border: "1px solid var(--tsr-border)",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnWatchlist: {
    padding: "9px 16px",
    fontSize: "13px",
    background: "var(--tsr-accent-light)",
    color: "var(--tsr-purple)",
    border: "1px solid var(--tsr-purple)",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "500",
  },
  btnClose: {
    padding: "9px 20px",
    fontSize: "13px",
    background: "var(--tsr-navy)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "500",
  },
};