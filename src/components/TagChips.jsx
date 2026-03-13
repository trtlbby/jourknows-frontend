
// ─── Card Components (Data-Driven) ────────────────────────────────────────────
export function TagChips({ tags }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
      {tags.map(tag => (
        <span key={tag.slug} className="tag-chip">{tag.name}</span>
      ))}
    </div>
  );
}