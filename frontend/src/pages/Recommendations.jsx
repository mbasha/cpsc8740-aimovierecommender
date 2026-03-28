import { useState, useEffect } from "react";
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
    user,
    recommendations,
    hiddenMovies,
    watchlist,
    hideMovie,
    unhideMovie,
    addToWatchlist,
    removeFromWatchlist,
    rateWatchlistMovie,
  } = useApp();

  const [activeTab, setActiveTab] = useState("Recommendations");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [posters, setPosters] = useState({});
  const [loadedPosters, setLoadedPosters] = useState(new Set());
  const [tmdbData, setTmdbData] = useState({});
  const [ratedMovieMeta, setRatedMovieMeta] = useState({});

  const characterLabel = CHARACTER_LABELS[user?.character] || "your crew";

  // Fetch TMDB data and posters for all movies
  useEffect(() => {
    const allMovies = [...recommendations, ...hiddenMovies, ...watchlist];
    const toFetch = allMovies.filter(r => !loadedPosters.has(r.movieId));

    toFetch.forEach(async rec => {
      try {
        const res = await axios.get(`${API}/api/movie`, {
          params: { title: rec.title }
        });
        const data = res.data;
        setTmdbData(prev => ({ ...prev, [rec.movieId]: data }));
        setRatedMovieMeta(prev => ({ ...prev, [rec.movieId]: { title: rec.title, genres: rec.genres } }));
        if (data.posterUrl) {
          setPosters(prev => ({ ...prev, [rec.movieId]: data.posterUrl }));
        }
      } catch {
        // silent fail
      } finally {
        setLoadedPosters(prev => new Set([...prev, rec.movieId]));
      }
    });
  }, [recommendations.length, hiddenMovies.length, watchlist.length]);

  // Fetch TMDB data for rated movies not in other lists
  useEffect(() => {
    if (activeTab !== "Rated") return;
    const ratedIds = Object.keys(user?.ratings || {}).map(Number);
    const knownIds = new Set([...recommendations, ...hiddenMovies, ...watchlist].map(m => m.movieId));
    const unknownIds = ratedIds.filter(id => !knownIds.has(id) && !loadedPosters.has(id));

    // For unknown rated movies we can't easily look up by title without storing it
    // Mark them as loaded so we don't keep retrying
    if (unknownIds.length > 0) {
      setLoadedPosters(prev => {
        const next = new Set(prev);
        unknownIds.forEach(id => next.add(id));
        return next;
      });
    }
  }, [activeTab]);

  function getDisplayMovies() {
    switch (activeTab) {
      case "Recommendations": return recommendations;
      case "Watchlist": return watchlist;
      case "Hidden": return hiddenMovies;
      default: return [];
    }
  }

  const displayMovies = getDisplayMovies();

  // Tab style helper — explicit borderBottomColor on every tab prevents stale underlines
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
      fontWeight: isActive ? "600" : "400",
      transition: "color 0.15s ease",
    };
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Nav */}
        <div style={styles.nav}>
          <div style={styles.navLeft}>
            <img src="/topshelficon.png" alt="" style={styles.navIcon} />
            <span style={styles.logo}>Top Shelf Rentals</span>
          </div>
          <div style={styles.navRight}>
            <div style={styles.userBadge}>{user?.username}</div>
          </div>
        </div>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            {activeTab === "Recommendations"
              ? `Curated by ${characterLabel}`
              : activeTab}
          </h1>
          <p style={styles.subtitle}>
            {activeTab === "Recommendations" && "Click any title for details and where to stream."}
            {activeTab === "Watchlist" && "Movies you want to watch. Rate them once you've seen them to improve your recommendations."}
            {activeTab === "Hidden" && "Movies you've hidden. Unhide to add them back."}
            {activeTab === "Rated" && "All the movies you've rated so far."}
          </p>
        </div>

        {/* Tabs */}
        <div style={styles.tabBar}>
          {TABS.map(tab => (
            <button
              key={tab}
              style={tabStyle(tab)}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === "Watchlist" && watchlist.length > 0 && (
                <span style={styles.tabCount}>{watchlist.length}</span>
              )}
              {tab === "Hidden" && hiddenMovies.length > 0 && (
                <span style={styles.tabCount}>{hiddenMovies.length}</span>
              )}
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
                  const tmdb = tmdbData[id];
                  const meta = ratedMovieMeta[id];
                  const knownMovie = [...recommendations, ...hiddenMovies, ...watchlist]
                    .find(m => m.movieId === id);
                  const title = knownMovie?.title || meta?.title || null;
                  const posterLoaded = loadedPosters.has(id);

                  return (
                    <div key={movieId} style={styles.ratedRow}>
                      <div style={styles.ratedPoster}>
                        {!posterLoaded ? (
                          <div className="skeleton" style={{ width: "100%", height: "100%" }} />
                        ) : posters[id] ? (
                          <img src={posters[id]} alt="" style={styles.ratedPosterImg} />
                        ) : (
                          <div style={styles.ratedPosterFallback} />
                        )}
                      </div>
                      <div style={styles.ratedInfo}>
                        <div style={styles.ratedTitle}>
                          {title || (
                            <span style={{ color: "var(--tsr-text-muted)", fontStyle: "italic" }}>
                              Loading...
                            </span>
                          )}
                        </div>
                        <div style={styles.ratedMeta}>
                          {tmdb?.releaseDate
                            ? tmdb.releaseDate.split("-")[0]
                            : ""}
                          {tmdb?.rating > 0
                            ? ` · ★ ${Number(tmdb.rating).toFixed(1)} community`
                            : ""}
                        </div>
                      </div>
                      <div style={styles.ratedScore}>
                        <div style={styles.ratedStars}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} style={{
                              color: s <= rating ? "var(--tsr-navy)" : "var(--tsr-border)",
                              fontSize: "16px",
                            }}>★</span>
                          ))}
                        </div>
                        <div style={styles.ratedScoreLabel}>Your rating: {rating} / 5</div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* Watchlist, Recommendations, Hidden */}
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
                  const posterLoaded = loadedPosters.has(rec.movieId);
                  if (!posterLoaded) return <MovieTileSkeleton key={rec.movieId} />;
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
                      hideLabel={
                        activeTab === "Hidden" ? "Unhide"
                        : activeTab === "Watchlist" ? "Remove"
                        : "Hide"
                      }
                      onAddToWatchlist={activeTab === "Recommendations"
                        ? () => addToWatchlist(rec)
                        : null
                      }
                      isInWatchlist={!!watchlist.find(w => w.movieId === rec.movieId)}
                      onRate={activeTab === "Watchlist"
                        ? r => rateWatchlistMovie(rec.movieId, r)
                        : null
                      }
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
          onHide={activeTab !== "Hidden" ? () => {
            hideMovie(selectedMovie);
            setSelectedMovie(null);
          } : null}
          onAddToWatchlist={activeTab === "Recommendations" ? () => {
            addToWatchlist(selectedMovie);
            setSelectedMovie(null);
          } : null}
          isInWatchlist={!!watchlist.find(w => w.movieId === selectedMovie?.movieId)}
        />
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--tsr-cream)",
    paddingBottom: "48px",
  },
  container: {
    maxWidth: "1040px",
    margin: "0 auto",
    padding: "0 40px",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 0",
    borderBottom: "1.5px solid var(--tsr-border)",
    marginBottom: "32px",
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  navIcon: {
    width: "28px",
    height: "28px",
    objectFit: "contain",
  },
  logo: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--tsr-navy)",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userBadge: {
    fontSize: "13px",
    color: "var(--tsr-text-muted)",
    background: "#fff",
    border: "1px solid var(--tsr-border)",
    borderRadius: "8px",
    padding: "6px 14px",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "600",
    color: "var(--tsr-navy)",
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--tsr-text-muted)",
  },
  tabBar: {
    display: "flex",
    gap: "0",
    marginBottom: "28px",
    borderBottom: "1.5px solid var(--tsr-border)",
  },
  tabCount: {
    background: "var(--tsr-warm-gray)",
    color: "var(--tsr-text-muted)",
    borderRadius: "20px",
    padding: "1px 7px",
    fontSize: "11px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "16px",
  },
  emptyState: {
    fontSize: "14px",
    color: "var(--tsr-text-muted)",
    padding: "48px 0",
    textAlign: "center",
  },
  ratedList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  ratedRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "#fff",
    border: "1px solid var(--tsr-border)",
    borderRadius: "10px",
    padding: "12px 16px",
  },
  ratedPoster: {
    width: "40px",
    height: "56px",
    borderRadius: "4px",
    overflow: "hidden",
    background: "var(--tsr-warm-gray)",
    flexShrink: 0,
  },
  ratedPosterImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  ratedPosterFallback: {
    width: "100%",
    height: "100%",
    background: "var(--tsr-warm-gray)",
  },
  ratedInfo: {
    flex: 1,
  },
  ratedTitle: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--tsr-navy)",
    marginBottom: "3px",
  },
  ratedMeta: {
    fontSize: "12px",
    color: "var(--tsr-text-muted)",
  },
  ratedScore: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "3px",
  },
  ratedStars: {
    display: "flex",
    gap: "2px",
  },
  ratedScoreLabel: {
    fontSize: "11px",
    color: "var(--tsr-text-muted)",
  },
};