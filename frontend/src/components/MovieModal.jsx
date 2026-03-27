import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function MovieModal({ movie, onClose, onHide }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [movie.title]);

  const genres = movie.genres.split("|").join(" · ");

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        <div style={styles.modalRow}>
          <div style={styles.poster}>
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                style={styles.posterImg}
              />
            ) : (
              <div className="skeleton" style={{ width: "100%", height: "100%" }} />
            )}
          </div>
          <div style={styles.content}>
            <div style={styles.title}>{movie.title}</div>
            <div style={styles.metaRow}>
              {loading ? (
                <>
                  <div className="skeleton" style={{ height: "24px", width: "60px", borderRadius: "20px" }} />
                  <div className="skeleton" style={{ height: "24px", width: "120px", borderRadius: "20px" }} />
                  <div className="skeleton" style={{ height: "24px", width: "100px", borderRadius: "20px" }} />
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
                  <span style={styles.metaItem}>
                    {movie.estimatedRating.toFixed(2)} / 5.0 match
                  </span>
                </>
              )}
            </div>
            <div style={styles.genres}>{genres}</div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div className="skeleton" style={{ height: "13px", width: "100%", borderRadius: "4px" }} />
                <div className="skeleton" style={{ height: "13px", width: "95%", borderRadius: "4px" }} />
                <div className="skeleton" style={{ height: "13px", width: "88%", borderRadius: "4px" }} />
                <div className="skeleton" style={{ height: "13px", width: "70%", borderRadius: "4px" }} />
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
                  <div className="skeleton" style={{ height: "30px", width: "80px", borderRadius: "20px" }} />
                  <div className="skeleton" style={{ height: "30px", width: "90px", borderRadius: "20px" }} />
                  <div className="skeleton" style={{ height: "30px", width: "70px", borderRadius: "20px" }} />
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
          <button style={styles.btnHide} onClick={onHide}>
            Not for me
          </button>
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
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: 100,
  },
  modal: {
    background: "#fff",
    border: "1px solid #e0dfd8",
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
    background: "#f0efea",
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
    fontWeight: "500",
    color: "#1a1a1a",
    lineHeight: "1.3",
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    minHeight: "30px",
  },
  metaItem: {
    fontSize: "12px",
    color: "#666",
    background: "#f7f6f2",
    border: "1px solid #e0dfd8",
    borderRadius: "20px",
    padding: "4px 12px",
    whiteSpace: "nowrap",
  },
  genres: {
    fontSize: "13px",
    color: "#aaa",
  },
  overview: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.7",
  },
  streamLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#888",
    marginBottom: "8px",
  },
  streamPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  pill: {
    background: "#f7f6f2",
    border: "1px solid #e0dfd8",
    borderRadius: "20px",
    padding: "6px 16px",
    fontSize: "13px",
    color: "#555",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  noStream: {
    fontSize: "13px",
    color: "#aaa",
    fontStyle: "italic",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #e0dfd8",
    paddingTop: "16px",
  },
  btnHide: {
    padding: "9px 20px",
    fontSize: "13px",
    background: "#fff",
    color: "#888",
    border: "1px solid #e0dfd8",
    borderRadius: "8px",
    cursor: "pointer",
  },
  btnClose: {
    padding: "9px 20px",
    fontSize: "13px",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};