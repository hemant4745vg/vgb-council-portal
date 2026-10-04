"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Category = "All" | "India" | "World" | "Economy" | "Science & Tech";

type NewsItem = {
  id: number;
  title: string;
  summary: string | null;
  source: string;
  source_url: string;
  published_at: string;
  category: Exclude<Category, "All">;
  image_url: string | null;
};

type CuratedNewsItem = {
  id: string;
  external_id: string;
  title: string;
  summary: string | null;
  source: string;
  source_url: string;
  image_url: string | null;
  category: Exclude<Category, "All">;
  published_at: string;
  briefing_date: string;
  rank: number;
  featured: boolean;
};

const CATEGORIES: Category[] = [
  "All",
  "India",
  "World",
  "Economy",
  "Science & Tech",
];

function getIndiaDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

const CATEGORY_META: Record<
  Exclude<Category, "All">,
  {
    label: string;
    description: string;
    accent: string;
    soft: string;
    dot: string;
  }
> = {
  India: {
    label: "India",
    description: "National affairs, policy, politics and society",
    accent: "text-blue-700",
    soft: "bg-blue-50 text-blue-700 ring-blue-100",
    dot: "bg-blue-600",
  },
  World: {
    label: "World",
    description: "International affairs and geopolitics",
    accent: "text-indigo-700",
    soft: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    dot: "bg-indigo-600",
  },
  Economy: {
    label: "Economy",
    description: "Markets, business, trade and economic policy",
    accent: "text-emerald-700",
    soft: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    dot: "bg-emerald-600",
  },
  "Science & Tech": {
    label: "Science & Tech",
    description: "Science, technology, AI and innovation",
    accent: "text-amber-700",
    soft: "bg-amber-50 text-amber-700 ring-amber-100",
    dot: "bg-amber-500",
  },
};

const SOURCE_PRIORITY: Record<string, number> = {
  "Press Information Bureau": 100,
  "The Indian Express": 95,
  "Hindustan Times": 88,
  NDTV: 86,
  "Business Standard": 82,
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = Date.now();
  const difference = now - date.getTime();

  if (Number.isNaN(date.getTime())) return "Recently";
  if (difference < 0) return "Just now";

  const seconds = Math.floor(difference / 1000);
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year:
      date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function formatExactDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getSourcePriority(source: string): number {
  return SOURCE_PRIORITY[source] ?? 70;
}

function getImageGradient(category: NewsItem["category"]): string {
  switch (category) {
    case "India":
      return "from-blue-800 via-blue-700 to-cyan-500";
    case "World":
      return "from-indigo-900 via-indigo-700 to-blue-500";
    case "Economy":
      return "from-emerald-800 via-emerald-700 to-teal-500";
    case "Science & Tech":
      return "from-slate-900 via-slate-800 to-amber-600";
    default:
      return "from-slate-800 to-slate-600";
  }
}

function truncateText(text: string | null, length: number): string {
  if (!text) return "";

  const cleaned = text.trim();
  if (cleaned.length <= length) return cleaned;

  return `${cleaned.slice(0, length).trimEnd()}…`;
}

function deduplicateStories(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const result: NewsItem[] = [];

  for (const item of items) {
    const normalizedTitle = item.title
      .toLowerCase()
      .replace(/[.,!?;:'"()[\]{}|\\/<>`~@#$%^&*+=_-]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const key = normalizedTitle || item.source_url;

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(item);
  }

  return result;
}

function sortStories(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => {
    const dateDifference =
      new Date(b.published_at).getTime() -
      new Date(a.published_at).getTime();

    if (dateDifference !== 0) return dateDifference;

    return getSourcePriority(b.source) - getSourcePriority(a.source);
  });
}

function NewsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5.75A1.75 1.75 0 0 1 5.75 4H20v14.25A1.75 1.75 0 0 1 18.25 20H5.75A1.75 1.75 0 0 1 4 18.25V5.75Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 8h8M8 11.5h8M8 15h4"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 5h5v5M19 5l-8 8"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 13.5V18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4.5"
      />
    </svg>
  );
}

function RefreshIcon({ spinning = false }: { spinning?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 11a8.1 8.1 0 0 0-14.9-4.3L4 8"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v4h4" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 13a8.1 8.1 0 0 0 14.9 4.3L20 16"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 20v-4h-4" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14M13 6l6 6-6 6"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M12 7.5V12l3 2" />
    </svg>
  );
}

