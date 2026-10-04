"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { createClient } from "@/lib/supabase/client";

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

type EditorMode = "write" | "preview";

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

type FormState = Omit<Post, "id">;

const blank = (): FormState => ({
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeMarkdownText(value: string) {
  return value.replace(/([\\`*_{}[\]()#+.!|<>])/g, "\\$1");
}

function inlineHtmlToMarkdown(element: Node): string {
  if (element.nodeType === Node.TEXT_NODE) {
    return escapeMarkdownText(element.textContent ?? "");
  }

  if (element.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const el = element as HTMLElement;
  const content = Array.from(el.childNodes)
    .map(inlineHtmlToMarkdown)
    .join("");

  switch (el.tagName.toLowerCase()) {
    case "strong":
    case "b":
      return `**${content.trim()}**`;

    case "em":
    case "i":
      return `*${content.trim()}*`;

    case "del":
    case "s":
    case "strike":
      return `~~${content.trim()}~~`;

    case "code":
      return `\`${content.replace(/`/g, "\\`")}\``;

    case "a": {
      const href = el.getAttribute("href") ?? "";
      const title = el.getAttribute("title");

      if (!href) return content;

      return title
        ? `[${content.trim()}](${href} "${title}")`
        : `[${content.trim()}](${href})`;
    }

    case "br":
      return "\n";

    case "sub":
      return content;

    case "sup":
      return content;

    default:
      return content;
  }
}

function blockHtmlToMarkdown(element: Node, listDepth = 0): string {
  if (element.nodeType === Node.TEXT_NODE) {
    return escapeMarkdownText(element.textContent ?? "");
  }

  if (element.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const el = element as HTMLElement;
  const tag = el.tagName.toLowerCase();

  if (tag === "script" || tag === "style" || tag === "noscript") {
    return "";
  }

  if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
    const level = Number(tag.slice(1));
    const content = Array.from(el.childNodes)
      .map(inlineHtmlToMarkdown)
      .join("")
      .trim();

    if (!content) return "";

    return `${"#".repeat(Math.min(level, 4))} ${content}\n\n`;
  }

  if (tag === "p") {
    const content = Array.from(el.childNodes)
      .map(inlineHtmlToMarkdown)
      .join("")
      .trim();

    return content ? `${content}\n\n` : "\n";
  }

  if (tag === "blockquote") {
    const content = Array.from(el.childNodes)
      .map((child) => blockHtmlToMarkdown(child, listDepth))
      .join("")
      .trim();

    if (!content) return "";

    return (
      content
        .split("\n")
        .map((line) => (line.trim() ? `> ${line}` : ">"))
        .join("\n") + "\n\n"
    );
  }

  if (tag === "pre") {
    const code = el.querySelector("code");
    const text = code?.textContent ?? el.textContent ?? "";
    const language =
      code?.getAttribute("data-language") ||
      code?.className
        ?.split(" ")
        .find((item) => item.startsWith("language-"))
        ?.replace("language-", "") ||
      "";

    return `\`\`\`${language}\n${text.replace(/\n+$/, "")}\n\`\`\`\n\n`;
  }

  if (tag === "hr") {
    return "---\n\n";
  }

  if (tag === "ul" || tag === "ol") {
    const items = Array.from(el.children).filter(
      (child) => child.tagName.toLowerCase() === "li"
    );

    const lines: string[] = [];

    items.forEach((item, index) => {
      const li = item as HTMLElement;
      const directChildren = Array.from(li.childNodes);

      const nestedLists = directChildren.filter(
        (child) =>
          child.nodeType === Node.ELEMENT_NODE &&
          ["ul", "ol"].includes(
            (child as HTMLElement).tagName.toLowerCase()
          )
      );

      const inlineParts = directChildren
        .filter((child) => {
          if (child.nodeType !== Node.ELEMENT_NODE) return true;

          const childTag = (child as HTMLElement).tagName.toLowerCase();

          return childTag !== "ul" && childTag !== "ol";
        })
        .map((child) => inlineHtmlToMarkdown(child))
        .join("")
        .trim();

      const prefix = tag === "ol" ? `${index + 1}. ` : "- ";
      const indentation = "  ".repeat(listDepth);

      if (inlineParts) {
        lines.push(`${indentation}${prefix}${inlineParts}`);
      }

      nestedLists.forEach((nested) => {
        const nestedMarkdown = blockHtmlToMarkdown(nested, listDepth + 1)
          .trimEnd()
          .split("\n")
          .map((line) => line)
          .join("\n");

        if (nestedMarkdown) {
          lines.push(nestedMarkdown);
        }
      });
    });

    return lines.join("\n") + "\n\n";
  }

  if (tag === "table") {
    const rows = Array.from(el.querySelectorAll("tr"));

    if (!rows.length) return "";

    const markdownRows = rows.map((row) => {
      const cells = Array.from(row.children).map((cell) =>
        Array.from(cell.childNodes)
          .map(inlineHtmlToMarkdown)
          .join("")
          .replace(/\|/g, "\\|")
          .replace(/\n+/g, " ")
          .trim()
      );

      return `| ${cells.join(" | ")} |`;
    });

    const firstRow = rows[0];
    const columnCount = firstRow.children.length;

    if (columnCount) {
      const separator = `| ${Array.from({
        length: columnCount,
      })
        .map(() => "---")
        .join(" | ")} |`;

      markdownRows.splice(1, 0, separator);
    }

    return `${markdownRows.join("\n")}\n\n`;
  }

  if (
    [
      "div",
      "section",
      "article",
      "main",
      "header",
      "footer",
      "figure",
      "figcaption",
    ].includes(tag)
  ) {
    const content = Array.from(el.childNodes)
      .map((child) => blockHtmlToMarkdown(child, listDepth))
      .join("");

    return content;
  }

  if (tag === "li") {
    return Array.from(el.childNodes)
      .map((child) => inlineHtmlToMarkdown(child))
      .join("");
  }

  const content = Array.from(el.childNodes)
    .map((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const childTag = (child as HTMLElement).tagName.toLowerCase();

        if (
          [
            "p",
            "div",
            "section",
            "article",
            "blockquote",
            "ul",
            "ol",
            "table",
            "pre",
            "h1",
            "h2",
            "h3",
            "h4",
            "hr",
          ].includes(childTag)
        ) {
          return blockHtmlToMarkdown(child, listDepth);
        }
      }

      return inlineHtmlToMarkdown(child);
    })
    .join("");

  return content;
}

function htmlToMarkdown(html: string) {
  if (typeof window === "undefined") return "";

  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");

  const markdown = Array.from(document.body.childNodes)
    .map((node) => blockHtmlToMarkdown(node))
    .join("");

  return markdown
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function markdownInlineToHtml(value: string) {
  let result = escapeHtml(value);

  result = result.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_, alt, src, title) =>
      `<img src="${src}" alt="${alt}"${
        title ? ` title="${title}"` : ""
      } />`
  );

  result = result.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_, text, href, title) =>
      `<a href="${href}"${
        title ? ` title="${title}"` : ""
      }>${text}</a>`
  );

  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  result = result.replace(/_([^_]+)_/g, "<em>$1</em>");
  result = result.replace(/~~([^~]+)~~/g, "<del>$1</del>");

  return result;
}

