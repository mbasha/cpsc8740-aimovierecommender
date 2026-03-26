import { useState } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const { setUser, setRecommendations } = useApp();
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
      const res = await axios.post(`${API}/api/login`, { username: username.trim() });
      setUser(res.data);
      // Don't pre-populate recommendations — let App.jsx routing handle it
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
      <div style={styles.card}>
        <div style={styles.logo}>🎬</div>
        <h1 style={styles.title}>AI Movie Recommender</h1>
        <p style={styles.subtitle}>
          Pick an employee. Rate some movies. Get recommendations.
        </p>
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button
            style={styles.btn}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "..." : "Let's go"}
          </button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <p style={styles.hint}>No password needed. Just pick a username and go.</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e0dfd8",
    borderRadius: "16px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  logo: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "500",
    marginBottom: "8px",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: "14px",
    color: "#888",
    marginBottom: "32px",
    lineHeight: "1.6",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    fontSize: "14px",
    border: "1px solid #e0dfd8",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "inherit",
  },
  btn: {
    padding: "10px 20px",
    fontSize: "14px",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "500",
  },
  error: {
    fontSize: "13px",
    color: "#c0392b",
    marginBottom: "8px",
  },
  hint: {
    fontSize: "12px",
    color: "#bbb",
    marginTop: "8px",
  },
};