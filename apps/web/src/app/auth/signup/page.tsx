'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

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

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated'];

export default function SignupPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    nickname: '',
    collegeName: '',
    department: '',
    year: '',
    bio: '',
    skills: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.nickname) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.email.length < 5 || !formData.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.nickname.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(formData.nickname)) {
      setError('Username can only contain letters, numbers, underscore, and dash');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const skills = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await register({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        nickname: formData.nickname.toLowerCase().trim(),
        collegeName: formData.collegeName.trim(),
        department: formData.department,
        year: formData.year ? parseInt(formData.year.split('st')[0]) : undefined,
        bio: formData.bio.trim(),
        skills,
      });

      router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 dark:border-green-900/50">
          <CardHeader className="border-b border-green-200 dark:border-green-900/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-slate-950">
            <CardTitle className="text-3xl font-bold text-green-900 dark:text-green-100">Join StudentHub</CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Create your professional student profile and start networking
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-900 dark:text-green-100">
                  Email Address *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="border-green-200 dark:border-green-900/50 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

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
                    placeholder="John"
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
                    placeholder="Doe"
                    className="border-green-200 dark:border-green-900/50 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-900 dark:text-green-100">
                  Username *
                </label>
                <Input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="john_doe"
                  className="border-green-200 dark:border-green-900/50 focus:border-green-500 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-green-600 dark:text-green-400">
                  Alphanumeric, underscore, and dash only
                </p>
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-900 dark:text-green-100">
                    Password *
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="border-green-200 dark:border-green-900/50 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                  <p className="text-xs text-green-600 dark:text-green-400">Min 8 characters</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-900 dark:text-green-100">
                    Confirm Password *
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="border-green-200 dark:border-green-900/50 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
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

              {/* Year */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-900 dark:text-green-100">
                  Year of Study
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-green-200 dark:border-green-900/50 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="">Select Year</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bio & Skills */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-900 dark:text-green-100">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  className="flex min-h-20 w-full rounded-md border border-green-200 dark:border-green-900/50 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                  rows={3}
                />
              </div>

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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-green-700 dark:text-green-300">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-semibold text-green-600 dark:text-green-400 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
              <span className="text-xl">👤</span>
            </div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">Create Profile</h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Showcase your skills and achievements
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
              <span className="text-xl">💡</span>
            </div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">Share Projects</h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Publish your work and get feedback
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
              <span className="text-xl">🤝</span>
            </div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">Network</h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Connect with talented students
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
