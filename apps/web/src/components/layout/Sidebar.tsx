"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, TrendingUp, Users, Award, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const links = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Explore", href: "/search" },
    { icon: Users, label: "Following", href: "/?tab=following" },
    { icon: Bookmark, label: "Saved", href: "/saved" },
    ...(user ? [{ icon: User, label: "Profile", href: `/${user.username}` }] : []),
    ...(user?.role === 'ADMIN' ? [{ icon: Shield, label: "Admin", href: "/admin" }] : []),
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-24 space-y-6">
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <link.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "fill-primary/20")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 rounded-xl bg-card/50 backdrop-blur-md border border-border/50 shadow-sm">
          <h3 className="font-semibold text-xs text-muted-foreground mb-4 uppercase tracking-wider">
            Popular Categories
          </h3>
          <div className="space-y-3">
            {["Web Development", "AI / Machine Learning", "Cybersecurity", "Blockchain"].map((domain) => (
              <Link 
                key={domain} 
                href={`/category/${domain.toLowerCase().replace(/ /g, '-')}`} 
                className="block text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all"
              >
                <span className="text-primary/50 mr-2">#</span>
                {domain}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
