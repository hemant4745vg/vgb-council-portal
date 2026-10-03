"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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

const CATEGORIES: Category[] = [
  "All",
  "India",
  "World",
  "Economy",
  "Science & Tech",
];

const CATEGORY_META: Record<
  Exclude<Category, "All">,
  {
    label: string;
    description: string;
  }
> = {
  India: {
    label: "India",
    description: "National affairs, policy, politics and society",
  },
  World: {
    label: "World",
    description: "International affairs and geopolitics",
  },
  Economy: {
    label: "Economy",
    description: "Markets, business, trade and economic policy",
  },
  "Science & Tech": {
    label: "Science & Tech",
    description: "Science, technology, AI and innovation",
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

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  if (difference < 0) {
    return "Just now";
  }

  const seconds = Math.floor(difference / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function formatExactDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getCategoryClass(category: NewsItem["category"]): string {
  switch (category) {
    case "India":
      return "bg-blue-50 text-blue-700 ring-blue-100";
    case "World":
      return "bg-violet-50 text-violet-700 ring-violet-100";
    case "Economy":
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    case "Science & Tech":
      return "bg-amber-50 text-amber-700 ring-amber-100";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-100";
  }
}

function getSourcePriority(source: string): number {
  return SOURCE_PRIORITY[source] ?? 70;
}

function getImageGradient(category: NewsItem["category"]): string {
  switch (category) {
    case "India":
      return "from-blue-700 via-blue-600 to-cyan-500";
    case "World":
      return "from-violet-700 via-indigo-600 to-blue-500";
    case "Economy":
      return "from-emerald-700 via-emerald-600 to-teal-500";
    case "Science & Tech":
      return "from-slate-800 via-slate-700 to-blue-600";
    default:
      return "from-slate-700 to-slate-500";
  }
}

function truncateText(text: string | null, length: number): string {
  if (!text) {
    return "";
  }

  const cleaned = text.trim();

  if (cleaned.length <= length) {
    return cleaned;
  }

  return `${cleaned.slice(0, length).trimEnd()}…`;
}

function deduplicateStories(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const result: NewsItem[] = [];

  for (const item of items) {
    const normalizedTitle = item.title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .replace(/\s+/g, " ")
      .trim();

    const key = normalizedTitle || item.source_url;

    if (seen.has(key)) {
      continue;
    }

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

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return getSourcePriority(b.source) - getSourcePriority(a.source);
  });
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
          <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
        </div>

        <div className="relative flex h-full items-center justify-center">
          <div className="rounded-full border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <NewsIcon />
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
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        onError={() => setFailed(true)}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
    </div>
  );
}

function NewsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6 text-white"
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v4h4"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 13a8.1 8.1 0 0 0 14.9 4.3L20 16"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 20v-4h-4"
      />
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

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`}
    />
  );
}

function FeaturedSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <SkeletonBlock className="h-[280px] w-full rounded-none sm:h-[360px]" />
      <div className="space-y-4 p-6 sm:p-8">
        <SkeletonBlock className="h-5 w-24" />
        <SkeletonBlock className="h-8 w-full max-w-3xl" />
        <SkeletonBlock className="h-8 w-4/5 max-w-2xl" />
        <SkeletonBlock className="h-16 w-full max-w-3xl" />
      </div>
    </div>
  );
}

function StorySkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <SkeletonBlock className="h-44 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-5 w-full" />
        <SkeletonBlock className="h-5 w-4/5" />
        <SkeletonBlock className="h-4 w-28" />
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
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <NewsIcon />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-slate-900">
        No stories available
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        There are currently no stories in{" "}
        {category === "All" ? "the news feed" : `the ${category} section`}.
        The automatic news pipeline may still be collecting the latest
        stories.
      </p>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshIcon spinning={refreshing} />
        Refresh
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
    <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4M12 16h.01"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.3 3.9 2.7 17a2 2 0 0 0 1.73 3h15.14a2 2 0 0 0 1.73-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
          />
        </svg>
      </div>

      <h2 className="mt-4 text-lg font-semibold text-red-900">
        News could not be loaded
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-red-700/80">
        The news database could not be reached right now. Your portal is
        still alive, which is more than can be said for many production
        systems at 2 a.m.
      </p>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshIcon spinning={refreshing} />
        Try again
      </button>
    </div>
  );
}

function StoryCard({ item }: { item: NewsItem }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <a
        href={item.source_url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Read ${item.title} from ${item.source}`}
        className="block"
      >
        <NewsImage item={item} className="h-48 sm:h-52" />
      </a>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${getCategoryClass(
              item.category
            )}`}
          >
            {item.category}
          </span>

          <span
            title={formatExactDate(item.published_at)}
            className="shrink-0 text-xs text-slate-400"
          >
            {formatRelativeTime(item.published_at)}
          </span>
        </div>

        <h3 className="mt-3 line-clamp-3 text-[17px] font-semibold leading-6 tracking-[-0.01em] text-slate-900">
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
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
            {truncateText(item.summary, 210)}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="truncate text-xs font-medium text-slate-500">
            {item.source}
          </span>

          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-blue-700 transition hover:text-blue-800"
          >
            Read
            <ExternalLinkIcon />
          </a>
        </div>
      </div>
    </article>
  );
}

function FeaturedStory({ item }: { item: NewsItem }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <a
        href={item.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block h-[270px] overflow-hidden sm:h-[360px]"
        aria-label={`Read ${item.title} from ${item.source}`}
      >
        <NewsImage
          item={item}
          priority
          className="h-full w-full"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-bold ${getCategoryClass(
                item.category
              )}`}
            >
              {item.category}
            </span>

            <span className="text-xs font-medium text-white/80">
              {item.source} · {formatRelativeTime(item.published_at)}
            </span>
          </div>

          <h2 className="mt-3 max-w-4xl text-2xl font-bold leading-tight tracking-[-0.025em] text-white sm:text-4xl">
            {item.title}
          </h2>
        </div>
      </a>

      <div className="p-5 sm:p-7">
        {item.summary && (
          <p className="max-w-4xl text-sm leading-6 text-slate-600 sm:text-[15px]">
            {truncateText(item.summary, 420)}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Published {formatExactDate(item.published_at)}
          </div>

          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Read full story
            <ExternalLinkIcon />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function NewsPage() {
  const [stories, setStories] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("All");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadNews = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("news_items")
        .select(
          "id, title, summary, source, source_url, published_at, category, image_url"
        )
        .order("published_at", { ascending: false })
        .limit(120);

      if (queryError) {
        throw queryError;
      }

      const cleaned = (data ?? []) as NewsItem[];

      setStories(sortStories(deduplicateStories(cleaned)));
      setLastUpdated(new Date());
    } catch (queryError) {
      console.error("Failed to load news:", queryError);

      setError(
        queryError instanceof Error
          ? queryError.message
          : "Unable to load news."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadNews();
  }, [loadNews]);

  const filteredStories = useMemo(() => {
    if (selectedCategory === "All") {
      return stories;
    }

    return stories.filter(
      (story) => story.category === selectedCategory
    );
  }, [selectedCategory, stories]);

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
      ? "Current affairs from India, the world, the economy, and science & technology."
      : CATEGORY_META[selectedCategory].description;

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  VGB News
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">
                News & Current Affairs
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                {pageDescription}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Feed status
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-700">
                  Updated automatically
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadNews(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshIcon spinning={refreshing} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category navigation */}
      <section className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          <nav
            className="flex min-w-max items-center gap-1 py-2"
            aria-label="News categories"
          >
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
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
          </nav>
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {/* Status line */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {selectedCategory === "All"
                ? "Latest stories"
                : selectedCategory}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              {loading
                ? "Loading the latest stories…"
                : `${filteredStories.length} ${
                    filteredStories.length === 1 ? "story" : "stories"
                  } available`}
            </p>
          </div>

          {lastUpdated && !loading && (
            <p className="text-xs text-slate-400">
              Checked {formatRelativeTime(lastUpdated.toISOString())}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-7">
            <FeaturedSkeleton />

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <StorySkeleton key={index} />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <ErrorState
            onRefresh={() => void loadNews(true)}
            refreshing={refreshing}
          />
        )}

        {/* Empty */}
        {!loading && !error && filteredStories.length === 0 && (
          <EmptyState
            category={selectedCategory}
            onRefresh={() => void loadNews(true)}
            refreshing={refreshing}
          />
        )}

        {/* News */}
        {!loading && !error && filteredStories.length > 0 && (
          <div className="space-y-10">
            {/* Featured */}
            {featuredStory && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Top story
                  </h2>
                </div>

                <FeaturedStory item={featuredStory} />
              </section>
            )}

            {/* Secondary stories */}
            {secondaryStories.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    More from the feed
                  </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {secondaryStories.map((story) => (
                    <StoryCard key={story.id} item={story} />
                  ))}
                </div>
              </section>
            )}

            {/* Remaining stories */}
            {remainingStories.length > 0 && (
              <section>
                <div className="mb-5 flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-xl font-bold tracking-[-0.02em] text-slate-900">
                      Latest
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Recent stories across the selected coverage.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {remainingStories.map((story) => (
                    <StoryCard key={story.id} item={story} />
                  ))}
                </div>
              </section>
            )}

            {/* Footer information */}
            <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Automatic news feed
                  </p>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                    Stories are collected automatically from the portal&apos;s
                    configured news sources and stored in the VGB news
                    database. Headlines link back to their original
                    publishers.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Automated
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
