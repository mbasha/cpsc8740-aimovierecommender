import { useState } from "react";
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
    { movieId: 26587, title: "Scream",                       year: 1996, genres: "Horror · Mystery" },
    { movieId: 8467,  title: "A Nightmare on Elm Street",    year: 1984, genres: "Horror" },
  ],
  valets: [
    { movieId: 1029,  title: "Coming to America",            year: 1988, genres: "Comedy · Romance" },
    { movieId: 11482, title: "Taken",                        year: 2008, genres: "Action · Thriller" },
  ],
  abed: [
    { movieId: 2108,  title: "The Breakfast Club",           year: 1985, genres: "Comedy · Drama" },
    { movieId: 1893,  title: "Raiders of the Lost Ark",      year: 1981, genres: "Action · Adventure" },
  ],
};

const SCRIPTS = {
  randy: {
    intro: "Okay, okay, OKAY. Listen up because I am only going to say this once. If you want good recommendations, you have to play by the rules. And rule number one? You have to be honest about what you've seen. No lying. The movie gods will know. I'm Randy by the way. Let's see what we're working with.",
    prompt: "Alright, be brutally honest. How do you rate this one?",
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
    outro: "Okay. Okay okay okay. I've seen enough. Based on your taste — or lack thereof, no offense — here's what I think you need to watch next. Don't blame me if any of these change your life.",
  },
  valets: {
    intro: "YOOOOO. Okay so check it out. My boy and I — we know MOVIES. Like we're talking encyclopedic knowledge of cinema right here. You want recommendations? We got you. We just need to know what you're working with first. Let's run through some films real quick. LET'S GO.",
    prompt: "Okay okay okay — where does this one land for you?",
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
    prompt: "Rate this one. Be precise — half stars matter.",
    movies: {
      "The Shawshank Redemption": "Structurally this is a near-perfect film. The hope theme is delivered with surgical consistency from the first act through the resolution. It's the kind of movie that makes people believe in narrative again. Where does it land for you?",
      "The Dark Knight": "Nolan essentially deconstructed the superhero genre and rebuilt it as a Greek tragedy. The Joker functions as a chaos agent — a classic archetype used to reveal the protagonist's true nature. What do you rate it?",
      "Jurassic Park": "Spielberg's use of practical effects combined with early CGI created a visual language that the industry still references. Also the T-Rex reveal is a masterclass in building tension through sound design. Your rating?",
      "Pulp Fiction": "Non-linear storytelling as a narrative device. Tarantino essentially gave the audience credit for being able to hold multiple timelines simultaneously. It changed what studios thought viewers could handle. What do you give it?",
      "Toy Story": "Pixar established an entire emotional grammar with this film. The premise is a metaphor for every character who performs one identity while experiencing another. I find it very relatable. Your rating?",
      "The Silence of the Lambs": "Clarice and Hannibal have one of the most precisely written mentor-protégé dynamics in cinema. The power exchange in every scene is deliberate and layered. Rate it.",
      "Forrest Gump": "It's a picaresque narrative — a simple protagonist moving through complex historical events without fully understanding them. Some people find that profound. Others find it frustrating. I'm curious which camp you're in. Rate it.",
      "Goodfellas": "Scorsese's use of voiceover narration creates dramatic irony throughout — we know Henry is doomed before he does. It's technically brilliant. What's your rating?",
      "The Breakfast Club": "Five character archetypes locked in a room together for one day. The Brain, the Athlete, the Basket Case, the Princess, the Criminal. It's almost clinical in its construction, which is probably why I've seen it eleven times. Your rating?",
      "Raiders of the Lost Ark": "The introduction of Indiana Jones in the first three minutes is one of the most efficient pieces of character establishment in film history. You learn everything about him before he says a word. I've broken it down frame by frame. What do you rate it?",
    },
    outro: "Okay. I've identified your pattern. These are the ten films most aligned with your specific viewer profile. I'm fairly confident about this.",
  },
};

function getDialog(character, movieTitle) {
  const script = SCRIPTS[character.id];
  return script?.movies?.[movieTitle] || script?.prompt || "";
}

function RandyDialog({ text }) {
  return (
    <div style={styles.bubble}>{text}</div>
  );
}

function ValetsDialog({ lines }) {
  if (typeof lines === "string") {
    return <div style={styles.bubble}>{lines}</div>;
  }
  return (
    <div style={styles.chat}>
      {lines.map((msg, i) => (
        <div key={i} style={{
          ...styles.msgRow,
          flexDirection: msg.valet === "V2" ? "row-reverse" : "row"
        }}>
          <div style={styles.avatar}>{msg.valet}</div>
          <div style={{
            ...styles.bubble,
            marginLeft: msg.valet === "V2" ? "auto" : 0,
            marginRight: msg.valet === "V1" ? "auto" : 0,
            maxWidth: "75%",
          }}>{msg.line}</div>
        </div>
      ))}
    </div>
  );
}

function AbedDialog({ text }) {
  return (
    <div style={styles.bubble}>{text}</div>
  );
}

