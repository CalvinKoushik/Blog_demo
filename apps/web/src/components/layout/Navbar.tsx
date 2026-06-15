"use client";

import Link from "next/link";
import { Plus, Menu, User, Settings, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavbarSearch, MobileSearchButton } from "@/components/layout/NavbarSearch";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { DropdownMenuGroup } from "@/components/ui/dropdown-menu";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo & Mobile Menu */}
        <div className="flex items-center gap-4 lg:w-64 shrink-0">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Toggle mobile menu">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Plus className="h-5 w-5 rotate-45" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">
              Student<span className="text-primary">Hub</span>
            </span>
          </Link>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-2xl hidden md:flex items-center">
          <NavbarSearch />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <MobileSearchButton />

          {mounted && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          <NotificationBell />

          {isAuthenticated && (
            <Link href="/post/new" className="hidden sm:flex">
              <Button className="rounded-full gap-2 pl-3">
                <Plus className="h-4 w-4" />
                <span>Create Post</span>
              </Button>
            </Link>
          )}

          {!isLoading && !isAuthenticated && (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="rounded-full">
                  Join
                </Button>
              </Link>
            </div>
          )}

          {/* Profile Dropdown */}
          {isAuthenticated && user && (
          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Open profile menu" className="rounded-full ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 inline-flex items-center justify-center whitespace-nowrap text-sm font-medium">
              <Avatar className="h-8 w-8 border border-border/50">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback>
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    {user.collegeName && (
                      <p className="text-xs leading-none text-muted-foreground pt-0.5">
                        {user.collegeName}
                        {user.year ? ` · Year ${user.year}` : ""}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={`/${user.username}`} className="w-full">
                  <DropdownMenuItem className="cursor-pointer w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings" className="w-full">
                  <DropdownMenuItem className="cursor-pointer w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={() => void logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
