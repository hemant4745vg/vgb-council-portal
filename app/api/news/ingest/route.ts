import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Category = "India" | "World" | "Economy" | "Science & Tech";

type FeedConfig = {
  id: string;
  url: string;
  source: string;
  category: Category;
  priority: number;
};

type ParsedItem = {
  external_id: string;
  title: string;
  summary: string | null;
  source: string;
  source_url: string;
  published_at: string;
  category: Category;
  image_url: string | null;
  priority: number;
};

const FEEDS: FeedConfig[] = [
  // ─────────────────────────────────────────────
  // INDIA
  // ─────────────────────────────────────────────

  {
    id: "pib-india",
    url: "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1",
    source: "Press Information Bureau",
    category: "India",
    priority: 100,
  },

  {
    id: "ie-india",
    url: "https://indianexpress.com/section/india/feed/",
    source: "The Indian Express",
    category: "India",
    priority: 95,
  },

  {
    id: "ie-politics",
    url: "https://indianexpress.com/section/politics/feed/",
    source: "The Indian Express",
    category: "India",
    priority: 94,
  },

  {
    id: "ie-political-pulse",
    url: "https://indianexpress.com/section/political-pulse/feed/",
    source: "The Indian Express",
    category: "India",
    priority: 93,
  },

  {
    id: "ht-india",
    url: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
    source: "Hindustan Times",
    category: "India",
    priority: 88,
  },

  {
    id: "ndtv-india",
    url: "https://feeds.feedburner.com/ndtvnews-india-news",
    source: "NDTV",
    category: "India",
    priority: 86,
  },

  {
    id: "bs-india",
    url: "https://www.business-standard.com/rss/india-news-101.rss",
    source: "Business Standard",
    category: "India",
    priority: 82,
  },

  // ─────────────────────────────────────────────
  // WORLD
  // ─────────────────────────────────────────────

  {
    id: "ie-world",
    url: "https://indianexpress.com/section/world/feed/",
    source: "The Indian Express",
    category: "World",
    priority: 95,
  },

  {
    id: "ht-world",
    url: "https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml",
    source: "Hindustan Times",
    category: "World",
    priority: 88,
  },

  {
    id: "ndtv-world",
    url: "https://feeds.feedburner.com/ndtvnews-world-news",
    source: "NDTV",
    category: "World",
    priority: 86,
  },

  {
    id: "bs-world",
    url: "https://www.business-standard.com/rss/world-news-221.rss",
    source: "Business Standard",
    category: "World",
    priority: 82,
  },

  // ─────────────────────────────────────────────
  // ECONOMY
  // ─────────────────────────────────────────────

  {
    id: "ie-economy",
    url: "https://indianexpress.com/section/business/economy/feed/",
    source: "The Indian Express",
    category: "Economy",
    priority: 95,
  },

  {
    id: "ie-business",
    url: "https://indianexpress.com/section/business/feed/",
    source: "The Indian Express",
    category: "Economy",
    priority: 92,
  },

  {
    id: "ht-business",
    url: "https://www.hindustantimes.com/feeds/rss/business/rssfeed.xml",
    source: "Hindustan Times",
    category: "Economy",
    priority: 87,
  },

  {
    id: "bs-economy",
    url: "https://www.business-standard.com/rss/economy-102.rss",
    source: "Business Standard",
    category: "Economy",
    priority: 91,
  },

  {
    id: "bs-markets",
    url: "https://www.business-standard.com/rss/markets-106.rss",
    source: "Business Standard",
    category: "Economy",
    priority: 88,
  },

  {
    id: "ndtv-business",
    url: "https://feeds.feedburner.com/ndtvprofit-latest",
    source: "NDTV",
    category: "Economy",
    priority: 84,
  },

  // ─────────────────────────────────────────────
  // SCIENCE & TECHNOLOGY
  // ─────────────────────────────────────────────

  {
    id: "ie-technology",
    url: "https://indianexpress.com/section/technology/feed/",
    source: "The Indian Express",
    category: "Science & Tech",
    priority: 94,
  },

  {
    id: "ie-science",
    url: "https://indianexpress.com/section/technology/science/feed/",
    source: "The Indian Express",
    category: "Science & Tech",
    priority: 93,
  },

  {
    id: "ie-ai",
    url: "https://indianexpress.com/section/technology/artificial-intelligence/feed/",
    source: "The Indian Express",
    category: "Science & Tech",
    priority: 92,
  },

  {
    id: "ht-technology",
    url: "https://www.hindustantimes.com/feeds/rss/technology/rssfeed.xml",
    source: "Hindustan Times",
    category: "Science & Tech",
    priority: 87,
  },

  {
    id: "ht-science",
    url: "https://www.hindustantimes.com/feeds/rss/science/rssfeed.xml",
    source: "Hindustan Times",
    category: "Science & Tech",
    priority: 86,
  },

  {
    id: "ndtv-tech",
    url: "https://feeds.feedburner.com/gadgets360-latest",
    source: "NDTV",
    category: "Science & Tech",
    priority: 84,
  },

  {
    id: "bs-technology",
    url: "https://www.business-standard.com/rss/technology-108.rss",
    source: "Business Standard",
    category: "Science & Tech",
    priority: 84,
  },
];

