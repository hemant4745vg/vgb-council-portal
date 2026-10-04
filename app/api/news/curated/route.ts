import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_CATEGORIES = [
  "India",
  "World",
  "Economy",
  "Science & Tech",
] as const;

type Category = (typeof ALLOWED_CATEGORIES)[number];

type CuratedStoryInput = {
  external_id?: unknown;
  title?: unknown;
  summary?: unknown;
  source?: unknown;
  source_url?: unknown;
  image_url?: unknown;
  category?: unknown;
  published_at?: unknown;
  rank?: unknown;
  featured?: unknown;
};

type CuratedPayload = {
  briefing_date?: unknown;
  stories?: unknown;
};

type CuratedStoryRow = {
  external_id: string;
  title: string;
  summary: string | null;
  source: string;
  source_url: string;
  image_url: string | null;
  category: Category;
  published_at: string;
  briefing_date: string;
  rank: number;
  featured: boolean;
};

function jsonError(
  message: string,
  status: number,
  details?: unknown,
) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      ...(details !== undefined ? { details } : {}),
    },
    { status },
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDateString(value: string): boolean {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function isBriefingDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeString(
  value: unknown,
  maxLength: number,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized || normalized.length > maxLength) {
    return null;
  }

  return normalized;
}

function constantTimeEqual(
  provided: string,
  expected: string,
): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

function makeExternalId(
  briefingDate: string,
  sourceUrl: string,
): string {
  return createHash("sha256")
    .update(`${briefingDate}|${sourceUrl}`)
    .digest("hex");
}

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return null;
  }

  return match[1].trim() || null;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase server environment variables.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getDateDaysAgo(days: number): string {
  const date = new Date();

  date.setUTCDate(date.getUTCDate() - days);

  return date.toISOString().slice(0, 10);
}

async function parsePayload(
  request: Request,
): Promise<
  | { ok: true; payload: CuratedPayload }
  | { ok: false; response: NextResponse }
> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: jsonError("Request body must be valid JSON.", 400),
    };
  }

  if (!isObject(body)) {
    return {
      ok: false,
      response: jsonError("Request body must be an object.", 400),
    };
  }

  return {
    ok: true,
    payload: body as CuratedPayload,
  };
}

function validateAndNormalizeStories(
  stories: unknown[],
  briefingDate: string,
):
  | { ok: true; rows: CuratedStoryRow[] }
  | { ok: false; response: NextResponse } {
  if (stories.length === 0) {
    return {
      ok: false,
      response: jsonError(
        "The briefing must contain at least one story.",
        400,
      ),
    };
  }

  if (stories.length > 20) {
    return {
      ok: false,
      response: jsonError(
        "A briefing may contain at most 20 stories.",
        400,
      ),
    };
  }

  const rows: CuratedStoryRow[] = [];
  const seenExternalIds = new Set<string>();
  const seenUrls = new Set<string>();

  for (let index = 0; index < stories.length; index += 1) {
    const rawStory = stories[index];

    if (!isObject(rawStory)) {
      return {
        ok: false,
        response: jsonError(
          `Story ${index + 1} must be an object.`,
          400,
        ),
      };
    }

    const story = rawStory as CuratedStoryInput;

    const title = normalizeString(story.title, 300);

    if (!title) {
      return {
        ok: false,
        response: jsonError(
          `Story ${index + 1} has an invalid title.`,
          400,
        ),
      };
    }

    const source = normalizeString(story.source, 150);

    if (!source) {
      return {
        ok: false,
        response: jsonError(
          `Story ${index + 1} has an invalid source.`,
          400,
        ),
      };
    }

    const sourceUrl = normalizeString(story.source_url, 2000);

    if (!sourceUrl || !isValidUrl(sourceUrl)) {
      return {
        ok: false,
        response: jsonError(
          `Story ${index + 1} has an invalid source_url.`,
          400,
        ),
      };
    }

    const imageUrl = normalizeString(story.image_url, 2000);

    if (imageUrl && !isValidUrl(imageUrl)) {
      return {
        ok: false,
        response: jsonError(
          `Story ${index + 1} has an invalid image_url.`,
          400,
        ),
      };
    }

    const summary =
      story.summary === null || story.summary === undefined
        ? null
        : normalizeString(story.summary, 1200);

    if (
      story.summary !== null &&
      story.summary !== undefined &&
      !summary
    ) {
      return {
        ok: false,
        response: jsonError(
          `Story ${index + 1} has an invalid summary.`,
          400,
        ),
      };
    }

    const category = normalizeString(story.category, 50);

    if (
      !category ||
      !ALLOWED_CATEGORIES.includes(category as Category)
    ) {
      return {
        ok: false,
        response: jsonError(
          `Story ${index + 1} has an invalid category. Allowed categories: ${ALLOWED_CATEGORIES.join(
            ", ",
          )}.`,
          400,
        ),
      };
    }

    const publishedAt = normalizeString(
      story.published_at,
      100,
    );

    if (!publishedAt || !isValidDateString(publishedAt)) {
      return {
        ok: false,
        response: jsonError(
          `Story ${index + 1} has an invalid published_at value.`,
          400,
        ),
      };
    }

    const rank =
      typeof story.rank === "number"
        ? story.rank
        : typeof story.rank === "string" &&
            story.rank.trim() !== ""
          ? Number(story.rank)
          : NaN;

    if (
      !Number.isInteger(rank) ||
      rank < 0 ||
      rank > 100
    ) {
      return {
        ok: false,
        response: jsonError(
          `Story ${index + 1} has an invalid rank.`,
          400,
        ),
      };
    }

    const featured =
      typeof story.featured === "boolean"
        ? story.featured
        : false;

    const suppliedExternalId =
      normalizeString(story.external_id, 300);

    const externalId =
      suppliedExternalId ??
      makeExternalId(briefingDate, sourceUrl);

    if (seenExternalIds.has(externalId)) {
      return {
        ok: false,
        response: jsonError(
          `Duplicate external_id detected in story ${index + 1}.`,
          400,
        ),
      };
    }

    if (seenUrls.has(sourceUrl)) {
      return {
        ok: false,
        response: jsonError(
          `Duplicate source_url detected in story ${index + 1}.`,
          400,
        ),
      };
    }

    seenExternalIds.add(externalId);
    seenUrls.add(sourceUrl);

    rows.push({
      external_id: externalId,
      title,
      summary,
      source,
      source_url: sourceUrl,
      image_url: imageUrl,
      category: category as Category,
      published_at: new Date(publishedAt).toISOString(),
      briefing_date: briefingDate,
      rank,
      featured,
    });
  }

  const featuredCount = rows.filter(
    (story) => story.featured,
  ).length;

  if (featuredCount > 1) {
    return {
      ok: false,
      response: jsonError(
        "Only one story may be marked featured.",
        400,
      ),
    };
  }

  rows.sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }

    return (
      new Date(b.published_at).getTime() -
      new Date(a.published_at).getTime()
    );
  });

  return {
    ok: true,
    rows,
  };
}

