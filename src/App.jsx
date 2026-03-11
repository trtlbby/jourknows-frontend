import { useState, useCallback, useEffect } from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import { MOCK_CATEGORIES, MOCK_ARTICLES, createMockArticle } from "./services/api";
import { useArticles, useArticle, useCategories, useReactions, useSubmitReaction, useComments, useSubmitComment } from "./hooks/useArticles";
import SEOHead from "./components/SEOHead";
import ArticleJsonLd from "./components/ArticleJsonLd";
import DOMPurify from "dompurify";
import { formatDate, formatDateTime, timeAgo } from "./utils/formatters";
import { FALLBACK_CATEGORY_COLORS, REACTIONS } from "./constants";

import { 
  Search, Mail, Instagram, Facebook, Twitter, Chrome, Menu, X
} from "lucide-react";

// ─── Shared UI Helpers ────────────────────────────────────────────────────────
function LoadingSpinner({ message = "Loading..." }) {
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

// ─── Data ─────────────────────────────────────────────────────────────────────

// ─── Shared Components ────────────────────────────────────────────────────────

function Navbar({ categories = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  let active = "HOME";
  if (path !== "/") {
    const section = path.split("/")[1];
    if (section && section !== "article") {
      active = section.toUpperCase();
    } else {
      active = "";
    }
  }

  const navLinks = ["HOME", ...categories.map(c => c.name.toUpperCase())];

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [path]);

  return (
    <header id="main-navbar" style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(0, 4, 109, 0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 72, position: "relative" }}>
        {/* Left: Search (Desktop) / Hamburger (Mobile) */}
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <button className="hide-on-mobile" style={{ background: "none", border: "none", display: "flex" }}>
            <Search size={22} color="#fff" style={{ opacity: 0.85, cursor: "pointer", transition: "opacity .2s" }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.85} />
          </button>
          <button className="show-on-mobile" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: "none", border: "none", display: "flex", color: "#fff" }}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Center: Logo */}
        <div
          onClick={() => navigate("/")}
          style={{ cursor: "pointer", position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center" }}
        >
          <div style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)", transition: "background .2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
            <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 900, fontSize: 24, color: "#fff", letterSpacing: -1 }}>JourKnows</span>
          </div>
        </div>

        {/* Right: Desktop Links */}
        <nav className="hide-on-mobile" style={{ flex: 1, display: "flex", gap: 32, justifyContent: "flex-end", alignItems: "center" }}>
          {navLinks.map(link => {
            const isHome = link === "HOME";
            const targetCat = categories.find(c => c.name.toUpperCase() === link);
            const targetSlug = isHome ? "/" : `/${targetCat?.slug || link.toLowerCase()}`;
            const isActive = active === link || active === targetCat?.slug.toUpperCase();
            return (
              <button
                key={link}
                id={`nav-${link.toLowerCase()}`}
                onClick={() => navigate(targetSlug)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: isActive ? 800 : 500,
                  fontSize: 13,
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.7)",
                  position: "relative",
                  padding: "4px 0",
                  letterSpacing: 0.5,
                  transition: "color .2s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = isActive ? "#fff" : "rgba(255,255,255,0.7)"}
              >
                {link}
                {/* Active Indicator Underline */}
                <div style={{
                  position: "absolute", bottom: -2, left: isActive ? 0 : "50%", right: isActive ? 0 : "50%", height: 2, background: "#fff",
                  transition: "left .2s ease-out, right .2s ease-out", opacity: isActive ? 1 : 0
                }} />
              </button>
            )
          })}
        </nav>
        
        {/* Right: Mobile Search Icon */}
        <div className="show-on-mobile" style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
           <Search size={22} color="#fff" style={{ opacity: 0.85, cursor: "pointer" }} />
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="show-on-mobile" style={{
          position: "absolute", top: 72, left: 0, right: 0, background: "rgba(0, 4, 109, 0.95)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "16px 24px 32px", display: "flex", flexDirection: "column", gap: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}>
          {navLinks.map(link => {
            const isHome = link === "HOME";
            const targetCat = categories.find(c => c.name.toUpperCase() === link);
            const targetSlug = isHome ? "/" : `/${targetCat?.slug || link.toLowerCase()}`;
            const isActive = active === link || active === targetCat?.slug.toUpperCase();
            return (
              <button
                key={link}
                onClick={() => navigate(targetSlug)}
                style={{
                  background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  fontFamily: "Montserrat, sans-serif", fontWeight: isActive ? 800 : 500, fontSize: 18,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.75)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 12
                }}
              >
                {link}
              </button>
            )
          })}
        </div>
      )}
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
      <div className="grid-to-col" style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 40, padding: "0 16px" }}>
        <div>
          <div style={{ width: 96, height: 96, borderRadius: 12, marginBottom: 16, background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 900, fontSize: 42, color: "#00046D", letterSpacing: -2 }}>JK</span>
          </div>
          <p style={{ fontSize: 10, opacity: .8, lineHeight: 1.7, maxWidth: 220 }}>
            JourKnows is your premier campus journalism platform. Find the latest news, opinion pieces, features, and sports updates all in one place.
          </p>
        </div>

        <div>
          <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 15, marginBottom: 12 }}>
            Subscribe to our newsletter
          </p>
          <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(250,250,250,0.6)", borderRadius: 5, overflow: "hidden", flex: 1, paddingLeft: 8 }}>
              <Mail size={16} color="rgba(255,255,255,0.6)" />
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
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Facebook size={24} style={{ cursor: "pointer", opacity: 0.8 }} />
            <Twitter size={24} style={{ cursor: "pointer", opacity: 0.8 }} />
            <Instagram size={24} style={{ cursor: "pointer", opacity: 0.8 }} />
            <Chrome size={24} style={{ cursor: "pointer", opacity: 0.8 }} />
          </div>
        </div>

        <div className="flex-to-col" style={{ display: "flex", gap: 32 }}>
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

