"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/post/PostCard";
import { MapPin, Link as LinkIcon, Calendar, Briefcase, Loader2 } from "lucide-react";
import { MOCK_PROJECTS, MOCK_ACHIEVEMENTS } from "@/lib/mock-data";
import { ProjectCard } from "@/components/profile/ProjectCard";
import { AchievementTimeline } from "@/components/profile/AchievementTimeline";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ProfileResponse } from "@/types/profile";
import type { ApiPost } from "@/types/post";
import { mapPostToCard } from "@/lib/posts";
import { FollowButton } from "@/components/profile/FollowButton";
import { ActivityTimeline } from "@/components/profile/ActivityTimeline";

async function fetchUserProfile(username: string) {
  const clean = username.replace(/^@/, "");
  return apiFetch<ProfileResponse>(`/users/${clean}`);
}

export default function ProfileClient({ username }: { username: string }) {
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => fetchUserProfile(username),
  });

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (error || !profileData) {
    return <div className="text-center py-20 text-destructive">User not found</div>;
  }

  const user = {
    name: `${profileData.firstName} ${profileData.lastName}`,
    username: profileData.nickname,
    avatar: profileData.avatarUrl,
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000",
    bio: profileData.bio,
    university: profileData.collegeName || "University",
    year: profileData.year ? `Year ${profileData.year}` : "",
    location: "Unknown",
    joinedAt: new Date(profileData.user.createdAt || new Date()).toLocaleDateString(),
    stats: {
      followers: profileData.user._count?.followers || 0,
      following: profileData.user._count?.following || 0,
      views: 0,
    },
    skills: (profileData.skills ?? []) as string[],
    social: {
      github: profileData.githubUrl,
      linkedin: profileData.linkedinUrl,
      portfolio: profileData.portfolioUrl
    }
  };

  const userPosts =
    profileData.user.posts?.map((p) => mapPostToCard(p as ApiPost)) ?? [];
  
  return (
    <main className="container mx-auto px-4 max-w-5xl pb-10">
      {/* Cover Banner */}
      <div className="w-full h-48 md:h-64 rounded-2xl bg-muted overflow-hidden relative mb-16 shadow-sm">
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image 
            src={user.coverImage} 
            alt="Cover" 
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover mix-blend-overlay opacity-60"
          />
        </div>
        
        {/* Avatar */}
        <div className="absolute -bottom-12 left-6 sm:left-10">
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
            <AvatarImage src={user.avatar ?? undefined} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10 px-2 sm:px-6">
        {/* Profile Info Side */}
        <div className="w-full md:w-[320px] shrink-0 space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{user.name}</h1>
            <p className="text-muted-foreground font-medium">@{user.username}</p>
          </div>
          
          <p className="text-sm leading-relaxed text-foreground/90">
            {user.bio}
          </p>
          
          <div className="flex gap-3">
            <FollowButton username={user.username ?? ""} />
            <Button variant="outline" className="flex-1 rounded-full bg-background/50 backdrop-blur-sm" disabled>
              Message
            </Button>
          </div>
          
          <div className="space-y-4 text-sm text-muted-foreground bg-muted/20 p-5 rounded-2xl border border-border/50">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-foreground/70" />
              <span className="font-medium text-foreground/90">{user.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-foreground/70" />
              <span className="font-medium text-foreground/90">{user.year} @ {user.university}</span>
            </div>
            {user.social.portfolio && (
              <div className="flex items-center gap-3">
                <LinkIcon className="h-4 w-4 text-foreground/70" />
                <a
                  href={user.social.portfolio}
                  className="font-medium text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {user.social.portfolio.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-foreground/70" />
              <span className="font-medium text-foreground/90">Joined {user.joinedAt}</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            {user.social.github && (
              <a
                href={user.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-muted/50 text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                <LinkIcon className="h-5 w-5" />
              </a>
            )}
            {user.social.linkedin && (
              <a
                href={user.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-muted/50 text-foreground hover:bg-[#0A66C2] hover:text-white transition-colors"
              >
                <Briefcase className="h-5 w-5" />
              </a>
            )}
          </div>
          
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill: string) => (
                <Badge key={skill} variant="secondary" className="bg-muted text-foreground/80 hover:bg-muted/80">{skill}</Badge>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between py-5 border-t border-b border-border/50 text-center">
            <div className="flex flex-col items-center">
              <p className="font-bold text-lg">{user.stats.followers}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Followers</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="font-bold text-lg">{user.stats.following}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Following</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="font-bold text-lg">{(user.stats.views / 1000).toFixed(1)}k</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Views</p>
            </div>
          </div>
        </div>
        
        {/* Content Tabs Side */}
        <div className="flex-1 w-full min-w-0">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-border/50 rounded-none pb-0 h-auto gap-8 mb-6 overflow-x-auto hide-scrollbar">
              <TabsTrigger value="posts" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3 pt-2 bg-transparent shadow-none text-base data-[state=active]:font-bold transition-all">Posts</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3 pt-2 bg-transparent shadow-none text-base data-[state=active]:font-bold transition-all">Activity</TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3 pt-2 bg-transparent shadow-none text-base data-[state=active]:font-bold transition-all hidden sm:inline-flex">Projects</TabsTrigger>
            </TabsList>
            
            <div className="min-h-[400px]">
              <TabsContent value="posts" keepMounted>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {userPosts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="activity">
                <ActivityTimeline username={user.username ?? username} />
              </TabsContent>
              
              <TabsContent value="projects" keepMounted>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {MOCK_PROJECTS.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </motion.div>
              </TabsContent>
              
              <TabsContent value="achievements" keepMounted>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-4"
                >
                  <AchievementTimeline achievements={MOCK_ACHIEVEMENTS} />
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
