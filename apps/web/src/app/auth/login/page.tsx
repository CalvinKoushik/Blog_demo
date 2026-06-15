'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      await login({
        email: email.toLowerCase().trim(),
        password,
      });

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="border-green-200 dark:border-green-900/50">
          <CardHeader className="border-b border-green-200 dark:border-green-900/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-slate-950">
            <CardTitle className="text-3xl font-bold text-green-900 dark:text-green-100">Welcome Back</CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Sign in to your StudentHub account
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
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="border-green-200 dark:border-green-900/50 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-green-900 dark:text-green-100">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-green-600 dark:text-green-400 hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-green-200 dark:border-green-900/50 focus:border-green-500 focus:ring-green-500"
                  required
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
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Signup Link */}
              <p className="text-center text-sm text-green-700 dark:text-green-300">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="font-semibold text-green-600 dark:text-green-400 hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Security Info */}
        <div className="mt-8 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">
            <strong>Demo Credentials:</strong> You can test with any email and password (min 8 characters)
          </p>
        </div>
      </div>
    </div>
  );
}
