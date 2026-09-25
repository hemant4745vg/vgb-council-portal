"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "Events & Activities",
  "Council & Leadership",
  "Campus Life",
  "Student Voices",
  "People",
  "Achievements",
  "Perspectives",
  "Culture",
] as const;

const STATUSES = ["draft", "published", "archived"] as const;

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  category: string;
  status: string;
  author_name: string;
  cover_image_url: string | null;
  calendar_event_id: number | null;
  featured: boolean;
  published_at: string | null;
};

type Event = {
  id: number;
  title: string;
  event_date: string;
  venue: string | null;
};

const blank = (): Omit<Post, "id"> => ({
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  category: CATEGORIES[0],
  status: "draft",
  author_name: "",
  cover_image_url: "",
  calendar_event_id: null,
  featured: false,
  published_at: null,
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export default function EditorialAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState(blank());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  async function load() {
    setBusy(true);
    const { data: profile } = await supabase.rpc("get_my_portal_profile");
    if (!profile?.admin_status || profile.admin_status !== "yes") {
      setAuthorized(false);
      setBusy(false);
      return;
    }
    setAuthorized(true);

    const [{ data: postData }, { data: eventData }] = await Promise.all([
      supabase
        .from("editorial_posts")
        .select("*")
        .order("updated_at", { ascending: false }),
      supabase
        .from("calendar_events")
        .select("id,title,event_date,venue")
        .order("event_date", { ascending: false })
        .limit(200),
    ]);

    setPosts((postData ?? []) as Post[]);
    setEvents((eventData ?? []) as Event[]);
    setBusy(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.author_name.toLowerCase().includes(q)
    );
  }, [posts, search]);

  function startNew() {
    setEditingId(null);
    setForm(blank());
    setNotice("");
  }

  function editPost(post: Post) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      body: post.body,
      category: post.category,
      status: post.status,
      author_name: post.author_name,
      cover_image_url: post.cover_image_url ?? "",
      calendar_event_id: post.calendar_event_id,
      featured: post.featured,
      published_at: post.published_at,
    });
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setNotice("");

    const title = form.title.trim();
    const slug = slugify(form.slug || title);
    const body = form.body.trim();
    const author = form.author_name.trim();

    if (!title || !body || !author) {
      setNotice("Title, author and story body are required.");
      return;
    }

    setSaving(true);
    const payload = {
      title,
      slug,
      excerpt: form.excerpt.trim() || null,
      body,
      category: form.category,
      status: form.status,
      author_name: author,
      cover_image_url: form.cover_image_url.trim() || null,
      calendar_event_id: form.calendar_event_id || null,
      featured: form.featured,
      published_at:
        form.status === "published"
          ? form.published_at || new Date().toISOString()
          : null,
      updated_at: new Date().toISOString(),
    };

    const result = editingId
      ? await supabase
          .from("editorial_posts")
          .update(payload)
          .eq("id", editingId)
          .select("*")
          .single()
      : await supabase
          .from("editorial_posts")
          .insert({ ...payload, created_by: author })
          .select("*")
          .single();

    setSaving(false);

    if (result.error) {
      setNotice(result.error.message);
      return;
    }

    setNotice(editingId ? "Story updated." : "Story created.");
    startNew();
    await load();
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this editorial story permanently?")) return;
    const { error } = await supabase.from("editorial_posts").delete().eq("id", id);
    setNotice(error ? error.message : "Story deleted.");
    if (!error) await load();
  }

  if (busy) {
    return <main className="p-10 text-slate-500">Loading Editorial desk…</main>;
  }

  if (!authorized) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20">
        <h1 className="text-3xl font-black">Editorial Desk</h1>
        <p className="mt-3 text-slate-600">
          Administrator access is required to manage editorial stories.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              VGB COUNCIL · EDITORIAL
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Editorial Desk
            </h1>
            <p className="mt-2 text-slate-600">
              Write, edit, publish and archive stories.
            </p>
          </div>
          <button
            type="button"
            onClick={startNew}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
          >
            New Story
          </button>
        </div>

        {notice && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            {notice}
          </div>
        )}

        <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">Title</span>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((x) => ({ ...x, title: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                placeholder="Story headline"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">Slug</span>
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm((x) => ({ ...x, slug: slugify(e.target.value) }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="generated-from-title"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">Category</span>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((x) => ({ ...x, category: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                {CATEGORIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">Author</span>
              <input
                value={form.author_name}
                onChange={(e) =>
                  setForm((x) => ({ ...x, author_name: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Author / Editorial Board"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">Status</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((x) => ({ ...x, status: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item[0].toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">Excerpt</span>
              <textarea
                rows={3}
                value={form.excerpt ?? ""}
                onChange={(e) =>
                  setForm((x) => ({ ...x, excerpt: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Short description shown on story cards"
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">Story</span>
              <textarea
                rows={16}
                value={form.body}
                onChange={(e) =>
                  setForm((x) => ({ ...x, body: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm leading-6"
                placeholder="Write the story. Separate paragraphs with a blank line."
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Cover image URL
              </span>
              <input
                type="url"
                value={form.cover_image_url ?? ""}
                onChange={(e) =>
                  setForm((x) => ({ ...x, cover_image_url: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="https://…"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Calendar event
              </span>
              <select
                value={form.calendar_event_id ?? ""}
                onChange={(e) =>
                  setForm((x) => ({
                    ...x,
                    calendar_event_id: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Not linked</option>
                {events.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.event_date} · {item.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm((x) => ({ ...x, featured: e.target.checked }))
                }
                className="h-4 w-4"
              />
              <span className="text-sm font-semibold">
                Feature this story on the Editorial homepage
              </span>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={saving}
              className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : editingId ? "Update Story" : "Create Story"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={startNew}
                className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Stories</h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm"
              placeholder="Search stories…"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {filtered.map((post) => (
              <div
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 last:border-0"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <span>{post.category}</span>
                    <span>·</span>
                    <span>{post.status}</span>
                    {post.featured && <span>· featured</span>}
                  </div>
                  <h3 className="mt-1 truncate text-lg font-bold">{post.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{post.author_name}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => editPost(post)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(post.id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!filtered.length && (
              <div className="p-10 text-center text-sm text-slate-500">
                No stories match this search.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