function markdownToEditorHtml(markdown: string) {
  if (!markdown.trim()) return "";

  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const output: string[] = [];

  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^```/.test(line.trim())) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];

      index += 1;

      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) index += 1;

      output.push(
        `<pre><code${
          language ? ` data-language="${escapeHtml(language)}"` : ""
        }>${escapeHtml(codeLines.join("\n"))}</code></pre>`
      );

      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);

    if (heading) {
      const level = heading[1].length;
      output.push(
        `<h${level}>${markdownInlineToHtml(heading[2])}</h${level}>`
      );
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];

      while (
        index < lines.length &&
        (/^>\s?/.test(lines[index]) || !lines[index].trim())
      ) {
        if (!lines[index].trim()) {
          quoteLines.push("");
        } else {
          quoteLines.push(lines[index].replace(/^>\s?/, ""));
        }

        index += 1;
      }

      output.push(
        `<blockquote>${quoteLines
          .map((item) => `<p>${markdownInlineToHtml(item)}</p>`)
          .join("")}</blockquote>`
      );

      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];

      while (
        index < lines.length &&
        /^[-*+]\s+/.test(lines[index])
      ) {
        items.push(lines[index].replace(/^[-*+]\s+/, ""));
        index += 1;
      }

      output.push(
        `<ul>${items
          .map((item) => `<li>${markdownInlineToHtml(item)}</li>`)
          .join("")}</ul>`
      );

      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];

      while (
        index < lines.length &&
        /^\d+\.\s+/.test(lines[index])
      ) {
        items.push(lines[index].replace(/^\d+\.\s+/, ""));
        index += 1;
      }

      output.push(
        `<ol>${items
          .map((item) => `<li>${markdownInlineToHtml(item)}</li>`)
          .join("")}</ol>`
      );

      continue;
    }

    if (/^---+$/.test(line.trim())) {
      output.push("<hr />");
      index += 1;
      continue;
    }

    const paragraphLines = [line];
    index += 1;

    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,4})\s+/.test(lines[index]) &&
      !/^[-*+]\s+/.test(lines[index]) &&
      !/^\d+\.\s+/.test(lines[index]) &&
      !/^>\s?/.test(lines[index]) &&
      !/^```/.test(lines[index].trim()) &&
      !/^---+$/.test(lines[index].trim())
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }

    output.push(
      `<p>${markdownInlineToHtml(
        paragraphLines.join(" ")
      )}</p>`
    );
  }

  return output.join("");
}

