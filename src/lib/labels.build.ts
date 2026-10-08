import type { Label } from "./types";

// Evaluated at build time by the build-time Vite plugin; importers receive these values inlined as JSON.
export const labels: Label[] = [
  { id: "design", name: "Design", color: "#8b5cf6" },
  { id: "engineering", name: "Engineering", color: "#1b50ff" },
  { id: "hiring", name: "Hiring", color: "#38bdf8" },
  { id: "infra", name: "Infra", color: "#6366f1" },
  { id: "launch", name: "Launch", color: "#ec4899" },
  { id: "social", name: "Social", color: "#f472b6" },
];
