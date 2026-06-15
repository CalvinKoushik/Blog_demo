import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Search",
  description: "Search posts, projects, and tutorials from students worldwide.",
  path: "/search",
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
