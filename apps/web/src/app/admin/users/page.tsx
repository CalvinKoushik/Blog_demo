'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchUsers(page: number = 1) {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_URL}/admin/users?page=${page}&limit=20`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export default function UsersManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => fetchUsers(page),
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const users = data?.data || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  return (
    <div className="space-y-8 bg-gradient-to-br from-green-50/30 to-emerald-50/20 dark:from-green-950/20 dark:to-slate-950 px-8 py-6 rounded-lg">
      <div className="border-b border-green-200 dark:border-green-900/50 pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-green-900 dark:text-green-100">User Management</h1>
        <p className="text-green-700 dark:text-green-300 mt-2 text-lg">
          View and manage platform users.
        </p>
      </div>

      <Card className="border-green-200 dark:border-green-900/50">
        <CardHeader className="border-b border-green-200 dark:border-green-900/50">
          <CardTitle className="text-green-900 dark:text-green-100">Users</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-green-200 dark:border-green-900/50 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-200 dark:border-green-900/50">
                  <th className="text-left py-3 px-4 text-green-900 dark:text-green-100 font-semibold">User</th>
                  <th className="text-left py-3 px-4 text-green-900 dark:text-green-100 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 text-green-900 dark:text-green-100 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 text-green-900 dark:text-green-100 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-green-900 dark:text-green-100 font-semibold">Posts</th>
                  <th className="text-left py-3 px-4 text-green-900 dark:text-green-100 font-semibold">Joined</th>
                  <th className="text-left py-3 px-4 text-green-900 dark:text-green-100 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-green-100 dark:border-green-900/30 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {user.profile?.avatarUrl && (
                          <img
                            src={user.profile.avatarUrl}
                            alt={user.profile.firstName}
                            className="h-8 w-8 rounded-full ring-2 ring-green-400 dark:ring-green-600"
                          />
                        )}
                        <div>
                          <p className="font-medium text-green-900 dark:text-green-100">
                            {user.profile?.firstName} {user.profile?.lastName}
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300">@{user.profile?.nickname}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-green-900 dark:text-green-100">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-green-200 text-green-900 dark:bg-green-900/50 dark:text-green-100 px-3 py-1 rounded-full text-xs font-medium">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          user.isSuspended
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-100'
                        }`}
                      >
                        {user.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-green-900 dark:text-green-100">{user._count?.posts || 0}</td>
                    <td className="py-3 px-4 text-sm text-green-700 dark:text-green-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button size="sm" variant="outline" className="h-8 border-green-400 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-950/40">
                            View
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-green-700 dark:text-green-300">
              Showing {users.length} of {total} users
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
              <span className="flex items-center px-2 text-green-900 dark:text-green-100 font-medium">
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