const MAX_AGE_HOURS = 72;
const MAX_ITEMS_PER_FEED = 40;
const MAX_TOTAL_ITEMS = 250;

function getEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function decodeHtml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(Number(code))
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    );
}

function cleanText(value: string): string {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(xml: string, tag: string): string | null {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const regex = new RegExp(
    `<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`,
    "i"
  );

  const match = xml.match(regex);

  return match?.[1]?.trim() || null;
}

function extractTagVariants(
  xml: string,
  tags: string[]
): string | null {
  for (const tag of tags) {
    const value = extractTag(xml, tag);

    if (value) {
      return value;
    }
  }

  return null;
}

function extractItems(xml: string): string[] {
  const rssItems = xml.match(
    /<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi
  );

  if (rssItems?.length) {
    return rssItems;
  }

  const atomEntries = xml.match(
    /<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi
  );

  return atomEntries ?? [];
}

function extractLink(item: string): string | null {
  const link = extractTag(item, "link");

  if (link) {
    return decodeHtml(link).trim();
  }

  const atomMatch = item.match(
    /<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i
  );

  return atomMatch?.[1]?.trim() ?? null;
}

function extractImage(item: string): string | null {
  const mediaUrl = item.match(
    /<media:(?:content|thumbnail)\b[^>]*url=["']([^"']+)["']/i
  );

  if (mediaUrl?.[1]) {
    return decodeHtml(mediaUrl[1]);
  }

  const enclosure = item.match(
    /<enclosure\b[^>]*url=["']([^"']+)["']/i
  );

  if (enclosure?.[1]) {
    return decodeHtml(enclosure[1]);
  }

  const imageTag = item.match(
    /<img\b[^>]*src=["']([^"']+)["']/i
  );

  if (imageTag?.[1]) {
    return decodeHtml(imageTag[1]);
  }

  return null;
}

function parseDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(cleanText(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function normalizeUrl(value: string): string {
  try {
    const url = new URL(value);

    // Tracking parameters do not identify a different article.
    const removableParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "output",
      "ref",
      "source",
    ];

    for (const param of removableParams) {
      url.searchParams.delete(param);
    }

    url.hash = "";

    return url.toString();
  } catch {
    return value.trim();
  }
}

function makeExternalId(
  guid: string | null,
  link: string,
  title: string,
  source: string
): string {
  const identity =
    guid?.trim() ||
    normalizeUrl(link) ||
    `${source}:${title.trim().toLowerCase()}`;

  return createHash("sha256")
    .update(identity)
    .digest("hex");
}

function parseFeed(
  xml: string,
  feed: FeedConfig
): ParsedItem[] {
  const items = extractItems(xml);

  const cutoff =
    Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000;

  const parsed: ParsedItem[] = [];

  for (const item of items.slice(0, MAX_ITEMS_PER_FEED)) {
    const rawTitle = extractTag(item, "title");

    const rawSummary = extractTagVariants(item, [
      "description",
      "content:encoded",
      "summary",
      "content",
    ]);

    const rawGuid = extractTagVariants(item, [
      "guid",
      "id",
    ]);

    const rawLink = extractLink(item);

    const rawDate = extractTagVariants(item, [
      "pubDate",
      "dc:date",
      "published",
      "updated",
    ]);

    if (!rawTitle || !rawLink) {
      continue;
    }

    const title = cleanText(rawTitle);

    const summary = rawSummary
      ? cleanText(rawSummary).slice(0, 800)
      : null;

    const sourceUrl = normalizeUrl(
      decodeHtml(rawLink)
    );

    const publishedAt = parseDate(rawDate);

    if (!publishedAt) {
      continue;
    }

    if (
      new Date(publishedAt).getTime() < cutoff
    ) {
      continue;
    }

    if (!title || !sourceUrl) {
      continue;
    }

    parsed.push({
      external_id: makeExternalId(
        rawGuid,
        sourceUrl,
        title,
        feed.source
      ),
      title,
      summary,
      source: feed.source,
      source_url: sourceUrl,
      published_at: publishedAt,
      category: feed.category,
      image_url: extractImage(item),
      priority: feed.priority,
    });
  }

  return parsed;
}

/**
 * Deduplicate articles in two stages:
 *
 * 1. category + source_url
 *    Prevents the same article appearing through multiple
 *    category feeds from the same publisher.
 *
 * 2. external_id
 *    This is the actual UNIQUE key in Supabase and therefore
 *    MUST be unique within a single upsert batch.
 *
 * When duplicates exist, retain the highest-priority version.
 * If priority is equal, retain the newer publication timestamp.
 */
function deduplicate(items: ParsedItem[]): ParsedItem[] {
  const bySourceUrl = new Map<string, ParsedItem>();

  for (const item of items) {
    const identity =
      `${item.category}:${item.source_url}`;

    const existing = bySourceUrl.get(identity);

    if (!existing) {
      bySourceUrl.set(identity, item);
      continue;
    }

    const itemIsBetter =
      item.priority > existing.priority ||
      (item.priority === existing.priority &&
        new Date(item.published_at).getTime() >
          new Date(existing.published_at).getTime());

    if (itemIsBetter) {
      bySourceUrl.set(identity, item);
    }
  }

  const byExternalId = new Map<string, ParsedItem>();

  for (const item of bySourceUrl.values()) {
    const existing = byExternalId.get(
      item.external_id
    );

    if (!existing) {
      byExternalId.set(
        item.external_id,
        item
      );
      continue;
    }

    const itemIsBetter =
      item.priority > existing.priority ||
      (item.priority === existing.priority &&
        new Date(item.published_at).getTime() >
          new Date(existing.published_at).getTime());

    if (itemIsBetter) {
      byExternalId.set(
        item.external_id,
        item
      );
    }
  }

  return Array.from(byExternalId.values());
}

function sortItems(items: ParsedItem[]): ParsedItem[] {
  return [...items].sort((a, b) => {
    const dateDifference =
      new Date(b.published_at).getTime() -
      new Date(a.published_at).getTime();

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return b.priority - a.priority;
  });
}

async function fetchFeed(
  feed: FeedConfig
): Promise<ParsedItem[]> {
  const response = await fetch(feed.url, {
    headers: {
      Accept:
        "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      "User-Agent":
        "VGB-Student-Council-Portal-NewsBot/1.0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `${feed.source} returned HTTP ${response.status}`
    );
  }

  const xml = await response.text();

  if (!xml.trim()) {
    throw new Error(
      `${feed.source} returned an empty feed`
    );
  }

  return parseFeed(xml, feed);
}

export async function GET(request: Request) {
  return ingest(request);
}

export async function POST(request: Request) {
  return ingest(request);
}

async function ingest(request: Request) {
  const cronSecret = getEnv("CRON_SECRET");

  if (!cronSecret) {
    console.error(
      "CRON_SECRET is not configured."
    );

    return NextResponse.json(
      {
        success: false,
        error: "Server configuration error.",
      },
      { status: 500 }
    );
  }

  const authorization =
    request.headers.get("authorization") ?? "";

  const expectedAuthorization =
    `Bearer ${cronSecret}`;

  if (
    authorization !== expectedAuthorization
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized.",
      },
      { status: 401 }
    );
  }

  const supabaseUrl =
    getEnv("SUPABASE_URL") ||
    getEnv("NEXT_PUBLIC_SUPABASE_URL");

  const supabaseSecret =
    getEnv("SUPABASE_SECRET_KEY") ||
    getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseSecret) {
    console.error(
      "Missing Supabase server credentials."
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Supabase server credentials are not configured.",
      },
      { status: 500 }
    );
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseSecret,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const feedResults =
    await Promise.allSettled(
      FEEDS.map((feed) => fetchFeed(feed))
    );

  const allItems: ParsedItem[] = [];

  const feedStatus = FEEDS.map(
    (feed, index) => {
      const result = feedResults[index];

      if (result.status === "fulfilled") {
        allItems.push(...result.value);

        return {
          id: feed.id,
          source: feed.source,
          category: feed.category,
          items: result.value.length,
          success: true,
        };
      }

      console.error(
        `News feed failed: ${feed.id}`,
        result.reason
      );

      return {
        id: feed.id,
        source: feed.source,
        category: feed.category,
        items: 0,
        success: false,
        error:
          result.reason instanceof Error
            ? result.reason.message
            : "Unknown feed error",
      };
    }
  );

  const dedupedItems =
    deduplicate(allItems);

  const sortedItems =
    sortItems(dedupedItems).slice(
      0,
      MAX_TOTAL_ITEMS
    );

  let upserted = 0;

  if (sortedItems.length > 0) {
    const rows = sortedItems.map(
      ({
        priority: _priority,
        ...item
      }) => item
    );

    const { error } = await supabase
      .from("news_items")
      .upsert(rows, {
        onConflict: "external_id",
        ignoreDuplicates: false,
      });

    if (error) {
      console.error(
        "Supabase news upsert failed:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          feeds: feedStatus,
        },
        { status: 500 }
      );
    }

    upserted = rows.length;
  }

  // Keep the public news database intentionally small.
  const retentionCutoff =
    new Date(
      Date.now() -
        14 * 24 * 60 * 60 * 1000
    ).toISOString();

  const {
    error: cleanupError,
  } = await supabase
    .from("news_items")
    .delete()
    .lt(
      "published_at",
      retentionCutoff
    );

  if (cleanupError) {
    console.error(
      "News cleanup failed:",
      cleanupError
    );
  }

  const successfulFeeds =
    feedStatus.filter(
      (feed) => feed.success
    ).length;

  const failedFeeds =
    feedStatus.length -
    successfulFeeds;

  return NextResponse.json({
    success: successfulFeeds > 0,
    fetched: allItems.length,
    deduplicated: dedupedItems.length,
    upserted,
    feeds: feedStatus.length,
    successful_feeds: successfulFeeds,
    failed_feeds: failedFeeds,
    updated_at:
      new Date().toISOString(),
  });
}
