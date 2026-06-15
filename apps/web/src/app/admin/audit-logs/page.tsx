'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchAuditLogs(page: number = 1) {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_URL}/admin/audit-logs?page=${page}&limit=50`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', page],
    queryFn: () => fetchAuditLogs(page),
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const logs = data?.data || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  const getActionColor = (action: string) => {
    if (action.includes('suspend')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    if (action.includes('delete')) return 'bg-destructive/10 text-destructive dark:text-destructive';
    if (action.includes('remove')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-green-50/30 to-emerald-50/20 dark:from-green-950/20 dark:to-slate-950 px-8 py-6 rounded-lg">
      <div className="border-b border-green-200 dark:border-green-900/50 pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-green-900 dark:text-green-100">Audit Logs</h1>
        <p className="text-green-700 dark:text-green-300 mt-2 text-lg">
          Track all admin actions and changes.
        </p>
      </div>

      <Card className="border-green-200 dark:border-green-900/50">
        <CardHeader className="border-b border-green-200 dark:border-green-900/50">
          <CardTitle className="text-green-900 dark:text-green-100">Admin Actions Timeline</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={log.id} className="flex gap-4 pb-4 border-b border-green-100 dark:border-green-900/30 last:border-0 hover:bg-green-50 dark:hover:bg-green-950/20 p-3 rounded transition-colors">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getActionColor(
                            log.action
                          )}`}
                        >
                          {log.action.replace('_', ' ').toUpperCase()}
                        </span>
                        <p className="mt-2 text-sm text-green-900 dark:text-green-100">
                          Admin: <strong>{log.admin?.profile?.firstName || log.admin?.email}</strong>
                        </p>
                        {log.entityId && (
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            Target: {log.entityType} ({log.entityId.slice(0, 8)}...)
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300 text-right">
                        <p className="font-medium">{new Date(log.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs">{new Date(log.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    {log.changes && (
                      <pre className="mt-2 text-xs bg-green-100 dark:bg-green-950/50 text-green-900 dark:text-green-100 p-2 rounded overflow-auto max-h-24 border border-green-200 dark:border-green-900/50">
                        {typeof log.changes === 'string'
                          ? log.changes
                          : JSON.stringify(JSON.parse(log.changes), null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-green-700 dark:text-green-300">No audit logs found</p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-green-700 dark:text-green-300">
              Showing {logs.length} of {total} logs
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="border-green-400 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-950/40"
              >
                Previous
              </Button>
              <span className="flex items-center px-2 text-sm text-green-900 dark:text-green-100 font-medium">
                Page {page} of {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
                className="border-green-400 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-950/40"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
