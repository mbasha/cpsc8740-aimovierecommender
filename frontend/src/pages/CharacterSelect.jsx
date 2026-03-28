import { useApp } from "../context/AppContext";

const characters = [
  {
    id: "randy",
    name: "Randy Meeks",
    source: "Scream",
    buttonLabel: "Ask Randy",
    specialty: "Horror & Cult Classics",
    tagline: "I know the rules. Let me tell you which movies you survive.",
    description: "Randy has seen every horror film ever made, twice. He knows the rules, the tropes, and every film that broke them. If you want something that'll keep you up at night — or something that'll prove horror is serious cinema — Randy's your guy.",
    mood: "Best for: horror, suspense, cult favorites, genre films",
    accent: "#e63946",
  },
  {
    id: "valets",
    name: "The Valets",
    source: "Key & Peele",
    buttonLabel: "Ask The Valets",
    specialty: "Action & Blockbusters",
    tagline: "Oh SNAAAP. You came to the right guys.",
    description: "The Valets have encyclopedic knowledge of every action movie, blockbuster, and crowd-pleaser ever made. They've seen them all, they remember every scene, and they will not stop talking about them. Maximum enthusiasm, zero chill.",
    mood: "Best for: action, blockbusters, crowd pleasers, anything with a great trailer",
    accent: "#00b4a6",
  },
  {
    id: "abed",
    name: "Abed Nadir",
    source: "Community",
    buttonLabel: "Ask Abed",
    specialty: "Cinema & Analysis",
    tagline: "Cool. Cool cool cool. Let's figure out your narrative arc.",
    description: "Abed approaches film like a system — he'll analyze your viewing patterns, identify your tropes, and generate a watchlist optimized for your specific character type. He's seen everything and remembered all of it. Precise. Reliable. Occasionally unsettling.",
    mood: "Best for: prestige films, classics, anything with subtext worth analyzing",
    accent: "#4a2d7a",
  }
];

export default function CharacterSelect() {
  const { user, setCharacter } = useApp();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <img src="/topshelficon.png" alt="Top Shelf Rentals" style={styles.icon} />
          <div>
            <div style={styles.eyebrow}>Welcome, {user?.username}</div>
            <h1 style={styles.title}>Who's helping you tonight?</h1>
            <p style={styles.subtitle}>
              Pick a staff member. They'll ask what you've seen, then build your list.
            </p>
          </div>
        </div>
        <div style={styles.grid}>
          {characters.map(char => (
            <div key={char.id} style={styles.card}>
              <div style={{ ...styles.cardAccent, background: char.accent }} />
              <div style={styles.cardBody}>
                <div style={styles.specialtyBadge}>{char.specialty}</div>
                <div style={styles.cardName}>{char.name}</div>
                <div style={styles.cardSource}>{char.source}</div>
                <div style={styles.cardTagline}>"{char.tagline}"</div>
                <div style={styles.cardDesc}>{char.description}</div>
                <div style={styles.cardMood}>{char.mood}</div>
              </div>
              <button
                style={{ ...styles.btn, background: char.accent }}
                onClick={() => setCharacter(char)}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                {char.buttonLabel} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--tsr-cream)",
    padding: "56px 40px",
  },
  container: {
    maxWidth: "1040px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "48px",
  },
  icon: {
    width: "52px",
    height: "52px",
    objectFit: "contain",
    marginTop: "4px",
    flexShrink: 0,
  },
  eyebrow: {
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--tsr-teal)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "8px",
  },
  title: {
    fontSize: "34px",
    fontWeight: "600",
    color: "var(--tsr-navy)",
    marginBottom: "8px",
    lineHeight: "1.2",
  },
  subtitle: {
    fontSize: "16px",
    color: "var(--tsr-text-muted)",
    lineHeight: "1.5",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
  },
  card: {
    background: "var(--tsr-card)",
    border: "1.5px solid var(--tsr-border)",
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  cardAccent: {
    height: "6px",
    width: "100%",
  },
  cardBody: {
    padding: "24px 24px 20px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  specialtyBadge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--tsr-text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "4px",
  },
  cardName: {
    fontSize: "20px",
    fontWeight: "600",
    color: "var(--tsr-navy)",
  },
  cardSource: {
    fontSize: "13px",
    color: "var(--tsr-text-muted)",
    marginBottom: "4px",
  },
  cardTagline: {
    fontSize: "14px",
    color: "#3a3550",
    fontStyle: "italic",
    lineHeight: "1.6",
    paddingLeft: "12px",
    borderLeft: "3px solid var(--tsr-border)",
    marginBottom: "4px",
  },
  cardDesc: {
    fontSize: "13px",
    color: "var(--tsr-text-muted)",
    lineHeight: "1.65",
  },
  cardMood: {
    fontSize: "12px",
    color: "var(--tsr-text-muted)",
    background: "var(--tsr-warm-gray)",
    borderRadius: "8px",
    padding: "8px 12px",
    marginTop: "4px",
  },
  btn: {
    margin: "0 24px 24px",
    padding: "12px 20px",
    fontSize: "14px",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.15s ease",
    letterSpacing: "0.01em",
  },
};