export async function POST(request: Request) {
  try {
    const expectedSecret =
      process.env.CURATED_NEWS_PUBLISH_SECRET;

    if (!expectedSecret) {
      console.error(
        "CURATED_NEWS_PUBLISH_SECRET is not configured.",
      );

      return jsonError(
        "Curated news publishing is not configured.",
        500,
      );
    }

    const providedToken = getBearerToken(request);

    if (
      !providedToken ||
      !constantTimeEqual(providedToken, expectedSecret)
    ) {
      return jsonError("Unauthorized.", 401);
    }

    const parsed = await parsePayload(request);

    if (parsed.ok === false) {
      return parsed.response;
    }

    const { payload } = parsed;

    const briefingDate = normalizeString(
      payload.briefing_date,
      10,
    );

    if (!briefingDate || !isBriefingDate(briefingDate)) {
      return jsonError(
        "briefing_date must use YYYY-MM-DD format.",
        400,
      );
    }

    const stories = Array.isArray(payload.stories)
      ? payload.stories
      : null;

    if (!stories) {
      return jsonError(
        "stories must be an array.",
        400,
      );
    }

    const validation = validateAndNormalizeStories(
      stories,
      briefingDate,
    );

    if (!validation.ok) {
      return validation.response;
    }

    const rows = validation.rows;
    const supabase = getSupabaseAdmin();

    const { error: upsertError } = await supabase
      .from("curated_news")
      .upsert(rows, {
        onConflict: "external_id",
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error(
        "Curated news upsert failed:",
        upsertError,
      );

      return jsonError(
        "Failed to publish curated news.",
        500,
        {
          code: upsertError.code,
          message: upsertError.message,
        },
      );
    }

    /*
     * Remove older briefings after a successful publish.
     * Keeping seven days gives us a useful small history while
     * preventing indefinite growth.
     */
    const retentionDate = getDateDaysAgo(7);

    const { error: cleanupError } = await supabase
      .from("curated_news")
      .delete()
      .lt("briefing_date", retentionDate);

    if (cleanupError) {
      /*
       * Publishing succeeded, so cleanup failure should not
       * turn a successful briefing into a failed response.
       */
      console.error(
        "Curated news cleanup failed:",
        cleanupError,
      );
    }

    return NextResponse.json({
      ok: true,
      briefing_date: briefingDate,
      published: rows.length,
      featured: rows.filter((story) => story.featured).length,
      cleanup_before: retentionDate,
    });
  } catch (error) {
    console.error(
      "Curated news publisher failed:",
      error,
    );

    return jsonError(
      "Internal server error.",
      500,
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "This endpoint only accepts authenticated POST requests.",
    },
    { status: 405 },
  );
}
