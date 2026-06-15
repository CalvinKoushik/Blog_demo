import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export function PostSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-48 rounded-none" />
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-2 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0 mt-4 border-t border-border/50 h-14 flex items-center justify-between">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-4" />
      </CardFooter>
    </Card>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="w-full mb-16 relative">
      <Skeleton className="w-full h-48 md:h-64 rounded-xl" />
      <div className="absolute -bottom-12 left-8">
        <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
      </div>
    </div>
  );
}