function NewsImage({
  item,
  className = "",
  priority = false,
}: {
  item: NewsItem;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!item.image_url || failed) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${getImageGradient(
          item.category
        )} ${className}`}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-white/30" />
          <div className="absolute -bottom-16 -left-8 h-44 w-44 rounded-full border border-white/20" />
          <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
        </div>

        <div className="relative flex h-full items-center justify-center">
          <div className="rounded-full border border-white/20 bg-white/10 p-4 text-white backdrop-blur-sm">
            <NewsIcon className="h-7 w-7" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      <img
        src={item.image_url}
        alt=""
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
        onError={() => setFailed(true)}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
    </div>
  );
}

function CategoryBadge({
  category,
  inverted = false,
}: {
  category: NewsItem["category"];
  inverted?: boolean;
}) {
  const meta = CATEGORY_META[category];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ring-1 ${
        inverted
          ? "bg-white/95 text-slate-900 ring-white/20"
          : meta.soft
      }`}
    >
      {!inverted && <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />}
      {category}
    </span>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />
  );
}

function LoadingState() {
  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
        <div className="grid lg:grid-cols-[1fr_1.05fr]">
          <div className="order-2 space-y-5 p-6 sm:p-8 lg:order-1 lg:p-10">
            <SkeletonBlock className="h-5 w-24" />
            <SkeletonBlock className="h-10 w-full max-w-xl" />
            <SkeletonBlock className="h-10 w-4/5 max-w-lg" />
            <SkeletonBlock className="h-20 w-full max-w-xl" />
            <SkeletonBlock className="h-10 w-32" />
          </div>
          <SkeletonBlock className="order-1 h-[280px] rounded-none sm:h-[360px] lg:order-2 lg:h-full lg:min-h-[480px]" />
        </div>
      </div>

      <div>
        <SkeletonBlock className="mb-4 h-5 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <SkeletonBlock className="h-40 rounded-none" />
              <div className="space-y-3 p-4">
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-5 w-full" />
                <SkeletonBlock className="h-5 w-4/5" />
                <SkeletonBlock className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  category,
  onRefresh,
  refreshing,
}: {
  category: Category;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <NewsIcon className="h-7 w-7" />
      </div>

      <h2 className="mt-6 text-xl font-bold tracking-tight text-slate-950">
        The newsroom is warming up
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {category === "All"
          ? "The automatic news feed has not received today's stories yet."
          : `There are no stories in ${category} yet. The automatic feed may still be collecting them.`}
      </p>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshIcon spinning={refreshing} />
        Refresh feed
      </button>
    </div>
  );
}

function ErrorState({
  onRefresh,
  refreshing,
}: {
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.3 3.9 2.7 17a2 2 0 0 0 1.73 3h15.14a2 2 0 0 0 1.73-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
          />
        </svg>
      </div>

      <h2 className="mt-5 text-xl font-bold tracking-tight text-red-950">
        News temporarily unavailable
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-red-800/75">
        We could not reach the news database right now. Try refreshing the feed.
      </p>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshIcon spinning={refreshing} />
        Try again
      </button>
    </div>
  );
}

function FeaturedStory({ item }: { item: NewsItem }) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)] transition hover:border-slate-300 hover:shadow-[0_20px_55px_-28px_rgba(15,23,42,0.42)]">
      <div className="grid lg:grid-cols-[1fr_1.05fr]">
        <div className="order-2 flex flex-col justify-center p-6 sm:p-8 lg:order-1 lg:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={item.category} />
            <span className="text-xs font-medium text-slate-400">
              {item.source}
            </span>
            <span className="text-slate-300">·</span>
            <span
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-400"
              title={formatExactDate(item.published_at)}
            >
              <ClockIcon />
              {formatRelativeTime(item.published_at)}
            </span>
          </div>

          <h2 className="mt-5 max-w-2xl text-3xl font-bold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[42px]">
            {item.title}
          </h2>

          {item.summary && (
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500 sm:text-[15px]">
              {truncateText(item.summary, 360)}
            </p>
          )}

          <div className="mt-7">
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Read full story
              <ExternalLinkIcon />
            </a>
          </div>

          <p className="mt-5 text-[11px] text-slate-400">
            Published {formatExactDate(item.published_at)}
          </p>
        </div>

        <a
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Read ${item.title} from ${item.source}`}
          className="relative order-1 block min-h-[280px] overflow-hidden sm:min-h-[360px] lg:order-2 lg:min-h-[480px]"
        >
          <NewsImage item={item} priority className="h-full w-full" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

          <div className="absolute left-5 top-5">
            <span className="rounded-full bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md">
              Lead story
            </span>
          </div>

          <div className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-lg">
            <ArrowRightIcon />
          </div>
        </a>
      </div>
    </article>
  );
}

function SecondaryStory({ item }: { item: NewsItem }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <a
        href={item.source_url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Read ${item.title} from ${item.source}`}
        className="block overflow-hidden"
      >
        <NewsImage item={item} className="h-40 w-full" />
      </a>

      <div className="flex flex-1 flex-col p-4.5 p-5">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={item.category} />
          <span
            title={formatExactDate(item.published_at)}
            className="shrink-0 text-[11px] font-medium text-slate-400"
          >
            {formatRelativeTime(item.published_at)}
          </span>
        </div>

        <h3 className="mt-3 line-clamp-3 text-[16px] font-bold leading-5.5 tracking-[-0.015em] text-slate-900">
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-blue-700"
          >
            {item.title}
          </a>
        </h3>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="truncate text-[11px] font-semibold text-slate-400">
            {item.source}
          </span>
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-blue-700"
          >
            Read
            <ExternalLinkIcon />
          </a>
        </div>
      </div>
    </article>
  );
}

