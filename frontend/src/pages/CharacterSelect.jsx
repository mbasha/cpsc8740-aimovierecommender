import { useApp } from "../context/AppContext";

const characters = [
  {
    id: "randy",
    name: "Randy Meeks",
    source: "Scream",
    emoji: "🎬",
    tagline: "I know the rules. Let me tell you which movies you survive.",
    description: "Horror obsessive. Cinephile. Will judge your taste."
  },
  {
    id: "valets",
    name: "The Valets",
    source: "Key & Peele",
    emoji: "🎭",
    tagline: "Oh SNAAAP. You came to the right guys.",
    description: "Encyclopedic knowledge. Maximum enthusiasm. Zero chill."
  },
  {
    id: "abed",
    name: "Abed Nadir",
    source: "Community",
    emoji: "📽️",
    tagline: "Cool. Cool cool cool. Let's figure out your narrative arc.",
    description: "Analytical. Precise. Has seen everything twice."
  }
];

export default function CharacterSelect() {
  const { user, setCharacter } = useApp();

  function handleSelect(character) {
    setCharacter(character);
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>who do you want to help you tonight?</h1>
          <p style={styles.subtitle}>
            pick your employee. they'll ask what you've seen.
          </p>
          <p style={styles.welcome}>welcome, {user?.username}.</p>
        </div>
        <div style={styles.grid}>
          {characters.map(char => (
            <div
              key={char.id}
              style={styles.card}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#1a1a1a"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e0dfd8"}
            >
              <div style={styles.emoji}>{char.emoji}</div>
              <div style={styles.cardName}>{char.name}</div>
              <div style={styles.cardSource}>{char.source}</div>
              <div style={styles.cardTagline}>"{char.tagline}"</div>
              <div style={styles.cardDesc}>{char.description}</div>
              <button
                style={styles.btn}
                onClick={() => handleSelect(char)}
              >
                choose {char.name.split(" ")[0].toLowerCase()}
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
    padding: "48px 24px",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#888",
    marginBottom: "6px",
  },
  welcome: {
    fontSize: "13px",
    color: "#bbb",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e0dfd8",
    borderRadius: "16px",
    padding: "28px 24px",
    textAlign: "center",
    transition: "border-color 0.15s ease",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  emoji: {
    fontSize: "40px",
    marginBottom: "8px",
  },
  cardName: {
    fontSize: "17px",
    fontWeight: "500",
    color: "#1a1a1a",
  },
  cardSource: {
    fontSize: "13px",
    color: "#aaa",
    marginBottom: "4px",
  },
  cardTagline: {
    fontSize: "13px",
    color: "#555",
    fontStyle: "italic",
    lineHeight: "1.5",
    marginBottom: "4px",
  },
  cardDesc: {
    fontSize: "12px",
    color: "#aaa",
    marginBottom: "12px",
    lineHeight: "1.5",
  },
  btn: {
    padding: "10px 20px",
    fontSize: "13px",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "500",
    marginTop: "auto",
  },
};