import { useState } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const { initFromLogin } = useApp();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/api/login`, {
        username: username.trim()
      });
      initFromLogin(res.data);
    } catch (e) {
      setError("Something went wrong. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <div style={styles.eyebrow}>AI Movie Recommender</div>
          <h1 style={styles.headline}>
            Your next favorite<br />movie is one<br />conversation away.
          </h1>
          <p style={styles.description}>
            Pick a character. Rate a few films. Get a personalized list of
            movies you'll actually want to watch — with links to where you
            can stream them tonight.
          </p>
          <div style={styles.features}>
            <div style={styles.feature}>
              <div style={styles.featureDot} />
              <span>Powered by collaborative filtering AI</span>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureDot} />
              <span>Real-time streaming availability</span>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureDot} />
              <span>Three unique recommendation personalities</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.loginCard}>
          <h2 style={styles.cardTitle}>Let's get started</h2>
          <p style={styles.cardSubtitle}>
            No account needed. Just pick a username and we'll remember
            your taste for next time.
          </p>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Your username</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. moviebuff42"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Checking in..." : "Get my recommendations →"}
          </button>
          <p style={styles.hint}>
            Returning user? Enter the same username to pick up where
            you left off.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
  },
  left: {
    background: "#1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "64px 56px",
  },
  leftContent: {
    maxWidth: "440px",
  },
  eyebrow: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "24px",
  },
  headline: {
    fontSize: "44px",
    fontWeight: "500",
    color: "#fff",
    lineHeight: "1.15",
    marginBottom: "24px",
  },
  description: {
    fontSize: "15px",
    color: "#999",
    lineHeight: "1.7",
    marginBottom: "40px",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    color: "#bbb",
  },
  featureDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#555",
    flexShrink: 0,
  },
  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "64px 56px",
    background: "#f7f6f2",
  },
  loginCard: {
    width: "100%",
    maxWidth: "400px",
  },
  cardTitle: {
    fontSize: "28px",
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: "10px",
  },
  cardSubtitle: {
    fontSize: "14px",
    color: "#888",
    lineHeight: "1.6",
    marginBottom: "36px",
  },
  inputGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#555",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    border: "1px solid #e0dfd8",
    borderRadius: "10px",
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
    color: "#1a1a1a",
  },
  error: {
    fontSize: "13px",
    color: "#c0392b",
    marginBottom: "12px",
  },
  btn: {
    width: "100%",
    padding: "13px 20px",
    fontSize: "15px",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "500",
    marginBottom: "16px",
    transition: "opacity 0.15s ease",
    cursor: "pointer",
  },
  hint: {
    fontSize: "12px",
    color: "#bbb",
    textAlign: "center",
    lineHeight: "1.5",
  },
};