function getEditorText(html: string) {
  if (typeof window === "undefined") return "";

  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");

  return document.body.textContent ?? "";
}

function sanitizeEditorHtml(html: string) {
  if (typeof window === "undefined") return html;

  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");

  const allowedTags = new Set([
    "P",
    "BR",
    "STRONG",
    "B",
    "EM",
    "I",
    "DEL",
    "S",
    "STRIKE",
    "CODE",
    "PRE",
    "BLOCKQUOTE",
    "UL",
    "OL",
    "LI",
    "H1",
    "H2",
    "H3",
    "H4",
    "HR",
    "A",
    "IMG",
    "TABLE",
    "THEAD",
    "TBODY",
    "TR",
    "TH",
    "TD",
  ]);

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT
  );

  const elements: HTMLElement[] = [];

  let current = walker.nextNode();

  while (current) {
    elements.push(current as HTMLElement);
    current = walker.nextNode();
  }

  elements.forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      const parent = element.parentNode;

      if (parent) {
        while (element.firstChild) {
          parent.insertBefore(element.firstChild, element);
        }

        parent.removeChild(element);
      }

      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();

      if (
        name.startsWith("on") ||
        name === "style" ||
        name === "class" ||
        name === "id"
      ) {
        element.removeAttribute(attribute.name);
      }
    });

    if (element.tagName === "A") {
      const href = element.getAttribute("href") ?? "";

      if (
        !href ||
        (!href.startsWith("http://") &&
          !href.startsWith("https://") &&
          !href.startsWith("mailto:") &&
          !href.startsWith("/") &&
          !href.startsWith("#"))
      ) {
        element.removeAttribute("href");
      } else {
        element.setAttribute("rel", "noopener noreferrer");
        element.setAttribute("target", "_blank");
      }
    }

    if (element.tagName === "IMG") {
      const src = element.getAttribute("src") ?? "";

      if (
        !src.startsWith("http://") &&
        !src.startsWith("https://") &&
        !src.startsWith("data:image/")
      ) {
        element.removeAttribute("src");
      }
    }
  });

  return document.body.innerHTML;
}

