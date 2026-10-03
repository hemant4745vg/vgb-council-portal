import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Category = "India" | "World" | "Economy" | "Science & Tech";

type FeedConfig = {
  url: string;
  source: string;
  category: Category;
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
};

const FEEDS: FeedConfig[] = [
  {
    url: "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1",
    source: "Press Information Bureau",
    category: "India",
  },
  {
    url: "https://indianexpress.com/section/india/feed/",
    source: "The Indian Express",
    category: "India",
  },
  {
    url: "https://indianexpress.com/section/world/feed/",
    source: "The Indian Express",
    category: "World",
  },
  {
    url: "https://indianexpress.com/section/business/economy/feed/",
    source: "The Indian Express",
    category: "Economy",
  },
  {
    url: "https://indianexpress.com/section/technology/feed/",
    source: "The Indian Express",
    category: "Science & Tech",
  },
  {
    url: "https://indianexpress.com/section/technology/science/feed/",
    source: "The Indian Express",
    category: "Science & Tech",
  },
];

const MAX_AGE_HOURS = 72;
const MAX_ITEMS_PER_FEED = 20;
const MAX_TOTAL_ITEMS = 80;

function cleanText(value: string | undefined | null) {
  if (!value) return "";

  return decodeEntities(
    value
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function decodeEntities(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    quot: '"',
    lt: "<",
    gt: ">",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    lsquo: "‘",
    rsquo: "’",
    ldquo: "“",
    rdquo: "”",
  };

  return value
    .replace(
      /&(#x?[0-9a-f]+|amp|apos|quot|lt|gt|nbsp|ndash|mdash|lsquo|rsquo|ldquo|rdquo);/gi,
      (_, entity: string) => {
        const lower = entity.toLowerCase();

        if (lower.startsWith("#x")) {
          const code = parseInt(lower.slice(2), 16);
          return Number.isFinite(code) ? String.fromCodePoint(code) : _;
        }

        if (lower.startsWith("#")) {
          const code = parseInt(lower.slice(1), 10);
          return Number.isFinite(code) ? String.fromCodePoint(code) : _;
        }

        return named[lower] ?? _;
      }
    )
    .trim();
}

function getTag(block: string, tag: string) {
  const expression = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
    "i"
  );

  return block.match(expression)?.[1]?.trim() ?? "";
}

function getAttribute(block: string, tag: string, attribute: string) {
  const expression = new RegExp(
    `<${tag}\\b[^>]*\\s${attribute}=["']([^"']+)["'][^>]*\\/?>`,
    "i"
  );

  return block.match(expression)?.[1] ?? "";
}

function getImage(block: string) {
  return (
    getAttribute(block, "media:content", "url") ||
    getAttribute(block, "media:thumbnail", "url") ||
    getAttribute(block, "enclosure", "url") ||
    null
  );
}

function makeExternalId(
  guid: string,
  sourceUrl: string,
  title: string
) {
  const basis = guid || sourceUrl || title;

  return createHash("sha256")
    .update(basis)
    .digest("hex");
}

function parseFeed(
  xml: string,
  feed: FeedConfig
): ParsedItem[] {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
  const now = Date.now();
  const minimumTime =
    now - MAX_AGE_HOURS * 60 * 60 * 1000;

  return blocks
    .slice(0, MAX_ITEMS_PER_FEED)
    .map((block) => {
      const title = cleanText(getTag(block, "title"));
      const description = cleanText(
        getTag(block, "description") ||
          getTag(block, "content:encoded")
      );

      const sourceUrl =
        cleanText(getTag(block, "link")) ||
        cleanText(getTag(block, "guid"));

      const guid = cleanText(getTag(block, "guid"));

      const rawDate =
        cleanText(getTag(block, "pubDate")) ||
        cleanText(getTag(block, "dc:date"));

      const parsedDate = new Date(rawDate);

      if (
        !title ||
        !sourceUrl ||
        !rawDate ||
        Number.isNaN(parsedDate.getTime())
      ) {
        return null;
      }

      if (parsedDate.getTime() < minimumTime) {
        return null;
      }

      return {
        external_id: makeExternalId(
          guid,
          sourceUrl,
          title
        ),
        title: title.slice(0, 240),
        summary: description
          ? description.slice(0, 280)
          : null,
        source: feed.source,
        source_url: sourceUrl,
        published_at: parsedDate.toISOString(),
        category: feed.category,
        image_url: getImage(block),
      };
    })
    .filter(Boolean) as ParsedItem[];
}

async function fetchFeed(feed: FeedConfig) {
  const response = await fetch(feed.url, {
    headers: {
      "User-Agent":
        "VGB-Student-Council-Portal/1.0 RSS reader",
      Accept:
        "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `${feed.source} feed returned ${response.status}`
    );
  }

  return response.text();
}

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL;

  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Missing Supabase server credentials."
    );
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (
    !cronSecret ||
    authorization !== `Bearer ${cronSecret}`
  ) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const results = await Promise.allSettled(
      FEEDS.map(async (feed) => {
        const xml = await fetchFeed(feed);
        return parseFeed(xml, feed);
      })
    );

    const items: ParsedItem[] = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        items.push(...result.value);
      } else {
        console.error(
          "News feed error:",
          result.reason
        );
      }
    }

    const unique = new Map<string, ParsedItem>();

    for (const item of items) {
      if (!unique.has(item.external_id)) {
        unique.set(item.external_id, item);
      }
    }

    const finalItems = Array.from(unique.values())
      .sort(
        (a, b) =>
          new Date(b.published_at).getTime() -
          new Date(a.published_at).getTime()
      )
      .slice(0, MAX_TOTAL_ITEMS);

    if (finalItems.length === 0) {
      return Response.json({
        success: true,
        fetched: 0,
        message: "No fresh stories found.",
      });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("news_items")
      .upsert(finalItems, {
        onConflict: "external_id",
        ignoreDuplicates: false,
      });

    if (error) {
      console.error(error);

      return Response.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    const cutoff = new Date(
      Date.now() -
        14 * 24 * 60 * 60 * 1000
    ).toISOString();

    await supabase
      .from("news_items")
      .delete()
      .lt("published_at", cutoff);

    return Response.json({
      success: true,
      fetched: finalItems.length,
      feeds: FEEDS.length,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("News ingestion failed:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown ingestion error",
      },
      { status: 500 }
    );
  }
}
