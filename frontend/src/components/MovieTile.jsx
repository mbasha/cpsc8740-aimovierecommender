export default function MovieTile({ movie, onClick }) {
  const genres = movie.genres
    .split("|")
    .slice(0, 2)
    .join(" · ");

  return (
    <div
      style={styles.tile}
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#1a1a1a";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = movie.isNew ? "#85B7EB" : "#e0dfd8";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{
        ...styles.poster,
        background: movie.isNew ? "#E6F1FB" : "#f0efea",
      }}>
        {movie.isNew
          ? <span style={styles.newLabel}>new</span>
          : <span style={styles.posterIcon}>🎬</span>
        }
      </div>
      <div style={styles.info}>
        <div style={styles.title}>{movie.title}</div>
        <div style={styles.meta}>{genres}</div>
        <div style={styles.score}>★ {movie.estimatedRating.toFixed(1)}</div>
        {movie.isNew && (
          <span style={styles.newBadge}>new</span>
        )}
      </div>
    </div>
  );
}

const styles = {
  tile: {
    background: "#fff",
    border: "1px solid #e0dfd8",
    borderRadius: "10px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "border-color 0.15s ease, transform 0.15s ease",
  },
  poster: {
    height: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  posterIcon: {
    fontSize: "32px",
  },
  newLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#185FA5",
  },
  info: {
    padding: "10px",
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
  meta: {
    fontSize: "11px",
    color: "#aaa",
    marginBottom: "4px",
  },
  score: {
    fontSize: "11px",
    color: "#555",
    marginBottom: "4px",
  },
  newBadge: {
    background: "#E6F1FB",
    color: "#0C447C",
    border: "1px solid #85B7EB",
    borderRadius: "20px",
    padding: "2px 8px",
    fontSize: "10px",
  },
};