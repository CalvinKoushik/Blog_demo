import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Saved posts",
  description: "Your bookmarked posts on StudentHub.",
  path: "/saved",
});

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