export default function EditorialAdminPage() {
  const supabase = createClient();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorReadyRef = useRef(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState<FormState>(blank());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("write");
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  async function load() {
    setBusy(true);

    const { data: profileRows, error: profileError } =
      await supabase.rpc("get_my_portal_profile");

    const profile = profileRows?.[0];

    if (
      profileError ||
      !profile ||
      profile.admin_status !== "yes"
    ) {
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

  useEffect(() => {
    if (!editorRef.current || editorReadyRef.current) return;

    editorRef.current.innerHTML = markdownToEditorHtml(form.body);
    editorReadyRef.current = true;
    updateCounts();
  }, [busy]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return posts;

    return posts.filter((post) =>
      [
        post.title,
        post.category,
        post.author_name,
        post.excerpt ?? "",
      ].some((value) => value.toLowerCase().includes(q))
    );
  }, [posts, search]);

  function updateCounts() {
    const editor = editorRef.current;

    if (!editor) return;

    const text = getEditorText(editor.innerHTML)
      .replace(/\s+/g, " ")
      .trim();

    const words = text ? text.split(/\s+/).length : 0;

    setWordCount(words);
    setCharacterCount(text.length);
  }

  function syncBodyFromEditor() {
    const editor = editorRef.current;

    if (!editor) return "";

    const cleanHtml = sanitizeEditorHtml(editor.innerHTML);
    const markdown = htmlToMarkdown(cleanHtml);

    setForm((current) => ({
      ...current,
      body: markdown,
    }));

    updateCounts();

    return markdown;
  }

  function startNew() {
    setEditingId(null);
    setForm(blank());
    setNotice("");
    setEditorMode("write");

    editorReadyRef.current = false;

    window.setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
        editorReadyRef.current = true;
        updateCounts();
      }
    }, 0);
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
    setEditorMode("write");
    editorReadyRef.current = false;

    window.setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = markdownToEditorHtml(post.body);
        editorReadyRef.current = true;
        updateCounts();
      }
    }, 0);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function applyCommand(
    command: string,
    value?: string
  ) {
    editorRef.current?.focus();

    try {
      document.execCommand(command, false, value);
    } catch {
      // Browser support varies. The editor still remains usable.
    }

    syncBodyFromEditor();
  }

  function formatBlock(tag: string) {
    editorRef.current?.focus();

    try {
      document.execCommand("formatBlock", false, tag);
    } catch {
      // Ignore unsupported formatting commands.
    }

    syncBodyFromEditor();
  }

  function insertLink() {
    const href = window.prompt("Paste the URL:");

    if (!href) return;

    const cleanHref = href.trim();

    if (!/^https?:\/\/|^mailto:|^\//i.test(cleanHref)) {
      setNotice("Please enter a valid http, https, mailto, or local URL.");
      return;
    }

    editorRef.current?.focus();

    try {
      document.execCommand("createLink", false, cleanHref);
    } catch {
      // Ignore unsupported command.
    }

    syncBodyFromEditor();
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const html = event.clipboardData.getData("text/html");

    if (!html) {
      return;
    }

    event.preventDefault();

    const cleanHtml = sanitizeEditorHtml(html);

    try {
      document.execCommand("insertHTML", false, cleanHtml);
    } catch {
      const text = event.clipboardData.getData("text/plain");

      document.execCommand(
        "insertText",
        false,
        text
      );
    }

    syncBodyFromEditor();
  }

  function handleEditorInput() {
    syncBodyFromEditor();
  }

  function handleEditorKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>
  ) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
      event.preventDefault();
      applyCommand("bold");
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "i") {
      event.preventDefault();
      applyCommand("italic");
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      insertLink();
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setNotice("");

    const title = form.title.trim();
    const slug = slugify(form.slug || title);
    const body = syncBodyFromEditor().trim();
    const author = form.author_name.trim();

    if (!title || !body || !author) {
      setNotice(
        "Title, author and story content are required."
      );
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
      cover_image_url:
        form.cover_image_url.trim() || null,
      calendar_event_id:
        form.calendar_event_id || null,
      featured: form.featured,
      published_at:
        form.status === "published"
          ? form.published_at ||
            new Date().toISOString()
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
        ? "Story updated."
        : "Story created."
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
      <main className="p-10 text-slate-500">
        Loading Editorial desk…
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20">
        <h1 className="text-3xl font-black">
          Editorial Desk
        </h1>

        <p className="mt-3 text-slate-600">
          Administrator access is required to manage
          editorial stories.
        </p>
      </main>
    );
  }

  const previewMarkdown = form.body;

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
              Write, paste, edit, publish and archive
              stories.
            </p>
          </div>

          <button
            type="button"
            onClick={startNew}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            New Story
          </button>
        </div>

        {notice && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            {notice}
          </div>
        )}

        <form
          onSubmit={save}
          className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">
                Title
              </span>

              <input
                value={form.title}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    title: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg font-semibold outline-none transition focus:border-slate-950"
                placeholder="Story headline"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Slug
              </span>

              <input
                value={form.slug}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    slug: slugify(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                placeholder="generated-from-title"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Category
              </span>

              <select
                value={form.category}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    category: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              >
                {CATEGORIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Author
              </span>

              <input
                value={form.author_name}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    author_name: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                placeholder="Author / Editorial Board"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Status
              </span>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    status: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item[0].toUpperCase() +
                      item.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">
                Excerpt
              </span>

              <textarea
                rows={3}
                value={form.excerpt ?? ""}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    excerpt: e.target.value,
                  }))
                }
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                placeholder="Short description shown on story cards"
              />
            </label>
          </div>

          {/* STORY EDITOR */}
          <section className="mt-7">
            <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="block text-sm font-semibold">
                  Story
                </span>

                <p className="mt-1 text-xs text-slate-500">
                  Paste formatted text from Word, Google Docs,
                  websites, or other editors. Bold, headings,
                  lists and links will be preserved.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{wordCount} words</span>
                <span>·</span>
                <span>{characterCount} characters</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white">
              <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
                <button
                  type="button"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    formatBlock("H2")
                  }
                  className="rounded-lg px-3 py-2 text-xs font-bold transition hover:bg-white"
                  title="Heading 2"
                >
                  H2
                </button>

                <button
                  type="button"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    formatBlock("H3")
                  }
                  className="rounded-lg px-3 py-2 text-xs font-bold transition hover:bg-white"
                  title="Heading 3"
                >
                  H3
                </button>

                <span className="mx-1 h-5 w-px bg-slate-300" />

                <button
                  type="button"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    applyCommand("bold")
                  }
                  className="rounded-lg px-3 py-2 text-sm font-black transition hover:bg-white"
                  title="Bold"
                >
                  B
                </button>

                <button
                  type="button"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    applyCommand("italic")
                  }
                  className="rounded-lg px-3 py-2 text-sm italic transition hover:bg-white"
                  title="Italic"
                >
                  I
                </button>

                <button
                  type="button"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    applyCommand("strikeThrough")
                  }
                  className="rounded-lg px-3 py-2 text-sm line-through transition hover:bg-white"
                  title="Strikethrough"
                >
                  S
                </button>

                <span className="mx-1 h-5 w-px bg-slate-300" />

                <button
                  type="button"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    applyCommand(
                      "insertUnorderedList"
                    )
                  }
                  className="rounded-lg px-3 py-2 text-sm font-bold transition hover:bg-white"
                  title="Bulleted list"
                >
                  • List
                </button>

                <button
                  type="button"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    applyCommand(
                      "insertOrderedList"
                    )
                  }
                  className="rounded-lg px-3 py-2 text-sm font-bold transition hover:bg-white"
                  title="Numbered list"
                >
                  1. List
                </button>

                <button
                  type="button"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    applyCommand(
                      "formatBlock",
                      "BLOCKQUOTE"
                    )
                  }
                  className="rounded-lg px-3 py-2 text-sm font-bold transition hover:bg-white"
                  title="Blockquote"
                >
                  “ Quote
                </button>

                <button
                  type="button"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={insertLink}
                  className="rounded-lg px-3 py-2 text-sm font-bold transition hover:bg-white"
                  title="Insert link"
                >
                  Link
                </button>

                <span className="mx-1 h-5 w-px bg-slate-300" />

                <button
                  type="button"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    applyCommand("removeFormat")
                  }
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-950"
                  title="Clear formatting"
                >
                  Clear
                </button>

                <div className="ml-auto flex rounded-lg border border-slate-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() =>
                      setEditorMode("write")
                    }
                    className={`rounded-md px-3 py-1.5 text-xs font-bold ${
                      editorMode === "write"
                        ? "bg-slate-950 text-white"
                        : "text-slate-500"
                    }`}
                  >
                    Write
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      syncBodyFromEditor();
                      setEditorMode("preview");
                    }}
                    className={`rounded-md px-3 py-1.5 text-xs font-bold ${
                      editorMode === "preview"
                        ? "bg-slate-950 text-white"
                        : "text-slate-500"
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {editorMode === "write" ? (
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  onPaste={handlePaste}
                  onKeyDown={handleEditorKeyDown}
                  className="min-h-[28rem] max-w-none px-5 py-6 text-[17px] leading-8 outline-none md:px-8 md:py-8"
                  data-placeholder="Start writing or paste formatted text here…"
                  role="textbox"
                  aria-multiline="true"
                />
              ) : (
                <div className="min-h-[28rem] px-5 py-6 md:px-8 md:py-8">
                  {previewMarkdown.trim() ? (
                    <div className="prose max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="mb-5 mt-8 text-3xl font-black tracking-tight first:mt-0">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="mb-4 mt-8 text-2xl font-black tracking-tight">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="mb-3 mt-7 text-xl font-bold tracking-tight">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="mb-5 leading-8 text-slate-700">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-slate-950">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em>{children}</em>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold underline underline-offset-4"
                            >
                              {children}
                            </a>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="my-6 border-l-4 border-slate-300 pl-5 italic text-slate-600">
                              {children}
                            </blockquote>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-6 ml-6 list-disc space-y-2">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="mb-6 ml-6 list-decimal space-y-2">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="pl-1">
                              {children}
                            </li>
                          ),
                          code: ({ children }) => (
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="my-6 overflow-x-auto rounded-xl bg-slate-950 p-5 text-sm leading-6 text-slate-100">
                              {children}
                            </pre>
                          ),
                          hr: () => (
                            <hr className="my-8 border-slate-200" />
                          ),
                        }}
                      >
                        {previewMarkdown}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">
                      Nothing to preview yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <p>
                Formatting is preserved when you paste rich text.
                The saved version remains Markdown.
              </p>

              <p className="font-medium">
                Ctrl/Cmd+B · Ctrl/Cmd+I · Ctrl/Cmd+K
              </p>
            </div>
          </section>

          {/* MEDIA + EVENT */}
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold">
                Cover image URL
              </span>

              <input
                type="url"
                value={form.cover_image_url ?? ""}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    cover_image_url:
                      e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                placeholder="https://…"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Calendar event
              </span>

              <select
                value={
                  form.calendar_event_id ?? ""
                }
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    calendar_event_id: e.target
                      .value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              >
                <option value="">
                  Not linked
                </option>

                {events.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.event_date} ·{" "}
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* PUBLISHING */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Publishing
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Control visibility and homepage placement.
                </p>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      featured:
                        e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded"
                />

                <span className="text-sm font-semibold">
                  Feature on Editorial homepage
                </span>
              </label>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={saving}
              className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
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
                className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold transition hover:border-slate-950"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* STORIES */}
        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Content Library
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
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-950"
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
                    onClick={() =>
                      editPost(post)
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold transition hover:border-slate-950"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      remove(post.id)
                    }
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:border-red-400"
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

        {/* MARKDOWN REFERENCE */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Under the hood
          </p>

          <h2 className="mt-2 text-xl font-black">
            Markdown is still the stored format
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            You do not need to type Markdown manually. Paste
            formatted content or use the toolbar. The editor
            converts the formatting into Markdown when the story
            is saved, which keeps the content portable and lets
            the public Editorial page render it consistently.
          </p>

          <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-bold">Bold</p>
              <p className="mt-1 font-mono text-xs text-slate-500">
                **important**
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-bold">Heading</p>
              <p className="mt-1 font-mono text-xs text-slate-500">
                ## Section title
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-bold">Link</p>
              <p className="mt-1 font-mono text-xs text-slate-500">
                [Read more](https://…)
              </p>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        [contenteditable="true"]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }

        [contenteditable="true"] h1,
        [contenteditable="true"] h2,
        [contenteditable="true"] h3,
        [contenteditable="true"] h4 {
          font-weight: 800;
          line-height: 1.2;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        [contenteditable="true"] h1 {
          font-size: 2rem;
        }

        [contenteditable="true"] h2 {
          font-size: 1.65rem;
        }

        [contenteditable="true"] h3 {
          font-size: 1.35rem;
        }

        [contenteditable="true"] p {
          margin-bottom: 1rem;
        }

        [contenteditable="true"] ul {
          list-style-type: disc;
          margin: 0 0 1rem 1.5rem;
        }

        [contenteditable="true"] ol {
          list-style-type: decimal;
          margin: 0 0 1rem 1.5rem;
        }

        [contenteditable="true"] li {
          padding-left: 0.25rem;
        }

        [contenteditable="true"] blockquote {
          border-left: 4px solid #cbd5e1;
          color: #64748b;
          font-style: italic;
          margin: 1.5rem 0;
          padding-left: 1rem;
        }

        [contenteditable="true"] a {
          color: #0f172a;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        [contenteditable="true"] code {
          background: #f1f5f9;
          border-radius: 0.25rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco,
            Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.9em;
          padding: 0.15rem 0.3rem;
        }

        [contenteditable="true"] pre {
          background: #020617;
          border-radius: 0.75rem;
          color: #f8fafc;
          margin: 1.5rem 0;
          overflow-x: auto;
          padding: 1rem;
        }

        [contenteditable="true"] pre code {
          background: transparent;
          padding: 0;
        }

        [contenteditable="true"] hr {
          border: 0;
          border-top: 1px solid #e2e8f0;
          margin: 2rem 0;
        }

        [contenteditable="true"] table {
          border-collapse: collapse;
          margin: 1.5rem 0;
          width: 100%;
        }

        [contenteditable="true"] th,
        [contenteditable="true"] td {
          border: 1px solid #e2e8f0;
          padding: 0.6rem 0.75rem;
          text-align: left;
        }

        [contenteditable="true"] th {
          background: #f8fafc;
          font-weight: 700;
        }

        [contenteditable="true"] img {
          max-width: 100%;
          border-radius: 0.75rem;
          margin: 1rem 0;
        }
      `}</style>
    </main>
  );
}