function SmallCard({ article }) {
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

function MediumCard({ article }) {
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

function HeaderCard({ article }) {
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

function HomePage({ categories = [] }) {
  const navigate = useNavigate();
  const { data: allArticlesData, isLoading, isError } = useArticles();
  const allArticles = allArticlesData?.articles || MOCK_ARTICLES;

  if (isLoading) return <LoadingSpinner message="Loading latest news..." />;

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
      <div id="hero-section" style={{ position: "relative", height: 520, background: "#d9d9d9", overflow: "hidden" }}>
        {heroArticle.coverImageUrl && <img src={heroArticle.coverImageUrl} alt="hero" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 80%)",
        }} />
        <div className="container-padding" style={{ position: "absolute", bottom: 48, left: 80, right: 80 }}>
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
              {heroArticle.author?.avatarUrl ? (
                <img src={heroArticle.author.avatarUrl} alt="" style={{ width: 52, height: 62, objectFit: "cover", borderRadius: 4 }} />
              ) : (
                <div style={{ width: 52, height: 62, background: "#rgba(255,255,255,0.2)", borderRadius: 4, border: "2px solid rgba(255,255,255,0.4)" }} />
              )}
              <span style={{ fontFamily: "Inter,sans-serif", fontStyle: "italic", color: "#fafafa", fontSize: 16, textShadow: "0 2px 4px rgba(0,0,0,.4)" }}>
                by {heroArticle.author?.fullName || "Unknown Author"}
              </span>
            </div>
            <button
              id="hero-read-more"
              onClick={() => heroArticle?.slug && navigate(`/article/${heroArticle.slug}`)}
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
      <div className="section-padding" style={{ background: "#fff", padding: "32px 80px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 24, color: "#1a1a1a", margin: 0 }}>LATEST</h2>
          <div style={{ flex: 1, height: 3, background: "linear-gradient(to right,#041eb0,#fffbfb)", marginLeft: 12, borderRadius: 2 }} />
        </div>
        <div className="grid-to-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {latestArticles.map((article) => (
            <MediumCard key={article.id} article={article} />
          ))}
        </div>
      </div>

      {/* CATEGORY SECTIONS */}
      <div style={{ background: "rgba(250,250,250,0.7)" }}>
        {categories.map((cat) => {
          const { name: label, slug } = cat;
          const color = FALLBACK_CATEGORY_COLORS[slug] || FALLBACK_CATEGORY_COLORS.default;
          
          const catArticles = getArticlesForCategory(slug);
          // Only show section if articles exist or we're using mock data
          if (catArticles.length === 0 && !MOCK_ARTICLES.length) return null;
          const topArticle = catArticles[0] || createMockArticle({ category: { name: label, slug } });
          const restArticles = catArticles.slice(1, 4);
          while (restArticles.length < 3) {
            restArticles.push(createMockArticle({ category: { name: label, slug }, id: `placeholder-${slug}-${restArticles.length}` }));
          }

          return (
            <div key={slug} className="section-padding" style={{ padding: "32px 80px 48px", position: "relative" }}>
              <SectionHeader label={label} color={color} />
              <div style={{ marginBottom: 24 }}>
                <HeaderCard article={topArticle} />
              </div>
              <div className="grid-to-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
                {restArticles.map((article, i) => (
                  <SmallCard key={article.id || i} article={article} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* KNOW THE LINE */}
      <div className="section-padding" style={{ padding: "32px 80px 48px", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <div style={{ background: "#00046D", padding: "10px 20px" }}>
            <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 22, color: "#fafafa" }}>KNOW THE LINE</span>
          </div>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "linear-gradient(to right, #041eb0, #fffbfb)" }} />
        </div>
        <div className="grid-to-col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {getArticlesForCategory("literary").slice(0, 4).map((article, i) => (
            <SmallCard key={article.id || i} article={article} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ArticlePage() {
  const { slug: articleSlug } = useParams();
  const navigate = useNavigate();
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

  if (articleLoading) {
    return <LoadingSpinner message="Reading article..." />;
  }

  if (!article) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <h1 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 900, fontSize: 48, color: "#00046D", margin: "0 0 16px" }}>404</h1>
        <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: 18, color: "#555", marginBottom: 24 }}>Article not found.</p>
        <button
          onClick={() => navigate("/")}
          style={{ background: "#00046D", border: "none", borderRadius: 20, padding: "10px 32px", cursor: "pointer", fontFamily: "Montserrat,sans-serif", fontWeight: 800, color: "#fff", fontSize: 15 }}
        >GO HOME</button>
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
      <div style={{ position: "relative", height: 480, background: "#d9d9d9", overflow: "hidden" }}>
        {article.coverImageUrl && <img src={article.coverImageUrl} alt="hero" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,.1) 0%,rgba(0,0,0,.65) 80%)" }} />
        <div className="container-padding" style={{ position: "absolute", bottom: 40, left: 80, right: 80 }}>
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
              {article.author?.avatarUrl ? (
                <img src={article.author.avatarUrl} alt="" style={{ width: 48, height: 58, objectFit: "cover", borderRadius: 4 }} />
              ) : (
                <div style={{ width: 48, height: 58, background: "rgba(255,255,255,0.2)", borderRadius: 4, border: "2px solid rgba(255,255,255,0.4)" }} />
              )}
              <span style={{ fontFamily: "Inter,sans-serif", fontStyle: "italic", color: "#fafafa", fontSize: 15 }}>
                by {article.author?.fullName || "Unknown Author"}
              </span>
            </div>
            <button
              id="article-back-btn"
              onClick={() => navigate(-1)}
              style={{ background: "transparent", border: "1px solid #fff", borderRadius: 20, padding: "8px 24px", cursor: "pointer", fontFamily: "Montserrat,sans-serif", fontWeight: 800, color: "#fff", fontSize: 15 }}
            >← BACK</button>
          </div>
        </div>
      </div>

      {/* ARTICLE CONTENT */}
      <div className="article-content" style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 40px 0" }}>
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
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.contentHtml) }}
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
            {REACTIONS.map(({ icon: Icon, type, label, color }) => (
              <button
                key={type}
                id={`reaction-${type}`}
                onClick={() => handleReaction(type)}
                style={{
                  background: "#fff", border: "1px solid #ddd", borderRadius: 16,
                  padding: "10px 14px", cursor: "pointer", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 6, transition: "transform .15s, box-shadow .15s",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)"; }}
              >
                <Icon size={28} color={color} strokeWidth={2.5} />
                <span style={{ fontFamily: "Inter,sans-serif", fontSize: 13, fontWeight: 600, color: "#444" }}>
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
          <div className="author-bio" style={{ padding: "32px", display: "flex", gap: 32, alignItems: "flex-start" }}>
            <div style={{ flex: "0 0 200px" }}>
              {article.author?.avatarUrl ? (
                <img src={article.author.avatarUrl} alt="author" style={{ width: 200, height: 240, objectFit: "cover", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,.2)" }} />
              ) : (
                <div style={{ width: 200, height: 240, background: "#d9d9d9", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "Montserrat,sans-serif", fontSize: 48, fontWeight: 900, color: "rgba(0,0,0,0.1)" }}>JK</span>
                </div>
              )}
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

          <div className="grid-to-col-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
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
          <div className="grid-to-col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 48 }}>
            {relatedArticles.map((a, i) => (
              <SmallCard key={a.id || i} article={a} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function SectionPage({ categories = [] }) {
  const { section } = useParams();
  
  // Find category match from backend data or fallback to mock
  const categoryMatch = categories.find(c => c.slug === section) || MOCK_CATEGORIES.find(c => c.slug === section) || { name: section.toUpperCase(), slug: section };
  const color = FALLBACK_CATEGORY_COLORS[categoryMatch.slug] || FALLBACK_CATEGORY_COLORS.default;
  
  const { data: articlesData, isLoading } = useArticles(categoryMatch.slug);
  const catArticles = articlesData?.articles || MOCK_ARTICLES.filter(a => a.category?.slug === categoryMatch.slug);
  const topArticle = catArticles[0] || createMockArticle({ category: categoryMatch });
  const restArticles = catArticles.slice(1);

  if (isLoading) return <LoadingSpinner message={`Loading ${categoryMatch.name} articles...`} />;

  return (
    <div>
      <SEOHead
        title={categoryMatch.name}
        description={categoryMatch.description || `${categoryMatch.name} articles on JourKnows`}
      />

      {/* Hero banner */}
      <div style={{ position: "relative", height: 320, background: "#1a1a1a", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom,rgba(0,0,0,.2),${color})`, opacity: 0.85 }} />
        <div className="container-padding" style={{ position: "absolute", bottom: 40, left: 16 }}>
          <h1 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 900, fontSize: 48, color: "#fff", margin: "0 0 8px", textTransform: "uppercase" }}>
            {categoryMatch.name}
          </h1>
          <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: 16, color: "rgba(255,255,255,0.85)", margin: 0, maxWidth: 600 }}>
            {categoryMatch.description || ""}
          </p>
        </div>
      </div>

      <div className="section-padding" style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 80px" }}>
        {/* Top article */}
        <div style={{ marginBottom: 32 }}>
          <SectionHeader label="TOP ARTICLES" color={color} />
          <HeaderCard article={topArticle} />
        </div>

        {/* Latest in section */}
        <div>
          <SectionHeader label="LATEST" color={color} />
          <div className="grid-to-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 24 }}>
            {restArticles.map((article, i) => (
              <SmallCard key={article.id || i} article={article} />
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
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

export default function App() {
  // Fetch global categories for navigation and sections
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const categories = categoriesData?.categories || MOCK_CATEGORIES;

  if (categoriesLoading) {
    return <LoadingSpinner message="Starting JourKnows..." />;
  }

  return (
    <div style={{ fontFamily: "Montserrat,sans-serif", minHeight: "100vh", background: "#fff" }}>
      <ScrollToTop />
      <Navbar categories={categories} />

      <Routes>
        <Route path="/" element={<HomePage categories={categories} />} />
        <Route path="/article/:slug" element={<ArticlePage />} />
        <Route path="/:section" element={<SectionPage categories={categories} />} />
      </Routes>
    </div>
  );
}
