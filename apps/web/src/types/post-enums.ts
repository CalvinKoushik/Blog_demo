export type PostType =
  | "PROJECT"
  | "BLOG"
  | "TUTORIAL"
  | "RESEARCH"
  | "ACHIEVEMENT"
  | "HACKATHON";

export const POST_TYPE_OPTIONS: { value: PostType; label: string }[] = [
  { value: "BLOG", label: "Blog" },
  { value: "PROJECT", label: "Project" },
  { value: "TUTORIAL", label: "Tutorial" },
  { value: "RESEARCH", label: "Research" },
  { value: "ACHIEVEMENT", label: "Achievement" },
  { value: "HACKATHON", label: "Hackathon" },
];
