"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Category =
  | "Flagship"
  | "Academic"
  | "Cultural"
  | "Exams"
  | "Sports"
  | "Excursion"
  | "Holiday";

type Period = {
  start: string;
  end: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  periods: Period[];
  category: Category;
  target?: string;
  venue?: string;
  time?: string;
  description?: string;
  createdBy?: string;
};

type RawEvent = {
  id: number | string;
  title: string;
  event_date: string;
  description?: string | null;
  event_time?: string | null;
  category?: string | null;
  created_by?: string | null;
  target?: string | null;
  venue?: string | null;
};

type RawPeriod = {
  id: number | string;
  event_id: number | string;
  start_date: string;
  end_date: string;
};

const CATEGORY_CONFIG: Record<
  Category,
  {
    dot: string;
    text: string;
    soft: string;
    border: string;
    bar: string;
    accent: string;
  }
> = {
  Academic: {
    dot: "bg-blue-500",
    text: "text-blue-700",
    soft: "bg-blue-50",
    border: "border-blue-100",
    bar: "bg-blue-100 text-blue-800",
    accent: "bg-blue-600",
  },
  Exams: {
    dot: "bg-violet-500",
    text: "text-violet-700",
    soft: "bg-violet-50",
    border: "border-violet-100",
    bar: "bg-violet-100 text-violet-800",
    accent: "bg-violet-600",
  },
  Cultural: {
    dot: "bg-rose-500",
    text: "text-rose-700",
    soft: "bg-rose-50",
    border: "border-rose-100",
    bar: "bg-rose-100 text-rose-800",
    accent: "bg-rose-600",
  },
  Sports: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    soft: "bg-emerald-50",
    border: "border-emerald-100",
    bar: "bg-emerald-100 text-emerald-800",
    accent: "bg-emerald-600",
  },
  Excursion: {
    dot: "bg-cyan-500",
    text: "text-cyan-700",
    soft: "bg-cyan-50",
    border: "border-cyan-100",
    bar: "bg-cyan-100 text-cyan-800",
    accent: "bg-cyan-600",
  },
  Flagship: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    soft: "bg-amber-50",
    border: "border-amber-100",
    bar: "bg-amber-100 text-amber-800",
    accent: "bg-amber-500",
  },
  Holiday: {
    dot: "bg-orange-500",
    text: "text-orange-700",
    soft: "bg-orange-50",
    border: "border-orange-100",
    bar: "bg-orange-100 text-orange-800",
    accent: "bg-orange-500",
  },
};

const FILTERS: Array<{ key: Category | "All"; label: string }> = [
  { key: "All", label: "All events" },
  { key: "Academic", label: "Academic" },
  { key: "Exams", label: "Exams" },
  { key: "Cultural", label: "Cultural" },
  { key: "Sports", label: "Sports" },
  { key: "Excursion", label: "Excursion" },
  { key: "Flagship", label: "Flagship" },
  { key: "Holiday", label: "Holiday" },
];

