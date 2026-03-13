import { useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/formatters";
import { TagChips } from "./TagChips";

export function HeaderCard({ article }) {
  const navigate = useNavigate();
  return (
    <div
      className="card-collapse"
      onClick={() => article?.slug && navigate(`/article/${article.slug}`)}
      style={{
        background: "#f4f4f4", borderRadius: 10, overflow: "hidden",
        cursor: "pointer", display: "flex", gap: 0, height: 250,
        transition: "transform .2s, box-shadow .2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,77,.18)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{
        background: article?.coverImageUrl ? `url(${article.coverImageUrl}) center/cover` : "#d9d9d9",
        width: 480, minWidth: 480,
      }} />
      <div style={{ padding: "24px 24px", flex: 1 }}>
        <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 22, color: "#151515", margin: "0 0 12px", lineHeight: 1.4 }}>
          {article?.title || "Headline goes here. Headline goes here. Headline."}
        </p>
        <p style={{ fontFamily: "Inter,sans-serif", fontStyle: "italic", fontSize: 14, color: "#555", margin: "0 0 8px" }}>
          by {article?.author?.fullName || "Unknown Author"}
        </p>
        <p style={{ fontFamily: "Inter,sans-serif", fontSize: 13, color: "#888", marginBottom: 12 }}>
          {timeAgo(article?.publishedAt)}
        </p>
        <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: 14, color: "#333", lineHeight: 1.6 }}>
          {article?.excerpt || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."}
        </p>
        <TagChips tags={article?.tags} />
      </div>
    </div>
  );
}