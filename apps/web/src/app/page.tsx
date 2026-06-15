"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { FeedList } from "@/components/feed/FeedList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  
  const initialTab = searchParams.get("tab") === "following" ? "following" : "foryou";
  const [feedTab, setFeedTab] = useState<"foryou" | "following">(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "following" || tab === "foryou") {
      setFeedTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (v: string) => {
    const newTab = v as "foryou" | "following";
    setFeedTab(newTab);
    router.replace(newTab === "following" ? "/?tab=following" : "/");
  };

  return (
    <main className="container mx-auto px-4 flex gap-8 justify-center">
      <Sidebar />

      <div className="flex-1 max-w-2xl w-full space-y-6">
        <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border/50 shadow-sm glass transition-shadow hover:shadow-md">
          <div className="flex gap-4 mb-4">
            <Avatar className="h-12 w-12 border border-border">
              <AvatarImage src={user?.avatarUrl ?? undefined} />
              <AvatarFallback>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <Link
              href={isAuthenticated ? "/post/new" : "/login?redirect=/post/new"}
              className="flex-1"
            >
              <div className="w-full h-12 px-4 rounded-full bg-muted/50 border border-border/50 hover:bg-muted hover:border-primary/30 transition-all flex items-center text-muted-foreground cursor-pointer">
                {isAuthenticated && user
                  ? `Start a post, ${user.firstName}...`
                  : "Sign in to share with the community..."}
              </div>
            </Link>
          </div>
          <div className="flex items-center justify-end px-2 gap-2">
            <Link href={isAuthenticated ? "/post/new" : "/login?redirect=/post/new"}>
              <Button variant="ghost" className="rounded-full gap-2 text-muted-foreground">
                <FileText className="h-4 w-4 text-amber-500" />
                <span className="hidden sm:inline">Write article</span>
              </Button>
            </Link>
            <Link href={isAuthenticated ? "/post/new" : "/login?redirect=/post/new"}>
              <Button className="rounded-full px-6 font-semibold shadow-md hover:shadow-lg transition-shadow">
                Post
              </Button>
            </Link>
          </div>
        </div>

        <Tabs
          value={feedTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2 bg-muted/40 p-1 mb-6 rounded-xl border border-border/50">
            <TabsTrigger value="foryou" className="text-base rounded-lg data-[state=active]:shadow-sm">
              For You
            </TabsTrigger>
            <TabsTrigger value="following" className="text-base rounded-lg data-[state=active]:shadow-sm">
              Following
            </TabsTrigger>
          </TabsList>

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <TabsContent value={feedTab} className="mt-0" key={feedTab}>
                {feedTab === "following" && !isAuthenticated ? (
                  <FeedList
                    queryKey={["posts", "following", "guest"]}
                    params={{ feed: "following" }}
                    emptyTitle="Sign in to see your feed"
                    emptyDescription="Follow students to see their latest posts here."
                    emptyActionLabel="Sign in"
                    onEmptyAction={() => router.push("/login")}
                  />
                ) : (
                  <FeedList
                    queryKey={["posts", feedTab, accessToken]}
                    params={
                      feedTab === "following" ? { feed: "following" } : {}
                    }
                    token={accessToken}
                    emptyTitle={
                      feedTab === "following" ? "No updates yet" : "No posts yet"
                    }
                    emptyDescription={
                      feedTab === "following"
                        ? "When the people you follow post something, it will show up here."
                        : "Be the first to publish something for the community."
                    }
                    emptyActionLabel={
                      feedTab === "following" ? "Discover" : "Write Post"
                    }
                    onEmptyAction={() =>
                      router.push(
                        feedTab === "following"
                          ? "/search"
                          : isAuthenticated
                            ? "/post/new"
                            : "/signup",
                      )
                    }
                  />
                )}
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>

      <RightSidebar />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
