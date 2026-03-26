export default function MovieTile({ movie, onClick, onHide, hideLabel = "Hide" }) {
  const genres = movie.genres
    .split("|")
    .slice(0, 2)
    .join(" · ");

  function handleHide(e) {
    e.stopPropagation();
    onHide();
  }

  return (
    <div
      style={{
        ...styles.tile,
        border: movie.isNew ? "2px solid #85B7EB" : "1px solid #e0dfd8",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#1a1a1a";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = movie.isNew ? "#85B7EB" : "#e0dfd8";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={styles.posterWrapper} onClick={onClick}>
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            style={styles.posterImg}
          />
        ) : (
          <div style={styles.posterPlaceholder}>
            <div style={styles.posterTitle}>{movie.title}</div>
          </div>
        )}
        {movie.isNew && <div style={styles.newRibbon}>New</div>}
      </div>
      <div style={styles.info} onClick={onClick}>
        <div style={styles.title}>{movie.title}</div>
        <div style={styles.genres}>{genres}</div>
        <div style={styles.scoreRow}>
          <span style={styles.matchScore}>
            Match: {movie.estimatedRating.toFixed(2)}
          </span>
        </div>
      </div>
      <button style={styles.hideBtn} onClick={handleHide}>
        {hideLabel}
      </button>
    </div>
  );
}

const styles = {
  tile: {
    background: "#fff",
    borderRadius: "10px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "border-color 0.15s ease, transform 0.15s ease",
    display: "flex",
    flexDirection: "column",
  },
  posterWrapper: {
    position: "relative",
    width: "100%",
    paddingTop: "150%",
    overflow: "hidden",
    background: "#f0efea",
  },
  posterImg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  posterPlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px",
    background: "#f0efea",
  },
  posterTitle: {
    fontSize: "11px",
    color: "#888",
    textAlign: "center",
    lineHeight: "1.4",
  },
  newRibbon: {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "#E6F1FB",
    color: "#0C447C",
    border: "1px solid #85B7EB",
    borderRadius: "20px",
    padding: "2px 8px",
    fontSize: "10px",
    fontWeight: "500",
  },
  info: {
    padding: "10px 10px 4px",
    flex: 1,
  },
  title: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: "3px",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  genres: {
    fontSize: "11px",
    color: "#aaa",
    marginBottom: "6px",
  },
  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  matchScore: {
    fontSize: "11px",
    color: "#555",
  },
  hideBtn: {
    width: "100%",
    padding: "6px",
    fontSize: "11px",
    background: "none",
    color: "#aaa",
    border: "none",
    borderTop: "1px solid #f0efea",
    cursor: "pointer",
    textAlign: "center",
  },
};