import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-border/60 bg-card/40 backdrop-blur-md shadow-sm transition-all hover:bg-card/60">
      <div className="bg-primary/10 p-5 rounded-full mb-5 shadow-inner">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-extrabold tracking-tight mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-full shadow-md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
