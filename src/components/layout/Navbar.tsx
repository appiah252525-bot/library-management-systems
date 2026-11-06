"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/Button";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

interface NavbarProps {
  onMenuToggle: () => void;
  userRole?: string;
}

export function Navbar({ onMenuToggle, userRole = "ADMIN" }: NavbarProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const { isSignedIn, user } = useUser();
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Fetch unread notification count
  React.useEffect(() => {
    async function fetchNotificationsCount() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.totalCount || 0);
        }
      } catch (err) {
        // quiet fallback
      }
    }
    fetchNotificationsCount();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 sm:px-6 backdrop-blur">
      {/* Left side: Hamburger button + Global search bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search books by title, author, or ISBN..."
            className="h-9 w-full rounded-full border border-input bg-muted/40 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </form>
      </div>

      {/* Right side: Notifications, Theme Toggle, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Button */}
        <Link href="/notifications">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Clerk User Button or Fallback */}
        <div className="flex items-center pl-2 border-l border-border/80">
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <UserButton afterSignOutUrl="/sign-in" />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight text-foreground">
                  {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                </span>
                <span className="text-[10px] text-muted-foreground capitalize">
                  {userRole.toLowerCase()}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                AU
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight text-foreground">
                  Library Admin
                </span>
                <span className="text-[10px] text-muted-foreground capitalize">
                  {userRole.toLowerCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
