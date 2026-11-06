"use client";

import * as React from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BookSearchFilterProps {
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onReset: () => void;
}

export function BookSearchFilter({
  categories,
  selectedCategory,
  searchQuery,
  onSearchChange,
  onCategoryChange,
  onReset,
}: BookSearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full bg-card p-4 rounded-2xl border border-border shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, author, or ISBN..."
          className="h-10 w-full rounded-xl border border-input bg-muted/30 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-56">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-muted/30 pl-9 pr-8 text-xs font-medium text-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {(searchQuery || selectedCategory !== "All") && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-10 text-xs shrink-0">
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
