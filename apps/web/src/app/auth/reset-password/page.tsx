'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in both password fields');
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

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm() || !token) {
      setError('Invalid or missing reset token');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: formData.password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Reset failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="border-green-200 dark:border-green-900/50">
          <CardHeader className="border-b border-green-200 dark:border-green-900/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-slate-950">
            <CardTitle className="text-3xl font-bold text-green-900 dark:text-green-100">
              Create New Password
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {success ? (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
                    Password Reset Successful!
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mb-6">
                    Your password has been reset. Redirecting to login...
                  </p>
                </div>

                <Loader2 className="h-6 w-6 animate-spin text-green-600 dark:text-green-400 mx-auto" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                  </div>
                )}

                {!token && (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      No reset token found. Please check your reset link.
                    </p>
                  </div>
                )}

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-900 dark:text-green-100">
                    New Password
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-900 dark:text-green-100">
                    Confirm Password
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>

                {/* Back Link */}
                <p className="text-center text-sm text-green-700 dark:text-green-300">
                  Remember your password?{' '}
                  <Link href="/auth/login" className="font-semibold text-green-600 dark:text-green-400 hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