export default function RatingFlow() {
  const { user, character, setRecommendations } = useApp();
  const [step, setStep] = useState("intro");
  const [movieIndex, setMovieIndex] = useState(0);
  const [ratings, setRatings] = useState({});
  const [currentRating, setCurrentRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const allMovies = [...SEED_MOVIES, ...( CHARACTER_MOVIES[character.id] || [])];
  const currentMovie = allMovies[movieIndex];
  const totalMovies = allMovies.length;
  const dialog = currentMovie ? getDialog(character, currentMovie.title) : "";

  function handleNext() {
    if (currentRating > 0) {
      setRatings(prev => ({
        ...prev,
        [String(currentMovie.movieId)]: currentRating
      }));
    }
    setCurrentRating(0);

    if (movieIndex < totalMovies - 1) {
      setMovieIndex(i => i + 1);
    } else {
      handleSubmit({ ...ratings, [String(currentMovie.movieId)]: currentRating });
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

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingEmoji}>🎬</div>
          <p style={styles.loadingText}>
            {character.id === "randy" && "Okay. Okay okay okay. Calculating..."}
            {character.id === "valets" && "YOOO hold on we're working on it..."}
            {character.id === "abed" && "Processing. This will take approximately eight seconds."}
          </p>
        </div>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div style={styles.page}>
        <div style={styles.introCard}>
          <div style={styles.characterEmoji}>
            {character.id === "randy" && "🎬"}
            {character.id === "valets" && "🎭"}
            {character.id === "abed" && "📽️"}
          </div>
          <h2 style={styles.characterName}>{character.name}</h2>
          <div style={styles.bubble}>{SCRIPTS[character.id].intro}</div>
          <button style={styles.btn} onClick={() => setStep("rating")}>
            let's do it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.ratingCard}>
        <div style={styles.progressBar}>
          <div style={{
            ...styles.progressFill,
            width: `${((movieIndex) / totalMovies) * 100}%`
          }} />
        </div>
        <div style={styles.progressLabel}>
          {movieIndex + 1} of {totalMovies}
        </div>
        <div style={styles.movieRow}>
          <div style={styles.posterPlaceholder}>
            <span style={styles.posterText}>🎬</span>
          </div>
          <div style={styles.movieContent}>
            <div style={styles.movieTitle}>{currentMovie.title}</div>
            <div style={styles.movieMeta}>
              {currentMovie.year} &nbsp;·&nbsp; {currentMovie.genres}
            </div>
            {character.id === "valets" ? (
              <ValetsDialog lines={dialog} />
            ) : character.id === "abed" ? (
              <AbedDialog text={dialog} />
            ) : (
              <RandyDialog text={dialog} />
            )}
            <StarRating value={currentRating} onChange={setCurrentRating} />
            <div style={styles.btnRow}>
              <button style={styles.btn} onClick={handleNext}>
                {movieIndex < totalMovies - 1 ? "next" : "get my recommendations"}
              </button>
              <button style={styles.btnSecondary} onClick={handleSkip}>
                haven't seen it
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "48px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  introCard: {
    background: "#fff",
    border: "1px solid #e0dfd8",
    borderRadius: "16px",
    padding: "40px",
    maxWidth: "560px",
    width: "100%",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    alignItems: "center",
  },
  characterEmoji: {
    fontSize: "48px",
  },
  characterName: {
    fontSize: "20px",
    fontWeight: "500",
  },
  ratingCard: {
    background: "#fff",
    border: "1px solid #e0dfd8",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "680px",
    width: "100%",
  },
  progressBar: {
    height: "4px",
    background: "#f0efea",
    borderRadius: "2px",
    marginBottom: "8px",
  },
  progressFill: {
    height: "4px",
    background: "#1a1a1a",
    borderRadius: "2px",
    transition: "width 0.3s ease",
  },
  progressLabel: {
    fontSize: "12px",
    color: "#aaa",
    textAlign: "right",
    marginBottom: "24px",
  },
  movieRow: {
    display: "flex",
    gap: "24px",
    alignItems: "flex-start",
  },
  posterPlaceholder: {
    width: "110px",
    height: "160px",
    background: "#f0efea",
    border: "1px dashed #ccc",
    borderRadius: "8px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  posterText: {
    fontSize: "32px",
  },
  movieContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  movieTitle: {
    fontSize: "20px",
    fontWeight: "500",
    color: "#1a1a1a",
  },
  movieMeta: {
    fontSize: "13px",
    color: "#aaa",
  },
  bubble: {
    background: "#f5f4ef",
    border: "1px solid #e0dfd8",
    borderRadius: "12px",
    padding: "14px 16px",
    fontSize: "13px",
    color: "#333",
    lineHeight: "1.6",
  },
  chat: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  msgRow: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
  },
  avatar: {
    width: "28px",
    height: "28px",
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
  btnRow: {
    display: "flex",
    gap: "10px",
    marginTop: "4px",
  },
  btn: {
    padding: "10px 20px",
    fontSize: "13px",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "500",
  },
  btnSecondary: {
    padding: "10px 20px",
    fontSize: "13px",
    background: "#fff",
    color: "#555",
    border: "1px solid #e0dfd8",
    borderRadius: "8px",
  },
  loadingCard: {
    background: "#fff",
    border: "1px solid #e0dfd8",
    borderRadius: "16px",
    padding: "48px 40px",
    textAlign: "center",
    maxWidth: "420px",
    width: "100%",
  },
  loadingEmoji: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  loadingText: {
    fontSize: "15px",
    color: "#555",
    fontStyle: "italic",
  },
};