
// ─── Shared UI Helpers ────────────────────────────────────────────────────────
export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "40vh", gap: 16 }}>
      <div className="spinner" style={{
        width: 40, height: 40, border: "4px solid rgba(0,4,109,0.1)", borderTop: "4px solid #00046D",
        borderRadius: "50%", animation: "spin 1s linear infinite"
      }} />
      <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: 16, color: "#555", fontWeight: 600 }}>{message}</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}