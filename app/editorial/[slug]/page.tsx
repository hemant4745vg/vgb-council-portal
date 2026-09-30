"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
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
  calendar_event: CalendarEvent | CalendarEvent[] | null;
};

function formatDate(value: string | null) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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
      <main className="min-h-screen bg-white px-6 py-24 text-slate-950">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            The Editorial
          </p>

          <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
            Story not found
          </h1>

          <p className="mt-4 text-slate-500">
            This story may have been moved, unpublished, or never existed.
          </p>

          <Link
            className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"
            href="/editorial"
          >
            ← Back to Editorial
          </Link>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-white px-6 py-24 text-center text-slate-500">
        Loading story…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <article>
        <header className="border-b border-slate-200">
          <div className="mx-auto max-w-5xl px-6 pb-12 pt-10 md:px-10 md:pb-16 md:pt-14">
            <Link
              href="/editorial"
              className="inline-flex text-sm font-semibold text-slate-500 transition hover:text-slate-950"
            >
              ← The Editorial
            </Link>

            <div className="mt-12 max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                {post.category}
              </p>

              <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
                  {post.excerpt}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
                <span className="font-semibold text-slate-900">
                  {post.author_name}
                </span>

                {post.published_at && (
                  <>
                    <span>·</span>
                    <time dateTime={post.published_at}>
                      {formatDate(post.published_at)}
                    </time>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {post.cover_image_url && (
          <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8 md:pt-10">
            <img
              src={post.cover_image_url}
              alt=""
              className="max-h-[42rem] w-full rounded-3xl object-cover"
            />
          </div>
        )}

        <div className="mx-auto max-w-5xl px-6 md:px-10">
          {post.calendar_event && (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                From the Calendar
              </p>

              <p className="mt-2 text-lg font-bold">
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

          <div className="mx-auto max-w-3xl py-12 md:py-16">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={{
                h1: ({ children }) => (
                  <h2 className="mb-6 mt-12 text-3xl font-black tracking-tight md:text-4xl">
                    {children}
                  </h2>
                ),

                h2: ({ children }) => (
                  <h2 className="mb-5 mt-12 text-2xl font-black tracking-tight md:text-3xl">
                    {children}
                  </h2>
                ),

                h3: ({ children }) => (
                  <h3 className="mb-4 mt-10 text-xl font-bold tracking-tight md:text-2xl">
                    {children}
                  </h3>
                ),

                p: ({ children }) => (
                  <p className="mb-6 text-[17px] leading-8 text-slate-700 md:text-lg md:leading-9">
                    {children}
                  </p>
                ),

                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-950"
                  >
                    {children}
                  </a>
                ),

                strong: ({ children }) => (
                  <strong className="font-bold text-slate-950">
                    {children}
                  </strong>
                ),

                blockquote: ({ children }) => (
                  <blockquote className="my-8 border-l-4 border-slate-300 pl-5 text-lg italic leading-8 text-slate-600">
                    {children}
                  </blockquote>
                ),

                ul: ({ children }) => (
                  <ul className="mb-7 ml-6 list-disc space-y-2 text-[17px] leading-8 text-slate-700">
                    {children}
                  </ul>
                ),

                ol: ({ children }) => (
                  <ol className="mb-7 ml-6 list-decimal space-y-2 text-[17px] leading-8 text-slate-700">
                    {children}
                  </ol>
                ),

                li: ({ children }) => (
                  <li className="pl-1">{children}</li>
                ),

                hr: () => <hr className="my-10 border-slate-200" />,

                code: ({ children }) => (
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-900">
                    {children}
                  </code>
                ),

                pre: ({ children }) => (
                  <pre className="my-8 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-slate-100">
                    {children}
                  </pre>
                ),

                table: ({ children }) => (
                  <div className="my-8 overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                      {children}
                    </table>
                  </div>
                ),

                th: ({ children }) => (
                  <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 font-bold">
                    {children}
                  </th>
                ),

                td: ({ children }) => (
                  <td className="border-b border-slate-100 px-4 py-3 align-top">
                    {children}
                  </td>
                ),
              }}
            >
              {post.body}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    </main>
  );
}
