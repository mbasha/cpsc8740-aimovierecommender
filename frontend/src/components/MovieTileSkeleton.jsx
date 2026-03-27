export default function MovieTileSkeleton() {
  return (
    <div style={styles.tile}>
      <div className="skeleton" style={styles.poster} />
      <div style={styles.info}>
        <div className="skeleton" style={{ height: "12px", width: "85%", marginBottom: "6px", borderRadius: "4px" }} />
        <div className="skeleton" style={{ height: "10px", width: "60%", marginBottom: "8px", borderRadius: "4px" }} />
        <div style={styles.scoreRow}>
          <div className="skeleton" style={{ height: "10px", width: "30%", borderRadius: "4px" }} />
          <div className="skeleton" style={{ height: "10px", width: "35%", borderRadius: "4px" }} />
        </div>
      </div>
      <div style={styles.hideBtn} />
    </div>
  );
}

const styles = {
  tile: {
    background: "#fff",
    border: "1px solid #e0dfd8",
    borderRadius: "10px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  poster: {
    width: "100%",
    paddingTop: "150%",
    borderRadius: 0,
  },
  info: {
    padding: "10px 10px 4px",
    flex: 1,
  },
  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  hideBtn: {
    height: "29px",
    borderTop: "1px solid #f0efea",
  },
};