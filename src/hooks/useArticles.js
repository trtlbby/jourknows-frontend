import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getArticles,
  getArticleBySlug,
  getArticleReactions,
  submitReaction as apiSubmitReaction,
  getArticleComments,
  submitComment as apiSubmitComment,
  getCategories,
  MOCK_ARTICLES,
  MOCK_CATEGORIES,
  MOCK_REACTIONS,
  MOCK_COMMENTS,
  createMockArticle,
} from "../services/api";

// ─── Articles ─────────────────────────────────────────────────────────────────

export function useArticles(categorySlug = null, page = 1) {
  return useQuery({
    queryKey: ["articles", categorySlug, page],
    queryFn: () => getArticles(categorySlug, page),
    placeholderData: {
      articles: categorySlug
        ? MOCK_ARTICLES.filter((a) => a.category.slug === categorySlug)
        : MOCK_ARTICLES.slice(0, 10),
      total: MOCK_ARTICLES.length,
      page: 1,
    },
    staleTime: 60_000,
    retry: 1,
  });
}

export function useArticle(slug) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: () => getArticleBySlug(slug),
    placeholderData: MOCK_ARTICLES.find((a) => a.slug === slug) || createMockArticle({ slug }),
    enabled: !!slug,
    staleTime: 60_000,
    retry: 1,
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    placeholderData: { categories: MOCK_CATEGORIES },
    staleTime: 5 * 60_000, // 5 min
  });
}

// ─── Reactions ────────────────────────────────────────────────────────────────

export function useReactions(articleId) {
  return useQuery({
    queryKey: ["reactions", articleId],
    queryFn: () => getArticleReactions(articleId),
    placeholderData: { ...MOCK_REACTIONS },
    enabled: !!articleId,
  });
}

export function useSubmitReaction(articleId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, token }) => apiSubmitReaction(articleId, type, token),
    onMutate: async ({ type }) => {
      await queryClient.cancelQueries({ queryKey: ["reactions", articleId] });
      const prev = queryClient.getQueryData(["reactions", articleId]);
      queryClient.setQueryData(["reactions", articleId], (old) => ({
        ...old,
        [type]: (old?.[type] || 0) + 1,
      }));
      return { prev };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["reactions", articleId], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reactions", articleId] });
    },
  });
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export function useComments(articleId, page = 1) {
  return useQuery({
    queryKey: ["comments", articleId, page],
    queryFn: () => getArticleComments(articleId, page),
    placeholderData: { comments: MOCK_COMMENTS, total: MOCK_COMMENTS.length },
    enabled: !!articleId,
  });
}

export function useSubmitComment(articleId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiSubmitComment(articleId, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["comments", articleId] });
      const prev = queryClient.getQueryData(["comments", articleId, 1]);
      queryClient.setQueryData(["comments", articleId, 1], (old) => ({
        ...old,
        comments: [
          ...(old?.comments || []),
          {
            id: crypto.randomUUID(),
            guestName: data.guestName,
            content: data.content,
            createdAt: new Date().toISOString(),
            replies: [],
          },
        ],
      }));
      return { prev };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["comments", articleId, 1], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", articleId] });
    },
  });
}