function EditorialStory({ item }: { item: NewsItem }) {
  return (
    <article className="group grid gap-5 border-b border-slate-200 pb-6 last:border-b-0 sm:grid-cols-[190px_1fr]">
      <a
        href={item.source_url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Read ${item.title} from ${item.source}`}
        className="block overflow-hidden rounded-2xl"
      >
        <NewsImage item={item} className="h-32 w-full sm:h-full sm:min-h-[132px]" />
      </a>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={item.category} />
          <span className="text-xs font-medium text-slate-400">
            {item.source}
          </span>
          <span className="text-slate-300">·</span>
          <span
            title={formatExactDate(item.published_at)}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-400"
          >
            <ClockIcon />
            {formatRelativeTime(item.published_at)}
          </span>
        </div>

        <h3 className="mt-2.5 text-xl font-bold leading-tight tracking-[-0.02em] text-slate-950">
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-blue-700"
          >
            {item.title}
          </a>
        </h3>

        {item.summary && (
          <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">
            {truncateText(item.summary, 260)}
          </p>
        )}

        <a
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-fit items-center gap-1.5 text-xs font-bold text-slate-700 transition hover:text-blue-700"
        >
          Continue reading
          <ArrowRightIcon />
        </a>
      </div>
    </article>
  );
}

function CuratedImage({
  item,
  className = "",
}: {
  item: CuratedNewsItem;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!item.image_url || failed) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${getImageGradient(
          item.category
        )} ${className}`}
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-white/25" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full border border-white/20" />
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
        </div>
        <div className="relative flex h-full items-center justify-center">
          <div className="rounded-full border border-white/20 bg-white/10 p-4 text-white backdrop-blur-sm">
            <NewsIcon className="h-8 w-8" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      <img
        src={item.image_url}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
        onError={() => setFailed(true)}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
    </div>
  );
}

