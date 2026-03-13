import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// ─── App Shell ────────────────────────────────────────────────────────────────
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}