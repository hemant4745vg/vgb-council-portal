"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createClient,
  type Session,
} from "@supabase/supabase-js";

const supabase = createClient(
  "https://lllmgmfofwczpqbmigey.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzIiwicmVmIjoibGxsbWdmb2Z3Y3pxYm1pZ2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTIxNzYsImV4cCI6MjEwNTEyODE3Nn0.H_YfM8J3ZOy-B1lH7jgc4JtHu4rhUsigZ72qoI-b1ss"
);

type UserProfile = {
  id: number;
  name: string | null;
  email: string;
  role: string | null;
  admin_status: "yes" | "no";
};

type RpcProfile = {
  id: number;
  name: string | null;
  email: string;
  role: string | null;
  admin_status: string | null;
};

type CalendarPeriod = {
  start_date: string;
  end_date: string;
};

type CalendarEvent = {
  id: number;
  title: string;
  category: string;
  description: string | null;
  event_time: string | null;
  venue: string | null;
  target: string | null;
  event_date: string;
  calendar_event_periods?: CalendarPeriod[] | null;
};

const CALENDAR_CATEGORIES = [
  "Academic",
  "Examinations",
  "Sports",
  "Cultural & Arts",
  "Trips & Visits",
  "Institutional",
  "Holidays & Breaks",
  "Special Events",
] as const;

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date())
  );

  return hour < 12
    ? "Good morning"
    : hour < 17
      ? "Good afternoon"
      : "Good evening";
}

function getTodayKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + amount);

  return date.toISOString().slice(0, 10);
}

function formatDate(
  dateKey: string,
  options: Intl.DateTimeFormatOptions
) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    ...options,
  }).format(new Date(year, month - 1, day));
}

