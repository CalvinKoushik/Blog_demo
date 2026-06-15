import ProfileClient from "./ProfileClient";
import { buildMetadata } from "@/lib/seo";
import { apiFetch } from "@/lib/api";
import type { ProfileResponse } from "@/types/profile";

async function fetchUserProfile(username: string) {
  const clean = username.replace(/^@/, "");
  return apiFetch<ProfileResponse>(`/users/${clean}`, { next: { revalidate: 60 } });
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  try {
    const profile = await fetchUserProfile(username);
    return buildMetadata({
      title: `${profile.firstName} ${profile.lastName} (@${profile.nickname})`,
      description: profile.bio || `Check out ${profile.nickname}'s profile on StudentHub.`,
      path: `/${username}`,
      image: profile.avatarUrl,
    });
  } catch {
    return buildMetadata({
      title: "User Profile",
      description: "StudentHub User Profile",
      path: `/${username}`,
    });
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <ProfileClient username={username} />;
}
