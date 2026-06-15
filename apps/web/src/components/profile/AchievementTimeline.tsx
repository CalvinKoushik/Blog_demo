import { Trophy, BadgeCheck, TrendingUp, Award } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Trophy: Trophy,
  BadgeCheck: BadgeCheck,
  TrendingUp: TrendingUp,
  Award: Award,
};

export function AchievementTimeline({ achievements }: { achievements: any[] }) {
  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {achievements.map((item, index) => {
        const Icon = ICON_MAP[item.icon] || Award;
        return (
          <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/10 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <Icon className="h-4 w-4" />
            </div>
            
            {/* Content */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/30">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-foreground">{item.title}</h4>
                <time className="text-xs font-mono text-muted-foreground">{item.date}</time>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
