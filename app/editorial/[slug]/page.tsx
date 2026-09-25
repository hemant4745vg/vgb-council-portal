"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type CalendarEvent = {
  title: string;
  event_date: string | null;
  venue: string | null;
};

type Post = {
  title: string;
  excerpt: string | null;
  body: string;
  category: string;
  author_name: string;
  cover_image_url: string | null;
  published_at: string | null;
  calendar_event: CalendarEvent | null;
};

type SupabasePost = Omit<Post, "calendar_event"> & {
  calendar_event:
    | CalendarEvent
    | CalendarEvent[]
    | null;
};

export default function EditorialStoryPage() {
  const params = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    async function load() {
      setMissing(false);
      setPost(null);

      const { data, error } = await supabase
        .from("editorial_posts")
        .select(
          "title,excerpt,body,category,author_name,cover_image_url,published_at,calendar_event:calendar_events(title,event_date,venue)"
        )
        .eq("slug", params.slug)
        .eq("status", "published")
        .maybeSingle();

      if (error || !data) {
        setMissing(true);
        return;
      }

      const rawPost = data as SupabasePost;

      const calendarEvent = Array.isArray(rawPost.calendar_event)
        ? rawPost.calendar_event[0] ?? null
        : rawPost.calendar_event;

      setPost({
        title: rawPost.title,
        excerpt: rawPost.excerpt,
        body: rawPost.body,
        category: rawPost.category,
        author_name: rawPost.author_name,
        cover_image_url: rawPost.cover_image_url,
        published_at: rawPost.published_at,
        calendar_event: calendarEvent,
      });
    }

    if (params.slug) {
      load();
    }
  }, [params.slug]);

  if (missing) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-black">Story not found</h1>

        <Link
          className="mt-6 inline-block underline"
          href="/editorial"
        >
          Back to Editorial
        </Link>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="p-12 text-center text-slate-500">
        Loading story…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <article className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-20">
        <Link
          href="/editorial"
          className="text-sm font-semibold text-slate-500 hover:text-slate-950"
        >
          ← The Editorial
        </Link>

        <div className="mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {post.category}
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-6 max-w-3xl text-xl leading-8 text-slate-600">
              {post.excerpt}
            </p>
          )}

          <div className="mt-6 text-sm text-slate-500">
            By {post.author_name}
            {post.published_at
              ? ` · ${new Date(
                  post.published_at
                ).toLocaleDateString()}`
              : ""}
          </div>
        </div>

        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt=""
            className="mt-10 max-h-[32rem] w-full rounded-3xl object-cover"
          />
        )}

        {post.calendar_event && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              From the Calendar
            </p>

            <p className="mt-2 font-bold">
              {post.calendar_event.title}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {[
                post.calendar_event.event_date,
                post.calendar_event.venue,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        )}

        <div className="prose prose-slate mt-12 max-w-none">
          {post.body.split(/\n\s*\n/).map((paragraph, index) => (
            <p
              key={index}
              className="whitespace-pre-wrap leading-8"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
