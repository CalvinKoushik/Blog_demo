"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/40 bg-card/50 animate-pulse">
      <div className="h-48 sm:h-56 bg-muted/60" />
      <CardHeader className="p-5 pb-3">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-muted rounded" />
            <div className="h-2 w-24 bg-muted rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-3">
        <div className="h-6 w-3/4 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-2/3 bg-muted rounded" />
      </CardContent>
      <CardFooter className="h-14 bg-muted/20" />
    </Card>
  );
}
