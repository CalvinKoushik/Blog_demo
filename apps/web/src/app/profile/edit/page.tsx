'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Biotechnology',
  'Other',
];

export default function EditProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.accessToken);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: '',
    collegeName: user?.collegeName || '',
    department: user?.department || '',
    skills: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      return;
    }

    setLoading(true);

    try {
      const skills = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const response = await fetch(`${API_URL}/profiles/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio,
          collegeName: formData.collegeName,
          department: formData.department,
          skills,
          linkedinUrl: formData.linkedinUrl,
          githubUrl: formData.githubUrl,
          portfolioUrl: formData.portfolioUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/profile/${user?.username}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Card className="border-green-200 dark:border-green-900/50">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-lg text-green-600 dark:text-green-400">
              Please sign in to edit your profile
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 dark:border-green-900/50">
          <CardHeader className="border-b border-green-200 dark:border-green-900/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-slate-950">
            <CardTitle className="text-3xl font-bold text-green-900 dark:text-green-100">
              Edit Profile
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Update your professional information
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {success && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-200">
                  Profile updated successfully! Redirecting...
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-900 dark:text-green-100">
                    First Name *
                  </label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="border-green-200 dark:border-green-900/50 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-900 dark:text-green-100">
                    Last Name *
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="border-green-200 dark:border-green-900/50 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-900 dark:text-green-100">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  className="flex min-h-24 w-full rounded-md border border-green-200 dark:border-green-900/50 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                  rows={4}
                />
              </div>

              {/* Education */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-900 dark:text-green-100">
                    College/University
                  </label>
                  <Input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    placeholder="Your University"
                    className="border-green-200 dark:border-green-900/50 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-900 dark:text-green-100">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-green-200 dark:border-green-900/50 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-900 dark:text-green-100">
                  Skills (comma-separated)
                </label>
                <Input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., React, Node.js, Python"
                  className="border-green-200 dark:border-green-900/50 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-900 dark:text-green-100">
                  LinkedIn URL
                </label>
                <Input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="border-green-200 dark:border-green-900/50 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-green-900 dark:text-green-100">
                  GitHub URL
                </label>
                <Input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/your-username"
                  className="border-green-200 dark:border-green-900/50 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-green-900 dark:text-green-100">
                  Portfolio URL
                </label>
                <Input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  placeholder="https://your-portfolio.com"
                  className="border-green-200 dark:border-green-900/50 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
