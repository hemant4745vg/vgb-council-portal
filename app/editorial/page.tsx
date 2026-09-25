"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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

export default function EditorialPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("editorial_posts")
        .select(
          "id,title,slug,excerpt,category,status,author_name,cover_image_url,featured,published_at"
        )
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false });

      setPosts((data ?? []) as Post[]);
      setLoading(false);
    }
    load();
  }, []);

  const visible = useMemo(
    () =>
      category === "All"
        ? posts
        : posts.filter((post) => post.category === category),
    [posts, category]
  );

  const featured = posts.find((post) => post.featured) ?? posts[0];

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            VidyaGyan Editorial Board
          </p>
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">
            THE EDITORIAL
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Stories from life at VidyaGyan. Events, people, ideas, achievements,
            culture, and the details that deserve to be remembered.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 md:px-10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                category === item
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-10">
        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading stories…</div>
        ) : !visible.length ? (
          <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-20 text-center">
            <h2 className="text-xl font-bold">No stories yet</h2>
            <p className="mt-2 text-sm text-slate-500">
              The editorial desk is still assembling this issue.
            </p>
          </div>
        ) : (
          <>
            {featured && category === "All" && (
              <Link
                href={`/editorial/${featured.slug}`}
                className="group mb-10 grid overflow-hidden rounded-3xl bg-slate-100 md:grid-cols-2"
              >
                <div className="min-h-72 bg-slate-200">
                  {featured.cover_image_url ? (
                    <img
                      src={featured.cover_image_url}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full min-h-72 items-center justify-center text-6xl font-black text-slate-300">
                      V
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Featured · {featured.category}
                  </span>
                  <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="mt-4 leading-7 text-slate-600">
                      {featured.excerpt}
                    </p>
                  )}
                  <p className="mt-7 text-sm font-semibold text-slate-900">
                    Read story →
                  </p>
                </div>
              </Link>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visible
                .filter((post) => category !== "All" || post.id !== featured?.id)
                .map((post) => (
                  <Link
                    key={post.id}
                    href={`/editorial/${post.slug}`}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-400"
                  >
                    <div className="aspect-[16/9] bg-slate-100">
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl font-black text-slate-200">
                          V
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        {post.category}
                      </p>
                      <h2 className="mt-3 text-xl font-bold tracking-tight group-hover:underline">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                          {post.excerpt}
                        </p>
                      )}
                      <p className="mt-5 text-xs font-medium text-slate-500">
                        {post.author_name}
                        {post.published_at
                          ? ` · ${new Date(post.published_at).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
