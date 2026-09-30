"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

type EditorMode = "write" | "preview";

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

function wordCount(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  before: string,
  after = ""
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);

  const replacement = `${before}${selected || "text"}${after}`;

  return {
    value:
      textarea.value.slice(0, start) +
      replacement +
      textarea.value.slice(end),
    selectionStart: start + before.length,
    selectionEnd: start + before.length + (selected || "text").length,
  };
}

function markdownPreview(body: string) {
  return body
    .replace(/^### (.+)$/gm, '<h3 class="preview-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="preview-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="preview-h1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    .split(/\n\s*\n/)
    .map((block) => {
      const trimmed = block.trim();

      if (!trimmed) return "";

      if (trimmed.startsWith("- ")) {
        const items = trimmed
          .split("\n")
          .filter((line) => line.startsWith("- "))
          .map((line) => `<li>${line.slice(2)}</li>`)
          .join("");

        return `<ul class="preview-list">${items}</ul>`;
      }

      if (trimmed.startsWith("> ")) {
        return `<blockquote class="preview-quote">${trimmed
          .split("\n")
          .map((line) => line.replace(/^>\s?/, ""))
          .join(" ")}</blockquote>`;
      }

      return `<p class="preview-p">${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("");
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
  const [mode, setMode] = useState<EditorMode>("write");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  async function load() {
    setBusy(true);

    const { data: profileRows, error: profileError } =
      await supabase.rpc("get_my_portal_profile");

    const profile = profileRows?.[0];

    if (profileError || !profile || profile.admin_status !== "yes") {
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
        post.author_name.toLowerCase().includes(q) ||
        (post.excerpt ?? "").toLowerCase().includes(q)
    );
  }, [posts, search]);

  const bodyWords = wordCount(form.body);
  const bodyCharacters = form.body.length;

  function updateForm<K extends keyof Omit<Post, "id">>(
    key: K,
    value: Omit<Post, "id">[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function startNew() {
    setEditingId(null);
    setForm(blank());
    setMode("write");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

    setMode("write");
    setNotice("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function applyMarkdown(
    before: string,
    after = ""
  ) {
    const textarea = textareaRef.current;

    if (!textarea) return;

    const result = insertAtCursor(textarea, before, after);

    updateForm("body", result.value);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        result.selectionStart,
        result.selectionEnd
      );
    });
  }

  function addHeading(level: 1 | 2 | 3) {
    const prefix = "#".repeat(level) + " ";
    applyMarkdown(prefix);
  }

  function addBullet() {
    applyMarkdown("- ");
  }

  function addQuote() {
    applyMarkdown("> ");
  }

  function addLink() {
    const textarea = textareaRef.current;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end);

    const replacement = `[${selected || "link text"}](https://)`;

    const value =
      textarea.value.slice(0, start) +
      replacement +
      textarea.value.slice(end);

    updateForm("body", value);

    requestAnimationFrame(() => {
      textarea.focus();

      const urlStart =
        start + replacement.indexOf("https://");

      textarea.setSelectionRange(
        urlStart,
        urlStart + "https://".length
      );
    });
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

    if (!slug) {
      setNotice("A valid title or slug is required.");
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
          .insert({
            ...payload,
            created_by: author,
          })
          .select("*")
          .single();

    setSaving(false);

    if (result.error) {
      setNotice(result.error.message);
      return;
    }

    setNotice(
      editingId
        ? "Story updated successfully."
        : "Story created successfully."
    );

    startNew();
    await load();
  }

  async function remove(id: number) {
    if (
      !window.confirm(
        "Delete this editorial story permanently?"
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("editorial_posts")
      .delete()
      .eq("id", id);

    setNotice(
      error ? error.message : "Story deleted."
    );

    if (!error) {
      await load();
    }
  }

  if (busy) {
    return (
      <main className="min-h-screen bg-slate-50 p-10 text-slate-500">
        Loading Editorial desk…
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-xl px-6 py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            VGB COUNCIL · EDITORIAL
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Editorial Desk
          </h1>

          <p className="mt-3 text-slate-600">
            Administrator access is required to manage editorial stories.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              VGB COUNCIL · EDITORIAL
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
              Editorial Desk
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600">
              Write, format, preview, publish and manage stories.
            </p>
          </div>

          <button
            type="button"
            onClick={startNew}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            + New Story
          </button>
        </header>

        {notice && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium">
            {notice}
          </div>
        )}

        <form onSubmit={save}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 md:px-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      {editingId ? "Editing story" : "New story"}
                    </p>

                    <h2 className="mt-1 text-xl font-black">
                      Story editor
                    </h2>
                  </div>

                  <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setMode("write")}
                      className={`rounded-lg px-4 py-2 text-sm font-bold ${
                        mode === "write"
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      Write
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode("preview")}
                      className={`rounded-lg px-4 py-2 text-sm font-bold ${
                        mode === "preview"
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-7">
                <div className="grid gap-5">
                  <label>
                    <span className="mb-2 block text-sm font-bold">
                      Title
                    </span>

                    <input
                      value={form.title}
                      onChange={(e) =>
                        updateForm("title", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg font-semibold outline-none transition focus:border-slate-950"
                      placeholder="Story headline"
                    />
                  </label>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label>
                      <span className="mb-2 block text-sm font-bold">
                        Slug
                      </span>

                      <input
                        value={form.slug}
                        onChange={(e) =>
                          updateForm(
                            "slug",
                            slugify(e.target.value)
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                        placeholder="generated-from-title"
                      />
                    </label>

                    <label>
                      <span className="mb-2 block text-sm font-bold">
                        Author
                      </span>

                      <input
                        value={form.author_name}
                        onChange={(e) =>
                          updateForm(
                            "author_name",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                        placeholder="Author / Editorial Board"
                      />
                    </label>
                  </div>

                  <label>
                    <span className="mb-2 block text-sm font-bold">
                      Excerpt
                    </span>

                    <textarea
                      rows={3}
                      value={form.excerpt ?? ""}
                      onChange={(e) =>
                        updateForm(
                          "excerpt",
                          e.target.value
                        )
                      }
                      className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                      placeholder="Short description shown on story cards and above the article."
                    />
                  </label>

                  {mode === "write" ? (
                    <div>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm font-bold">
                          Story
                        </span>

                        <span className="text-xs text-slate-500">
                          {bodyWords} words · {bodyCharacters} characters
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-300">
                        <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
                          <button
                            type="button"
                            onClick={() => addHeading(2)}
                            className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-white"
                          >
                            H2
                          </button>

                          <button
                            type="button"
                            onClick={() => addHeading(3)}
                            className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-white"
                          >
                            H3
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              applyMarkdown("**", "**")
                            }
                            className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-white"
                          >
                            B
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              applyMarkdown("*", "*")
                            }
                            className="rounded-lg px-3 py-2 text-sm italic hover:bg-white"
                          >
                            I
                          </button>

                          <button
                            type="button"
                            onClick={addBullet}
                            className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-white"
                          >
                            • List
                          </button>

                          <button
                            type="button"
                            onClick={addQuote}
                            className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-white"
                          >
                            Quote
                          </button>

                          <button
                            type="button"
                            onClick={addLink}
                            className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-white"
                          >
                            Link
                          </button>
                        </div>

                        <textarea
                          ref={textareaRef}
                          rows={22}
                          value={form.body}
                          onChange={(e) =>
                            updateForm(
                              "body",
                              e.target.value
                            )
                          }
                          className="block w-full resize-y border-0 px-5 py-4 font-mono text-sm leading-7 outline-none"
                          placeholder={`Write your story in Markdown.

## Section heading

Write your paragraph here.

**Bold text** and *italic text* are supported.

- First point
- Second point

> A quotation can go here.

[Link text](https://example.com)`}
                        />
                      </div>

                      <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                        Markdown is supported. Use blank lines between
                        paragraphs. The published article will render the
                        formatting automatically.
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-bold">
                          Live Preview
                        </span>

                        <span className="text-xs text-slate-500">
                          Approximate editor preview
                        </span>
                      </div>

                      <div className="min-h-[30rem] rounded-xl border border-slate-200 bg-white p-6 md:p-8">
                        {!form.body.trim() ? (
                          <p className="text-sm text-slate-400">
                            Start writing to see the preview.
                          </p>
                        ) : (
                          <div
                            className="editor-preview"
                            dangerouslySetInnerHTML={{
                              __html: markdownPreview(form.body),
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving
                        ? "Saving…"
                        : editingId
                          ? "Update Story"
                          : "Create Story"}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        onClick={startNew}
                        className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold transition hover:border-slate-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">
                  Publishing
                </h3>

                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold">
                      Status
                    </span>

                    <select
                      value={form.status}
                      onChange={(e) =>
                        updateForm(
                          "status",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    >
                      {STATUSES.map((item) => (
                        <option key={item} value={item}>
                          {item[0].toUpperCase() +
                            item.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold">
                      Category
                    </span>

                    <select
                      value={form.category}
                      onChange={(e) =>
                        updateForm(
                          "category",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    >
                      {CATEGORIES.map((item) => (
                        <option key={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) =>
                        updateForm(
                          "featured",
                          e.target.checked
                        )
                      }
                      className="mt-1 h-4 w-4"
                    />

                    <span>
                      <span className="block text-sm font-bold">
                        Featured story
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Show this story prominently on the Editorial homepage.
                      </span>
                    </span>
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">
                  Media & Links
                </h3>

                <label className="mt-5 block">
                  <span className="mb-2 block text-sm font-bold">
                    Cover image URL
                  </span>

                  <input
                    type="url"
                    value={form.cover_image_url ?? ""}
                    onChange={(e) =>
                      updateForm(
                        "cover_image_url",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                    placeholder="https://…"
                  />
                </label>

                <label className="mt-5 block">
                  <span className="mb-2 block text-sm font-bold">
                    Calendar event
                  </span>

                  <select
                    value={form.calendar_event_id ?? ""}
                    onChange={(e) =>
                      updateForm(
                        "calendar_event_id",
                        e.target.value
                          ? Number(e.target.value)
                          : null
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                  >
                    <option value="">
                      Not linked
                    </option>

                    {events.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.event_date} · {item.title}
                      </option>
                    ))}
                  </select>
                </label>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">
                  Markdown
                </h3>

                <div className="mt-4 space-y-2 text-xs leading-5 text-slate-600">
                  <p>
                    <strong>## Heading</strong> creates a section heading.
                  </p>

                  <p>
                    <strong>**bold**</strong> creates bold text.
                  </p>

                  <p>
                    <strong>*italic*</strong> creates italic text.
                  </p>

                  <p>
                    <strong>- item</strong> creates a bullet.
                  </p>

                  <p>
                    <strong>&gt; quote</strong> creates a quotation.
                  </p>

                  <p>
                    <strong>[text](URL)</strong> creates a link.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </form>

        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Content library
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Stories
              </h2>
            </div>

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm md:w-72"
              placeholder="Search stories…"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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

                    {post.featured && (
                      <>
                        <span>·</span>
                        <span>featured</span>
                      </>
                    )}
                  </div>

                  <h3 className="mt-1 truncate text-lg font-bold">
                    {post.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {post.author_name}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => editPost(post)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold transition hover:border-slate-500"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(post.id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
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

      <style jsx>{`
        .editor-preview {
          color: rgb(51 65 85);
          font-size: 17px;
          line-height: 1.9;
        }

        .editor-preview :global(.preview-h1) {
          margin: 2rem 0 1rem;
          color: rgb(15 23 42);
          font-size: 2rem;
          font-weight: 900;
          line-height: 1.15;
        }

        .editor-preview :global(.preview-h2) {
          margin: 2rem 0 0.9rem;
          color: rgb(15 23 42);
          font-size: 1.6rem;
          font-weight: 900;
          line-height: 1.2;
        }

        .editor-preview :global(.preview-h3) {
          margin: 1.75rem 0 0.75rem;
          color: rgb(15 23 42);
          font-size: 1.25rem;
          font-weight: 800;
        }

        .editor-preview :global(.preview-p) {
          margin: 0 0 1.25rem;
        }

        .editor-preview :global(.preview-list) {
          margin: 0 0 1.5rem;
          padding-left: 1.5rem;
        }

        .editor-preview :global(.preview-list li) {
          margin: 0.35rem 0;
        }

        .editor-preview :global(.preview-quote) {
          margin: 1.5rem 0;
          border-left: 4px solid rgb(203 213 225);
          padding-left: 1rem;
          color: rgb(100 116 139);
          font-style: italic;
        }

        .editor-preview :global(strong) {
          color: rgb(15 23 42);
          font-weight: 800;
        }

        .editor-preview :global(em) {
          font-style: italic;
        }

        .editor-preview :global(a) {
          color: rgb(15 23 42);
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
      `}</style>
    </main>
  );
}