function BriefingStory({ item, lead = false }: { item: CuratedNewsItem; lead?: boolean }) {
  return (
    <article
      className={`group overflow-hidden rounded-[24px] border border-slate-800/80 bg-[#101722] text-white shadow-[0_18px_60px_-32px_rgba(2,8,23,0.75)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-[0_24px_70px_-34px_rgba(2,8,23,0.9)] ${
        lead ? "lg:grid lg:grid-cols-[1.08fr_0.92fr]" : ""
      }`}
    >
      <a
        href={item.source_url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Read ${item.title} from ${item.source}`}
        className={`relative block overflow-hidden ${lead ? "min-h-[250px] lg:min-h-[390px]" : "h-48"}`}
      >
        <CuratedImage item={item} className="h-full w-full" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          {item.featured && (
            <span className="rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
              Featured
            </span>
          )}
          <CategoryBadge category={item.category} inverted />
        </div>
        <div className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-950 shadow-lg">
          <ArrowRightIcon />
        </div>
      </a>

      <div className={`flex flex-col ${lead ? "justify-center p-6 sm:p-8 lg:p-9" : "p-5"}`}>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
          <span>{item.source}</span>
          <span className="text-slate-600">·</span>
          <span>{formatRelativeTime(item.published_at)}</span>
        </div>
        <h3
          className={`mt-3 font-bold tracking-[-0.025em] text-white ${
            lead ? "text-2xl leading-[1.12] sm:text-3xl lg:text-[34px]" : "text-lg leading-6"
          }`}
        >
          <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="transition hover:text-cyan-300">
            {item.title}
          </a>
        </h3>
        {item.summary && (
          <p className={`mt-3 leading-6 text-slate-400 ${lead ? "text-sm sm:text-[15px]" : "line-clamp-3 text-sm"}`}>
            {truncateText(item.summary, lead ? 430 : 220)}
          </p>
        )}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Editor's Choice
          </span>
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white transition hover:text-cyan-300"
          >
            Read source <ExternalLinkIcon />
          </a>
        </div>
      </div>
    </article>
  );
}

function BriefingSection({ items }: { items: CuratedNewsItem[] }) {
  const lead = items.find((item) => item.featured) ?? items[0] ?? null;
  const rest = lead ? items.filter((item) => item.id !== lead.id).slice(0, 4) : [];

  if (!lead) return null;

  return (
    <section aria-labelledby="editors-choice-heading" className="overflow-hidden rounded-[30px] border border-slate-800 bg-[#0a1019] p-4 shadow-[0_24px_80px_-42px_rgba(2,8,23,0.8)] sm:p-5 lg:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.75)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
              Editorial selection
            </span>
          </div>
          <h2 id="editors-choice-heading" className="mt-2 text-2xl font-bold tracking-[-0.035em] text-white sm:text-3xl">
            Editor's Choice
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-400">
            Editorially selected analytically.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {items.length} briefing {items.length === 1 ? "story" : "stories"}
        </div>
      </div>

      <BriefingStory item={lead} lead />

      {rest.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((item) => (
            <BriefingStory key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function CoverageStrip({
  stories,
  counts,
}: {
  stories: NewsItem[];
  counts: Record<Exclude<Category, "All">, number>;
}) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-4">
      {(Object.keys(CATEGORY_META) as Array<Exclude<Category, "All">>).map(
        (category, index) => {
          const meta = CATEGORY_META[category];

          return (
            <div
              key={category}
              className={`flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 ${
                index > 0 ? "border-l border-slate-200" : ""
              } ${index === 2 ? "border-l-0 sm:border-l" : ""}`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
                <span className="truncate text-xs font-semibold text-slate-600">
                  {category}
                </span>
              </div>
              <span className={`text-sm font-bold ${meta.accent}`}>
                {stories.length ? counts[category] : "—"}
              </span>
            </div>
          );
        }
      )}
    </div>
  );
}

function FeedStatus({ lastUpdated }: { lastUpdated: Date | null }) {
  return (
    <section className="border-t border-slate-200 pt-6">
      <div className="flex flex-col gap-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-600">
            Automated publisher feed
          </span>
          <span className="hidden text-slate-300 sm:inline">·</span>
          <span>Stories link to their original publishers.</span>
        </div>

        {lastUpdated && (
          <span>Last checked {formatRelativeTime(lastUpdated.toISOString())}</span>
        )}
      </div>
    </section>
  );
}

export default function NewsPage() {
  const supabase = createClient();
  const [stories, setStories] = useState<NewsItem[]>([]);
  const [curatedStories, setCuratedStories] = useState<CuratedNewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadNews = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const [newsResult, curatedResult] = await Promise.all([
        supabase
          .from("news_items")
          .select("id, title, summary, source, source_url, published_at, category, image_url")
          .order("published_at", { ascending: false })
          .limit(120),
        supabase
          .from("curated_news")
          .select(
            "id, external_id, title, summary, source, source_url, image_url, category, published_at, briefing_date, rank, featured"
          )
          .eq("briefing_date", getIndiaDate())
          .order("rank", { ascending: true })
          .order("published_at", { ascending: false })
          .limit(12),
      ]);

      if (newsResult.error) throw newsResult.error;
      if (curatedResult.error) throw curatedResult.error;

      const cleaned = (newsResult.data ?? []) as NewsItem[];
      const curated = (curatedResult.data ?? []) as CuratedNewsItem[];

      setStories(sortStories(deduplicateStories(cleaned)));
      setCuratedStories(curated);
      setLastUpdated(new Date());
    } catch (queryError) {
      console.error("Failed to load news:", queryError);
      setError(
        queryError instanceof Error ? queryError.message : "Unable to load news."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadNews();
  }, [loadNews]);

  const filteredStories = useMemo(() => {
    if (selectedCategory === "All") return stories;

    return stories.filter((story) => story.category === selectedCategory);
  }, [selectedCategory, stories]);

  const filteredCuratedStories = useMemo(() => {
    if (selectedCategory === "All") return curatedStories;
    return curatedStories.filter((story) => story.category === selectedCategory);
  }, [curatedStories, selectedCategory]);

  const featuredStory = filteredStories[0] ?? null;
  const secondaryStories = filteredStories.slice(1, 5);
  const remainingStories = filteredStories.slice(5);

  const categoryCounts = useMemo(() => {
    const counts: Record<Exclude<Category, "All">, number> = {
      India: 0,
      World: 0,
      Economy: 0,
      "Science & Tech": 0,
    };

    for (const story of stories) {
      counts[story.category] += 1;
    }

    return counts;
  }, [stories]);

  const pageDescription =
    selectedCategory === "All"
      ? "Editor's Choice on top, followed by the continuously refreshed VGB news feed."
      : CATEGORY_META[selectedCategory].description;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
      {/* Newsroom header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-7 pt-8 sm:px-6 sm:pb-9 sm:pt-10 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">
                  VGB Newsroom
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[42px]">
                News & Current Affairs
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                {pageDescription}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 lg:justify-end">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Feed status
                  </p>
                  <p className="text-xs font-semibold text-slate-700">
                    Updated automatically
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void loadNews(true)}
                disabled={loading || refreshing}
                aria-label="Refresh news"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshIcon spinning={refreshing} />
                <span className="hidden sm:inline">
                  {refreshing ? "Updating…" : "Refresh"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Category navigation */}
      <nav
        className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl"
        aria-label="News categories"
      >
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-max items-center gap-1 py-2">
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              const count =
                category === "All"
                  ? stories.length
                  : categoryCounts[category];

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`relative inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {category}
                  {!loading && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        active
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        {!loading && !error && filteredCuratedStories.length > 0 && (
          <div className="mb-10">
            <BriefingSection items={filteredCuratedStories} />
          </div>
        )}

        {/* Coverage strip */}
        {!loading && !error && (
          <div className="mb-8">
            <CoverageStrip stories={stories} counts={categoryCounts} />
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingState />}

        {/* Error */}
        {!loading && error && (
          <ErrorState
            onRefresh={() => void loadNews(true)}
            refreshing={refreshing}
          />
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          filteredStories.length === 0 &&
          filteredCuratedStories.length === 0 && (
            <EmptyState
              category={selectedCategory}
              onRefresh={() => void loadNews(true)}
              refreshing={refreshing}
            />
          )}

        {/* News */}
        {!loading &&
          !error &&
          (filteredStories.length > 0 || filteredCuratedStories.length > 0) && (
            <div className="space-y-10">
            {/* Lead */}
            {featuredStory && (
              <section aria-labelledby="lead-story-heading">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Today&apos;s lead
                    </p>
                    <h2
                      id="lead-story-heading"
                      className="mt-1 text-lg font-bold tracking-tight text-slate-900"
                    >
                      Top story
                    </h2>
                  </div>

                  {lastUpdated && (
                    <p className="hidden text-xs text-slate-400 sm:block">
                      Checked {formatRelativeTime(lastUpdated.toISOString())}
                    </p>
                  )}
                </div>

                <FeaturedStory item={featuredStory} />
              </section>
            )}

            {/* More stories */}
            {secondaryStories.length > 0 && (
              <section aria-labelledby="more-stories-heading">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Keep reading
                    </p>
                    <h2
                      id="more-stories-heading"
                      className="mt-1 text-xl font-bold tracking-[-0.02em] text-slate-900"
                    >
                      More stories
                    </h2>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {secondaryStories.map((story) => (
                    <SecondaryStory key={story.id} item={story} />
                  ))}
                </div>
              </section>
            )}

            {/* Latest */}
            {remainingStories.length > 0 && (
              <section id="latest-news" aria-labelledby="latest-heading">
                <div className="mb-5 flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Automated feed
                    </p>
                    <h2
                      id="latest-heading"
                      className="mt-1 text-2xl font-bold tracking-[-0.025em] text-slate-950"
                    >
                      Latest News
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Continuously refreshed stories from the automated publisher feed.
                    </p>
                  </div>

                  <span className="hidden text-xs font-medium text-slate-400 sm:block">
                    {remainingStories.length}{" "}
                    {remainingStories.length === 1 ? "story" : "stories"}
                  </span>
                </div>

                <div className="grid gap-x-10 gap-y-7 lg:grid-cols-2">
                  {remainingStories.map((story) => (
                    <EditorialStory key={story.id} item={story} />
                  ))}
                </div>
              </section>
            )}

            <FeedStatus lastUpdated={lastUpdated} />
          </div>
        )}
      </div>
    </main>
  );
}
