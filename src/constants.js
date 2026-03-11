import {
    ThumbsUp, Heart, Smile, Star, Frown, Angry
} from "lucide-react";


// Fallback Section display config if backend has no colors defined
export const FALLBACK_CATEGORY_COLORS = {
  news: "#00046D", opinion: "#00046D", features: "#F8A42E",
  sports: "#020269", "sci-tech": "#314DEB", literary: "#AE1914",
  default: "#1e1e1e"
};

// Reactions aligned to backend reaction_type enum values
export const REACTIONS = [
  { icon: ThumbsUp, type: "like",  label: "Like",  color: "#3b5998" },
  { icon: Heart,    type: "love",  label: "Love",  color: "#e0245e" },
  { icon: Smile,    type: "haha",  label: "Haha",  color: "#f5a623" },
  { icon: Star,     type: "wow",   label: "Wow",   color: "#f5a623" },
  { icon: Frown,    type: "sad",   label: "Sad",   color: "#4a90e2" },
  { icon: Angry,    type: "angry", label: "Angry", color: "#d0021b" },
];
