import { useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/formatters";
import { TagChips } from "./TagChips";

// ─── Card Components (Data-Driven) ────────────────────────────────────────────
export function SmallCard({ article }) {
  const navigate = useNavigate();
  const categoryName = article?.category?.name || "CATEGORY";
  return (
    <div
      onClick={() => article?.slug && navigate(`/article/${article.slug}`)}
      style={{
        background: "#f4f4f4", borderRadius: 10, overflow: "hidden",
        cursor: "pointer", transition: "transform .2s, box-shadow .2s",
        minWidth: 260,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,77,.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{
        background: article?.coverImageUrl ? `url(${article.coverImageUrl}) center/cover` : "#d9d9d9",
        height: 168, position: "relative",
      }}>
        <span style={{
          position: "absolute", bottom: 8, left: 8,
          background: "rgba(0,0,0,0.55)", color: "#fff",
          fontFamily: "Montserrat,sans-serif", fontWeight: 700,
          fontSize: 11, padding: "3px 8px", borderRadius: 4,
        }}>{categoryName.toUpperCase()}</span>
      </div>
      <div style={{ padding: "12px 12px 16px" }}>
        <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 14, color: "#151515", margin: "0 0 8px", lineHeight: 1.4 }}>
          {article?.title || "Headline goes here. Headline goes here."}
        </p>
        <p style={{ fontFamily: "Inter,sans-serif", fontStyle: "italic", fontSize: 12, color: "#555", margin: "0 0 4px" }}>
          by {article?.author?.fullName || "Unknown Author"}
        </p>
        <p style={{ fontFamily: "Inter,sans-serif", fontSize: 11, color: "#888" }}>
          {timeAgo(article?.publishedAt)}
        </p>
        <TagChips tags={article?.tags} />
      </div>
    </div>
  );
}