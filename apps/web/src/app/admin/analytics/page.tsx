'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchAnalytics() {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_URL}/admin/analytics/overview`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: fetchAnalytics,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const metrics = [
    { label: 'Total Users', value: data?.totalUsers || 0, icon: '👥' },
    { label: 'Active Users', value: data?.activeUsers || 0, icon: '✨' },
    { label: 'Suspended Users', value: data?.suspendedUsers || 0, icon: '🚫' },
    { label: 'Published Posts', value: data?.totalPosts || 0, icon: '📝' },
    { label: 'Total Comments', value: data?.totalComments || 0, icon: '💬' },
  ];

  return (
    <div className="space-y-8 bg-gradient-to-br from-green-50/30 to-emerald-50/20 dark:from-green-950/20 dark:to-slate-950 px-8 py-6 rounded-lg">
      <div className="border-b border-green-200 dark:border-green-900/50 pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-green-900 dark:text-green-100">Analytics</h1>
        <p className="text-green-700 dark:text-green-300 mt-2 text-lg">
          Platform statistics and metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-green-200 dark:border-green-900/50 hover:border-green-400 dark:hover:border-green-700 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">{metric.value}</div>
                <span className="text-2xl">{metric.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-green-200 dark:border-green-900/50">
        <CardHeader className="border-b border-green-200 dark:border-green-900/50">
          <CardTitle className="text-green-900 dark:text-green-100">Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border border-green-200 dark:border-green-900/50 rounded-lg bg-green-50 dark:bg-green-950/20">
              <span className="text-sm font-medium text-green-900 dark:text-green-100">Last Updated</span>
              <span className="text-sm text-green-700 dark:text-green-300">
                {new Date(data?.updatedAt).toLocaleString()}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="border border-green-200 dark:border-green-900/50 rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                <p className="text-green-700 dark:text-green-300 mb-2 font-semibold">User Statistics</p>
                <ul className="space-y-2 text-green-900 dark:text-green-100">
                  <li>Total Users: <strong>{data?.totalUsers || 0}</strong></li>
                  <li>Active Users: <strong>{data?.activeUsers || 0}</strong></li>
                  <li>Suspended: <strong>{data?.suspendedUsers || 0}</strong></li>
                </ul>
              </div>
              <div className="border border-green-200 dark:border-green-900/50 rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                <p className="text-green-700 dark:text-green-300 mb-2 font-semibold">Content Statistics</p>
                <ul className="space-y-2 text-green-900 dark:text-green-100">
                  <li>Published Posts: <strong>{data?.totalPosts || 0}</strong></li>
                  <li>Total Comments: <strong>{data?.totalComments || 0}</strong></li>
                  <li>Avg Comments/Post: <strong>{(data?.totalComments / (data?.totalPosts || 1)).toFixed(2)}</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
