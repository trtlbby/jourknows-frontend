import { useState, useCallback } from "react";
import { MOCK_CATEGORIES, MOCK_ARTICLES, createMockArticle } from "./services/api";
import { useArticles, useArticle, useReactions, useSubmitReaction, useComments, useSubmitComment } from "./hooks/useArticles";
import SEOHead from "./components/SEOHead";
import ArticleJsonLd from "./components/ArticleJsonLd";

// ─── Asset URLs (from Figma) ──────────────────────────────────────────────────
const LOGO       = "https://www.figma.com/api/mcp/asset/10230cad-3002-4e4d-b964-2e3e2f2df496";
const HERO_IMG   = "https://www.figma.com/api/mcp/asset/efb1c652-fa66-4d27-a71f-a50150c59bf9";
const AUTHOR_IMG = "https://www.figma.com/api/mcp/asset/c3dea2c0-a640-40a4-96c3-3f0c52574711";
const SEARCH_ICON = "https://www.figma.com/api/mcp/asset/0826f66e-7363-4bd7-af2a-a6943955ff8a";
const LETTER_ICON = "https://www.figma.com/api/mcp/asset/49ecb15a-e553-4c2a-ae4a-d40d7fbbc864";
const IG_ICON    = "https://www.figma.com/api/mcp/asset/e92c90b3-55ed-43b3-a0cd-fbb625a776f7";
const FB_ICON    = "https://www.figma.com/api/mcp/asset/4b7d24fd-7339-48ae-82ff-9a80ce2dcf06";
const X_ICON     = "https://www.figma.com/api/mcp/asset/1484dcd9-c91f-40f4-b9cd-3e5c630c8ff0";
const GMAIL_ICON = "https://www.figma.com/api/mcp/asset/63525b62-7df7-416d-935a-00b1f339a315";

// Reaction emoji images — aligned to backend enum: like, love, haha, wow, sad, angry
// "Dislike" removed (not in backend schema), "Heart" → love, "Laugh" → haha
const REACT_LIKE  = "https://www.figma.com/api/mcp/asset/9e43a404-b97f-4f25-916a-e1225a5bbe6e";
const REACT_LOVE  = "https://www.figma.com/api/mcp/asset/348a674e-4ac5-4ca2-be98-18c16fd8d2b6";
const REACT_HAHA  = "https://www.figma.com/api/mcp/asset/3e9faf44-04e7-416c-990b-ee89a3561f35";
const REACT_WOW   = "https://www.figma.com/api/mcp/asset/2905cdf8-4c42-477f-ae89-cee1fd27fec7";
const REACT_SAD   = "https://www.figma.com/api/mcp/asset/575305df-e735-442f-9fb4-3ca1a0d23215";
const REACT_ANGRY = "https://www.figma.com/api/mcp/asset/a4a9dfee-674e-4083-9f76-3770bd9535e9";

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV_LINKS = ["HOME","NEWS","OPINION","FEATURES","SPORTS","SCI-TECH","LITERARY"];

// Section display config — colors are frontend-only presentation
const SECTIONS = [
  { label: "NEWS",                 slug: "news",     color: "#00046D" },
  { label: "OPINION",             slug: "opinion",  color: "#00046D" },
  { label: "FEATURES & LIFESTYLE", slug: "features", color: "#F8A42E" },
  { label: "SPORTS",              slug: "sports",   color: "#020269" },
  { label: "SCI-TECH",            slug: "sci-tech", color: "#314DEB" },
  { label: "LITERARY",            slug: "literary", color: "#AE1914" },
];

