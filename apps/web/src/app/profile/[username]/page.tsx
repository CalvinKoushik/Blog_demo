'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, Briefcase, Github, Linkedin, Globe } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const currentUser = useAuthStore((state) => state.user);
  const isOwnProfile = currentUser?.username?.toLowerCase() === username?.toLowerCase();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/profiles/${username}`);
      if (!res.ok) throw new Error('Profile not found');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 dark:border-red-900/50">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-xl text-red-600 dark:text-red-400 font-semibold">
                Profile not found
              </p>
              <p className="text-red-600 dark:text-red-400 mt-2">
                The student profile you&apos;re looking for doesn&apos;t exist.
              </p>
              <Link href="/">
                <Button className="mt-6 bg-green-600 hover:bg-green-700">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cover & Basic Info */}
        <Card className="border-green-200 dark:border-green-900/50 overflow-hidden">
          {/* Cover Banner */}
          <div className="h-32 bg-gradient-to-r from-green-500 to-emerald-500" />

          <CardContent className="pt-0 -mt-16 pb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={profile.avatarUrl || 'https://via.placeholder.com/120'}
                  alt={profile.firstName}
                  className="h-32 w-32 rounded-full border-4 border-white dark:border-slate-900 object-cover"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 pt-4">
                <h1 className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-lg text-green-700 dark:text-green-300 mb-3">
                  @{profile.nickname}
                </p>

                {profile.bio && (
                  <p className="text-green-700 dark:text-green-300 mb-4">
                    {profile.bio}
                  </p>
                )}

                {/* Education Info */}
                {(profile.collegeName || profile.department) && (
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-green-700 dark:text-green-300">
                    {profile.collegeName && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.collegeName}
                      </div>
                    )}
                    {profile.department && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {profile.department}
                      </div>
                    )}
                  </div>
                )}

                {/* Social Links */}
                {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
                  <div className="flex gap-3 mb-4">
                    {profile.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {profile.githubUrl && (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {profile.portfolioUrl && (
                      <a
                        href={profile.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {isOwnProfile ? (
                  <Link href="/profile/edit">
                    <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white">
                      Edit Profile
                    </Button>
                  </Link>
                ) : (
                  <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white">
                    Follow
                  </Button>
                )}
                {profile.resumeUrl && (
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/20">
                      View Resume
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-green-200 dark:border-green-900/50">
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {profile.postsCount || 0}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">Posts</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-900/50">
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {profile.followersCount || 0}
              </p>
              <Link href={`/profile/${username}/followers`}>
                <p className="text-sm text-green-700 dark:text-green-300 hover:underline cursor-pointer">
                  Followers
                </p>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-900/50">
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {profile.followingCount || 0}
              </p>
              <Link href={`/profile/${username}/following`}>
                <p className="text-sm text-green-700 dark:text-green-300 hover:underline cursor-pointer">
                  Following
                </p>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <Card className="border-green-200 dark:border-green-900/50">
            <CardHeader>
              <CardTitle className="text-green-900 dark:text-green-100">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
