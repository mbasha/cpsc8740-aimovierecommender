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
            {movie.posterUrl || details?.posterUrl ? (
              <img
                src={movie.posterUrl || details?.posterUrl}
                alt={movie.title}
                style={styles.posterImg}
              />
            ) : (
              <div style={styles.posterPlaceholder}>
                <span style={styles.posterPlaceholderText}>{movie.title}</span>
              </div>
            )}
          </div>
          <div style={styles.content}>
            <div style={styles.title}>{movie.title}</div>
            <div style={styles.metaRow}>
              {details?.releaseDate && (
                <span style={styles.metaItem}>
                  {details.releaseDate.split("-")[0]}
                </span>
              )}
              {details?.rating > 0 && (
                <span style={styles.metaItem}>
                  ★ {Number(details.rating).toFixed(1)} community rating
                </span>
              )}
              <span style={styles.metaItem}>
                {movie.estimatedRating.toFixed(2)} / 5.0 match score
              </span>
            </div>
            <div style={styles.genres}>{genres}</div>
            {loading && (
              <div style={styles.loadingText}>Loading details...</div>
            )}
            {details?.overview && (
              <p style={styles.overview}>{details.overview}</p>
            )}
            {details?.streaming?.length > 0 && (
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
            )}
            {!loading && details && !details.streaming?.length && (
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
    background: "rgba(0,0,0,0.45)",
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
    maxWidth: "580px",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  modalRow: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  poster: {
    width: "110px",
    height: "160px",
    background: "#f0efea",
    border: "1px solid #e0dfd8",
    borderRadius: "8px",
    flexShrink: 0,
    overflow: "hidden",
  },
  posterImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  posterPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
  },
  posterPlaceholderText: {
    fontSize: "11px",
    color: "#aaa",
    textAlign: "center",
    lineHeight: "1.4",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#1a1a1a",
    lineHeight: "1.3",
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  metaItem: {
    fontSize: "12px",
    color: "#888",
    background: "#f5f4ef",
    border: "1px solid #e0dfd8",
    borderRadius: "20px",
    padding: "3px 10px",
  },
  genres: {
    fontSize: "12px",
    color: "#888",
  },
  loadingText: {
    fontSize: "13px",
    color: "#aaa",
    fontStyle: "italic",
  },
  overview: {
    fontSize: "13px",
    color: "#555",
    lineHeight: "1.6",
  },
  streamLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#888",
    marginBottom: "6px",
  },
  streamPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  pill: {
    background: "#f5f4ef",
    border: "1px solid #e0dfd8",
    borderRadius: "20px",
    padding: "5px 14px",
    fontSize: "12px",
    color: "#555",
    cursor: "pointer",
    textDecoration: "none",
  },
  noStream: {
    fontSize: "12px",
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
    padding: "8px 20px",
    fontSize: "13px",
    background: "#fff",
    color: "#888",
    border: "1px solid #e0dfd8",
    borderRadius: "8px",
    cursor: "pointer",
  },
  btnClose: {
    padding: "8px 20px",
    fontSize: "13px",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};