const WEEKDAYS = [
  { short: "Sun", full: "Sunday" },
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
];

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function fromDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatLongDate(key: string) {
  return fromDateKey(key).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(key: string) {
  return fromDateKey(key).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function formatPeriod(period: Period) {
  if (period.start === period.end) {
    return formatShortDate(period.start);
  }

  const start = fromDateKey(period.start);
  const end = fromDateKey(period.end);

  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    return `${start.getDate()}–${end.getDate()} ${start.toLocaleDateString(
      "en-IN",
      { month: "short" }
    )}`;
  }

  if (start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} ${start.toLocaleDateString("en-IN", {
      month: "short",
    })} – ${end.getDate()} ${end.toLocaleDateString("en-IN", {
      month: "short",
    })}`;
  }

  return `${formatShortDate(period.start)} ${start.getFullYear()} – ${formatShortDate(
    period.end
  )} ${end.getFullYear()}`;
}

function formatPeriods(periods: Period[]) {
  return periods.map(formatPeriod).join(" · ");
}

function eventOccursOn(event: CalendarEvent, dateKey: string) {
  return event.periods.some(
    (period) => period.start <= dateKey && dateKey <= period.end
  );
}

function eventTouchesMonth(
  event: CalendarEvent,
  year: number,
  month: number
) {
  const first = toDateKey(new Date(year, month, 1));
  const last = toDateKey(new Date(year, month + 1, 0));

  return event.periods.some(
    (period) => period.start <= last && period.end >= first
  );
}

function firstEventDate(event: CalendarEvent) {
  return (
    [...event.periods]
      .sort((a, b) => a.start.localeCompare(b.start))[0]?.start ??
    "9999-12-31"
  );
}

function lastEventDate(event: CalendarEvent) {
  return (
    [...event.periods]
      .sort((a, b) => b.end.localeCompare(a.end))[0]?.end ??
    "0000-01-01"
  );
}

function isMultiDay(event: CalendarEvent) {
  return event.periods.some((period) => period.start !== period.end);
}

function normalizeCategory(value?: string | null): Category {
  if (
    value === "Academic" ||
    value === "Exams" ||
    value === "Cultural" ||
    value === "Sports" ||
    value === "Excursion" ||
    value === "Flagship" ||
    value === "Holiday"
  ) {
    return value;
  }

  return "Academic";
}

function normalizeEvents(
  rawEvents: RawEvent[],
  rawPeriods: RawPeriod[]
): CalendarEvent[] {
  const periodsByEvent = new Map<string, Period[]>();

  for (const period of rawPeriods) {
    const key = String(period.event_id);

    if (!periodsByEvent.has(key)) {
      periodsByEvent.set(key, []);
    }

    periodsByEvent.get(key)!.push({
      start: period.start_date,
      end: period.end_date,
    });
  }

  return rawEvents.map((event) => {
    const dbPeriods = periodsByEvent.get(String(event.id)) ?? [];

    const periods =
      dbPeriods.length > 0
        ? [...dbPeriods].sort((a, b) =>
            a.start.localeCompare(b.start)
          )
        : [
            {
              start: event.event_date,
              end: event.event_date,
            },
          ];

    return {
      id: String(event.id),
      title: event.title,
      periods,
      category: normalizeCategory(event.category),
      target: event.target || undefined,
      venue: event.venue || undefined,
      time: event.event_time || undefined,
      description: event.description || undefined,
      createdBy: event.created_by || undefined,
    };
  });
}

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M12.5 4.5L7 10l5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M7.5 4.5L13 10l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle
        cx="8.75"
        cy="8.75"
        r="5.25"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12.75 12.75L16.25 16.25"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15.5"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M7.5 3.5v4M16.5 3.5v4M3.5 9.5h17"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EventDot({ category }: { category: Category }) {
  return (
    <span
      className={`h-1.5 w-1.5 shrink-0 rounded-full ${CATEGORY_CONFIG[category].dot}`}
    />
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0">
      <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium leading-5 text-slate-700">
        {value}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const today = useMemo(() => fromDateKey(todayKey), [todayKey]);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    null
  );

  const [category, setCategory] = useState<Category | "All">("All");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchCalendar() {
      setLoading(true);
      setCalendarError(null);

      const [eventsResponse, periodsResponse] = await Promise.all([
        supabase
          .from("calendar_events")
          .select("*")
          .order("event_date", { ascending: true }),

        supabase
          .from("calendar_event_periods")
          .select("*")
          .order("start_date", { ascending: true }),
      ]);

      if (!mounted) return;

      if (eventsResponse.error || periodsResponse.error) {
        console.error("Calendar loading error:", {
          eventsError: eventsResponse.error,
          periodsError: periodsResponse.error,
        });

        setCalendarError(
          "The calendar could not be loaded from the portal database."
        );
        setEvents([]);
        setLoading(false);
        return;
      }

      const normalized = normalizeEvents(
        (eventsResponse.data || []) as RawEvent[],
        (periodsResponse.data || []) as RawPeriod[]
      );

      setEvents(normalized);
      setCalendarError(null);
      setLoading(false);
    }

    fetchCalendar();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events
      .filter(
        (event) =>
          category === "All" || event.category === category
      )
      .filter((event) => {
        if (!query) return true;

        return [
          event.title,
          event.target,
          event.venue,
          event.description,
          event.time,
          event.category,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          );
      })
      .sort(
        (a, b) =>
          firstEventDate(a).localeCompare(firstEventDate(b)) ||
          a.title.localeCompare(b.title)
      );
  }, [events, category, search]);

  const currentMonthEvents = useMemo(() => {
    return filteredEvents.filter((event) =>
      eventTouchesMonth(
        event,
        currentMonth.getFullYear(),
        currentMonth.getMonth()
      )
    );
  }, [filteredEvents, currentMonth]);

  const selectedDateEvents = useMemo(() => {
    return filteredEvents.filter((event) =>
      eventOccursOn(event, selectedDate)
    );
  }, [filteredEvents, selectedDate]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;

    return (
      filteredEvents.find((event) => event.id === selectedEventId) ??
      null
    );
  }, [filteredEvents, selectedEventId]);

  const upcomingEvents = useMemo(() => {
    return filteredEvents
      .filter((event) => lastEventDate(event) >= todayKey)
      .sort(
        (a, b) =>
          firstEventDate(a).localeCompare(firstEventDate(b)) ||
          a.title.localeCompare(b.title)
      )
      .slice(0, 6);
  }, [filteredEvents, todayKey]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const firstGridDay = addDays(first, -first.getDay());
    const lastGridDay = addDays(last, 6 - last.getDay());

    const days: Date[] = [];
    let cursor = firstGridDay;

    while (cursor <= lastGridDay) {
      days.push(new Date(cursor));
      cursor = addDays(cursor, 1);
    }

    return days;
  }, [currentMonth]);

  const weeks = useMemo(() => {
    const result: Date[][] = [];

    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }

    return result;
  }, [calendarDays]);

  const monthLabel = formatMonthYear(currentMonth);

  const goMonth = (amount: number) => {
    setCurrentMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + amount,
          1
        )
    );
    setSelectedEventId(null);
  };

  const goToday = () => {
    setCurrentMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
    setSelectedDate(todayKey);
    setSelectedEventId(null);
  };

  const selectDate = (dateKey: string) => {
    setSelectedDate(dateKey);

    const date = fromDateKey(dateKey);

    if (
      date.getMonth() !== currentMonth.getMonth() ||
      date.getFullYear() !== currentMonth.getFullYear()
    ) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }

    setSelectedEventId(null);
  };

  const selectEvent = (event: CalendarEvent, dateKey?: string) => {
    setSelectedEventId(event.id);

    const targetDate = dateKey || firstEventDate(event);
    setSelectedDate(targetDate);

    const date = fromDateKey(targetDate);

    setCurrentMonth(
      new Date(date.getFullYear(), date.getMonth(), 1)
    );
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <div className="mx-auto max-w-[1540px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">

        {/* =========================================================
            HEADER
        ========================================================== */}
        <header className="mb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                VidyaGyan Bulandshahr
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                  <CalendarIcon />
                </div>

                <div>
                  <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                    Campus Calendar
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Everything happening across the 2026–27 academic year.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[10px] font-bold text-slate-500 shadow-sm">
                Academic Year
                <span className="ml-1.5 text-slate-900">2026–27</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[10px] font-bold text-slate-500 shadow-sm">
                <span className="text-slate-900">{events.length}</span>{" "}
                events
              </div>
            </div>
          </div>
        </header>

        {/* =========================================================
            TOOLBAR
        ========================================================== */}
        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">

            {/* Month navigation */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => goMonth(-1)}
                aria-label="Previous month"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              >
                <ChevronLeft />
              </button>

              <div className="mx-3 min-w-[175px] text-center">
                <div className="text-lg font-bold tracking-tight text-slate-950">
                  {monthLabel}
                </div>

                <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  {currentMonthEvents.length} scheduled
                </div>
              </div>

              <button
                type="button"
                onClick={() => goMonth(1)}
                aria-label="Next month"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              >
                <ChevronRight />
              </button>

              <button
                type="button"
                onClick={goToday}
                className="ml-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                Today
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full xl:max-w-md">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search events, grades, venues..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          </div>

          {/* Category filters */}
          <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              {FILTERS.map((item) => {
                const active = category === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setCategory(item.key)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-bold transition ${
                      active
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
                    }`}
                  >
                    {item.key !== "All" && (
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          active
                            ? "bg-white"
                            : CATEGORY_CONFIG[item.key].dot
                        }`}
                      />
                    )}

                    {item.label}
                  </button>
                );
              })}

              {(search || category !== "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-auto shrink-0 px-2 text-[10px] font-bold text-blue-600 transition hover:text-blue-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </section>

        {/* =========================================================
            ERROR
        ========================================================== */}
        {calendarError && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-xs text-amber-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-bold">
                Calendar data could not be loaded.
              </div>
              <div className="mt-0.5 text-amber-700">
                Check the Supabase connection and refresh the page.
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="shrink-0 rounded-lg bg-amber-900 px-3 py-2 text-[10px] font-bold text-white hover:bg-amber-800"
            >
              Refresh
            </button>
          </div>
        )}

        {/* =========================================================
            MAIN CONTENT
        ========================================================== */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_350px]">

          {/* =======================================================
              CALENDAR
          ======================================================== */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">

            {/* Weekday header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
              {WEEKDAYS.map((day) => (
                <div
                  key={day.short}
                  title={day.full}
                  className="border-r border-slate-100 px-2 py-3 text-center text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 last:border-r-0 sm:text-[10px]"
                >
                  <span className="sm:hidden">{day.short.charAt(0)}</span>
                  <span className="hidden sm:inline">{day.short}</span>
                </div>
              ))}
            </div>

            {/* Calendar body */}
            {loading ? (
              <div className="grid min-h-[690px] place-items-center">
                <div className="text-center">
                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                  <p className="mt-3 text-xs font-medium text-slate-400">
                    Loading calendar...
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {weeks.map((week, weekIndex) => (
                  <div
                    key={`week-${weekIndex}`}
                    className="grid grid-cols-7"
                  >
                    {week.map((date) => {
                      const dateKey = toDateKey(date);

                      const inMonth =
                        date.getMonth() === currentMonth.getMonth() &&
                        date.getFullYear() ===
                          currentMonth.getFullYear();

                      const isToday = dateKey === todayKey;
                      const isSelected = dateKey === selectedDate;

                      const dayEvents = filteredEvents.filter((event) =>
                        eventOccursOn(event, dateKey)
                      );

                      const visibleEvents = dayEvents.slice(0, 4);

                      const moreCount = Math.max(
                        dayEvents.length - visibleEvents.length,
                        0
                      );

                      return (
                        <button
                          key={dateKey}
                          type="button"
                          onClick={() => selectDate(dateKey)}
                          className={`group relative min-h-[138px] border-b border-r border-slate-100 p-2 text-left transition last:border-r-0 sm:min-h-[155px] sm:p-2.5 ${
                            !inMonth
                              ? "bg-slate-50/60"
                              : "bg-white hover:bg-slate-50/70"
                          } ${
                            isSelected
                              ? "bg-blue-50/40 ring-1 ring-inset ring-blue-100"
                              : ""
                          }`}
                        >
                          {/* Date */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-xs font-bold ${
                                isToday
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : isSelected
                                    ? "bg-blue-100 text-blue-800"
                                    : inMonth
                                      ? "text-slate-700"
                                      : "text-slate-300"
                              }`}
                            >
                              {date.getDate()}
                            </span>

                            {isToday && (
                              <span className="hidden text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600 sm:block">
                                Today
                              </span>
                            )}
                          </div>

                          {/* Events */}
                          <div className="mt-2 space-y-1">
                            {visibleEvents.map((event) => {
                              const config =
                                CATEGORY_CONFIG[event.category];

                              const startsHere = event.periods.some(
                                (period) => period.start === dateKey
                              );

                              const endsHere = event.periods.some(
                                (period) => period.end === dateKey
                              );

                              const multiDay =
                                isMultiDay(event) &&
                                eventOccursOn(event, dateKey);

                              return (
                                <span
                                  key={`${event.id}-${dateKey}`}
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectEvent(event, dateKey);
                                  }}
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" ||
                                      e.key === " "
                                    ) {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      selectEvent(event, dateKey);
                                    }
                                  }}
                                  title={`${event.title} · ${formatPeriods(
                                    event.periods
                                  )}`}
                                  className={`group/event flex min-w-0 items-center gap-1.5 text-left text-[9px] font-semibold leading-4 transition sm:text-[10px] ${
                                    multiDay
                                      ? `${config.bar} ${
                                          startsHere
                                            ? "rounded-l-md"
                                            : "-ml-2 rounded-l-none"
                                        } ${
                                          endsHere
                                            ? "rounded-r-md"
                                            : "-mr-2 rounded-r-none"
                                        } px-1.5 py-1`
                                      : `${config.soft} ${config.text} rounded-md border ${config.border} px-1.5 py-1`
                                  } ${
                                    selectedEventId === event.id
                                      ? "ring-2 ring-blue-400/30"
                                      : "hover:brightness-95"
                                  }`}
                                >
                                  <EventDot category={event.category} />

                                  <span className="min-w-0 truncate">
                                    {event.title}
                                  </span>
                                </span>
                              );
                            })}

                            {moreCount > 0 && (
                              <span className="block px-1 text-[9px] font-bold text-slate-400">
                                +{moreCount} more
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 px-4 py-3.5 sm:px-5">
              {FILTERS.filter(
                (item) => item.key !== "All"
              ).map((item) => (
                <div
                  key={item.key}
                  className="inline-flex items-center gap-1.5 text-[9px] font-medium text-slate-500"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      CATEGORY_CONFIG[item.key].dot
                    }`}
                  />

                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* =======================================================
              SIDEBAR
          ======================================================== */}
          <aside className="flex min-h-[650px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">

            {/* Selected day */}
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
                  Selected day
                </div>

                {selectedDate === todayKey && (
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-blue-700">
                    Today
                  </span>
                )}
              </div>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                {formatLongDate(selectedDate)}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {selectedDateEvents.length === 0
                  ? "No matching events"
                  : `${selectedDateEvents.length} event${
                      selectedDateEvents.length === 1 ? "" : "s"
                    }`}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">

              {/* Selected date events */}
              <div className="border-b border-slate-100 p-4">
                {selectedDateEvents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
                    <div className="text-sm font-semibold text-slate-600">
                      Nothing scheduled
                    </div>

                    <p className="mt-1 text-[10px] leading-5 text-slate-400">
                      No events match the current filters for
                      this date.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedDateEvents.map((event) => {
                      const config =
                        CATEGORY_CONFIG[event.category];

                      const active =
                        selectedEventId === event.id;

                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() =>
                            selectEvent(event, selectedDate)
                          }
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            active
                              ? `${config.soft} ${config.border}`
                              : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${config.dot}`}
                            />

                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold leading-4 text-slate-800">
                                {event.title}
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span
                                  className={`text-[9px] font-bold ${config.text}`}
                                >
                                  {event.category}
                                </span>

                                {event.time && (
                                  <>
                                    <span className="text-[9px] text-slate-300">
                                      •
                                    </span>

                                    <span className="text-[9px] text-slate-400">
                                      {event.time}
                                    </span>
                                  </>
                                )}
                              </div>

                              {event.target && (
                                <p className="mt-1 truncate text-[10px] text-slate-500">
                                  {event.target}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Event details */}
              {selectedEvent && (
                <div className="border-b border-slate-100 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] ${
                        CATEGORY_CONFIG[selectedEvent.category].soft
                      } ${
                        CATEGORY_CONFIG[selectedEvent.category].text
                      } ${
                        CATEGORY_CONFIG[selectedEvent.category].border
                      }`}
                    >
                      {selectedEvent.category}
                    </span>

                    {isMultiDay(selectedEvent) && (
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        Multi-day
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-lg font-bold leading-6 tracking-tight text-slate-950">
                    {selectedEvent.title}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {formatPeriods(selectedEvent.periods)}
                  </p>

                  <div className="mt-4">
                    <DetailRow
                      label="Audience"
                      value={
                        selectedEvent.target ||
                        "School Community"
                      }
                    />

                    <DetailRow
                      label="Venue"
                      value={
                        selectedEvent.venue ||
                        "Not specified"
                      }
                    />

                    <DetailRow
                      label="Time"
                      value={
                        selectedEvent.time ||
                        "Not specified"
                      }
                    />

                    <DetailRow
                      label="Schedule"
                      value={formatPeriods(
                        selectedEvent.periods
                      )}
                    />
                  </div>

                  {selectedEvent.description && (
                    <div className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3 text-[11px] leading-5 text-slate-600">
                      {selectedEvent.description}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedEventId(null)
                    }
                    className="mt-4 text-[10px] font-semibold text-slate-400 transition hover:text-slate-700"
                  >
                    Clear selection
                  </button>
                </div>
              )}

              {/* Upcoming */}
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Upcoming
                    </div>

                    <div className="mt-0.5 text-sm font-bold text-slate-800">
                      Next events
                    </div>
                  </div>

                  <span className="rounded-full bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-400">
                    {upcomingEvents.length}
                  </span>
                </div>

                {upcomingEvents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-[10px] text-slate-400">
                    No upcoming events match the current filters.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {upcomingEvents.map((event) => {
                      const config =
                        CATEGORY_CONFIG[event.category];

                      const eventDate =
                        firstEventDate(event);

                      const date =
                        fromDateKey(eventDate);

                      return (
                        <button
                          key={`upcoming-${event.id}`}
                          type="button"
                          onClick={() =>
                            selectEvent(event)
                          }
                          className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-slate-50"
                        >
                          <div className="w-10 shrink-0 text-center">
                            <div className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              {date.toLocaleDateString(
                                "en-IN",
                                { month: "short" }
                              )}
                            </div>

                            <div className="text-lg font-bold leading-5 text-slate-800">
                              {date.getDate()}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1 border-l border-slate-100 pl-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`}
                              />

                              <span className="truncate text-[11px] font-bold text-slate-700">
                                {event.title}
                              </span>
                            </div>

                            <p className="mt-0.5 truncate text-[9px] text-slate-400">
                              {formatPeriods(event.periods)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </section>

        {/* Filter status */}
        {(search || category !== "All") && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-[10px] font-medium text-blue-700">
            Showing{" "}
            <span className="font-bold">
              {filteredEvents.length}
            </span>{" "}
            matching event
            {filteredEvents.length === 1 ? "" : "s"}.

            <button
              type="button"
              onClick={clearFilters}
              className="ml-2 font-bold underline underline-offset-2"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="px-1 pb-2 pt-6 text-center text-[9px] leading-5 text-slate-400">
          Calendar information is maintained through the
          VidyaGyan Bulandshahr portal database.
        </footer>
      </div>
    </main>
  );
}
