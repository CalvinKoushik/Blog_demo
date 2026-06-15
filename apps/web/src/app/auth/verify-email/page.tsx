'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState('');

  const handleVerify = async () => {
    if (!token) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/verify-email?token=${token}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Verification failed');
      }

      setVerified(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {verified ? (
          <Card className="border-green-200 dark:border-green-900/50">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                Email Verified! 🎉
              </h2>
              <p className="text-green-700 dark:text-green-300 mb-6">
                Your email has been successfully verified. Redirecting to login...
              </p>
              <Loader2 className="h-6 w-6 animate-spin text-green-600 dark:text-green-400 mx-auto" />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-200 dark:border-green-900/50">
            <CardHeader className="border-b border-green-200 dark:border-green-900/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-slate-950">
              <CardTitle className="text-3xl font-bold text-green-900 dark:text-green-100">
                Verify Your Email
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                We've sent a verification link to {email}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="space-y-6">
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                  </div>
                )}

                {/* Info Box */}
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-lg">
                  <Mail className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-700 dark:text-green-300">
                    <p className="font-medium mb-1">Check your email</p>
                    <p>We've sent a verification link. Copy the token from the email and paste it below.</p>
                  </div>
                </div>

                {/* Verification Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-900 dark:text-green-100">
                    Verification Token
                  </label>
                  <textarea
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your verification token here..."
                    className="flex min-h-24 w-full rounded-md border border-green-200 dark:border-green-900/50 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500 font-mono"
                    rows={4}
                  />
                  <p className="text-xs text-green-600 dark:text-green-400">
                    This is a long string from the verification email
                  </p>
                </div>

                {/* Verify Button */}
                <Button
                  onClick={handleVerify}
                  disabled={loading || !token}
                  className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </Button>

                {/* Resend & Back Links */}
                <div className="flex gap-4 text-center text-sm">
                  <Link href="/auth/login" className="text-green-600 dark:text-green-400 hover:underline flex-1">
                    Back to Login
                  </Link>
                  <div className="text-green-400 dark:text-green-600">•</div>
                  <Link
                    href="/auth/signup"
                    className="text-green-600 dark:text-green-400 hover:underline flex-1"
                  >
                    Resend Email
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
