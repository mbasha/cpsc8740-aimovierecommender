import { useState } from "react";

export default function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={styles.row}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          style={{
            ...styles.star,
            color: star <= (hovered || value) ? "#1a1a1a" : "#e0dfd8",
          }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
      {value > 0 && (
        <span style={styles.label}>{value} / 5</span>
      )}
    </div>
  );
}

const styles = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  star: {
    fontSize: "28px",
    background: "none",
    border: "none",
    padding: "2px",
    cursor: "pointer",
    transition: "color 0.1s ease",
    lineHeight: 1,
  },
  label: {
    fontSize: "13px",
    color: "#aaa",
    marginLeft: "8px",
  },
};