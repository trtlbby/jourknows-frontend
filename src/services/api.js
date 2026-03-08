// ─── API Service Layer ────────────────────────────────────────────────────────
// Maps to jourknows-backend endpoints under /api/v1
// Falls back to mock data when the backend is unavailable.

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
  : "/api/v1"; // Vite proxy handles this in dev

// ─── Helper ───────────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}

// ─── Articles ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/articles?category=:slug&page=:page
 * Returns: { articles: Article[], total: number, page: number }
 *
 * Article shape from backend:
 *  { id, title, slug, contentHtml, excerpt, coverImageUrl,
 *    isPublished, publishedAt, authorId, categoryId, createdAt, updatedAt,
 *    author: { fullName, avatarUrl, bio },
 *    category: { name, slug },
 *    tags: [{ name, slug }] }
 */
export async function getArticles(categorySlug = null, page = 1) {
  const params = new URLSearchParams({ page: String(page) });
  if (categorySlug) params.set("category", categorySlug);
  return apiFetch(`/articles?${params}`);
}

/**
 * GET /api/v1/articles/:slug
 * Returns: Article (full, with contentHtml)
 */
export async function getArticleBySlug(slug) {
  return apiFetch(`/articles/${slug}`);
}

// ─── Categories ───────────────────────────────────────────────────────────────

/**
 * GET /api/v1/categories
 * Returns: { categories: Category[] }
 *
 * Category shape: { id, name, slug, description, isActive }
 */
export async function getCategories() {
  return apiFetch("/categories");
}

// ─── Reactions ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/articles/:id/reactions
 * Returns: { like: number, love: number, haha: number, wow: number, sad: number, angry: number }
 */
export async function getArticleReactions(articleId) {
  return apiFetch(`/articles/${articleId}/reactions`);
}

/**
 * POST /api/v1/articles/:id/reactions
 * Body: { type: "like" | "love" | "haha" | "wow" | "sad" | "angry" }
 * Requires auth (Supabase JWT in Authorization header)
 */
export async function submitReaction(articleId, type, token = null) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return apiFetch(`/articles/${articleId}/reactions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ type }),
  });
}

// ─── Comments ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/articles/:id/comments?page=:page
 * Returns: { comments: Comment[], total: number }
 *
 * Comment shape from backend:
 *  { id, articleId, authorId, guestName, parentId, content,
 *    isFlagged, createdAt, updatedAt,
 *    author?: { fullName, avatarUrl },
 *    replies?: Comment[] }
 */
export async function getArticleComments(articleId, page = 1) {
  return apiFetch(`/articles/${articleId}/comments?page=${page}`);
}

/**
 * POST /api/v1/articles/:id/comments
 * Body: { guestName: string, content: string, parentId?: string }
 *
 * Note: email is NOT stored in the backend comments table.
 * For guest comments, only guestName and content are persisted.
 */
export async function submitComment(articleId, { guestName, content, parentId = null }) {
  return apiFetch(`/articles/${articleId}/comments`, {
    method: "POST",
    body: JSON.stringify({ guestName, content, parentId }),
  });
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Used when the backend is not running, so the frontend renders independently.

export const MOCK_CATEGORIES = [
  { id: "c1", name: "News",               slug: "news",       description: "Latest campus news",      isActive: true },
  { id: "c2", name: "Opinion",            slug: "opinion",    description: "Editorials and op-eds",   isActive: true },
  { id: "c3", name: "Features & Lifestyle", slug: "features", description: "Feature stories",         isActive: true },
  { id: "c4", name: "Sports",             slug: "sports",     description: "Sports coverage",          isActive: true },
  { id: "c5", name: "Sci-Tech",           slug: "sci-tech",   description: "Science and technology",   isActive: true },
  { id: "c6", name: "Literary",           slug: "literary",   description: "Creative writing",         isActive: true },
];

export function createMockArticle(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    title: "Baguio City blooms up for the Annual Flower Festival",
    slug: "baguio-city-blooms-flower-festival",
    contentHtml: `
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
      <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
    `,
    excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
    coverImageUrl: null,
    isPublished: true,
    publishedAt: "2025-11-11T17:00:00Z",
    createdAt: "2025-11-11T17:00:00Z",
    updatedAt: "2025-11-11T17:00:00Z",
    author: {
      fullName: "Juan Dela Cruz",
      avatarUrl: null,
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    },
    category: MOCK_CATEGORIES[0],
    tags: [
      { name: "Baguio", slug: "baguio" },
      { name: "Festival", slug: "festival" },
    ],
    ...overrides,
  };
}

export const MOCK_ARTICLES = MOCK_CATEGORIES.flatMap((cat, ci) =>
  Array.from({ length: 4 }, (_, i) =>
    createMockArticle({
      id: `art-${ci}-${i}`,
      title: `Headline goes here. Headline goes here.`,
      slug: `${cat.slug}-article-${i + 1}`,
      category: cat,
      tags: [{ name: cat.name, slug: cat.slug }],
      publishedAt: new Date(Date.now() - (ci * 4 + i) * 86400000).toISOString(),
    })
  )
);

export const MOCK_COMMENTS = [
  { id: "cm1", guestName: "anonymous", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", createdAt: "2025-11-11T17:00:00Z", replies: [] },
  { id: "cm2", guestName: "anonymous", content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", createdAt: "2025-11-11T17:00:00Z", replies: [] },
  { id: "cm3", guestName: "anonymous", content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", createdAt: "2025-11-11T17:30:00Z", replies: [] },
  { id: "cm4", guestName: "anonymous", content: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", createdAt: "2025-11-11T18:00:00Z", replies: [] },
];

export const MOCK_REACTIONS = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
