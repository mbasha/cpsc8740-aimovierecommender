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
      const res = await axios.post(`${API}/api/login`, { username: username.trim() });
      initFromLogin(res.data);
    } catch {
      setError("Something went wrong. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div className="cyber-bg" style={styles.left}>
        {/* Radial fade so grid softly emerges around the logo */}
        <div style={styles.gridFade} />
        <div style={styles.leftContent}>
          <div style={styles.logoWrapper}>
            <img src="/topshelfrentals.png" alt="Top Shelf Rentals" style={styles.logo} />
          </div>
          <p style={styles.tagline}>Your neighborhood video store — now powered by AI.</p>
          <p style={styles.description}>
            Walk in, pick an employee, and let them help you find your next favorite movie.
            Our staff knows their films — from cult classics to blockbusters — and they'll
            match you with something worth watching tonight.
          </p>
          <div style={styles.divider} />
          <div style={styles.staffHeading}>Meet the staff</div>
          <div style={styles.staffList}>
            {[
              { name: "Randy Meeks", role: "Horror specialist. Knows every rule.", color: "var(--tsr-red)" },
              { name: "The Valets", role: "Action & blockbusters. Maximum enthusiasm.", color: "var(--tsr-teal)" },
              { name: "Abed Nadir", role: "Cinema analyst. Has seen everything twice.", color: "var(--tsr-purple)" },
            ].map(s => (
              <div key={s.name} style={styles.staffItem}>
                <div style={{ ...styles.staffDot, background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                <div>
                  <div style={styles.staffName}>{s.name}</div>
                  <div style={styles.staffRole}>{s.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="light-grid-bg" style={styles.right}>
        <div style={styles.loginCard}>
          <div style={styles.cardHeader}>
            <img src="/topshelficon.png" alt="" style={styles.cardIcon} />
            <h2 style={styles.cardTitle}>Step inside</h2>
          </div>
          <p style={styles.cardSubtitle}>
            Enter a username to get started. No password needed — we'll remember your taste for next time.
          </p>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Your name</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. moviebuff42"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
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
          <p style={styles.hint}>Returning customer? Use the same name to pick up where you left off.</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" },
  left: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "64px 56px",
    overflow: "hidden",
  },
  gridFade: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(ellipse 60% 55% at 50% 42%, #000 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  leftContent: { maxWidth: "440px", position: "relative", zIndex: 1 },
  logoWrapper: { marginBottom: "28px" },
  logo: { width: "100%", maxWidth: "340px", display: "block" },
  tagline: {
    fontSize: "15px", color: "var(--tsr-teal)", fontWeight: "600",
    marginBottom: "14px", letterSpacing: "0.02em",
    textShadow: "0 0 12px rgba(0,229,208,0.5)",
  },
  description: { fontSize: "13px", color: "#8895b8", lineHeight: "1.75", marginBottom: "28px" },
  divider: {
    height: "1px", background: "rgba(123,47,255,0.4)",
    marginBottom: "24px", boxShadow: "0 0 8px rgba(123,47,255,0.3)",
  },
  staffHeading: {
    fontSize: "11px", fontWeight: "700", color: "#555e7a",
    textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "14px",
  },
  staffList: { display: "flex", flexDirection: "column", gap: "12px" },
  staffItem: { display: "flex", alignItems: "flex-start", gap: "12px" },
  staffDot: { width: "8px", height: "8px", borderRadius: "50%", marginTop: "5px", flexShrink: 0 },
  staffName: { fontSize: "13px", fontWeight: "600", color: "#d0d8ee", marginBottom: "2px" },
  staffRole: { fontSize: "12px", color: "#555e7a" },
  right: {
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "64px 56px",
  },
  loginCard: { width: "100%", maxWidth: "400px" },
  cardHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" },
  cardIcon: { width: "40px", height: "40px", objectFit: "contain" },
  cardTitle: { fontSize: "28px", fontWeight: "700", color: "var(--tsr-navy)" },
  cardSubtitle: { fontSize: "14px", color: "var(--tsr-text-muted)", lineHeight: "1.6", marginBottom: "32px" },
  inputGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "var(--tsr-text-muted)", marginBottom: "8px" },
  input: {
    width: "100%", padding: "12px 16px", fontSize: "15px",
    border: "1.5px solid var(--tsr-border)", borderRadius: "10px",
    outline: "none", fontFamily: "inherit", background: "#fff", color: "var(--tsr-text)",
  },
  error: { fontSize: "13px", color: "var(--tsr-red)", marginBottom: "12px" },
  btn: {
    width: "100%", padding: "13px 20px", fontSize: "15px",
    background: "linear-gradient(135deg, var(--tsr-purple) 0%, var(--tsr-orange) 100%)",
    color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700",
    marginBottom: "16px", cursor: "pointer",
    boxShadow: "0 4px 20px rgba(123,47,255,0.4)",
  },
  hint: { fontSize: "12px", color: "#b8b0c8", textAlign: "center", lineHeight: "1.5" },
};