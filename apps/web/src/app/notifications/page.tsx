"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/social-api";
import { useAuthStore } from "@/store/useAuthStore";
import { Heart, MessageSquare, UserPlus, Star, Loader2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/ui/EmptyState";

const typeConfig = {
  LIKE: { icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", label: "liked your post" },
  COMMENT: { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10", label: "commented on your post" },
  FOLLOW: { icon: UserPlus, color: "text-green-500", bg: "bg-green-500/10", label: "started following you" },
  FEATURE: { icon: Star, color: "text-amber-500", bg: "bg-amber-500/10", label: "featured your post" },
};

export default function NotificationsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(accessToken!),
    enabled: !!accessToken,
  });

  const markAll = useMutation({
    mutationFn: () => markAllNotificationsRead(accessToken!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead(id, accessToken!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  return (
    <RequireAuth>
      <main className="container mx-auto px-4 max-w-3xl py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">
              ← Back to home
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
          </div>
          <Button 
            variant="outline" 
            className="rounded-full gap-2" 
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending || !notifications?.some(n => !n.isRead)}
          >
            <CheckCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Mark all as read</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !notifications?.length ? (
          <EmptyState
            icon={CheckCheck}
            title="You're all caught up!"
            description="Check back later for new updates and activity."
          />
        ) : (
          <div className="space-y-4">
            {notifications.map((n, i) => {
              const config = typeConfig[n.type];
              const Icon = config?.icon || Star;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={n.id}
                  className={cn(
                    "flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300",
                    n.isRead 
                      ? "bg-card border-border/50 opacity-70" 
                      : "bg-card/80 border-primary/20 shadow-sm"
                  )}
                  onClick={() => {
                    if (!n.isRead) markRead.mutate(n.id);
                  }}
                >
                  <div className={cn("h-12 w-12 rounded-full flex items-center justify-center shrink-0", config?.bg)}>
                    <Icon className={cn("h-6 w-6", config?.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-relaxed">
                      <span className="font-bold">Someone</span> {config?.label ?? n.type}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      {new Date(n.createdAt).toLocaleString(undefined, { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                      })}
                    </p>
                  </div>
                  
                  {!n.isRead && (
                    <div className="h-3 w-3 rounded-full bg-primary shrink-0 self-center shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </RequireAuth>
  );
}
