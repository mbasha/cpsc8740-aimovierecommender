import { useApp } from "../context/AppContext";

const characters = [
  {
    id: "randy",
    name: "Randy Meeks",
    source: "Scream",
    buttonLabel: "Choose Randy",
    tagline: "I know the rules. Let me tell you which movies you survive.",
    description: "Horror obsessive. Cinephile. Will judge your taste — but he's never wrong.",
    accent: "#1a1a1a",
    mood: "For fans of genre films, cult classics, and movies with rules.",
  },
  {
    id: "valets",
    name: "The Valets",
    source: "Key & Peele",
    buttonLabel: "Choose The Valets",
    tagline: "Oh SNAAAP. You came to the right guys.",
    description: "Encyclopedic knowledge. Maximum enthusiasm. They've seen everything and loved most of it.",
    accent: "#1a1a1a",
    mood: "For fans of crowd pleasers, blockbusters, and genuinely great cinema.",
  },
  {
    id: "abed",
    name: "Abed Nadir",
    source: "Community",
    buttonLabel: "Choose Abed",
    tagline: "Cool. Cool cool cool. Let's figure out your narrative arc.",
    description: "Analytical. Precise. Will identify your cinematic tropes before you do.",
    accent: "#1a1a1a",
    mood: "For fans of structure, subtext, and films that reward close watching.",
  }
];

export default function CharacterSelect() {
  const { user, setCharacter } = useApp();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.eyebrow}>Welcome, {user?.username}</div>
          <h1 style={styles.title}>Who do you want to help you tonight?</h1>
          <p style={styles.subtitle}>
            Pick your employee. They'll ask what you've seen, then build your list.
          </p>
        </div>
        <div style={styles.grid}>
          {characters.map(char => (
            <div key={char.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.cardName}>{char.name}</div>
                    <div style={styles.cardSource}>{char.source}</div>
                  </div>
                </div>
                <div style={styles.cardTagline}>"{char.tagline}"</div>
                <div style={styles.cardDesc}>{char.description}</div>
                <div style={styles.cardMood}>{char.mood}</div>
              </div>
              <button
                style={styles.btn}
                onClick={() => setCharacter(char)}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#333";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#1a1a1a";
                }}
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
    padding: "64px 40px",
    background: "#f7f6f2",
  },
  container: {
    maxWidth: "1040px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "48px",
  },
  eyebrow: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "12px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: "12px",
    lineHeight: "1.2",
  },
  subtitle: {
    fontSize: "16px",
    color: "#888",
    lineHeight: "1.6",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e0dfd8",
    borderRadius: "16px",
    padding: "32px 28px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "340px",
    transition: "box-shadow 0.2s ease, transform 0.2s ease",
  },
  cardTop: {
    flex: 1,
    marginBottom: "28px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  cardName: {
    fontSize: "20px",
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: "4px",
  },
  cardSource: {
    fontSize: "13px",
    color: "#aaa",
  },
  cardTagline: {
    fontSize: "14px",
    color: "#444",
    fontStyle: "italic",
    lineHeight: "1.6",
    marginBottom: "16px",
    paddingLeft: "12px",
    borderLeft: "2px solid #e0dfd8",
  },
  cardDesc: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.6",
    marginBottom: "12px",
  },
  cardMood: {
    fontSize: "12px",
    color: "#aaa",
    lineHeight: "1.5",
    background: "#f7f6f2",
    borderRadius: "8px",
    padding: "8px 12px",
  },
  btn: {
    width: "100%",
    padding: "13px 20px",
    fontSize: "14px",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "500",
    transition: "background 0.15s ease",
  },
};