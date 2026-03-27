import { useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";
import StarRating from "../components/StarRating";

const API = import.meta.env.VITE_API_URL;

const SEED_MOVIES = [
  { movieId: 318,   title: "The Shawshank Redemption", year: 1994, genres: "Drama" },
  { movieId: 58559, title: "The Dark Knight",           year: 2008, genres: "Action · Thriller" },
  { movieId: 589,   title: "Jurassic Park",             year: 1993, genres: "Adventure · Sci-Fi" },
  { movieId: 296,   title: "Pulp Fiction",              year: 1994, genres: "Crime · Drama" },
  { movieId: 1,     title: "Toy Story",                 year: 1995, genres: "Animation · Comedy" },
  { movieId: 1258,  title: "The Silence of the Lambs",  year: 1991, genres: "Thriller · Horror" },
  { movieId: 356,   title: "Forrest Gump",              year: 1994, genres: "Drama · Comedy" },
  { movieId: 593,   title: "Goodfellas",                year: 1990, genres: "Crime · Drama" },
];

const CHARACTER_MOVIES = {
  randy: [
    { movieId: 26587, title: "Scream",                    year: 1996, genres: "Horror · Mystery" },
    { movieId: 8467,  title: "A Nightmare on Elm Street", year: 1984, genres: "Horror" },
  ],
  valets: [
    { movieId: 1029,  title: "Coming to America",         year: 1988, genres: "Comedy · Romance" },
    { movieId: 11482, title: "Taken",                     year: 2008, genres: "Action · Thriller" },
  ],
  abed: [
    { movieId: 2108,  title: "The Breakfast Club",        year: 1985, genres: "Comedy · Drama" },
    { movieId: 1893,  title: "Raiders of the Lost Ark",   year: 1981, genres: "Action · Adventure" },
  ],
};

const SCRIPTS = {
  randy: {
    intro: "Okay, okay, OKAY. Listen up because I am only going to say this once. If you want good recommendations, you have to play by the rules. And rule number one? You have to be honest about what you've seen. No lying. The movie gods will know. I'm Randy by the way. Let's see what we're working with.",
    movies: {
      "The Shawshank Redemption": "Classic redemption arc. No jump scares, I know, but even I respect a perfect film. What did you think?",
      "The Dark Knight": "Heath Ledger's Joker is the greatest movie villain since Hannibal Lecter. Fight me. Where does this land for you?",
      "Jurassic Park": "Spielberg. Practical effects. Dinosaurs eating lawyers. This is cinema. Rate it.",
      "Pulp Fiction": "Tarantino literally changed the rules of storytelling with this one. Non-linear narrative, unexpected deaths, no one is safe. Sound familiar? Rate it.",
      "Toy Story": "Don't sleep on animated films. Some of the darkest themes in cinema are hiding in kids movies. Anyway. This one?",
      "The Silence of the Lambs": "Now we're talking. Oscar winning horror. OSCAR WINNING. This is the one I show people when they say horror isn't serious cinema. What's your rating?",
      "Forrest Gump": "Look, it's a good movie. Not a horror movie, but I'll allow it. Rate it.",
      "Goodfellas": "Scorsese. Every frame is a masterclass. Even I take notes. What do you give it?",
      "Scream": "Oh you KNOW I have opinions about this one. This is basically my bible. But forget what I think — what do YOU think?",
      "A Nightmare on Elm Street": "Freddy Krueger. The man of my dreams. Literally. This is where it all started for me. Be honest.",
    },
    outro: "Okay. Okay okay okay. I've seen enough. Based on your taste — or lack thereof, no offense — here's what I think you need to watch next.",
  },
  valets: {
    intro: "YOOOOO. Okay so check it out. My boy and I — we know MOVIES. Like we're talking encyclopedic knowledge of cinema right here. You want recommendations? We got you. We just need to know what you're working with first. Let's run through some films real quick. LET'S GO.",
    movies: {
      "The Shawshank Redemption": [
        { valet: "V1", line: "Yo this movie is COLD BLOODED." },
        { valet: "V2", line: "Number one on IMDb for like twenty years straight." },
        { valet: "V1", line: "TWENTY YEARS. What you rating this?" },
      ],
      "The Dark Knight": [
        { valet: "V1", line: "Ledger as the Joker though—" },
        { valet: "V2", line: "Don't even START me." },
        { valet: "V1", line: "Greatest performance in a superhero movie EVER." },
        { valet: "V2", line: "It's not even a superhero movie it's a CRIME DRAMA. Anyway — you rating this or what?" },
      ],
      "Jurassic Park": [
        { valet: "V1", line: "Okay real talk, the T-Rex scene in the rain?" },
        { valet: "V2", line: "ICONIC." },
        { valet: "V1", line: "Still holds up." },
        { valet: "V2", line: "STILL HOLDS UP. Rate it." },
      ],
      "Pulp Fiction": [
        { valet: "V1", line: "Tarantino said what if we just... didn't do it in order?" },
        { valet: "V2", line: "And everyone lost their mind." },
        { valet: "V1", line: "Rightfully so." },
        { valet: "V2", line: "What you giving this one?" },
      ],
      "Toy Story": [
        { valet: "V1", line: "Okay don't clown on this one." },
        { valet: "V2", line: "This movie made GROWN MEN CRY." },
        { valet: "V1", line: "Still makes grown men cry." },
        { valet: "V2", line: "Where does it land for you?" },
      ],
      "The Silence of the Lambs": [
        { valet: "V1", line: "Hannibal Lecter is in like sixteen minutes of this movie." },
        { valet: "V2", line: "SIXTEEN MINUTES and he won the Oscar." },
        { valet: "V1", line: "That's POWER. Rate it." },
      ],
      "Forrest Gump": [
        { valet: "V1", line: "Life is like a box of chocolates—" },
        { valet: "V2", line: "Don't." },
        { valet: "V1", line: "I'm just saying—" },
        { valet: "V2", line: "We know what you're saying. Rate the movie." },
      ],
      "Goodfellas": [
        { valet: "V1", line: "As far back as I can remember I always wanted to be a gangster." },
        { valet: "V2", line: "That opening line goes CRAZY." },
        { valet: "V1", line: "Every single time." },
        { valet: "V2", line: "What's your rating?" },
      ],
      "Coming to America": [
        { valet: "V1", line: "Okay THIS one is personal to us." },
        { valet: "V2", line: "Very personal." },
        { valet: "V1", line: "This is basically our origin story." },
        { valet: "V2", line: "So be VERY careful how you rate this." },
        { valet: "V1", line: "Just kidding. Kind of. Rate it." },
      ],
      "Taken": [
        { valet: "V1", line: "LIAM NEESON." },
        { valet: "V2", line: "BRO." },
        { valet: "V1", line: "I will find you—" },
        { valet: "V2", line: "AND I WILL WATCH THIS MOVIE WITH YOU. Okay your turn. Rate it." },
      ],
    },
    outro: "We've seen enough. We know exactly what you need. Top ten. Right here. You're welcome in advance.",
  },
  abed: {
    intro: "Cool. Cool cool cool. So here's what's happening. You want movie recommendations, and I have a system. I'm going to show you ten films. You rate them. I analyze the data, identify your tropes, and generate a watchlist optimized for your specific character type. It's actually a pretty elegant process when you think about it. I'm Abed. Let's begin.",
    movies: {
      "The Shawshank Redemption": "Structurally this is a near-perfect film. The hope theme is delivered with surgical consistency from the first act through the resolution. Where does it land for you?",
      "The Dark Knight": "Nolan essentially deconstructed the superhero genre and rebuilt it as a Greek tragedy. The Joker functions as a chaos agent — a classic archetype used to reveal the protagonist's true nature. What do you rate it?",
      "Jurassic Park": "Spielberg's use of practical effects combined with early CGI created a visual language that the industry still references. Also the T-Rex reveal is a masterclass in building tension through sound design. Your rating?",
      "Pulp Fiction": "Non-linear storytelling as a narrative device. Tarantino essentially gave the audience credit for being able to hold multiple timelines simultaneously. What do you give it?",
      "Toy Story": "Pixar established an entire emotional grammar with this film. The premise is a metaphor for every character who performs one identity while experiencing another. I find it very relatable. Your rating?",
      "The Silence of the Lambs": "Clarice and Hannibal have one of the most precisely written mentor-protégé dynamics in cinema. The power exchange in every scene is deliberate and layered. Rate it.",
      "Forrest Gump": "It's a picaresque narrative — a simple protagonist moving through complex historical events without fully understanding them. Some people find that profound. Others find it frustrating. Rate it.",
      "Goodfellas": "Scorsese's use of voiceover narration creates dramatic irony throughout — we know Henry is doomed before he does. It's technically brilliant. What's your rating?",
      "The Breakfast Club": "Five character archetypes locked in a room together for one day. It's almost clinical in its construction, which is probably why I've seen it eleven times. Your rating?",
      "Raiders of the Lost Ark": "The introduction of Indiana Jones in the first three minutes is one of the most efficient pieces of character establishment in film history. What do you rate it?",
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

  const allMovies = [...SEED_MOVIES, ...(CHARACTER_MOVIES[character.id] || [])];
  const currentMovie = allMovies[movieIndex];
  const totalMovies = allMovies.length;
  const dialog = currentMovie ? getDialog(character, currentMovie.title) : "";
  const progress = Math.round((movieIndex / totalMovies) * 100);

  // Fetch all posters upfront
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
  }, []);

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
      const res = await axios.post(`${API}/api/rate`, {
        username: user.username,
        character: character.id,
        ratings: finalRatings,
      });
      setRecommendations(res.data.recommendations);
    } catch (e) {
      console.error("Failed to get recommendations", e);
    } finally {
      setLoading(false);
    }
  }

  // Skeleton grid while loading recommendations
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
          <div style={styles.introLeft}>
            <div style={styles.characterBadge}>{character.source}</div>
            <h1 style={styles.introName}>{character.name}</h1>
            <div style={styles.introBubble}>
              {SCRIPTS[character.id].intro}
            </div>
            <div style={styles.introActions}>
              <button style={styles.btnPrimary} onClick={() => setStep("rating")}>
                Let's do it →
              </button>
              <button style={styles.btnGhost} onClick={() => setCharacter(null)}>
                ← Choose someone else
              </button>
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
        {/* Left — Poster */}
        <div style={styles.posterCol}>
          {postersLoading || !posters[currentMovie.movieId] ? (
            <div className={postersLoading ? "skeleton" : ""} style={styles.posterBox}>
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
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <div style={styles.progressLabel}>
              {movieIndex + 1} of {totalMovies}
            </div>
          </div>
        </div>

        {/* Right — Dialog and rating */}
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
            <button style={styles.btnPrimary} onClick={handleNext}>
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
    background: "#f7f6f2",
  },
  introLayout: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
  },
  introLeft: {
    background: "#1a1a1a",
    padding: "64px 56px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  introRight: {
    padding: "64px 56px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "32px",
  },
  characterBadge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "500",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "16px",
  },
  introName: {
    fontSize: "40px",
    fontWeight: "500",
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
  introMovieCount: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
  },
  introCountNumber: {
    fontSize: "56px",
    fontWeight: "300",
    color: "#1a1a1a",
    lineHeight: 1,
  },
  introCountLabel: {
    fontSize: "16px",
    color: "#888",
  },
  introMovieList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  introMovieItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    background: "#fff",
    border: "1px solid #e0dfd8",
    borderRadius: "8px",
  },
  introMovieNum: {
    fontSize: "11px",
    color: "#aaa",
    width: "18px",
    flexShrink: 0,
  },
  introMovieTitle: {
    fontSize: "13px",
    color: "#1a1a1a",
    flex: 1,
  },
  introMovieYear: {
    fontSize: "12px",
    color: "#aaa",
  },
  ratingLayout: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "420px 1fr",
  },
  posterCol: {
    background: "#1a1a1a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
    gap: "28px",
  },
  posterBox: {
    width: "100%",
    maxWidth: "280px",
    aspectRatio: "2/3",
    borderRadius: "12px",
    background: "#2a2a2a",
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
    background: "#333",
    borderRadius: "2px",
    marginBottom: "8px",
  },
  progressFill: {
    height: "3px",
    background: "#fff",
    borderRadius: "2px",
    transition: "width 0.4s ease",
  },
  progressLabel: {
    fontSize: "12px",
    color: "#666",
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
    color: "#aaa",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    marginBottom: "8px",
  },
  movieTitle: {
    fontSize: "32px",
    fontWeight: "500",
    color: "#1a1a1a",
    lineHeight: "1.2",
  },
  movieMeta: {
    fontSize: "14px",
    color: "#aaa",
  },
  bubble: {
    background: "#fff",
    border: "1px solid #e0dfd8",
    borderRadius: "14px",
    padding: "18px 22px",
    fontSize: "15px",
    color: "#333",
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
    background: "#e0dfd8",
    border: "1px solid #ccc",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "500",
    color: "#666",
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
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "500",
    cursor: "pointer",
  },
  btnGhost: {
    padding: "12px 20px",
    fontSize: "14px",
    background: "none",
    color: "#888",
    border: "1px solid #e0dfd8",
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
    border: "1px solid #e0dfd8",
    borderRadius: "10px",
    overflow: "hidden",
  },
};