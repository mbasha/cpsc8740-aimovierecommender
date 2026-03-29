import { useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";
import StarRating from "../components/StarRating";

const API = import.meta.env.VITE_API_URL;

const CHARACTER_MOVIES = {
  randy: [
    { movieId: 953,   title: "Halloween",                      year: 1978, genres: "Horror" },
    { movieId: 8467,  title: "A Nightmare on Elm Street",      year: 1984, genres: "Horror" },
    { movieId: 8810,  title: "Friday the 13th",                year: 1980, genres: "Horror" },
    { movieId: 6466,  title: "The Texas Chain Saw Massacre",    year: 1974, genres: "Horror" },
    { movieId: 1340,  title: "Alien",                          year: 1979, genres: "Horror · Sci-Fi" },
    { movieId: 507,   title: "The Exorcist",                   year: 1973, genres: "Horror" },
    { movieId: 26587, title: "Scream",                         year: 1996, genres: "Horror · Mystery" },
    { movieId: 8871,  title: "Friday the 13th Part 2",         year: 1981, genres: "Horror" },
    { movieId: 1578,  title: "Psycho",                         year: 1960, genres: "Horror · Thriller" },
    { movieId: 6867,  title: "Night of the Living Dead",       year: 1968, genres: "Horror" },
  ],
  abed: [
    { movieId: 68954, title: "My Dinner with Andre",           year: 1981, genres: "Drama" },
    { movieId: 296,   title: "Pulp Fiction",                   year: 1994, genres: "Crime · Drama" },
    { movieId: 2108,  title: "The Breakfast Club",             year: 1985, genres: "Comedy · Drama" },
    { movieId: 9591,  title: "Face/Off",                       year: 1997, genres: "Action · Thriller" },
    { movieId: 58559, title: "The Dark Knight",                year: 2008, genres: "Action · Thriller" },
    { movieId: 260,   title: "Star Wars: A New Hope",          year: 1977, genres: "Adventure · Sci-Fi" },
    { movieId: 2571,  title: "The Matrix",                     year: 1999, genres: "Action · Sci-Fi" },
    { movieId: 79132, title: "Inception",                      year: 2010, genres: "Action · Sci-Fi" },
    { movieId: 593,   title: "Goodfellas",                     year: 1990, genres: "Crime · Drama" },
    { movieId: 694,   title: "The Shining",                    year: 1980, genres: "Horror · Thriller" },
  ],
  valets: [
    { movieId: 58559, title: "The Dark Knight",                year: 2008, genres: "Action · Thriller" },
    { movieId: 245891,title: "John Wick",                      year: 2014, genres: "Action · Thriller" },
    { movieId: 1359,  title: "Training Day",                   year: 2001, genres: "Crime · Drama" },
    { movieId: 2571,  title: "The Matrix",                     year: 1999, genres: "Action · Sci-Fi" },
    { movieId: 299534,title: "Avengers: Endgame",              year: 2019, genres: "Action · Adventure" },
    { movieId: 284054,title: "Black Panther",                  year: 2018, genres: "Action · Adventure" },
    { movieId: 111,   title: "Scarface",                       year: 1983, genres: "Crime · Drama" },
    { movieId: 9928,  title: "Friday",                         year: 1995, genres: "Comedy" },
    { movieId: 13437, title: "Bad Boys II",                    year: 2003, genres: "Action · Comedy" },
    { movieId: 98,    title: "Gladiator",                      year: 2000, genres: "Action · Drama" },
  ],
};

const SCRIPTS = {
  randy: {
    intro: "Okay, okay, OKAY. Listen up because I am only going to say this once. If you want good recommendations, you have to play by the rules. And rule number one? You have to be honest about what you've seen. No lying. The movie gods will know. I'm Randy by the way. Let's see what we're working with.",
    movies: {
      "Halloween": "The original slasher. Carpenter invented the template with this one. Every horror movie since owes it something. What's your rating?",
      "A Nightmare on Elm Street": "Freddy Krueger. The man of my dreams. Literally. This is where it all started for me. Be honest.",
      "Friday the 13th": "Camp Crystal Lake. The kills, the twist, the score. Classic. Rate it.",
      "The Texas Chain Saw Massacre": "Tobe Hooper. Raw, brutal, unflinching. This is what horror looks like when it means it. What do you give it?",
      "Alien": "Ridley Scott put a haunted house in space and it worked perfectly. Where does this one land for you?",
      "The Exorcist": "Still the scariest movie ever made, forty years later. Nobody has topped it. Rate it.",
      "Scream": "Oh you KNOW I have opinions about this one. This is basically my bible. But forget what I think — what do YOU think?",
      "Friday the 13th Part 2": "The killer wears a burlap sack this time. More creative than people give it credit for. What's your rating?",
      "Psycho": "Hitchcock. Norman Bates. The shower scene. This is where psychological horror began. Rate it.",
      "Night of the Living Dead": "Romero created the modern zombie with this film. Shot for nothing, scared everyone. What do you give it?",
    },
    outro: "Okay. Okay okay okay. I've seen enough. Based on your taste — or lack thereof, no offense — here's what I think you need to watch next.",
  },
  valets: {
    intro: "YOOOOO. Okay so check it out. My boy and I — we know MOVIES. Like we're talking encyclopedic knowledge of cinema right here. You want recommendations? We got you. We just need to know what you're working with first. Let's run through some films real quick. LET'S GO.",
    movies: {
      "The Dark Knight": [
        { valet: "V1", line: "Ledger as the Joker though—" },
        { valet: "V2", line: "Don't even START me." },
        { valet: "V1", line: "Greatest performance in a superhero movie EVER." },
        { valet: "V2", line: "It's not even a superhero movie it's a CRIME DRAMA. Anyway — you rating this or what?" },
      ],
      "John Wick": [
        { valet: "V1", line: "They killed his dog." },
        { valet: "V2", line: "BIG mistake." },
        { valet: "V1", line: "The pencil scene alone puts this in the action hall of fame." },
        { valet: "V2", line: "What's your rating?" },
      ],
      "Training Day": [
        { valet: "V1", line: "Denzel Washington in this movie is TERRIFYING." },
        { valet: "V2", line: "Oscar winning terrifying." },
        { valet: "V1", line: "King Kong ain't got nothing on him." },
        { valet: "V2", line: "Rate it." },
      ],
      "The Matrix": [
        { valet: "V1", line: "There is no spoon." },
        { valet: "V2", line: "THERE IS NO SPOON." },
        { valet: "V1", line: "The Wachowskis changed action movies forever with this one." },
        { valet: "V2", line: "What you giving it?" },
      ],
      "Avengers: Endgame": [
        { valet: "V1", line: "Twenty-two movies." },
        { valet: "V2", line: "TWENTY-TWO." },
        { valet: "V1", line: "All leading to this. The theater was electric." },
        { valet: "V2", line: "Where does it land for you?" },
      ],
      "Black Panther": [
        { valet: "V1", line: "Wakanda Forever." },
        { valet: "V2", line: "This movie was a whole moment." },
        { valet: "V1", line: "Culturally, cinematically — it hit different." },
        { valet: "V2", line: "Rate it." },
      ],
      "Scarface": [
        { valet: "V1", line: "Say hello to my little friend." },
        { valet: "V2", line: "Al Pacino went absolutely insane in this movie." },
        { valet: "V1", line: "In the best possible way." },
        { valet: "V2", line: "What's your rating?" },
      ],
      "Friday": [
        { valet: "V1", line: "Smokey. Craig. The porch." },
        { valet: "V2", line: "A perfect movie." },
        { valet: "V1", line: "Not an exaggeration." },
        { valet: "V2", line: "Rate it." },
      ],
      "Bad Boys II": [
        { valet: "V1", line: "Will Smith and Martin Lawrence." },
        { valet: "V2", line: "The freeway chase scene is one for the ages." },
        { valet: "V1", line: "Michael Bay turned the budget up to eleven." },
        { valet: "V2", line: "Where does this land for you?" },
      ],
      "Gladiator": [
        { valet: "V1", line: "Are you not entertained?" },
        { valet: "V2", line: "ARE YOU NOT ENTERTAINED?" },
        { valet: "V1", line: "Russell Crowe carried that entire film." },
        { valet: "V2", line: "What's your rating?" },
      ],
    },
    outro: "We've seen enough. We know exactly what you need. Top ten. Right here. You're welcome in advance.",
  },
  abed: {
    intro: "Cool. Cool cool cool. So here's what's happening. You want movie recommendations, and I have a system. I'm going to show you ten films. You rate them. I analyze the data, identify your tropes, and generate a watchlist optimized for your specific character type. It's actually a pretty elegant process when you think about it. I'm Abed. Let's begin.",
    movies: {
      "My Dinner with Andre": "Two men have dinner and talk for two hours. That's the entire film. It is somehow one of the most compelling things ever committed to celluloid. Your rating?",
      "Pulp Fiction": "Non-linear storytelling as a narrative device. Tarantino gave the audience credit for holding multiple timelines simultaneously. What do you give it?",
      "The Breakfast Club": "Five character archetypes locked in a room for one day. It's almost clinical in its construction, which is probably why I've seen it eleven times. Your rating?",
      "Face/Off": "John Travolta and Nicolas Cage swap faces and then play each other. It should not work. It works completely. This film understands itself perfectly. Rate it.",
      "The Dark Knight": "Nolan deconstructed the superhero genre and rebuilt it as a Greek tragedy. The Joker as chaos agent is a textbook archetype. What do you rate it?",
      "Star Wars: A New Hope": "Joseph Campbell's hero's journey rendered as a space opera. The structural purity of this film is remarkable. Your rating?",
      "The Matrix": "A film about living inside a simulation that is itself a simulation of an action movie. The layers are intentional. What do you give it?",
      "Inception": "A heist film structured like a dream — each layer following its own internal logic while serving the whole. Nolan's most formally ambitious work. Rate it.",
      "Goodfellas": "Scorsese's voiceover creates dramatic irony throughout — we know Henry is doomed before he does. Technically brilliant. What's your rating?",
      "The Shining": "Kubrick turned a Stephen King novel into something King himself hated, which tells you everything about how completely Kubrick understood it. Your rating?",
    },
    outro: "Okay. I've identified your pattern. These are the ten films most aligned with your specific viewer profile. I'm fairly confident about this.",
  },
};

function getDialog(character, movieTitle) {
  return SCRIPTS[character.id]?.movies?.[movieTitle] || "";
}

function Dialog({ character, text }) {
  if (character.id === "valets" && Array.isArray(text)) {
    return (
      <div style={styles.chat}>
        {text.map((msg, i) => (
          <div key={i} style={{
            ...styles.msgRow,
            flexDirection: msg.valet === "V2" ? "row-reverse" : "row"
          }}>
            <div style={styles.avatar}>{msg.valet}</div>
            <div style={{
              ...styles.bubble,
              marginLeft: msg.valet === "V2" ? "auto" : 0,
              marginRight: msg.valet === "V1" ? "auto" : 0,
              maxWidth: "78%",
            }}>{msg.line}</div>
          </div>
        ))}
      </div>
    );
  }
  return <div style={styles.bubble}>{text}</div>;
}

export default function RatingFlow() {
  const { user, character, setCharacter, setRecommendations } = useApp();
  const [step, setStep] = useState("intro");
  const [movieIndex, setMovieIndex] = useState(0);
  const [ratings, setRatings] = useState({});
  const [currentRating, setCurrentRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [posters, setPosters] = useState({});
  const [postersLoading, setPostersLoading] = useState(true);

  const allMovies = CHARACTER_MOVIES[character.id] || [];
  const currentMovie = allMovies[movieIndex];
  const totalMovies = allMovies.length;
  const dialog = currentMovie ? getDialog(character, currentMovie.title) : "";
  const progress = Math.round((movieIndex / totalMovies) * 100);

  const accentColor = {
    randy: "var(--tsr-red)",
    valets: "var(--tsr-teal)",
    abed: "var(--tsr-purple)",
  }[character.id] || "var(--tsr-navy)";

  useEffect(() => {
    async function fetchPosters() {
      setPostersLoading(true);
      const results = await Promise.allSettled(
        allMovies.map(async movie => {
          try {
            const res = await axios.get(`${API}/api/movie`, {
              params: { title: `${movie.title} (${movie.year})` }
            });
            return { movieId: movie.movieId, posterUrl: res.data.posterUrl };
          } catch {
            return { movieId: movie.movieId, posterUrl: null };
          }
        })
      );
      const map = {};
      results.forEach(r => {
        if (r.status === "fulfilled" && r.value.posterUrl) {
          map[r.value.movieId] = r.value.posterUrl;
        }
      });
      setPosters(map);
      setPostersLoading(false);
    }
    fetchPosters();
  }, [character.id]);

  function handleNext() {
    const updatedRatings = currentRating > 0
      ? { ...ratings, [String(currentMovie.movieId)]: currentRating }
      : ratings;
    setRatings(updatedRatings);
    setCurrentRating(0);
    if (movieIndex < totalMovies - 1) {
      setMovieIndex(i => i + 1);
    } else {
      handleSubmit(updatedRatings);
    }
  }

  function handleSkip() {
    setCurrentRating(0);
    if (movieIndex < totalMovies - 1) {
      setMovieIndex(i => i + 1);
    } else {
      handleSubmit(ratings);
    }
  }

  async function handleSubmit(finalRatings) {
      setLoading(true);
      try {
        // Build movieMeta for all rated movies so backend can store titles
        const movieMeta = Object.keys(finalRatings).map(movieIdStr => {
          const id = parseInt(movieIdStr);
          const movie = allMovies.find(m => m.movieId === id);
          return movie ? { movieId: id, title: movie.title, genres: movie.genres } : null;
        }).filter(Boolean);

        const res = await axios.post(`${API}/api/rate`, {
          username: user.username,
          character: character.id,
          ratings: finalRatings,
          movieMeta,
        });
        setRecommendations(res.data.recommendations);
      } catch (e) {
        console.error("Failed to get recommendations", e);
      } finally {
        setLoading(false);
      }
    }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingPage}>
          <div style={styles.loadingHeader}>
            <div className="skeleton" style={{ height: "18px", width: "200px", marginBottom: "12px" }} />
            <div className="skeleton" style={{ height: "32px", width: "340px", marginBottom: "8px" }} />
            <div className="skeleton" style={{ height: "16px", width: "260px" }} />
          </div>
          <div style={styles.skeletonGrid}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={styles.skeletonTile}>
                <div className="skeleton" style={{ width: "100%", paddingTop: "150%", borderRadius: "8px" }} />
                <div style={{ padding: "10px" }}>
                  <div className="skeleton" style={{ height: "12px", width: "80%", marginBottom: "6px" }} />
                  <div className="skeleton" style={{ height: "10px", width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div style={styles.page}>
        <div style={styles.introLayout}>
          <div style={{ ...styles.introLeft, background: "var(--tsr-navy)" }}>
            <div style={{ ...styles.introAccentBar, background: accentColor }} />
            <div style={styles.introLeftContent}>
              <div style={styles.introBadge}>{character.source}</div>
              <h1 style={styles.introName}>{character.name}</h1>
              <div style={styles.introBubble}>
                {SCRIPTS[character.id].intro}
              </div>
              <div style={styles.introActions}>
                <button
                  style={{ ...styles.btnPrimary, background: accentColor }}
                  onClick={() => setStep("rating")}
                >
                  Let's do it →
                </button>
                <button style={styles.btnGhost} onClick={() => setCharacter(null)}>
                  ← Choose someone else
                </button>
              </div>
            </div>
          </div>
          <div style={styles.introRight}>
            <div style={styles.introMovieCount}>
              <div style={styles.introCountNumber}>{totalMovies}</div>
              <div style={styles.introCountLabel}>movies to rate</div>
            </div>
            <div style={styles.introMovieList}>
              {allMovies.map((m, i) => (
                <div key={m.movieId} style={styles.introMovieItem}>
                  <span style={styles.introMovieNum}>{i + 1}</span>
                  <span style={styles.introMovieTitle}>{m.title}</span>
                  <span style={styles.introMovieYear}>{m.year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.ratingLayout}>
        <div style={{ ...styles.posterCol, background: "var(--tsr-navy)" }}>
          <div style={{ ...styles.posterAccentBar, background: accentColor }} />
          {postersLoading || !posters[currentMovie.movieId] ? (
            <div
              className={postersLoading ? "skeleton" : ""}
              style={{
                ...styles.posterBox,
                background: postersLoading ? undefined : "#2a2a3a",
              }}
            >
              {!postersLoading && (
                <div style={styles.posterFallback}>{currentMovie.title}</div>
              )}
            </div>
          ) : (
            <img
              src={posters[currentMovie.movieId]}
              alt={currentMovie.title}
              style={styles.posterImage}
            />
          )}
          <div style={styles.progressSection}>
            <div style={styles.progressBar}>
              <div style={{
                ...styles.progressFill,
                width: `${progress}%`,
                background: accentColor,
              }} />
            </div>
            <div style={styles.progressLabel}>
              {movieIndex + 1} of {totalMovies}
            </div>
          </div>
        </div>

        <div style={styles.dialogCol}>
          <button style={styles.backBtn} onClick={() => setCharacter(null)}>
            ← Choose someone else
          </button>
          <div style={styles.movieTitle}>{currentMovie.title}</div>
          <div style={styles.movieMeta}>
            {currentMovie.year} &nbsp;·&nbsp; {currentMovie.genres}
          </div>
          <Dialog character={character} text={dialog} />
          <div style={styles.ratingSection}>
            <StarRating value={currentRating} onChange={setCurrentRating} />
          </div>
          <div style={styles.actionRow}>
            <button
              style={{ ...styles.btnPrimary, background: accentColor }}
              onClick={handleNext}
            >
              {movieIndex < totalMovies - 1 ? "Next →" : "Get my recommendations →"}
            </button>
            <button style={styles.btnGhost} onClick={handleSkip}>
              Haven't seen it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--tsr-cream)",
  },
  introLayout: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
  },
  introLeft: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  introAccentBar: {
    height: "5px",
    width: "100%",
  },
  introLeftContent: {
    padding: "56px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  introBadge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "600",
    color: "#555e7a",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "14px",
  },
  introName: {
    fontSize: "40px",
    fontWeight: "600",
    color: "#fff",
    marginBottom: "28px",
    lineHeight: "1.15",
  },
  introBubble: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px",
    padding: "20px 24px",
    fontSize: "15px",
    color: "#ccc",
    lineHeight: "1.7",
    marginBottom: "36px",
    fontStyle: "italic",
  },
  introActions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "flex-start",
  },
  introRight: {
    padding: "56px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "32px",
    background: "var(--tsr-cream)",
  },
  introMovieCount: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
  },
  introCountNumber: {
    fontSize: "56px",
    fontWeight: "300",
    color: "var(--tsr-navy)",
    lineHeight: 1,
  },
  introCountLabel: {
    fontSize: "16px",
    color: "var(--tsr-text-muted)",
  },
  introMovieList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  introMovieItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "9px 14px",
    background: "#fff",
    border: "1px solid var(--tsr-border)",
    borderRadius: "8px",
  },
  introMovieNum: {
    fontSize: "11px",
    color: "var(--tsr-text-muted)",
    width: "18px",
    flexShrink: 0,
  },
  introMovieTitle: {
    fontSize: "13px",
    color: "var(--tsr-navy)",
    flex: 1,
  },
  introMovieYear: {
    fontSize: "12px",
    color: "var(--tsr-text-muted)",
  },
  ratingLayout: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "420px 1fr",
  },
  posterCol: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
    gap: "28px",
  },
  posterAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "5px",
  },
  posterBox: {
    width: "100%",
    maxWidth: "280px",
    aspectRatio: "2/3",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  posterFallback: {
    fontSize: "14px",
    color: "#555",
    textAlign: "center",
    padding: "20px",
    lineHeight: "1.5",
  },
  posterImage: {
    width: "100%",
    maxWidth: "280px",
    aspectRatio: "2/3",
    objectFit: "cover",
    borderRadius: "12px",
  },
  progressSection: {
    width: "100%",
    maxWidth: "280px",
  },
  progressBar: {
    height: "3px",
    background: "#2a2a3a",
    borderRadius: "2px",
    marginBottom: "8px",
  },
  progressFill: {
    height: "3px",
    borderRadius: "2px",
    transition: "width 0.4s ease",
  },
  progressLabel: {
    fontSize: "12px",
    color: "#555e7a",
    textAlign: "center",
  },
  dialogCol: {
    padding: "64px 56px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "16px",
  },
  backBtn: {
    alignSelf: "flex-start",
    fontSize: "13px",
    color: "var(--tsr-text-muted)",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    marginBottom: "8px",
  },
  movieTitle: {
    fontSize: "32px",
    fontWeight: "600",
    color: "var(--tsr-navy)",
    lineHeight: "1.2",
  },
  movieMeta: {
    fontSize: "14px",
    color: "var(--tsr-text-muted)",
  },
  bubble: {
    background: "#fff",
    border: "1.5px solid var(--tsr-border)",
    borderRadius: "14px",
    padding: "18px 22px",
    fontSize: "15px",
    color: "var(--tsr-text)",
    lineHeight: "1.7",
  },
  chat: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  msgRow: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
  },
  avatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "var(--tsr-warm-gray)",
    border: "1px solid var(--tsr-border)",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "600",
    color: "var(--tsr-text-muted)",
  },
  ratingSection: {
    padding: "8px 0",
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginTop: "8px",
  },
  btnPrimary: {
    padding: "12px 24px",
    fontSize: "14px",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "0.01em",
  },
  btnGhost: {
    padding: "12px 20px",
    fontSize: "14px",
    background: "none",
    color: "var(--tsr-text-muted)",
    border: "1.5px solid var(--tsr-border)",
    borderRadius: "10px",
    cursor: "pointer",
  },
  loadingPage: {
    maxWidth: "1040px",
    margin: "0 auto",
    padding: "64px 40px",
  },
  loadingHeader: {
    marginBottom: "40px",
  },
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "16px",
  },
  skeletonTile: {
    background: "#fff",
    border: "1px solid var(--tsr-border)",
    borderRadius: "10px",
    overflow: "hidden",
  },
};