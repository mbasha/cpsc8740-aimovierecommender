import { useState, useEffect, useRef } from "react";
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

const TABS = ["Recommendations", "Watchlist", "Rated", "Hidden"];

export default function Recommendations() {
  const {
    user, setUser,
    recommendations,
    hiddenMovies,
    watchlist,
    movieMeta,
    registerMovieMeta,
    hideMovie,
    unhideMovie,
    addToWatchlist,
    removeFromWatchlist,
    rateMovie,
    rateWatchlistMovie,
    refreshRecommendations,
  } = useApp();

  const [activeTab, setActiveTab] = useState("Recommendations");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [posters, setPosters] = useState({});
  const [tmdbData, setTmdbData] = useState({});
  const [fetchedIds, setFetchedIds] = useState(new Set());
  const [ratingInProgress, setRatingInProgress] = useState(new Set());
  const fetchingRef = useRef(new Set());

  const characterLabel = CHARACTER_LABELS[user?.character] || "your crew";

  function fetchMovieTmdb(rec) {
    if (!rec?.title || fetchingRef.current.has(rec.movieId)) return;
    fetchingRef.current.add(rec.movieId);

    axios.get(`${API}/api/movie`, { params: { title: rec.title } })
      .then(res => {
        const data = res.data;
        setTmdbData(prev => ({ ...prev, [rec.movieId]: data }));
        if (data.posterUrl) {
          setPosters(prev => ({ ...prev, [rec.movieId]: data.posterUrl }));
        }
        registerMovieMeta([{ ...rec, title: rec.title }]);
      })
      .catch(() => {})
      .finally(() => {
        setFetchedIds(prev => new Set([...prev, rec.movieId]));
      });
  }

  // Fetch TMDB for all movies in all lists
  useEffect(() => {
    const allMovies = [...recommendations, ...hiddenMovies, ...watchlist];
    allMovies.forEach(rec => {
      if (!fetchedIds.has(rec.movieId)) fetchMovieTmdb(rec);
    });
  }, [recommendations.length, hiddenMovies.length, watchlist.length]);

  // Also fetch when new recommendations come in
  useEffect(() => {
    recommendations.forEach(rec => {
      if (!fetchedIds.has(rec.movieId)) fetchMovieTmdb(rec);
    });
  }, [recommendations]);

  // Fetch TMDB for rated movies using movieMeta titles
  useEffect(() => {
    if (activeTab !== "Rated") return;
    Object.keys(user?.ratings || {}).forEach(movieIdStr => {
      const id = parseInt(movieIdStr);
      const meta = movieMeta[id];
      if (meta?.title && !fetchedIds.has(id)) {
        fetchMovieTmdb({ movieId: id, title: meta.title, genres: meta.genres });
      } else if (!meta?.title) {
        // Mark as fetched so we don't show skeleton forever for unknown movies
        setFetchedIds(prev => new Set([...prev, id]));
      }
    });
  }, [activeTab, movieMeta]);

  async function handleWatchlistRate(movieId, rating) {
    setRatingInProgress(prev => new Set([...prev, movieId]));
    await rateWatchlistMovie(movieId, rating);
    setRatingInProgress(prev => { const n = new Set(prev); n.delete(movieId); return n; });
  }

  async function handleReRate(movieId, rating) {
    // Update user ratings locally
    const updatedUser = { ...user, ratings: { ...user.ratings, [String(movieId)]: rating } };
    setUser(updatedUser);

    // Submit and refresh recommendations
    try {
      const knownMovie = movieMeta[movieId];
      const metaToSend = knownMovie
        ? [{ movieId, title: knownMovie.title, genres: knownMovie.genres }]
        : [];

      const res = await axios.post(`${API}/api/rate`, {
        username: user.username,
        character: user.character || "",
        ratings: { [String(movieId)]: rating },
        movieMeta: metaToSend,
      });
      await refreshRecommendations(updatedUser, hiddenMovies, res.data.recommendations);
    } catch (e) {
      console.error("Re-rate failed", e);
    }
  }

  function getDisplayMovies() {
    switch (activeTab) {
      case "Recommendations": return recommendations;
      case "Watchlist": return watchlist;
      case "Hidden": return hiddenMovies;
      default: return [];
    }
  }

  const displayMovies = getDisplayMovies();

  function tabStyle(tab) {
    const isActive = activeTab === tab;
    return {
      padding: "10px 20px",
      fontSize: "14px",
      background: "none",
      border: "none",
      borderBottom: isActive ? "2.5px solid var(--tsr-purple)" : "2.5px solid transparent",
      color: isActive ? "var(--tsr-navy)" : "var(--tsr-text-muted)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      marginBottom: "-1.5px",
      fontFamily: "inherit",
      fontWeight: isActive ? "700" : "400",
    };
  }

  return (
    <div className="light-grid-bg" style={styles.page}>
      <div style={styles.container}>
        <div style={styles.nav}>
          <div style={styles.navLeft}>
            <img src="/topshelficon.png" alt="" style={styles.navIcon} />
            <span style={styles.logo}>Top Shelf Rentals</span>
          </div>
          <div style={styles.userBadge}>{user?.username}</div>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>
            {activeTab === "Recommendations" ? `Curated by ${characterLabel}` : activeTab}
          </h1>
          <p style={styles.subtitle}>
            {activeTab === "Recommendations" && "Click any title for details and where to stream."}
            {activeTab === "Watchlist" && "Movies you want to watch. Rate them once you've seen them."}
            {activeTab === "Hidden" && "Hidden movies. Unhide to add back to recommendations."}
            {activeTab === "Rated" && "All movies you've rated. Click stars to re-rate."}
          </p>
        </div>

        <div style={styles.tabBar}>
          {TABS.map(tab => (
            <button key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>
              {tab}
              {tab === "Watchlist" && watchlist.length > 0 && <span style={styles.tabCount}>{watchlist.length}</span>}
              {tab === "Hidden" && hiddenMovies.length > 0 && <span style={styles.tabCount}>{hiddenMovies.length}</span>}
              {tab === "Rated" && Object.keys(user?.ratings || {}).length > 0 && (
                <span style={styles.tabCount}>{Object.keys(user.ratings).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Rated tab */}
        {activeTab === "Rated" && (
          <div style={styles.ratedList}>
            {Object.keys(user?.ratings || {}).length === 0 ? (
              <div style={styles.emptyState}>No rated movies yet.</div>
            ) : (
              Object.entries(user?.ratings || {})
                .sort((a, b) => b[1] - a[1])
                .map(([movieId, rating]) => {
                  const id = parseInt(movieId);
                  const meta = movieMeta[id];
                  const isFetched = fetchedIds.has(id);

                  return (
                    <RatedRow
                      key={movieId}
                      movieId={id}
                      rating={rating}
                      title={meta?.title}
                      tmdb={tmdbData[id]}
                      poster={posters[id]}
                      isFetched={isFetched}
                      hasMeta={!!meta?.title}
                      onReRate={r => handleReRate(id, r)}
                    />
                  );
                })
            )}
          </div>
        )}

        {/* Other tabs */}
        {activeTab !== "Rated" && (
          <div>
            {displayMovies.length === 0 ? (
              <div style={styles.emptyState}>
                {activeTab === "Hidden" && "No hidden movies yet."}
                {activeTab === "Watchlist" && "No movies saved yet. Add from your recommendations."}
                {activeTab === "Recommendations" && "No recommendations yet."}
              </div>
            ) : (
              <div style={styles.grid}>
                {displayMovies.map(rec => {
                  const isFetched = fetchedIds.has(rec.movieId);
                  const isRating = ratingInProgress.has(rec.movieId);
                  if (!isFetched || isRating) return <MovieTileSkeleton key={rec.movieId} />;
                  return (
                    <MovieTile
                      key={rec.movieId}
                      movie={{ ...rec, posterUrl: posters[rec.movieId] }}
                      communityRating={tmdbData[rec.movieId]?.rating}
                      onClick={() => setSelectedMovie({
                        ...rec,
                        posterUrl: posters[rec.movieId],
                        tmdbData: tmdbData[rec.movieId],
                      })}
                      onHide={() => {
                        if (activeTab === "Hidden") unhideMovie(rec.movieId);
                        else if (activeTab === "Watchlist") removeFromWatchlist(rec.movieId);
                        else hideMovie(rec);
                      }}
                      hideLabel={activeTab === "Hidden" ? "Unhide" : activeTab === "Watchlist" ? "Remove" : "Hide"}
                      onAddToWatchlist={activeTab === "Recommendations" ? () => addToWatchlist(rec) : null}
                      isInWatchlist={!!watchlist.find(w => w.movieId === rec.movieId)}
                      onRate={activeTab === "Watchlist" ? r => handleWatchlistRate(rec.movieId, r) : null}
                      showRateButton={activeTab === "Watchlist"}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onHide={activeTab !== "Hidden" ? () => { hideMovie(selectedMovie); setSelectedMovie(null); } : null}
          onAddToWatchlist={activeTab === "Recommendations" ? () => { addToWatchlist(selectedMovie); setSelectedMovie(null); } : null}
          isInWatchlist={!!watchlist.find(w => w.movieId === selectedMovie?.movieId)}
          onRate={r => rateMovie(selectedMovie.movieId, r)}
        />
      )}
    </div>
  );
}

function RatedRow({ movieId, rating, title, tmdb, poster, isFetched, hasMeta, onReRate }) {
  const [hovered, setHovered] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  function handleRate(star) {
    setCurrentRating(star);
    onReRate(star);
  }

  // If we have no metadata at all, don't show skeleton forever — show unknown
  const showSkeleton = !isFetched && hasMeta;

  return (
    <div style={styles.ratedRow}>
      <div style={styles.ratedPoster}>
        {showSkeleton ? (
          <div className="skeleton" style={{ width: "100%", height: "100%" }} />
        ) : poster ? (
          <img src={poster} alt="" style={styles.ratedPosterImg} />
        ) : (
          <div style={styles.ratedPosterFallback} />
        )}
      </div>
      <div style={styles.ratedInfo}>
        <div style={styles.ratedTitle}>
          {showSkeleton ? (
            <div className="skeleton" style={{ height: "14px", width: "55%", borderRadius: "4px" }} />
          ) : (
            title || <span style={{ color: "var(--tsr-text-muted)", fontStyle: "italic" }}>Unknown title</span>
          )}
        </div>
        <div style={styles.ratedMeta}>
          {showSkeleton ? (
            <div className="skeleton" style={{ height: "11px", width: "35%", borderRadius: "4px", marginTop: "4px" }} />
          ) : (
            <>
              {tmdb?.releaseDate ? tmdb.releaseDate.split("-")[0] : ""}
              {tmdb?.rating > 0 ? ` · ★ ${Number(tmdb.rating).toFixed(1)} community` : ""}
            </>
          )}
        </div>
      </div>
      <div style={styles.ratedScore}>
        <div style={styles.ratedStars}>
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              style={{
                ...styles.ratedStarBtn,
                color: s <= (hovered || currentRating) ? "var(--tsr-yellow)" : "var(--tsr-border)",
              }}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => handleRate(s)}
            >★</button>
          ))}
        </div>
        <div style={styles.ratedScoreLabel}>Your rating: {currentRating} / 5</div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", paddingBottom: "48px" },
  container: { maxWidth: "1040px", margin: "0 auto", padding: "0 40px" },
  nav: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "18px 0", borderBottom: "1.5px solid var(--tsr-border)", marginBottom: "32px",
  },
  navLeft: { display: "flex", alignItems: "center", gap: "10px" },
  navIcon: { width: "28px", height: "28px", objectFit: "contain" },
  logo: { fontSize: "15px", fontWeight: "700", color: "var(--tsr-navy)" },
  userBadge: {
    fontSize: "13px", color: "var(--tsr-text-muted)",
    background: "#fff", border: "1px solid var(--tsr-border)",
    borderRadius: "8px", padding: "6px 14px",
  },
  header: { marginBottom: "20px" },
  title: { fontSize: "26px", fontWeight: "700", color: "var(--tsr-navy)", marginBottom: "6px" },
  subtitle: { fontSize: "14px", color: "var(--tsr-text-muted)" },
  tabBar: { display: "flex", marginBottom: "28px", borderBottom: "1.5px solid var(--tsr-border)" },
  tabCount: {
    background: "var(--tsr-warm-gray)", color: "var(--tsr-text-muted)",
    borderRadius: "20px", padding: "1px 7px", fontSize: "11px",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" },
  emptyState: { fontSize: "14px", color: "var(--tsr-text-muted)", padding: "48px 0", textAlign: "center" },
  ratedList: { display: "flex", flexDirection: "column", gap: "8px" },
  ratedRow: {
    display: "flex", alignItems: "center", gap: "16px",
    background: "#fff", border: "1px solid var(--tsr-border)",
    borderRadius: "10px", padding: "12px 16px",
  },
  ratedPoster: {
    width: "40px", height: "56px", borderRadius: "4px",
    overflow: "hidden", background: "var(--tsr-warm-gray)", flexShrink: 0,
  },
  ratedPosterImg: { width: "100%", height: "100%", objectFit: "cover" },
  ratedPosterFallback: { width: "100%", height: "100%", background: "var(--tsr-warm-gray)" },
  ratedInfo: { flex: 1 },
  ratedTitle: { fontSize: "14px", fontWeight: "500", color: "var(--tsr-navy)", marginBottom: "3px" },
  ratedMeta: { fontSize: "12px", color: "var(--tsr-text-muted)" },
  ratedScore: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" },
  ratedStars: { display: "flex", gap: "2px" },
  ratedStarBtn: {
    fontSize: "18px", background: "none", border: "none",
    cursor: "pointer", padding: "1px", lineHeight: 1,
    transition: "color 0.1s", fontFamily: "inherit",
  },
  ratedScoreLabel: { fontSize: "11px", color: "var(--tsr-text-muted)" },
};