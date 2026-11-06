"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Repeat,
  DollarSign,
  Search,
  BarChart3,
  Bell,
  GraduationCap,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Books",
    href: "/books",
    icon: BookOpen,
  },
  {
    label: "Students",
    href: "/students",
    icon: Users,
  },
  {
    label: "Circulation",
    href: "/borrowings",
    icon: Repeat,
  },
  {
    label: "Fine Management",
    href: "/fines",
    icon: DollarSign,
  },
  {
    label: "Advanced Search",
    href: "/search",
    icon: Search,
  },
  {
    label: "Analytics & Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: string;
}

export function Sidebar({ isOpen, onClose, userRole = "ADMIN" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card/95 backdrop-blur transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-foreground text-base leading-tight">
              Apex University
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              Library System <Sparkles className="h-3 w-3 text-amber-500 inline" />
            </span>
          </div>
        </div>

        {/* Current Role Indicator */}
        <div className="px-6 py-3.5 border-b border-border/60 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Access Level</span>
            <Badge
              variant={
                userRole === "ADMIN"
                  ? "destructive"
                  : userRole === "LIBRARIAN"
                  ? "default"
                  : "secondary"
              }
              className="text-[10px] uppercase font-bold tracking-wider"
            >
              {userRole}
            </Badge>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Main Menu
          </div>
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform group-hover:scale-110",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100",
                      isActive && "opacity-100 text-primary-foreground/80"
                    )}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="border-t border-border p-4">
          <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground flex flex-col gap-1">
            <div className="flex justify-between items-center text-foreground font-semibold">
              <span>Next.js 15 & Prisma</span>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">v1.0</span>
            </div>
            <p className="text-[11px]">Production University Library Engine</p>
          </div>
        </div>
      </aside>
    </>
  );
}
