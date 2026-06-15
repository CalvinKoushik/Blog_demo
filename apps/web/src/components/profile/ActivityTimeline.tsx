"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchUserActivity } from "@/lib/users-api";
import { Loader2, FileText, MessageSquare, Heart } from "lucide-react";
import { formatDistanceToNow } from "@/lib/format-date";

export function ActivityTimeline({ username }: { username: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["activity", username],
    queryFn: () => fetchUserActivity(username),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        Could not load activity.
      </p>
    );
  }

  if (!data.timeline.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        No recent activity yet.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {data.timeline.map((item) => {
        const time = formatDistanceToNow(item.createdAt);
        if (item.type === "post" && item.post) {
          const p = item.post as { title?: string; slug?: string };
          return (
            <li
              key={`post-${item.id}`}
              className="flex gap-3 p-4 rounded-xl border border-border/40 bg-card/40 hover:border-primary/30 transition-colors"
            >
              <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Published · {time}</p>
                <Link
                  href={`/post/${p.slug}`}
                  className="font-medium hover:text-primary transition-colors line-clamp-2"
                >
                  {p.title}
                </Link>
              </div>
            </li>
          );
        }
        if (item.type === "comment" && item.post) {
          const p = item.post as { title?: string; slug?: string };
          return (
            <li
              key={`comment-${item.id}`}
              className="flex gap-3 p-4 rounded-xl border border-border/40 bg-card/40 hover:border-primary/30 transition-colors"
            >
              <MessageSquare className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Commented · {time}</p>
                <Link
                  href={`/post/${p.slug}#comments`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  on {p.title}
                </Link>
              </div>
            </li>
          );
        }
        if (item.type === "like" && item.post) {
          const p = item.post as { title?: string; slug?: string };
          return (
            <li
              key={`like-${item.id}`}
              className="flex gap-3 p-4 rounded-xl border border-border/40 bg-card/40 hover:border-primary/30 transition-colors"
            >
              <Heart className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Liked · {time}</p>
                <Link
                  href={`/post/${p.slug}`}
                  className="font-medium hover:text-primary transition-colors line-clamp-2"
                >
                  {p.title}
                </Link>
              </div>
            </li>
          );
        }
        return null;
      })}
    </ul>
  );
}
