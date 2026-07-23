"use client";

import { CAT_LAO, CATEGORIES } from "@/types/product";

interface Props {
  search: string;
  selectedCategory: string;
  onSearchChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
}

export function ProductFilters({
  search,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-xl border bg-card p-4 shadow-sm">
      {/* Search */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="ຄົ້ນຫາສິນຄ້າ..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Category filter */}
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
      >
        <option value="All">ທຸກປະເພດ</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {CAT_LAO[cat] || cat}
          </option>
        ))}
      </select>
    </div>
  );
}
