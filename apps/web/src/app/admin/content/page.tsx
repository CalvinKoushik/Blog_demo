'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ContentModerationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
        <p className="text-muted-foreground mt-2">
          Review and moderate flagged content.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flagged Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Content moderation endpoints are being integrated.
            </p>
            <p className="text-sm text-muted-foreground">
              This page will display flagged posts and comments for review.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <span>Review flagged content with details and reasons</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span>Approve content and dismiss flags</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">🚫</span>
              <span>Remove inappropriate content from platform</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <span>Add notes and reasons for moderation actions</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
