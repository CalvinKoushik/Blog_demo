"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import {
  fetchFollowStatus,
  followUser,
  unfollowUser,
} from "@/lib/social-api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function FollowButton({
  username,
  compact = false,
}: {
  username: string;
  compact?: boolean;
}) {
  const currentUser = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["follow", username, accessToken],
    queryFn: () => fetchFollowStatus(username, accessToken),
    enabled: !!username,
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Sign in to follow");
      if (data?.following) return unfollowUser(username, accessToken);
      return followUser(username, accessToken);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["follow", username] });
      void queryClient.invalidateQueries({ queryKey: ["profile", username] });
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!username || currentUser?.username === username) return null;

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="flex-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground h-10 text-sm font-medium"
      >
        Follow
      </Link>
    );
  }

  return (
    <Button
      className={compact ? "h-8 px-3 rounded-full text-xs" : "flex-1 rounded-full shadow-md"}
      size={compact ? "sm" : "default"}
      variant={data?.following ? "outline" : "default"}
      disabled={isLoading || toggle.isPending}
      onClick={() => toggle.mutate()}
    >
      {toggle.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : data?.following ? (
        "Following"
      ) : (
        "Follow"
      )}
    </Button>
  );
}
