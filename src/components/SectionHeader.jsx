export function SectionHeader({ label, color, alignRight = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
      {!alignRight && (
        <div style={{ background: color, padding: "10px 20px", borderRadius: 0 }}>
          <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 22, color: "#fafafa", letterSpacing: .5 }}>
            {label}
          </span>
        </div>
      )}
      <div style={{
        flex: 1, height: 4, borderRadius: 2,
        background: alignRight
          ? `linear-gradient(to left, ${color}, #fffbfb)`
          : `linear-gradient(to right, #041eb0, #fffbfb)`,
      }} />
      {alignRight && (
        <div style={{ background: color, padding: "10px 20px" }}>
          <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 22, color: "#fafafa", letterSpacing: .5 }}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

