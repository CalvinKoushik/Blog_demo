"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
} from "@/lib/social-api";

const typeLabels: Record<string, string> = {
  LIKE: "liked your post",
  COMMENT: "commented on your post",
  FOLLOW: "started following you",
  FEATURE: "featured your post",
};

export function NotificationBell() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  const { data: unread } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: () => fetchUnreadCount(accessToken!),
    enabled: isAuthenticated && !!accessToken,
    refetchInterval: 60_000,
  });

  const { data: items } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(accessToken!),
    enabled: isAuthenticated && !!accessToken,
  });

  const markAll = useMutation({
    mutationFn: () => markAllNotificationsRead(accessToken!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  if (!isAuthenticated) return null;

  const count = unread?.count ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent">
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-background" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {count > 0 && (
              <button
                type="button"
                className="text-xs text-primary font-medium"
                onClick={() => markAll.mutate()}
              >
                Mark all read
              </button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {!items?.length ? (
            <p className="px-3 py-6 text-sm text-muted-foreground text-center">
              You&apos;re all caught up
            </p>
          ) : (
            items.slice(0, 12).map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2">
                <span className="text-sm font-medium">
                  {typeLabels[n.type] ?? n.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/notifications" />} className="w-full justify-center text-primary font-medium py-2 text-center cursor-pointer">
            View all notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