// Reactions aligned to backend reaction_type enum values
const REACTIONS = [
  { icon: REACT_LIKE,  type: "like",  label: "Like"  },
  { icon: REACT_LOVE,  type: "love",  label: "Love"  },
  { icon: REACT_HAHA,  type: "haha",  label: "Haha"  },
  { icon: REACT_WOW,   type: "wow",   label: "Wow"   },
  { icon: REACT_SAD,   type: "sad",   label: "Sad"   },
  { icon: REACT_ANGRY, type: "angry", label: "Angry" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

// ─── Shared Components ────────────────────────────────────────────────────────

function Navbar({ onNavigate, active }) {
  return (
    <header id="main-navbar" style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "linear-gradient(135deg,#000080 0%,#000055 100%)",
      boxShadow: "0 2px 16px rgba(0,0,77,0.5)",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", padding: "0 24px", height: 72 }}>
        <img src={SEARCH_ICON} alt="search" style={{ width: 22, height: 22, marginRight: 12, opacity: 0.7, cursor: "pointer" }} />

        <div
          onClick={() => onNavigate("home")}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1, justifyContent: "center" }}
        >
          <img src={LOGO} alt="JourKnows" style={{ width: 54, height: 54, borderRadius: 8 }} />
        </div>

        <nav style={{ display: "flex", gap: 28 }}>
          {NAV_LINKS.map(link => (
            <button
              key={link}
              id={`nav-${link.toLowerCase()}`}
              onClick={() => onNavigate(link === "HOME" ? "home" : link.toLowerCase())}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "Montserrat, sans-serif",
                fontWeight: active === link ? 800 : 600,
                fontSize: 13,
                color: active === link ? "#ffffff" : "rgba(255,255,255,0.75)",
                borderBottom: active === link ? "2px solid #fff" : "2px solid transparent",
                paddingBottom: 2,
                letterSpacing: 0.5,
                transition: "all .2s",
              }}
            >{link}</button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer id="main-footer" style={{
      background: "radial-gradient(ellipse at center, #00046d 0%, #080a5a 25%, #0f1146 50%, #171832 75%, #1e1e1e 100%)",
      padding: "48px 48px 0",
      color: "rgba(255,255,255,0.85)",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 40 }}>
        <div>
          <img src={LOGO} alt="JourKnows" style={{ width: 96, height: 96, borderRadius: 12, marginBottom: 12 }} />
          <p style={{ fontSize: 10, opacity: .8, lineHeight: 1.7, maxWidth: 220 }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        <div>
          <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 15, marginBottom: 12 }}>
            Subscribe to our newsletter
          </p>
          <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(250,250,250,0.6)", borderRadius: 5, overflow: "hidden", flex: 1 }}>
              <img src={LETTER_ICON} alt="" style={{ width: 16, height: 24, margin: "0 8px", objectFit: "contain" }} />
              <input
                id="newsletter-email"
                placeholder="your@email.com"
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "rgba(255,255,255,0.8)", fontSize: 11,
                  fontFamily: "Montserrat,sans-serif", padding: "6px 4px",
                }}
              />
            </div>
            <button id="newsletter-subscribe" style={{
              background: "#fafafa", border: "none", cursor: "pointer",
              fontFamily: "Montserrat,sans-serif", fontWeight: 700,
              color: "#00046D", fontSize: 11, padding: "0 14px", borderRadius: "0 5px 5px 0",
            }}>SUBSCRIBE</button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[FB_ICON, X_ICON, IG_ICON, GMAIL_ICON].map((ic, i) => (
              <img key={i} src={ic} alt="" style={{ width: 36, height: 20, objectFit: "contain", cursor: "pointer" }} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 32 }}>
          <div>
            <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 14, marginBottom: 8 }}>JourKnows PH</p>
            {["About Us", "Contact Us", "Privacy Policy"].map(l => (
              <p key={l} style={{ fontFamily: "Montserrat,sans-serif", fontSize: 13, marginBottom: 6, cursor: "pointer", opacity: .85 }}>{l}</p>
            ))}
          </div>
          <div>
            <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Quick Links</p>
            {["Volunteer", "Subscribe"].map(l => (
              <p key={l} style={{ fontFamily: "Montserrat,sans-serif", fontSize: 13, marginBottom: 6, cursor: "pointer", opacity: .85 }}>{l}</p>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 32,
        background: "linear-gradient(90deg,#797979,#505050,#3c3c3c,#272727)",
        textAlign: "center", padding: "14px 0",
        fontFamily: "Montserrat,sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)",
      }}>
        © JourKnows 2025. All rights reserved.
      </div>
    </footer>
  );
}

