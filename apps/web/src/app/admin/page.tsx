'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, MessageSquare, AlertCircle, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchAdminStats() {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_URL}/admin/analytics/overview`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

async function fetchAuditLogs() {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_URL}/admin/audit-logs?limit=4`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: fetchAdminStats,
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['admin', 'audit-logs'],
    queryFn: fetchAuditLogs,
  });

  if (statsLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 bg-gradient-to-br from-green-50/30 to-emerald-50/20 dark:from-green-950/20 dark:to-slate-950 px-8 py-6 rounded-lg">
      <div className="border-b border-green-200 dark:border-green-900/50 pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-green-900 dark:text-green-100">Admin Dashboard</h1>
        <p className="text-green-700 dark:text-green-300 mt-2 text-lg">
          Monitor platform activity and manage community content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 dark:border-green-900/50 hover:border-green-400 dark:hover:border-green-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Total Users</CardTitle>
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-green-700 dark:text-green-300">Active users on platform</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-900/50 hover:border-green-400 dark:hover:border-green-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Published Posts</CardTitle>
            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats?.totalPosts || 0}</div>
            <p className="text-xs text-green-700 dark:text-green-300">Live content on platform</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-900/50 hover:border-green-400 dark:hover:border-green-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats?.totalComments || 0}</div>
            <p className="text-xs text-green-700 dark:text-green-300">Community engagement</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity Panel */}
        <Card className="col-span-4 border-green-200 dark:border-green-900/50">
          <CardHeader className="border-b border-green-200 dark:border-green-900/50">
            <CardTitle className="text-green-900 dark:text-green-100">Recent Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8">
              {logsLoading ? (
                <p className="text-sm text-green-600 dark:text-green-400">Loading audit logs...</p>
              ) : auditLogs?.data?.length ? (
                auditLogs.data.map((log, i) => (
                  <div key={log.id} className="flex items-center border-l-2 border-green-400 pl-4 py-2">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none capitalize text-green-900 dark:text-green-100">{log.action.replace('_', ' ')}</p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        by {log.admin?.profile?.firstName || log.admin?.email}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-green-600 dark:text-green-400">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-green-600 dark:text-green-400">No recent actions</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Moderation Actions Placeholder */}
        <Card className="col-span-3 border-green-200 dark:border-green-900/50">
          <CardHeader className="border-b border-green-200 dark:border-green-900/50">
            <CardTitle className="text-green-900 dark:text-green-100">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-4 text-sm">
              <a href="/admin/users" className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors border border-green-200 dark:border-green-900/50">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-green-900 dark:text-green-100">Manage Users</span>
              </a>
              <a href="/admin/content" className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors border border-green-200 dark:border-green-900/50">
                <ShieldAlert className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-green-900 dark:text-green-100">Moderate Content</span>
              </a>
              <a href="/admin/analytics" className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors border border-green-200 dark:border-green-900/50">
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-green-900 dark:text-green-100">View Analytics</span>
              </a>
              <a href="/admin/audit-logs" className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors border border-green-200 dark:border-green-900/50">
                <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-green-900 dark:text-green-100">Audit Logs</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