function formatTodayLong(dateKey: string) {
  return formatDate(dateKey, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateKey: string) {
  return formatDate(dateKey, {
    day: "numeric",
    month: "short",
  });
}

function getEventRange(event: CalendarEvent) {
  const periods = event.calendar_event_periods ?? [];

  if (periods.length === 0) {
    return {
      start: event.event_date,
      end: event.event_date,
    };
  }

  const starts = periods
    .map((period) => period.start_date)
    .filter(Boolean)
    .sort();

  const ends = periods
    .map((period) => period.end_date)
    .filter(Boolean)
    .sort();

  return {
    start: starts[0] || event.event_date,
    end: ends[ends.length - 1] || event.event_date,
  };
}

function eventOccursOnDate(
  event: CalendarEvent,
  dateKey: string
) {
  const range = getEventRange(event);

  return dateKey >= range.start && dateKey <= range.end;
}

function eventStartsAfterDate(
  event: CalendarEvent,
  dateKey: string
) {
  const range = getEventRange(event);
  return range.start > dateKey;
}

function categoryClasses(category: string) {
  switch (category) {
    case "Academic":
      return "bg-blue-50 text-blue-700 border-blue-100";

    case "Examinations":
      return "bg-red-50 text-red-700 border-red-100";

    case "Sports":
      return "bg-orange-50 text-orange-700 border-orange-100";

    case "Cultural & Arts":
      return "bg-purple-50 text-purple-700 border-purple-100";

    case "Trips & Visits":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";

    case "Institutional":
      return "bg-slate-100 text-slate-700 border-slate-200";

    case "Holidays & Breaks":
      return "bg-amber-50 text-amber-700 border-amber-100";

    case "Special Events":
      return "bg-pink-50 text-pink-700 border-pink-100";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function EventIcon({
  category,
}: {
  category: string;
}) {
  const symbols: Record<string, string> = {
    Academic: "A",
    Examinations: "E",
    Sports: "S",
    "Cultural & Arts": "C",
    "Trips & Visits": "T",
    Institutional: "I",
    "Holidays & Breaks": "H",
    "Special Events": "★",
  };

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-700">
      {symbols[category] || "•"}
    </div>
  );
}

function Quick({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 transition group-hover:text-blue-700">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {text}
          </p>
        </div>
      </div>
    </Link>
  );
}

function EventRow({
  event,
  todayKey,
}: {
  event: CalendarEvent;
  todayKey: string;
}) {
  const range = getEventRange(event);
  const isMultiDay = range.start !== range.end;

  return (
    <div className="flex gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <EventIcon category={event.category} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-semibold leading-5 text-slate-900">
            {event.title}
          </h3>

          <span
            className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${categoryClasses(
              event.category
            )}`}
          >
            {event.category}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
          {event.event_time && (
            <span className="font-semibold text-slate-700">
              {event.event_time}
            </span>
          )}

          {isMultiDay ? (
            <span>
              {formatShortDate(range.start)} –{" "}
              {formatShortDate(range.end)}
            </span>
          ) : (
            <span>
              {range.start === todayKey
                ? "Today"
                : formatShortDate(range.start)}
            </span>
          )}

          {event.venue && <span>{event.venue}</span>}

          {event.target && <span>{event.target}</span>}
        </div>
      </div>
    </div>
  );
}

function LoadingEventRows() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex animate-pulse gap-4 border-b border-slate-100 py-4 last:border-b-0"
        >
          <div className="h-10 w-10 rounded-xl bg-slate-100" />

          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-slate-100" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);

  const [loading, setLoading] = useState(true);

  const [calendarEvents, setCalendarEvents] = useState<
    CalendarEvent[]
  >([]);

  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState<string | null>(
    null
  );

  async function loadProfile(userEmail: string) {
    if (!userEmail.trim()) {
      setProfile(null);
      setProfileError(true);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    setProfileError(false);

    const { data, error } = await supabase.rpc(
      "get_my_portal_profile"
    );

    if (error) {
      console.error("Portal profile RPC failed:", error);

      setProfile(null);
      setProfileError(true);
      setProfileLoading(false);
      return;
    }

    const profileData: RpcProfile | null = Array.isArray(data)
      ? (data[0] as RpcProfile | undefined) ?? null
      : (data as RpcProfile | null);

    if (!profileData) {
      console.error(
        "Portal profile RPC returned no profile for:",
        userEmail
      );

      setProfile(null);
      setProfileError(true);
      setProfileLoading(false);
      return;
    }

    const normalizedProfile: UserProfile = {
      id: Number(profileData.id),
      name: profileData.name ?? null,
      email: profileData.email ?? userEmail,
      role: profileData.role ?? null,
      admin_status:
        profileData.admin_status === "yes" ? "yes" : "no",
    };

    setProfile(normalizedProfile);
    setProfileError(false);
    setProfileLoading(false);
  }

  async function loadCalendar() {
    setCalendarLoading(true);
    setCalendarError(null);

    const todayKey = getTodayKey();

    /*
     * Fetch a reasonable rolling window rather than only events whose
     * event_date is today or later.
     *
     * This matters because multi-day events such as Mid-Term Exams
     * may have started before today but still be running today.
     */
    const fromDate = addDays(todayKey, -30);
    const toDate = addDays(todayKey, 90);

    const { data, error } = await supabase
      .from("calendar_events")
      .select(
        `
          id,
          title,
          category,
          description,
          event_time,
          venue,
          target,
          event_date,
          calendar_event_periods (
            start_date,
            end_date
          )
        `
      )
      .gte("event_date", fromDate)
      .lte("event_date", toDate)
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true });

    if (error) {
      console.error("Dashboard calendar load failed:", error);

      setCalendarEvents([]);
      setCalendarError(
        "Campus calendar information could not be loaded."
      );
      setCalendarLoading(false);
      return;
    }

    setCalendarEvents(
      ((data ?? []) as CalendarEvent[]).filter(
        (event) =>
          CALENDAR_CATEGORIES.includes(
            event.category as (typeof CALENDAR_CATEGORIES)[number]
          ) || Boolean(event.category)
      )
    );

    setCalendarLoading(false);
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(currentSession);

      if (currentSession?.user?.email) {
        await loadProfile(currentSession.user.email);
      } else {
        setProfile(null);
        setProfileError(false);
        setProfileLoading(false);
      }

      if (mounted) {
        setLoading(false);
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mounted) return;

        setSession(nextSession);

        if (nextSession?.user?.email) {
          window.setTimeout(() => {
            if (!mounted) return;

            loadProfile(nextSession.user.email!);
          }, 0);
        } else {
          setProfile(null);
          setProfileError(false);
          setProfileLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;

    loadCalendar();
  }, [session]);

  const isAdmin = profile?.admin_status === "yes";

  const displayName = profileLoading
    ? "there"
    : profile?.name?.trim() || "Student";

  const role = profile?.role?.trim() || null;

  const email = session?.user.email || "";

  const todayKey = useMemo(() => getTodayKey(), []);

  const todayEvents = useMemo(() => {
    return calendarEvents
      .filter((event) => eventOccursOnDate(event, todayKey))
      .sort((a, b) => {
        if (!a.event_time && !b.event_time) return 0;
        if (!a.event_time) return 1;
        if (!b.event_time) return -1;

        return a.event_time.localeCompare(b.event_time);
      });
  }, [calendarEvents, todayKey]);

  const upcomingEvents = useMemo(() => {
    return calendarEvents
      .filter(
        (event) =>
          eventStartsAfterDate(event, todayKey) &&
          !eventOccursOnDate(event, todayKey)
      )
      .sort((a, b) => {
        const rangeA = getEventRange(a);
        const rangeB = getEventRange(b);

        if (rangeA.start !== rangeB.start) {
          return rangeA.start.localeCompare(rangeB.start);
        }

        if (!a.event_time && !b.event_time) return 0;
        if (!a.event_time) return 1;
        if (!b.event_time) return -1;

        return a.event_time.localeCompare(b.event_time);
      });
  }, [calendarEvents, todayKey]);

  const nextEvent = upcomingEvents[0] ?? null;

  const nextEventRange = nextEvent
    ? getEventRange(nextEvent)
    : null;

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-56 rounded-3xl bg-white" />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-80 rounded-2xl bg-white" />
            <div className="h-80 rounded-2xl bg-white" />
          </div>

          <div className="h-40 rounded-2xl bg-white" />

          <div className="h-40 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white">
            VG
          </div>

          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Authenticated Workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Sign in to your dashboard
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            Your dashboard contains authenticated campus information
            and tools. Public information remains available without
            signing in.
          </p>

          <Link
            href="/#signin"
            className="mt-7 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Hero */}
        <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-sm">
          <div className="relative px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />

            <div className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
                  Student Workspace
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {greeting()}, {displayName}.
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
                  Here&apos;s what&apos;s happening on campus today.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                    {formatTodayLong(todayKey)}
                  </span>

                  {role && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                      {role}
                    </span>
                  )}
                </div>
              </div>

              <div className="min-w-[210px] rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Campus calendar
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                  {todayEvents.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {todayEvents.length === 1
                    ? "event scheduled today"
                    : "events scheduled today"}
                </p>

                {isAdmin && (
                  <Link
                    href="/dashboard/calendar"
                    className="mt-4 inline-flex text-[10px] font-bold uppercase tracking-wide text-blue-300 transition hover:text-blue-200"
                  >
                    Manage calendar →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {profileError && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your account is authenticated, but your portal profile
            could not be loaded. Restricted default permissions are
            being used.
          </div>
        )}

        {/* Main campus information */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">

          {/* Today */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                  Today on campus
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                  {formatTodayLong(todayKey)}
                </h2>
              </div>

              <Link
                href="/calendar"
                className="shrink-0 text-xs font-semibold text-blue-700 transition hover:text-blue-900"
              >
                View calendar →
              </Link>
            </div>

            <div className="px-6">
              {calendarLoading ? (
                <LoadingEventRows />
              ) : calendarError ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-semibold text-slate-800">
                    Calendar unavailable
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {calendarError}
                  </p>

                  <button
                    type="button"
                    onClick={loadCalendar}
                    className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Try again
                  </button>
                </div>
              ) : todayEvents.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-400">
                    ✓
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-800">
                    Nothing scheduled today
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    No calendar event is currently recorded for today.
                  </p>
                </div>
              ) : (
                <div>
                  {todayEvents.slice(0, 6).map((event) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      todayKey={todayKey}
                    />
                  ))}

                  {todayEvents.length > 6 && (
                    <div className="border-t border-slate-100 py-4 text-center">
                      <Link
                        href="/calendar"
                        className="text-xs font-semibold text-blue-700"
                      >
                        View all {todayEvents.length} events →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Next */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Next on campus
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                  Upcoming
                </h2>
              </div>

              <Link
                href="/calendar"
                className="shrink-0 text-xs font-semibold text-blue-700 transition hover:text-blue-900"
              >
                View all →
              </Link>
            </div>

            <div className="p-6">
              {calendarLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-5 w-2/3 rounded bg-slate-100" />
                  <div className="h-4 w-1/2 rounded bg-slate-100" />
                  <div className="h-24 rounded-2xl bg-slate-100" />
                </div>
              ) : nextEvent ? (
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <EventIcon category={nextEvent.category} />

                    <span
                      className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${categoryClasses(
                        nextEvent.category
                      )}`}
                    >
                      {nextEvent.category}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold leading-7 tracking-tight text-slate-950">
                    {nextEvent.title}
                  </h3>

                  {nextEvent.description && (
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                      {nextEvent.description}
                    </p>
                  )}

                  <div className="mt-5 space-y-2 text-xs text-slate-500">
                    {nextEventRange && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {formatDate(nextEventRange.start, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>

                        {nextEventRange.start !==
                          nextEventRange.end && (
                          <span>
                            to{" "}
                            {formatDate(nextEventRange.end, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    )}

                    {nextEvent.event_time && (
                      <div>{nextEvent.event_time}</div>
                    )}

                    {nextEvent.venue && (
                      <div>{nextEvent.venue}</div>
                    )}

                    {nextEvent.target && (
                      <div>{nextEvent.target}</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-sm font-semibold text-slate-800">
                    No upcoming events
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    There are currently no upcoming calendar events
                    recorded.
                  </p>
                </div>
              )}

              {upcomingEvents.length > 1 && (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Coming after
                  </p>

                  <div className="mt-3 space-y-3">
                    {upcomingEvents.slice(1, 4).map((event) => {
                      const range = getEventRange(event);

                      return (
                        <Link
                          key={event.id}
                          href={`/calendar?event=${event.id}`}
                          className="group flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                              {event.title}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              {formatShortDate(range.start)}
                            </p>
                          </div>

                          <span className="text-slate-300 transition group-hover:text-blue-600">
                            →
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        </section>

        {/* Quick access */}
        <section className="mt-8">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
              Quick access
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              Your portal
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Quick
              href="/council"
              icon="L"
              title="Council"
              text="Student leadership structure and houses."
            />

            <Quick
              href="/activities"
              icon="A"
              title="Activities"
              text="Campus activities and student programmes."
            />

            <Quick
              href="/study-material"
              icon="S"
              title="Study Materials"
              text="Academic resources and study material."
            />

            <Quick
              href="/cafeteria"
              icon="M"
              title="Cafeteria"
              text="Current weekly menu and meal information."
            />

            <Quick
              href="/calendar"
              icon="C"
              title="Calendar"
              text="Full campus events and important dates."
            />
          </div>
        </section>

        {/* Identity */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Your role
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                {profile?.name?.trim() || "Verified Student"}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {role || "Student"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isAdmin && (
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-blue-700">
                  Administrator
                </span>
              )}

              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                Active account
              </span>

              <span className="max-w-[260px] truncate text-xs text-slate-400">
                {email}
              </span>
            </div>
          </div>
        </section>

        {/* Administration */}
        {isAdmin && (
          <section className="mt-8 rounded-2xl border border-blue-100 bg-white shadow-sm">
            <div className="border-b border-blue-50 px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                Administration
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                Portal management
              </h2>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                Administrative tools for maintaining the portal&apos;s
                operational data and user access.
              </p>
            </div>

            <div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/dashboard/calendar"
                className="group bg-white p-6 transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
                  C
                </div>

                <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-blue-700">
                  Manage Calendar
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Create, edit and maintain campus events and dates.
                </p>

                <span className="mt-4 inline-block text-xs font-semibold text-blue-700">
                  Open management →
                </span>
              </Link>

              <Link
                href="/dashboard/study-material"
                className="group bg-white p-6 transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-sm font-bold text-violet-700">
                  S
                </div>

                <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-violet-700">
                  Manage Study Materials
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Publish, organize and maintain academic resources.
                </p>

                <span className="mt-4 inline-block text-xs font-semibold text-violet-700">
                  Open management →
                </span>
              </Link>

              <Link
                href="/dashboard/users"
                className="group bg-white p-6 transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                  U
                </div>

                <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-emerald-700">
                  Manage Users
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Maintain portal identities, roles and administrative
                  access.
                </p>

                <span className="mt-4 inline-block text-xs font-semibold text-emerald-700">
                  Open management →
                </span>
              </Link>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            VidyaGyan Student Council Portal · Authenticated Workspace
          </p>

          <p>
            Access is controlled by your school account and portal role.
          </p>
        </div>
      </div>
    </main>
  );
}
