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
          <img
            src="/topshelfrentals.png"
            alt="Top Shelf Rentals"
            style={styles.logo}
          />
          <p style={styles.tagline}>
            Your neighborhood video store — now powered by AI.
          </p>
          <p style={styles.description}>
            Walk in, pick an employee, and let them help you find your next
            favorite movie. Our staff knows their films — from cult classics
            to blockbusters — and they'll match you with something worth
            watching tonight.
          </p>
          <div style={styles.divider} />
          <div style={styles.staffPreview}>
            <div style={styles.staffHeading}>Meet the staff</div>
            <div style={styles.staffList}>
              <div style={styles.staffItem}>
                <div style={styles.staffDot} />
                <div>
                  <div style={styles.staffName}>Randy Meeks</div>
                  <div style={styles.staffRole}>Horror specialist. Knows every rule.</div>
                </div>
              </div>
              <div style={styles.staffItem}>
                <div style={styles.staffDot} />
                <div>
                  <div style={styles.staffName}>The Valets</div>
                  <div style={styles.staffRole}>Action & blockbusters. Maximum enthusiasm.</div>
                </div>
              </div>
              <div style={styles.staffItem}>
                <div style={styles.staffDot} />
                <div>
                  <div style={styles.staffName}>Abed Nadir</div>
                  <div style={styles.staffRole}>Cinema analyst. Has seen everything twice.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.loginCard}>
          <div style={styles.cardHeader}>
            <img src="/topshelficon.png" alt="" style={styles.cardIcon} />
            <h2 style={styles.cardTitle}>Step inside</h2>
          </div>
          <p style={styles.cardSubtitle}>
            Enter a username to get started. No password needed — we'll
            remember your taste for next time.
          </p>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Your name</label>
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
            {loading ? "Checking in..." : "Come on in →"}
          </button>
          <p style={styles.hint}>
            Returning customer? Use the same name to pick up where you left off.
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
    background: "var(--tsr-navy)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "64px 56px",
    position: "relative",
    overflow: "hidden",
  },
  leftContent: {
    maxWidth: "440px",
    position: "relative",
    zIndex: 1,
  },
  logo: {
    width: "100%",
    maxWidth: "320px",
    marginBottom: "28px",
  },
  tagline: {
    fontSize: "16px",
    color: "var(--tsr-teal)",
    fontWeight: "500",
    marginBottom: "16px",
    letterSpacing: "0.01em",
  },
  description: {
    fontSize: "15px",
    color: "#8895b8",
    lineHeight: "1.75",
    marginBottom: "32px",
  },
  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.08)",
    marginBottom: "28px",
  },
  staffPreview: {},
  staffHeading: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#555e7a",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "16px",
  },
  staffList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  staffItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  staffDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "var(--tsr-teal)",
    marginTop: "5px",
    flexShrink: 0,
  },
  staffName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#d0d8ee",
    marginBottom: "2px",
  },
  staffRole: {
    fontSize: "12px",
    color: "#555e7a",
  },
  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "64px 56px",
    background: "var(--tsr-cream)",
  },
  loginCard: {
    width: "100%",
    maxWidth: "400px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  cardIcon: {
    width: "36px",
    height: "36px",
    objectFit: "contain",
  },
  cardTitle: {
    fontSize: "28px",
    fontWeight: "600",
    color: "var(--tsr-navy)",
  },
  cardSubtitle: {
    fontSize: "14px",
    color: "var(--tsr-text-muted)",
    lineHeight: "1.6",
    marginBottom: "32px",
  },
  inputGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--tsr-text-muted)",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    border: "1.5px solid var(--tsr-border)",
    borderRadius: "10px",
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
    color: "var(--tsr-text)",
    transition: "border-color 0.15s",
  },
  error: {
    fontSize: "13px",
    color: "var(--tsr-red)",
    marginBottom: "12px",
  },
  btn: {
    width: "100%",
    padding: "13px 20px",
    fontSize: "15px",
    background: "var(--tsr-purple)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    marginBottom: "16px",
    transition: "opacity 0.15s ease",
    cursor: "pointer",
    letterSpacing: "0.01em",
  },
  hint: {
    fontSize: "12px",
    color: "#b8b0c8",
    textAlign: "center",
    lineHeight: "1.5",
  },
};