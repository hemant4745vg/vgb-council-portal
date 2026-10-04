"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  "All",
  "Events & Activities",
  "Council & Leadership",
  "Campus Life",
  "Student Voices",
  "People",
  "Achievements",
  "Perspectives",
  "Culture",
];

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  status: string;
  author_name: string;
  cover_image_url: string | null;
  featured: boolean;
  published_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EditorialPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("editorial_posts")
        .select(
          "id,title,slug,excerpt,category,status,author_name,cover_image_url,featured,published_at"
        )
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false });

      if (fetchError) {
        setError("The Editorial could not be loaded right now.");
        setPosts([]);
        setLoading(false);
        return;
      }

      setPosts((data ?? []) as Post[]);
      setLoading(false);
    }

    load();
  }, []);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory =
        category === "All" || post.category === category;

      if (!matchesCategory) return false;

      if (!query) return true;

      return [
        post.title,
        post.excerpt ?? "",
        post.category,
        post.author_name,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [posts, category, search]);

  const featured = useMemo(() => {
    if (category !== "All" || search.trim()) return null;

    return posts.find((post) => post.featured) ?? posts[0] ?? null;
  }, [posts, category, search]);

  const latestPosts = useMemo(() => {
    return filteredPosts.filter((post) => post.id !== featured?.id);
  }, [filteredPosts, featured]);

  const hasStories = filteredPosts.length > 0;

  return (
    <main className="min-h-screen bg-white text-slate-950">
      {/* HERO */}
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
              VidyaGyan Editorial Board
            </p>

            <div className="mt-5 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-5xl font-black leading-none tracking-[-0.04em] sm:text-6xl md:text-8xl">
                  THE
                  <br />
                  EDITORIAL
                </h1>

                <p className="mt-7 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                  Stories from life at VidyaGyan. Events, people, ideas,
                  achievements, culture, and the details that deserve to be
                  remembered.
                </p>
              </div>

              <div className="hidden max-w-xs border-l border-slate-700 pl-6 text-sm leading-6 text-slate-400 lg:block">
                A student publication documenting the people, moments and
                ideas that shape our campus.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS + SEARCH */}
      <section className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 md:px-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((item) => {
                const active = category === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            <div className="relative shrink-0 lg:w-72">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search stories…"
                aria-label="Search Editorial stories"
                className="w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 transition hover:text-slate-950"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        {loading ? (
          <div className="space-y-8">
            <div className="grid overflow-hidden rounded-3xl border border-slate-200 md:grid-cols-2">
              <div className="aspect-[16/10] animate-pulse bg-slate-100" />
              <div className="space-y-5 p-8 md:p-12">
                <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                <div className="h-10 w-4/5 animate-pulse rounded bg-slate-100" />
                <div className="h-5 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
              </div>
            </div>

            <div>
              <div className="mb-5 h-8 w-48 animate-pulse rounded bg-slate-100" />

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <div className="aspect-[16/9] animate-pulse bg-slate-100" />
                    <div className="space-y-4 p-6">
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                      <div className="h-6 w-4/5 animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-500">
              Editorial
            </p>

            <h2 className="mt-3 text-2xl font-black text-slate-950">
              Something went wrong
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
            >
              Try Again
            </button>
          </div>
        ) : !hasStories ? (
          <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-20 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              {search ? "Search" : "Editorial Desk"}
            </p>

            <h2 className="mt-3 text-2xl font-black tracking-tight">
              {search ? "No stories found" : "No stories yet"}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              {search
                ? `Nothing matched “${search}”. Try another search or clear the filters.`
                : "The editorial desk is still assembling this issue."}
            </p>

            {(search || category !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="mt-6 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold transition hover:border-slate-950"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* FEATURED STORY */}
            {featured && (
              <section>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      Featured
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
                      Editor&apos;s Pick
                    </h2>
                  </div>

                  {featured.published_at && (
                    <time
                      dateTime={featured.published_at}
                      className="hidden text-sm text-slate-500 sm:block"
                    >
                      {formatDate(featured.published_at)}
                    </time>
                  )}
                </div>

                <Link
                  href={`/editorial/${featured.slug}`}
                  className="group grid overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 transition hover:border-slate-400"
                >
                  <div className="grid md:grid-cols-2">
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-200 md:aspect-auto md:min-h-[30rem]">
                      {featured.cover_image_url ? (
                        <img
                          src={featured.cover_image_url}
                          alt=""
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                        />
                      ) : (
                        <div className="flex h-full min-h-[20rem] items-center justify-center bg-slate-100 text-[8rem] font-black tracking-[-0.08em] text-slate-200 md:min-h-[30rem]">
                          V
                        </div>
                      )}

                      <div className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-950 shadow-sm">
                        {featured.category}
                      </div>
                    </div>

                    <div className="flex flex-col justify-center p-7 md:p-10 lg:p-14">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Featured Story
                      </p>

                      <h3 className="mt-4 text-3xl font-black leading-[1.08] tracking-tight md:text-4xl lg:text-5xl">
                        {featured.title}
                      </h3>

                      {featured.excerpt && (
                        <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                          {featured.excerpt}
                        </p>
                      )}

                      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
                        <span className="font-semibold text-slate-950">
                          {featured.author_name}
                        </span>

                        {featured.published_at && (
                          <>
                            <span>·</span>
                            <span>
                              {formatShortDate(featured.published_at)}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="mt-8 inline-flex items-center text-sm font-bold text-slate-950">
                        Read story
                        <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* LATEST STORIES */}
            <section className={featured ? "mt-16" : ""}>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    {category === "All" ? "The Desk" : category}
                  </p>

                  <h2 className="mt-2 text-3xl font-black tracking-tight">
                    {search
                      ? "Search Results"
                      : category === "All"
                        ? "Latest Stories"
                        : category}
                  </h2>
                </div>

                <p className="text-sm text-slate-500">
                  {latestPosts.length}{" "}
                  {latestPosts.length === 1 ? "story" : "stories"}
                </p>
              </div>

              {latestPosts.length ? (
                <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                  {latestPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/editorial/${post.slug}`}
                      className="group"
                    >
                      <article>
                        <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
                          {post.cover_image_url ? (
                            <img
                              src={post.cover_image_url}
                              alt=""
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-5xl font-black text-slate-200">
                              V
                            </div>
                          )}
                        </div>

                        <div className="pt-5">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            <span>{post.category}</span>

                            {post.published_at && (
                              <>
                                <span>·</span>
                                <time dateTime={post.published_at}>
                                  {formatShortDate(post.published_at)}
                                </time>
                              </>
                            )}
                          </div>

                          <h3 className="mt-3 text-xl font-black leading-tight tracking-tight transition group-hover:underline md:text-2xl">
                            {post.title}
                          </h3>

                          {post.excerpt && (
                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                              {post.excerpt}
                            </p>
                          )}

                          <div className="mt-5 flex items-center justify-between gap-4 text-xs font-medium text-slate-500">
                            <span>{post.author_name}</span>

                            <span className="font-bold text-slate-950 opacity-0 transition group-hover:opacity-100">
                              Read →
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
                  <p className="text-sm text-slate-500">
                    No additional stories match the current filters.
                  </p>

                  {(search || category !== "All") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setCategory("All");
                      }}
                      className="mt-4 text-sm font-bold underline underline-offset-4"
                    >
                      Show all stories
                    </button>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </section>

      {/* FOOTER NOTE */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-950">
                VidyaGyan Editorial Board
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Recording campus life, one story at a time.
              </p>
            </div>

            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              VGB COUNCIL · THE EDITORIAL
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
