"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type NewsCategory =
  | "All"
  | "India"
  | "World & Geopolitics"
  | "Economy & Markets"
  | "Geoeconomics"
  | "Technology & AI"
  | "Government & Public Policy"
  | "Society"
  | "Environment & Disasters"
  | "Uttar Pradesh"
  | "BRICS & Global South"
  | "Rupee & Indian Economy"
  | "Forecasting & Data"
  | "Political & Legal Cases"
  | "Controversies & Media Literacy";

type NewsArticle = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: Exclude<NewsCategory, "All">;
  subcategory: string | null;
  source_name: string | null;
  source_url: string | null;
  image_url: string | null;
  published_at: string | null;
  author: string | null;
  featured: boolean;
};

const CATEGORIES: NewsCategory[] = [
  "All",
  "India",
  "World & Geopolitics",
  "Economy & Markets",
  "Geoeconomics",
  "Technology & AI",
  "Government & Public Policy",
  "Society",
  "Environment & Disasters",
  "Uttar Pradesh",
  "BRICS & Global South",
  "Rupee & Indian Economy",
  "Forecasting & Data",
  "Political & Legal Cases",
  "Controversies & Media Literacy",
];

const DESKS = [
  {
    title: "India",
    description: "Politics, institutions, governance and major national developments.",
    category: "India" as NewsCategory,
    accent: "IND",
  },
  {
    title: "World & Geopolitics",
    description: "International relations, conflicts, alliances and strategic affairs.",
    category: "World & Geopolitics" as NewsCategory,
    accent: "GEO",
  },
  {
    title: "Economy & Markets",
    description: "Growth, inflation, markets, fiscal policy and economic indicators.",
    category: "Economy & Markets" as NewsCategory,
    accent: "ECO",
  },
  {
    title: "Technology & AI",
    description: "Artificial intelligence, technology policy, platforms and digital systems.",
    category: "Technology & AI" as NewsCategory,
    accent: "AI",
  },
  {
    title: "BRICS & Global South",
    description: "Emerging powers, multilateral institutions and South-South relations.",
    category: "BRICS & Global South" as NewsCategory,
    accent: "BRI",
  },
  {
    title: "Rupee & Indian Economy",
    description: "Currency movements, external sector, trade and monetary questions.",
    category: "Rupee & Indian Economy" as NewsCategory,
    accent: "₹",
  },
];

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getInitials(name: string | null) {
  if (!name) return "VG";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function CategoryPill({
  category,
  active = false,
  onClick,
}: {
  category: NewsCategory;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950",
      ].join(" ")}
    >
      {category}
    </button>
  );
}

function ArticlePlaceholder({
  category,
  large = false,
}: {
  category: string;
  large?: boolean;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden bg-slate-950",
        large ? "h-72 sm:h-96" : "h-48",
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.08),transparent_35%)]" />

      <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-sm font-bold tracking-widest text-white backdrop-blur">
        VG
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
          {category}
        </p>
        <div className="mt-2 h-px w-24 bg-white/30" />
      </div>
    </div>
  );
}

function ArticleCard({
  article,
  onOpen,
}: {
  article: NewsArticle;
  onOpen: (article: NewsArticle) => void;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      {article.image_url ? (
        <button
          type="button"
          onClick={() => onOpen(article)}
          className="block w-full text-left"
        >
          <div className="h-48 overflow-hidden bg-slate-100">
            <img
              src={article.image_url}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onOpen(article)}
          className="block w-full text-left"
        >
          <ArticlePlaceholder category={article.category} />
        </button>
      )}

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider">
          <span className="text-slate-950">{article.category}</span>

          {article.subcategory && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">
                {article.subcategory}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpen(article)}
          className="mt-3 block text-left"
        >
          <h3 className="text-xl font-bold leading-tight tracking-tight text-slate-950 transition group-hover:text-slate-700">
            {article.title}
          </h3>
        </button>

        {article.excerpt && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
            {article.excerpt}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span>{formatDate(article.published_at)}</span>

          <button
            type="button"
            onClick={() => onOpen(article)}
            className="font-semibold text-slate-950 transition group-hover:underline"
          >
            Read story →
          </button>
        </div>
      </div>
    </article>
  );
}

