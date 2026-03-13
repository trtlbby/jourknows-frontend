import { useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/formatters";
import { TagChips } from "./TagChips";


export function MediumCard({ article }) {
  const navigate = useNavigate();
  return (
    <div
      className="card-collapse"
      onClick={() => article?.slug && navigate(`/article/${article.slug}`)}
      style={{
        background: "#f4f4f4", borderRadius: 10, overflow: "hidden",
        cursor: "pointer", display: "flex", gap: 0,
        transition: "transform .2s, box-shadow .2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,77,.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{
        background: article?.coverImageUrl ? `url(${article.coverImageUrl}) center/cover` : "#d9d9d9",
        width: 220, minWidth: 220, borderRadius: "10px 0 0 10px",
      }} />
      <div style={{ padding: "16px 18px", flex: 1 }}>
        <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 16, color: "#151515", margin: "0 0 8px", lineHeight: 1.4 }}>
          {article?.title || "Headline goes here. Headline goes here."}
        </p>
        <p style={{ fontFamily: "Inter,sans-serif", fontStyle: "italic", fontSize: 13, color: "#555", margin: "0 0 4px" }}>
          by {article?.author?.fullName || "Unknown Author"}
        </p>
        <p style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: "#888" }}>
          {timeAgo(article?.publishedAt)}
        </p>
        <TagChips tags={article?.tags} />
      </div>
    </div>
  );
}