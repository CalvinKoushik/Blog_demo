"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Plus, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Compass, label: "Explore", href: "/explore" },
    { icon: Plus, label: "Create", href: "/post/new", isFab: true },
    { icon: Bell, label: "Alerts", href: "/notifications" },
    { icon: User, label: "Profile", href: "/@alexc" }, // Hardcoded for prototype
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/80 backdrop-blur-xl border-t border-border/50 pb-safe">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.isFab) {
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="relative -top-5 flex flex-col items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
              >
                <item.icon className="h-6 w-6" />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full gap-1 text-muted-foreground hover:text-foreground transition-colors",
                isActive && "text-primary hover:text-primary"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "fill-primary/20 stroke-primary")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