function FeaturedArticle({
  article,
  onOpen,
}: {
  article: NewsArticle;
  onOpen: (article: NewsArticle) => void;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <button
          type="button"
          onClick={() => onOpen(article)}
          className="relative block min-h-[330px] overflow-hidden text-left"
        >
          {article.image_url ? (
            <img
              src={article.image_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <ArticlePlaceholder
              category={article.category}
              large
            />
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-7 pt-24">
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
              Featured
            </span>
          </div>
        </button>

        <div className="flex flex-col justify-center p-7 sm:p-9">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>{article.category}</span>

            {article.subcategory && (
              <>
                <span className="text-slate-300">•</span>
                <span>{article.subcategory}</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpen(article)}
            className="mt-4 text-left"
          >
            <h2 className="text-3xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-4xl">
              {article.title}
            </h2>
          </button>

          {article.excerpt && (
            <p className="mt-5 text-base leading-7 text-slate-600">
              {article.excerpt}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <span>{formatDate(article.published_at)}</span>

            {article.source_name && (
              <>
                <span className="text-slate-300">•</span>
                <span>{article.source_name}</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpen(article)}
            className="mt-7 w-fit rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Read featured story
          </button>
        </div>
      </div>
    </article>
  );
}

function ArticleReader({
  article,
  onClose,
}: {
  article: NewsArticle;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
      <div className="mx-auto min-h-full max-w-4xl">
        <article className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white">
                VG
              </div>
              <span className="text-sm font-semibold text-slate-600">
                VGB News Desk
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          {article.image_url ? (
            <div className="max-h-[420px] overflow-hidden bg-slate-100">
              <img
                src={article.image_url}
                alt=""
                className="max-h-[420px] w-full object-cover"
              />
            </div>
          ) : (
            <ArticlePlaceholder category={article.category} large />
          )}

          <div className="px-6 py-8 sm:px-12 sm:py-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>{article.category}</span>

              {article.subcategory && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>{article.subcategory}</span>
                </>
              )}
            </div>

            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                {article.excerpt}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-slate-100 py-4 text-sm text-slate-500">
              <span>{formatDateTime(article.published_at)}</span>

              {article.author && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>By {article.author}</span>
                </>
              )}

              {article.source_name && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>{article.source_name}</span>
                </>
              )}
            </div>

            <div className="mt-9 whitespace-pre-wrap text-[17px] leading-8 text-slate-800">
              {article.content}
            </div>

            {article.source_url && article.source_name && (
              <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Original source
                </p>

                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex font-semibold text-slate-950 underline underline-offset-4"
                >
                  {article.source_name} ↗
                </a>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<NewsCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] =
    useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadArticles() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("news_articles")
        .select(
          `
            id,
            title,
            slug,
            excerpt,
            content,
            category,
            subcategory,
            source_name,
            source_url,
            image_url,
            published_at,
            author,
            featured
          `,
        )
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false });

      if (!mounted) return;

      if (fetchError) {
        console.error("Failed to load news articles:", fetchError);
        setError("The news desk could not load stories right now.");
        setArticles([]);
      } else {
        setArticles((data ?? []) as NewsArticle[]);
      }

      setLoading(false);
    }

    loadArticles();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === "All" ||
        article.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!query) return true;

      return [
        article.title,
        article.excerpt,
        article.content,
        article.category,
        article.subcategory,
        article.source_name,
        article.author,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query),
        );
    });
  }, [articles, selectedCategory, searchQuery]);

  const featuredArticle = useMemo(
    () => articles.find((article) => article.featured) ?? articles[0] ?? null,
    [articles],
  );

  const regularArticles = useMemo(() => {
    const featuredId = featuredArticle?.id;

    return filteredArticles.filter((article) => article.id !== featuredId);
  }, [filteredArticles, featuredArticle]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const article of articles) {
      counts.set(
        article.category,
        (counts.get(article.category) ?? 0) + 1,
      );
    }

    return counts;
  }, [articles]);

  const displayedFeatured =
    selectedCategory === "All" && !searchQuery.trim()
      ? featuredArticle
      : null;

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-sm font-black tracking-widest text-white">
                VG
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  VidyaGyan Student Council
                </p>
                <h1 className="mt-0.5 text-2xl font-black tracking-tight">
                  News Desk
                </h1>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Home
              </Link>

              <Link
                href="/tools"
                className="rounded-lg px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Tools
              </Link>

              <Link
                href="/tools/news"
                className="rounded-lg bg-slate-950 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
              >
                News Lab
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="max-w-4xl">
            <div className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              <span className="h-px w-8 bg-slate-300" />
              Current Affairs
            </div>

            <h2 className="text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-7xl">
              Understand the
              <br />
              world as it changes.
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              A student-facing current-affairs desk covering India,
              geopolitics, economics, technology, public policy and the
              questions underneath the headlines.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="relative block">
              <span className="sr-only">Search news</span>

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search stories, topics, sources..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
            </label>

            <Link
              href="/tools/news"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Open News Lab →
            </Link>
          </div>
        </div>
      </section>

      {/* Category navigation */}
      <section className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl overflow-x-auto px-5 py-3 sm:px-8">
          <div className="flex gap-2">
            {CATEGORIES.map((category) => (
              <CategoryPill
                key={category}
                category={category}
                active={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {/* Loading */}
        {loading && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-3xl bg-slate-200 lg:col-span-2" />
            <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-900">{error}</p>
            <p className="mt-1 text-sm text-red-700">
              Check the Supabase connection and the published-news policy.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && articles.length === 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center sm:px-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-xl font-black text-white">
              VG
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              News Desk
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight">
              The newsroom is ready.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
              There are no published current-affairs stories yet. Once
              articles are added to the editorial workflow and published,
              they will appear here automatically.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/tools/news"
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explore News Lab
              </Link>

              <Link
                href="/tools"
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Browse All Tools
              </Link>
            </div>
          </section>
        )}

        {/* Featured */}
        {!loading &&
          !error &&
          displayedFeatured &&
          filteredArticles.length > 0 && (
            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Lead story
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">
                    Featured
                  </h2>
                </div>

                <span className="text-sm text-slate-400">
                  {articles.length}{" "}
                  {articles.length === 1 ? "published story" : "published stories"}
                </span>
              </div>

              <FeaturedArticle
                article={displayedFeatured}
                onOpen={setSelectedArticle}
              />
            </section>
          )}

        {/* Search/filter heading */}
        {!loading &&
          !error &&
          articles.length > 0 &&
          (searchQuery.trim() || selectedCategory !== "All") && (
            <section className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Filtered desk
              </p>

              <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-2xl font-black tracking-tight">
                  {selectedCategory === "All"
                    ? "Search results"
                    : selectedCategory}
                </h2>

                <p className="text-sm text-slate-500">
                  {filteredArticles.length}{" "}
                  {filteredArticles.length === 1 ? "story" : "stories"}
                </p>
              </div>
            </section>
          )}

        {/* Articles */}
        {!loading &&
          !error &&
          regularArticles.length > 0 && (
            <section className="mt-10">
              {!displayedFeatured && (
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Latest reporting
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">
                    Stories
                  </h2>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {regularArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onOpen={setSelectedArticle}
                  />
                ))}
              </div>
            </section>
          )}

        {/* No filter results */}
        {!loading &&
          !error &&
          articles.length > 0 &&
          filteredArticles.length === 0 && (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <p className="text-lg font-bold text-slate-950">
                No stories match this filter.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Try another desk or clear the search.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Clear filters
              </button>
            </section>
          )}

        {/* News desks */}
        <section className="mt-20 border-t border-slate-200 pt-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Coverage map
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                News desks
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Different desks, different lenses. Because putting every
              geopolitical, economic and technological development under
              “News” is how information architecture quietly dies.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DESKS.map((desk) => {
              const count = categoryCounts.get(desk.category) ?? 0;

              return (
                <button
                  key={desk.title}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(desk.category);
                    setSearchQuery("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-slate-950 px-2 text-xs font-black tracking-wider text-white">
                      {desk.accent}
                    </span>

                    <span className="text-xs font-medium text-slate-400">
                      {count} {count === 1 ? "story" : "stories"}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-950">
                    {desk.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {desk.description}
                  </p>

                  <span className="mt-5 inline-block text-sm font-semibold text-slate-950 transition group-hover:translate-x-1">
                    Explore desk →
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Analytical layer */}
        <section className="mt-16 overflow-hidden rounded-3xl bg-slate-950 text-white">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-7 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
                Beyond the headline
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
                Read the story.
                <br />
                Then interrogate it.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                The News Desk tells you what happened. The News Lab helps you
                examine sources, separate claims from evidence, build
                timelines, map policy effects and reason about uncertainty.
              </p>

              <Link
                href="/tools/news"
                className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                Open News Lab →
              </Link>
            </div>

            <div className="grid grid-cols-2 border-t border-white/10 lg:border-l lg:border-t-0">
              {[
                ["01", "Source Lab"],
                ["02", "Claim Checker"],
                ["03", "Timeline"],
                ["04", "Forecasting"],
              ].map(([number, label]) => (
                <div
                  key={number}
                  className="border-b border-r border-white/10 p-6 last:border-b-0"
                >
                  <span className="text-xs font-bold text-white/30">
                    {number}
                  </span>
                  <p className="mt-8 text-sm font-semibold text-white/80">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Article reader */}
      {selectedArticle && (
        <ArticleReader
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </main>
  );
}
