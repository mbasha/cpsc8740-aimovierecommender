import { useState } from "react";

export default function MovieTile({
  movie,
  communityRating,
  onClick,
  onHide,
  hideLabel = "Hide",
  onAddToWatchlist,
  isInWatchlist,
  onRate,
  showRateButton,
}) {
  const [showRating, setShowRating] = useState(false);
  const [hovered, setHovered] = useState(0);

  const genres = movie.genres
    ? movie.genres.split("|").slice(0, 2).join(" · ")
    : "";

  function handleHide(e) {
    e.stopPropagation();
    onHide();
  }

  function handleWatchlist(e) {
    e.stopPropagation();
    if (onAddToWatchlist) onAddToWatchlist();
  }

  function handleRateClick(e) {
    e.stopPropagation();
    setShowRating(true);
  }

  function handleRate(e, star) {
    e.stopPropagation();
    if (onRate) onRate(star);
    setShowRating(false);
  }

  return (
    <div
      style={{
        ...styles.tile,
        border: movie.isNew ? "2px solid var(--tsr-teal)" : "1.5px solid var(--tsr-border)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--tsr-purple)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = movie.isNew ? "var(--tsr-teal)" : "var(--tsr-border)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={styles.posterWrapper} onClick={onClick}>
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt={movie.title} style={styles.posterImg} />
        ) : (
          <div style={styles.posterPlaceholder}>
            <div style={styles.posterTitle}>{movie.title}</div>
          </div>
        )}
        {movie.isNew && (
          <div style={styles.newRibbon}>New</div>
        )}
        {isInWatchlist && (
          <div style={styles.watchlistRibbon}>Saved</div>
        )}
      </div>

      <div style={styles.info} onClick={onClick}>
        <div style={styles.title}>{movie.title}</div>
        {genres && <div style={styles.genres}>{genres}</div>}
        <div style={styles.scoreRow}>
          <span style={styles.communityScore}>
            {communityRating
              ? `★ ${Number(communityRating).toFixed(1)}`
              : "★ —"
            }
          </span>
          <span style={styles.matchScore}>
            {movie.estimatedRating.toFixed(2)} match
          </span>
        </div>
      </div>

      <div style={styles.actions}>
        {showRateButton && !showRating && (
          <button style={styles.actionBtn} onClick={handleRateClick}>
            Rate this
          </button>
        )}
        {showRateButton && showRating && (
          <div style={styles.inlineRating} onClick={e => e.stopPropagation()}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                style={{
                  ...styles.ratingStar,
                  color: star <= hovered ? "var(--tsr-navy)" : "var(--tsr-border)",
                }}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={e => handleRate(e, star)}
              >
                ★
              </button>
            ))}
          </div>
        )}
        {onAddToWatchlist && !showRateButton && (
          <button
            style={{
              ...styles.actionBtn,
              color: isInWatchlist ? "var(--tsr-text-muted)" : "var(--tsr-purple)",
              fontWeight: isInWatchlist ? "400" : "500",
            }}
            onClick={handleWatchlist}
            disabled={isInWatchlist}
          >
            {isInWatchlist ? "Saved" : "+ Watchlist"}
          </button>
        )}
        <button style={styles.hideBtn} onClick={handleHide}>
          {hideLabel}
        </button>
      </div>
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
    background: "var(--tsr-warm-gray)",
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
    background: "var(--tsr-warm-gray)",
  },
  posterTitle: {
    fontSize: "11px",
    color: "var(--tsr-text-muted)",
    textAlign: "center",
    lineHeight: "1.4",
  },
  newRibbon: {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "var(--tsr-teal)",
    color: "#fff",
    borderRadius: "20px",
    padding: "2px 8px",
    fontSize: "10px",
    fontWeight: "600",
  },
  watchlistRibbon: {
    position: "absolute",
    top: "8px",
    left: "8px",
    background: "rgba(255,255,255,0.9)",
    color: "var(--tsr-purple)",
    border: "1px solid var(--tsr-border)",
    borderRadius: "20px",
    padding: "2px 8px",
    fontSize: "10px",
    fontWeight: "500",
  },
  info: {
    padding: "10px 10px 6px",
    flex: 1,
  },
  title: {
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--tsr-navy)",
    marginBottom: "3px",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  genres: {
    fontSize: "11px",
    color: "var(--tsr-text-muted)",
    marginBottom: "6px",
  },
  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  communityScore: {
    fontSize: "11px",
    color: "var(--tsr-navy)",
    fontWeight: "500",
  },
  matchScore: {
    fontSize: "11px",
    color: "var(--tsr-text-muted)",
  },
  actions: {
    display: "flex",
    borderTop: "1px solid var(--tsr-warm-gray)",
  },
  actionBtn: {
    flex: 1,
    padding: "7px 4px",
    fontSize: "11px",
    background: "none",
    color: "var(--tsr-purple)",
    border: "none",
    borderRight: "1px solid var(--tsr-warm-gray)",
    cursor: "pointer",
    textAlign: "center",
    fontFamily: "inherit",
    fontWeight: "500",
  },
  hideBtn: {
    flex: 1,
    padding: "7px 4px",
    fontSize: "11px",
    background: "none",
    color: "var(--tsr-text-muted)",
    border: "none",
    cursor: "pointer",
    textAlign: "center",
    fontFamily: "inherit",
  },
  inlineRating: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2px 0",
    borderRight: "1px solid var(--tsr-warm-gray)",
  },
  ratingStar: {
    fontSize: "16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px",
    lineHeight: 1,
    transition: "color 0.1s",
    fontFamily: "inherit",
  },
};