// ─── Card Components (Data-Driven) ────────────────────────────────────────────

function TagChips({ tags }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
      {tags.map(tag => (
        <span key={tag.slug} className="tag-chip">{tag.name}</span>
      ))}
    </div>
  );
}

function SmallCard({ article, onClick }) {
  const categoryName = article?.category?.name || "CATEGORY";
  return (
    <div
      onClick={() => onClick(article)}
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

function MediumCard({ article, onClick }) {
  return (
    <div
      onClick={() => onClick(article)}
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

function HeaderCard({ article, onClick }) {
  return (
    <div
      onClick={() => onClick(article)}
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

function SectionHeader({ label, color, alignRight = false }) {
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

// ─── Pages ────────────────────────────────────────────────────────────────────

function HomePage({ onArticleClick }) {
  const { data: allArticlesData } = useArticles();
  const allArticles = allArticlesData?.articles || MOCK_ARTICLES;

  const heroArticle = allArticles[0] || createMockArticle();
  const latestArticles = allArticles.slice(0, 4);

  const getArticlesForCategory = (slug) => {
    return allArticles.filter(a => a.category?.slug === slug);
  };

  return (
    <div>
      <SEOHead
        title="Home"
        description="JourKnows — Your source for campus journalism, news, opinion, features, sports, sci-tech, and literary content."
      />

      {/* HERO */}
      <div id="hero-section" style={{ position: "relative", height: 520, overflow: "hidden" }}>
        <img src={heroArticle.coverImageUrl || HERO_IMG} alt="hero" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 80%)",
        }} />
        <div style={{ position: "absolute", bottom: 48, left: 80, right: 80 }}>
          <div style={{
            display: "inline-block", background: "#fafafa",
            padding: "4px 16px", borderRadius: 20, marginBottom: 12,
            boxShadow: "0 4px 4px rgba(0,0,0,0.51)",
          }}>
            <span style={{
              fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 15,
              background: "linear-gradient(to left, #0007d3, #00046d)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>{heroArticle.category?.name?.toUpperCase() || "NEWS"}</span>
          </div>
          <h1 style={{
            fontFamily: "Montserrat,sans-serif", fontWeight: 900,
            fontSize: 42, color: "#fafafa", margin: "0 0 10px",
            lineHeight: 1.1, textShadow: "0 2px 8px rgba(0,0,0,.5)", maxWidth: 700,
          }}>
            {heroArticle.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <img src={heroArticle.author?.avatarUrl || AUTHOR_IMG} alt="" style={{ width: 52, height: 62, objectFit: "cover", borderRadius: 4 }} />
              <span style={{ fontFamily: "Inter,sans-serif", fontStyle: "italic", color: "#fafafa", fontSize: 16, textShadow: "0 2px 4px rgba(0,0,0,.4)" }}>
                by {heroArticle.author?.fullName || "Unknown Author"}
              </span>
            </div>
            <button
              id="hero-read-more"
              onClick={() => onArticleClick(heroArticle)}
              style={{
                background: "transparent", border: "1px solid #fff",
                borderRadius: 20, padding: "10px 28px", cursor: "pointer",
                fontFamily: "Montserrat,sans-serif", fontWeight: 800,
                color: "#fff", fontSize: 16,
              }}
            >READ MORE</button>
          </div>
        </div>
      </div>

      {/* LATEST SECTION */}
      <div style={{ background: "#fff", padding: "32px 80px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 24, color: "#1a1a1a", margin: 0 }}>LATEST</h2>
          <div style={{ flex: 1, height: 3, background: "linear-gradient(to right,#041eb0,#fffbfb)", marginLeft: 12, borderRadius: 2 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {latestArticles.map((article) => (
            <MediumCard key={article.id} article={article} onClick={onArticleClick} />
          ))}
        </div>
      </div>

      {/* CATEGORY SECTIONS */}
      <div style={{ background: "rgba(250,250,250,0.7)" }}>
        {SECTIONS.map(({ label, slug, color }) => {
          const catArticles = getArticlesForCategory(slug);
          const topArticle = catArticles[0] || createMockArticle({ category: { name: label, slug } });
          const restArticles = catArticles.slice(1, 4);
          while (restArticles.length < 3) {
            restArticles.push(createMockArticle({ category: { name: label, slug }, id: `placeholder-${slug}-${restArticles.length}` }));
          }

          return (
            <div key={slug} style={{ padding: "32px 80px 48px", position: "relative" }}>
              <SectionHeader label={label} color={color} />
              <div style={{ marginBottom: 24 }}>
                <HeaderCard article={topArticle} onClick={onArticleClick} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
                {restArticles.map((article, i) => (
                  <SmallCard key={article.id || i} article={article} onClick={onArticleClick} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* KNOW THE LINE */}
      <div style={{ padding: "32px 80px 48px", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <div style={{ background: "#00046D", padding: "10px 20px" }}>
            <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 22, color: "#fafafa" }}>KNOW THE LINE</span>
          </div>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "linear-gradient(to right, #041eb0, #fffbfb)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {getArticlesForCategory("literary").slice(0, 4).map((article, i) => (
            <SmallCard key={article.id || i} article={article} onClick={onArticleClick} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ArticlePage({ articleSlug, onBack, onArticleClick }) {
  // TanStack Query hooks
  const { data: article, isLoading: articleLoading } = useArticle(articleSlug);
  const { data: reactions } = useReactions(article?.id);
  const { data: commentsData } = useComments(article?.id);
  const submitReactionMutation = useSubmitReaction(article?.id);
  const submitCommentMutation = useSubmitComment(article?.id);

  const comments = commentsData?.comments || [];
  const [comment, setComment] = useState({ guestName: "", content: "" });

  // Related articles from same category
  const { data: relatedData } = useArticles(article?.category?.slug);
  const relatedArticles = (relatedData?.articles || MOCK_ARTICLES)
    .filter(a => a.slug !== articleSlug)
    .slice(0, 4);

  const handleReaction = useCallback((type) => {
    submitReactionMutation.mutate({ type });
  }, [submitReactionMutation]);

  const handleCommentSubmit = useCallback(() => {
    if (!comment.guestName.trim() || !comment.content.trim()) return;
    submitCommentMutation.mutate(
      { guestName: comment.guestName, content: comment.content },
      { onSuccess: () => setComment({ guestName: "", content: "" }) },
    );
  }, [comment, submitCommentMutation]);

  if (articleLoading || !article) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: 18, color: "#888" }}>Loading article...</p>
      </div>
    );
  }

  const submitting = submitCommentMutation.isPending;

  return (
    <div>
      <SEOHead
        title={article.title}
        description={article.excerpt}
        image={article.coverImageUrl}
        url={`/article/${article.slug}`}
        type="article"
      />
      <ArticleJsonLd article={article} />

      {/* HERO */}
      <div style={{ position: "relative", height: 480, overflow: "hidden" }}>
        <img src={article.coverImageUrl || HERO_IMG} alt="hero" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,.1) 0%,rgba(0,0,0,.65) 80%)" }} />
        <div style={{ position: "absolute", bottom: 40, left: 80, right: 80 }}>
          <div style={{ display: "inline-block", background: "#fafafa", padding: "4px 16px", borderRadius: 20, marginBottom: 10, boxShadow: "0 4px 4px rgba(0,0,0,.5)" }}>
            <span style={{
              fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 14,
              background: "linear-gradient(to left,#0007d3,#00046d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>{article.category?.name?.toUpperCase() || "NEWS"}</span>
          </div>
          <h1 id="article-title" style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 900, fontSize: 38, color: "#fafafa", margin: "0 0 10px", lineHeight: 1.1, maxWidth: 700 }}>
            {article.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src={article.author?.avatarUrl || AUTHOR_IMG} alt="" style={{ width: 48, height: 58, objectFit: "cover", borderRadius: 4 }} />
              <span style={{ fontFamily: "Inter,sans-serif", fontStyle: "italic", color: "#fafafa", fontSize: 15 }}>
                by {article.author?.fullName || "Unknown Author"}
              </span>
            </div>
            <button
              id="article-back-btn"
              onClick={onBack}
              style={{ background: "transparent", border: "1px solid #fff", borderRadius: 20, padding: "8px 24px", cursor: "pointer", fontFamily: "Montserrat,sans-serif", fontWeight: 800, color: "#fff", fontSize: 15 }}
            >← BACK</button>
          </div>
        </div>
      </div>

      {/* ARTICLE CONTENT */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 40px 0" }}>
        {/* Meta: publishedAt from backend */}
        <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 600, fontSize: 14, color: "rgba(30,30,30,0.6)", marginBottom: 24 }}>
          Published {formatDateTime(article.publishedAt)}
        </p>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            {article.tags.map(tag => (
              <span key={tag.slug} className="tag-chip" style={{ fontSize: 13, padding: "4px 12px", marginRight: 8 }}>
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Featured image */}
        <div style={{
          background: article.coverImageUrl ? `url(${article.coverImageUrl}) center/cover` : "#d9d9d9",
          borderRadius: 16, height: 400, marginBottom: 12, position: "relative",
        }}>
          <p style={{ position: "absolute", bottom: 12, right: 16, fontFamily: "Montserrat,sans-serif", fontStyle: "italic", fontSize: 13, color: "rgba(30,30,30,0.6)", margin: 0 }}>
            Photo by {article.author?.fullName || "Unknown"}
          </p>
        </div>

        {/* Article body — rendered from backend contentHtml */}
        {article.contentHtml ? (
          <div
            id="article-body"
            style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 500, fontSize: 18, color: "#1e1e1e", lineHeight: 1.8, textAlign: "justify", marginBottom: 32 }}
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />
        ) : (
          [0, 1, 2, 3].map(i => (
            <p key={i} style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 500, fontSize: 18, color: "#1e1e1e", lineHeight: 1.8, marginBottom: 24, textAlign: "justify" }}>
              <strong>L</strong>orem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          ))
        )}

        {/* REACTIONS — 6 types matching backend enum, no Points system */}
        <div id="reactions-section" style={{ background: "#f9f9f9", borderRadius: 16, padding: "24px 32px", marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {REACTIONS.map(({ icon, type, label }) => (
              <button
                key={type}
                id={`reaction-${type}`}
                onClick={() => handleReaction(type)}
                style={{
                  background: "#d9d9d9", border: "none", borderRadius: 16,
                  padding: "10px 14px", cursor: "pointer", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 4, transition: "transform .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.12)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <img src={icon} alt={label} style={{ width: 36, height: 36, objectFit: "contain" }} />
                <span style={{ fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 500, color: "#222" }}>
                  {reactions[type] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ABOUT THE WRITER — driven by author profile from backend */}
        <div style={{
          borderTop: "4px solid", borderImage: "linear-gradient(to right,#0090ff,#12006c) 1",
          background: "#fafafa", borderRadius: 16, marginBottom: 40, overflow: "hidden",
        }}>
          <div style={{ background: "linear-gradient(to right,#170075,#2c00db)", height: 4 }} />
          <div style={{ padding: "32px", display: "flex", gap: 32, alignItems: "flex-start" }}>
            <div style={{ flex: "0 0 200px" }}>
              <img src={article.author?.avatarUrl || AUTHOR_IMG} alt="author" style={{ width: 200, height: 240, objectFit: "cover", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,.2)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 24,
                background: "linear-gradient(to right,#0e00aa,#05005c)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                marginBottom: 16,
              }}>ABOUT THE WRITER</h3>
              <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 18, color: "#1e1e1e", marginBottom: 8 }}>
                {article.author?.fullName || "Unknown Author"}
              </p>
              <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: 16, color: "#1e1e1e", lineHeight: 1.75, textAlign: "justify" }}>
                {article.author?.bio || "No bio available."}
              </p>
            </div>
          </div>
          <div style={{ background: "linear-gradient(to right,#170075,#2c00db)", height: 80 }} />
        </div>

        {/* COMMENTS — guestName + content only, no email field */}
        <div id="comments-section" style={{ borderTop: "2px solid #0007d3", paddingTop: 32, marginBottom: 40 }}>
          <h2 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 26, color: "#000055", marginBottom: 8 }}>
            Let us know your thoughts!
          </h2>
          <p style={{ fontFamily: "Montserrat,sans-serif", fontStyle: "italic", fontSize: 14, color: "#1e1e1e", marginBottom: 32 }}>
            Leave a comment below about the article or show your reaction by clicking up above. All personal information will be kept confidential. Required fields are marked <span style={{ color: "#ff4646" }}>*</span>.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            {/* Comment list */}
            <div>
              <h3 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 22, color: "#1e1e1e", marginBottom: 20 }}>Comments</h3>
              {comments.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, background: "rgba(200,200,200,0.5)", borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 600, fontSize: 14, color: "rgba(30,30,30,0.6)" }}>
                        {c.guestName || c.author?.fullName || "anonymous"}
                      </span>
                      <span style={{ fontFamily: "Montserrat,sans-serif", fontSize: 10, color: "rgba(30,30,30,0.5)" }}>
                        {formatDateTime(c.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: 13, color: "rgba(30,30,30,0.9)", textAlign: "justify", margin: 0 }}>
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
              <button id="comments-read-more" style={{
                background: "#00046D", border: "1px solid #00046D",
                borderRadius: 20, padding: "10px 28px", cursor: "pointer",
                fontFamily: "Montserrat,sans-serif", fontWeight: 800, color: "#fff", fontSize: 15, marginTop: 8,
              }}>READ MORE</button>
            </div>

            {/* Comment form — aligned to backend: guestName + content, no email */}
            <div style={{ background: "#fafafa", border: "1px solid rgba(0,4,109,0.6)", borderRadius: 20, padding: 28 }}>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="comment-content" style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 600, fontSize: 15, color: "rgba(30,30,30,0.85)" }}>
                  COMMENT <span style={{ color: "#ff4646" }}>*</span>
                </label>
                <textarea
                  id="comment-content"
                  rows={4}
                  value={comment.content}
                  onChange={e => setComment({ ...comment, content: e.target.value })}
                  style={{
                    width: "100%", marginTop: 8, background: "rgba(217,217,217,0.26)",
                    border: "none", borderRadius: 12, padding: 12,
                    fontFamily: "Montserrat,sans-serif", fontSize: 14, resize: "vertical",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="comment-guest-name" style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 600, fontSize: 15, color: "rgba(30,30,30,0.85)" }}>
                  NAME <span style={{ color: "#ff4646" }}>*</span>
                </label>
                <input
                  id="comment-guest-name"
                  value={comment.guestName}
                  onChange={e => setComment({ ...comment, guestName: e.target.value })}
                  style={{
                    width: "100%", marginTop: 8, background: "rgba(217,217,217,0.26)",
                    border: "none", borderRadius: 12, padding: "10px 12px",
                    fontFamily: "Montserrat,sans-serif", fontSize: 14,
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
              <button
                id="comment-submit"
                onClick={handleCommentSubmit}
                disabled={submitting}
                style={{
                  background: "#00046D", borderRadius: 30, border: "none",
                  padding: "10px 0", width: "100%", cursor: submitting ? "wait" : "pointer",
                  fontFamily: "Montserrat,sans-serif", fontWeight: 700, color: "#fafafa", fontSize: 16,
                  opacity: submitting ? 0.6 : 1,
                }}
              >{submitting ? "Submitting..." : "Leave a reply"}</button>
            </div>
          </div>
        </div>

        {/* RELATED ARTICLES — same category from backend */}
        <div style={{ borderTop: "2px solid #0007d3", paddingTop: 32, marginBottom: 0 }}>
          <h2 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 26, color: "#000055", marginBottom: 24 }}>
            RELATED ARTICLES
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 48 }}>
            {relatedArticles.map((a, i) => (
              <SmallCard key={a.id || i} article={a} onClick={onArticleClick} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function SectionPage({ section, onArticleClick }) {
  const sec = SECTIONS.find(s => s.slug === section) || SECTIONS[0];
  const { data: articlesData } = useArticles(sec.slug);
  const catArticles = articlesData?.articles || MOCK_ARTICLES.filter(a => a.category?.slug === sec.slug);
  const topArticle = catArticles[0] || createMockArticle({ category: { name: sec.label, slug: sec.slug } });
  const restArticles = catArticles.slice(1);

  return (
    <div>
      <SEOHead
        title={sec.label}
        description={MOCK_CATEGORIES.find(c => c.slug === sec.slug)?.description || `${sec.label} articles on JourKnows`}
      />

      {/* Hero banner */}
      <div style={{ position: "relative", height: 320, overflow: "hidden" }}>
        <img src={HERO_IMG} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,.2),rgba(0,0,0,.7))" }} />
        <div style={{ position: "absolute", bottom: 40, left: 80 }}>
          <h1 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 900, fontSize: 48, color: "#fff", margin: "0 0 8px" }}>
            {sec.label}
          </h1>
          <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: 16, color: "rgba(255,255,255,0.85)", margin: 0 }}>
            {MOCK_CATEGORIES.find(c => c.slug === sec.slug)?.description || ""}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 80px" }}>
        {/* Top article */}
        <div style={{ marginBottom: 32 }}>
          <SectionHeader label="TOP ARTICLES" color={sec.color} />
          <HeaderCard article={topArticle} onClick={onArticleClick} />
        </div>

        {/* Latest in section */}
        <div>
          <SectionHeader label="LATEST" color={sec.color} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 24 }}>
            {restArticles.map((article, i) => (
              <SmallCard key={article.id || i} article={article} onClick={onArticleClick} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button style={{
              background: "#00046D", border: "1px solid #00046D", borderRadius: 20,
              padding: "10px 32px", cursor: "pointer",
              fontFamily: "Montserrat,sans-serif", fontWeight: 800, color: "#fff", fontSize: 15,
            }}>READ MORE</button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [activeNav, setActiveNav] = useState("HOME");
  const [articleSlug, setArticleSlug] = useState(null);

  const navigate = (dest) => {
    setPage(dest);
    setActiveNav(dest === "home" ? "HOME" : dest.toUpperCase());
    setArticleSlug(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToArticle = (article) => {
    setPage("article");
    setArticleSlug(article?.slug || null);
    setActiveNav("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ fontFamily: "Montserrat,sans-serif", minHeight: "100vh", background: "#fff" }}>
      <Navbar onNavigate={navigate} active={activeNav} />

      {page === "home" && (
        <HomePage onArticleClick={navigateToArticle} />
      )}
      {page === "article" && (
        <ArticlePage
          articleSlug={articleSlug}
          onBack={() => navigate("home")}
          onArticleClick={navigateToArticle}
        />
      )}
      {["news", "opinion", "features", "sports", "sci-tech", "literary"].includes(page) && (
        <SectionPage section={page} onArticleClick={navigateToArticle} />
      )}
    </div>
  );
}
