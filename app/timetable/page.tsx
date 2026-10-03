"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

type ViewMode = "today" | "week" | "routine" | "special";

type Grade = "VI" | "VII" | "VIII" | "IX" | "X" | "XI" | "XII";

type Category = "Classes" | "Meals" | "Activities" | "Rest/Admin";

type Entry = {
  id: string;
  title: string;
  start: string;
  end?: string;
  category: Category;
  note?: string;
  grades?: Grade[];
  days?: DayKey[];
  badge?: string;
};

const DAY_LABELS: Record<DayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

const DAY_SHORT: Record<DayKey, string> = {
  monday: "MON",
  tuesday: "TUE",
  wednesday: "WED",
  thursday: "THU",
  friday: "FRI",
  saturday: "SAT",
};

const DAY_ORDER: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const CATEGORY_META: Record<
  Category,
  {
    label: string;
    dot: string;
    line: string;
    soft: string;
    border: string;
    text: string;
  }
> = {
  Classes: {
    label: "Class",
    dot: "bg-blue-600",
    line: "bg-blue-200",
    soft: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-700",
  },
  Meals: {
    label: "Meal",
    dot: "bg-amber-500",
    line: "bg-amber-200",
    soft: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-700",
  },
  Activities: {
    label: "Activity",
    dot: "bg-emerald-600",
    line: "bg-emerald-200",
    soft: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-700",
  },
  "Rest/Admin": {
    label: "Rest / Admin",
    dot: "bg-slate-500",
    line: "bg-slate-200",
    soft: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
  },
};

const WEEKDAY_BASE: Entry[] = [
  {
    id: "wake",
    title: "Wake Up Call",
    start: "05:00",
    category: "Rest/Admin",
    note: "Start of the daily routine.",
  },
  {
    id: "freshen",
    title: "Freshen Up",
    start: "05:00",
    end: "05:30",
    category: "Rest/Admin",
    note: "30 minutes.",
  },
  {
    id: "morning",
    title: "Morning Yoga & Exercise",
    start: "05:30",
    end: "06:15",
    category: "Activities",
  },
  {
    id: "breakfast",
    title: "Getting Ready for School & Breakfast",
    start: "06:15",
    end: "07:30",
    category: "Meals",
  },
  {
    id: "reporting",
    title: "Reporting Time",
    start: "07:35",
    category: "Classes",
    note: "Students & teachers report to school.",
  },
  {
    id: "huddle",
    title: "Huddle Time",
    start: "07:35",
    end: "07:40",
    category: "Activities",
  },
  {
    id: "zero",
    title: "Class Teacher's Lesson / Zero Lesson",
    start: "07:40",
    end: "08:00",
    category: "Classes",
  },
  {
    id: "p1",
    title: "First Period",
    start: "08:00",
    end: "08:50",
    category: "Classes",
    badge: "P1",
  },
  {
    id: "p2",
    title: "Second Period",
    start: "08:50",
    end: "09:40",
    category: "Classes",
    badge: "P2",
  },
  {
    id: "p3",
    title: "Third Period",
    start: "09:40",
    end: "10:30",
    category: "Classes",
    badge: "P3",
  },
  {
    id: "snack1",
    title: "Break for Morning Snacks",
    start: "10:30",
    end: "10:45",
    category: "Meals",
  },
  {
    id: "p4",
    title: "Fourth Period",
    start: "10:45",
    end: "11:35",
    category: "Classes",
    badge: "P4",
  },
  {
    id: "p5",
    title: "Fifth Period",
    start: "11:35",
    end: "12:25",
    category: "Classes",
    badge: "P5",
  },
  {
    id: "p6",
    title: "Sixth Period",
    start: "12:25",
    end: "13:15",
    category: "Classes",
    badge: "P6",
  },
  {
    id: "p7",
    title: "Seventh Period",
    start: "13:15",
    end: "14:00",
    category: "Classes",
    badge: "P7",
  },
  {
    id: "lunch",
    title: "Lunch",
    start: "14:00",
    end: "14:45",
    category: "Meals",
    grades: ["VI", "VII", "VIII", "IX", "X", "XI", "XII"],
  },
  {
    id: "rest",
    title: "Rest Time",
    start: "14:45",
    end: "15:45",
    category: "Rest/Admin",
  },
  {
    id: "ncc",
    title: "NCC Classes & Parade",
    start: "15:10",
    end: "15:50",
    category: "Activities",
    note: "NCC students only.",
    days: ["thursday", "friday"],
  },
  {
    id: "evening",
    title: "Evening Activity / Clubs",
    start: "16:00",
    end: "17:15",
    category: "Activities",
    days: ["wednesday"],
  },
  {
    id: "snack2",
    title: "Evening Snacks",
    start: "17:15",
    end: "17:35",
    category: "Meals",
  },
  {
    id: "ready",
    title: "Getting Ready for Games / Art / Music / Dance",
    start: "17:35",
    end: "17:40",
    category: "Rest/Admin",
  },
  {
    id: "games",
    title: "Evening Games / Clubs",
    start: "17:40",
    end: "19:10",
    category: "Activities",
    days: ["wednesday"],
  },
  {
    id: "hostel",
    title: "Return to Hostels, Freshen Up, Dinner & Hostel Routine",
    start: "19:10",
    end: "20:10",
    category: "Meals",
  },
  {
    id: "prep",
    title: "Supervised Prep in the Academic Block",
    start: "20:15",
    end: "21:30",
    category: "Classes",
  },
  {
    id: "clean",
    title: "Clean Your Spaces & Organize for the Next Day",
    start: "21:35",
    end: "22:05",
    category: "Rest/Admin",
  },
  {
    id: "hostel-night",
    title: "Hostel Routine",
    start: "22:05",
    category: "Rest/Admin",
    note: "Continues overnight.",
  },
];

const SATURDAY_BASE: Entry[] = [
  {
    id: "sat-morning",
    title: "Morning Routine at Hostel, Freshening Up & Breakfast",
    start: "05:30",
    end: "07:30",
    category: "Meals",
  },
  {
    id: "sat-report",
    title: "Reporting Time",
    start: "07:35",
    category: "Classes",
    note: "Students & teachers.",
  },
  {
    id: "sat-huddle",
    title: "Huddle Time",
    start: "07:35",
    end: "07:40",
    category: "Activities",
  },
  {
    id: "sat-p1",
    title: "First Period",
    start: "07:40",
    end: "08:25",
    category: "Classes",
    grades: ["IX", "X", "XI", "XII"],
    badge: "P1",
  },
  {
    id: "sat-p1-jr",
    title: "Wellness & Meditation Session",
    start: "07:40",
    end: "08:25",
    category: "Activities",
    grades: ["VI", "VII", "VIII"],
  },
  {
    id: "sat-p2",
    title: "Second Period",
    start: "08:25",
    end: "09:10",
    category: "Classes",
    grades: ["IX", "X", "XI", "XII"],
    badge: "P2",
  },
  {
    id: "sat-p2-jr",
    title: "Converging Capacities / DTI / FinLit / Kaushal Bodh",
    start: "08:25",
    end: "09:10",
    category: "Classes",
    grades: ["VI", "VII", "VIII"],
  },
  {
    id: "sat-p3",
    title: "Third Period",
    start: "09:10",
    end: "09:55",
    category: "Classes",
    grades: ["IX", "X", "XI", "XII"],
    badge: "P3",
  },
  {
    id: "sat-p3-jr",
    title: "DTI / FinLit / Kaushal Bodh",
    start: "09:10",
    end: "09:55",
    category: "Classes",
    grades: ["VI", "VII", "VIII"],
  },
  {
    id: "sat-p4",
    title: "Fourth Period",
    start: "09:55",
    end: "10:40",
    category: "Classes",
    grades: ["IX", "X", "XI", "XII"],
    badge: "P4",
  },
  {
    id: "sat-p4-jr",
    title: "Soft Skill / DTI / FinLit / Kaushal Bodh",
    start: "09:55",
    end: "10:40",
    category: "Activities",
    grades: ["VI", "VII", "VIII"],
  },
  {
    id: "sat-snack",
    title: "Break for Morning Snacks",
    start: "10:40",
    end: "11:00",
    category: "Meals",
  },
  {
    id: "sat-p5",
    title: "Fifth Period",
    start: "11:00",
    end: "11:45",
    category: "Classes",
    grades: ["IX", "X", "XI", "XII"],
    badge: "P5",
  },
  {
    id: "sat-skills",
    title: "Essential Skills Session",
    start: "11:00",
    end: "11:45",
    category: "Activities",
    grades: ["VI", "VII", "VIII"],
  },
  {
    id: "sat-mentor",
    title: "House Meeting / Mentor–Mentee Meeting",
    start: "11:45",
    end: "12:30",
    category: "Activities",
    note: "Grades VI–XII.",
  },
  {
    id: "sat-clubs",
    title: "Club Activities",
    start: "12:30",
    end: "13:30",
    category: "Activities",
    grades: ["VI", "VII", "VIII", "IX", "X"],
  },
  {
    id: "sat-emrc",
    title: "EMRC",
    start: "12:30",
    end: "13:30",
    category: "Classes",
    grades: ["XI", "XII"],
    note: "Non-Maths students of Grades XI–XII.",
  },
  {
    id: "sat-teacher",
    title: "Self-time for Teachers",
    start: "13:30",
    end: "14:00",
    category: "Rest/Admin",
  },
  {
    id: "sat-lunch",
    title: "Lunch",
    start: "14:00",
    end: "15:00",
    category: "Meals",
    note: "Official schedule source lists Classes VI & XII; verify institutional wording before database publication.",
  },
  {
    id: "sat-rest",
    title: "Rest Time",
    start: "15:00",
    end: "16:00",
    category: "Rest/Admin",
  },
  {
    id: "sat-study",
    title: "Freshen Up / Self-Study",
    start: "16:00",
    end: "17:30",
    category: "Rest/Admin",
  },
  {
    id: "sat-snack2",
    title: "Evening Snacks",
    start: "17:30",
    end: "18:00",
    category: "Meals",
  },
  {
    id: "sat-games",
    title: "Games / Me Time",
    start: "18:00",
    end: "19:30",
    category: "Activities",
  },
  {
    id: "sat-dinner",
    title: "Dinner",
    start: "19:30",
    end: "20:30",
    category: "Meals",
  },
  {
    id: "sat-hostel",
    title: "Hostel Routine",
    start: "20:30",
    category: "Rest/Admin",
    note: "Continues overnight.",
  },
];

const SPECIAL_RULES: Record<
  DayKey,
  Partial<Record<string, string>>
> = {
  monday: {
    morning: "Morning Yoga & Exercise",
    zero: "Morning Assembly",
  },
  tuesday: {
    morning: "Morning Yoga & Exercise",
    zero: "Class Teacher's Lesson / Zero Lesson",
  },
  wednesday: {
    morning: "March Past",
    zero: "Class Teacher's Lesson / Zero Lesson",
  },
  thursday: {
    morning: "Morning Yoga & Exercise",
    zero: "Morning Assembly",
  },
  friday: {
    morning: "Morning Yoga & Exercise",
    zero: "Class Teacher's Lesson / Zero Lesson",
  },
  saturday: {},
};

const DAY_TO_NUMBER: Record<DayKey, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function parseMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function formatDuration(start: string, end?: string) {
  if (!end) return "Open-ended";

  const minutes =
    parseMinutes(end) - parseMinutes(start);

  if (minutes <= 0) return "";

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function getDayKey(date: Date): DayKey | null {
  const day = date.getDay();

  if (day === 0) return null;

  return DAY_ORDER[day - 1];
}

function getDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function getMinutesNow() {
  const formatter = new Intl.DateTimeFormat(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }
  );

  const parts = formatter.formatToParts(new Date());

  const h = Number(
    parts.find((part) => part.type === "hour")?.value ?? 0
  );

  const m = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0
  );

  return h * 60 + m;
}

function getCurrentDateIndia() {
  const parts = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).formatToParts(new Date());

  const year = Number(
    parts.find((part) => part.type === "year")?.value
  );

  const month = Number(
    parts.find((part) => part.type === "month")?.value
  );

  const day = Number(
    parts.find((part) => part.type === "day")?.value
  );

  return new Date(year, month - 1, day);
}

function getDateForDay(
  base: Date,
  day: DayKey
) {
  const result = new Date(base);

  const current =
    result.getDay() === 0
      ? 7
      : result.getDay();

  const target = DAY_TO_NUMBER[day];

  result.setDate(
    result.getDate() + target - current
  );

  return result;
}

function getWeekdayEntries(day: DayKey) {
  const rule = SPECIAL_RULES[day];

  return WEEKDAY_BASE
    .filter(
      (entry) =>
        !entry.days ||
        entry.days.includes(day)
    )
    .map((entry) => ({
      ...entry,
      title:
        rule[entry.id] ?? entry.title,
      note:
        entry.id === "morning" &&
        day === "wednesday"
          ? "Wednesday: March Past. NCC is also scheduled for Monday, Tuesday and Wednesday."
          : entry.note,
    }));
}

function getEntries(
  day: DayKey,
  grade: Grade
) {
  if (day === "saturday") {
    return SATURDAY_BASE.filter(
      (entry) =>
        !entry.grades ||
        entry.grades.includes(grade)
    );
  }

  return getWeekdayEntries(day);
}

function getCurrentEntry(
  entries: Entry[],
  now: number
) {
  return entries.find((entry) => {
    const start = parseMinutes(entry.start);

    if (!entry.end) return false;

    const end = parseMinutes(entry.end);

    return (
      now >= start &&
      now < end
    );
  });
}

function getNextEntry(
  entries: Entry[],
  now: number
) {
  return entries
    .filter(
      (entry) =>
        parseMinutes(entry.start) > now
    )
    .sort(
      (a, b) =>
        parseMinutes(a.start) -
        parseMinutes(b.start)
    )[0];
}

function isEntryActive(
  entry: Entry,
  now: number
) {
  const start = parseMinutes(entry.start);

  if (!entry.end) {
    return now >= start;
  }

  const end = parseMinutes(entry.end);

  return (
    now >= start &&
    now < end
  );
}

function isEntryPast(
  entry: Entry,
  now: number
) {
  if (!entry.end) {
    return parseMinutes(entry.start) < now;
  }

  return parseMinutes(entry.end) <= now;
}

function getProgress(
  entry: Entry,
  now: number
) {
  if (!entry.end) return 100;

  const start = parseMinutes(entry.start);
  const end = parseMinutes(entry.end);

  if (now <= start) return 0;
  if (now >= end) return 100;

  return (
    ((now - start) /
      (end - start)) *
    100
  );
}

function getClockString() {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }
  ).format(new Date());
}

/* -------------------------------------------------------------------------- */
/* ICONS                                                                       */
/* -------------------------------------------------------------------------- */

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

function ClockIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="6.8"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10 6.5v3.8l2.6 1.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TimelineIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7 4v16M7 7h10M7 12h7M7 17h10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle
        cx="7"
        cy="4"
        r="1.5"
        fill="currentColor"
      />
      <circle
        cx="7"
        cy="12"
        r="1.5"
        fill="currentColor"
      />
      <circle
        cx="7"
        cy="20"
        r="1.5"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowRight({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 10h11M11 5.5l4.5 4.5-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* SMALL UI COMPONENTS                                                         */
/* -------------------------------------------------------------------------- */

function CategoryTag({
  category,
}: {
  category: Category;
}) {
  const meta = CATEGORY_META[category];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] ${meta.soft} ${meta.border} ${meta.text}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
      />
      {meta.label}
    </span>
  );
}

function DayStrip({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date;
  onSelect: (day: DayKey) => void;
}) {
  return (
    <div className="grid grid-cols-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {DAY_ORDER.map((day) => {
        const date = getDateForDay(
          selectedDate,
          day
        );

        const selected =
          getDayKey(selectedDate) === day;

        const today = getCurrentDateIndia();

        const isToday =
          date.toDateString() ===
          today.toDateString();

        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelect(day)}
            className={`relative min-w-0 px-2 py-3 text-center transition ${
              selected
                ? "bg-[#1746c7] text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span
              className={`block text-[9px] font-black tracking-[0.12em] ${
                selected
                  ? "text-blue-100"
                  : "text-slate-400"
              }`}
            >
              {DAY_SHORT[day]}
            </span>

            <span className="mt-1 block text-sm font-black">
              {date.getDate()}
            </span>

            {isToday && (
              <span
                className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                  selected
                    ? "bg-white"
                    : "bg-blue-600"
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function TimelineEntry({
  entry,
  now,
  isToday,
  lane,
  laneCount,
}: {
  entry: Entry;
  now: number;
  isToday: boolean;
  lane: number;
  laneCount: number;
}) {
  const meta = CATEGORY_META[entry.category];

  const active =
    isToday &&
    isEntryActive(entry, now);

  const past =
    isToday &&
    isEntryPast(entry, now);

  const progress =
    active
      ? getProgress(entry, now)
      : 0;

  const laneStyle =
    laneCount > 1
      ? {
          marginLeft: `${lane * 14}px`,
          maxWidth: `calc(100% - ${
            lane * 14
          }px)`,
        }
      : undefined;

  return (
    <div
      className={`relative grid grid-cols-[64px_24px_minmax(0,1fr)] gap-0 sm:grid-cols-[82px_28px_minmax(0,1fr)] ${
        past ? "opacity-70" : ""
      }`}
    >
      <div className="pt-1 text-right">
        <p
          className={`text-[11px] font-black tracking-tight ${
            active
              ? "text-blue-700"
              : "text-slate-500"
          }`}
        >
          {formatTime(entry.start)}
        </p>

        {entry.end && (
          <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
            {formatTime(entry.end)}
          </p>
        )}
      </div>

      <div className="relative flex justify-center">
        <div
          className={`absolute bottom-0 top-0 w-px ${
            active
              ? "bg-blue-200"
              : "bg-slate-200"
          }`}
        />

        <div
          className={`relative z-10 mt-1 h-3.5 w-3.5 rounded-full border-[3px] border-white shadow-sm ${
            active
              ? "bg-blue-600 ring-4 ring-blue-100"
              : meta.dot
          }`}
        />
      </div>

      <div
        className="pb-5 pl-3 sm:pl-4"
        style={laneStyle}
      >
        <article
          className={`relative overflow-hidden rounded-2xl border bg-white transition ${
            active
              ? "border-blue-300 shadow-[0_8px_28px_rgba(37,99,235,0.13)]"
              : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
          }`}
        >
          {active && (
            <div
              className="absolute inset-y-0 left-0 w-1 bg-blue-600"
            />
          )}

          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryTag
                category={entry.category}
              />

              {entry.badge && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-slate-500">
                  {entry.badge}
                </span>
              )}

              {active && (
                <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white">
                  Now
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3
                  className={`text-base font-black tracking-tight sm:text-lg ${
                    active
                      ? "text-blue-950"
                      : "text-slate-950"
                  }`}
                >
                  {entry.title}
                </h3>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-400">
                  {entry.end && (
                    <span>
                      {formatDuration(
                        entry.start,
                        entry.end
                      )}
                    </span>
                  )}

                  {entry.note && (
                    <span className="text-slate-500">
                      {entry.note}
                    </span>
                  )}
                </div>
              </div>

              {active && (
                <div className="shrink-0 text-right">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-blue-500">
                    In progress
                  </p>

                  {entry.end && (
                    <p className="mt-0.5 text-xs font-black text-blue-900">
                      {Math.max(
                        0,
                        parseMinutes(
                          entry.end
                        ) - now
                      )}{" "}
                      min left
                    </p>
                  )}
                </div>
              )}
            </div>

            {active && entry.end && (
              <div className="mt-4">
                <div className="h-1.5 overflow-hidden rounded-full bg-blue-50">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

function Timeline({
  entries,
  now,
  isToday,
}: {
  entries: Entry[];
  now: number;
  isToday: boolean;
}) {
  const groups = useMemo(() => {
    const result: Array<{
      entries: Entry[];
      start: number;
    }> = [];

    for (const entry of entries) {
      const start = parseMinutes(
        entry.start
      );

      const last = result[result.length - 1];

      if (
        last &&
        last.entries.some(
          (item) =>
            parseMinutes(item.start) === start
        )
      ) {
        last.entries.push(entry);
      } else {
        result.push({
          entries: [entry],
          start,
        });
      }
    }

    return result;
  }, [entries]);

  return (
    <div className="relative">
      {groups.map((group) =>
        group.entries.map(
          (entry, index) => (
            <TimelineEntry
              key={`${entry.id}-${entry.start}`}
              entry={entry}
              now={now}
              isToday={isToday}
              lane={index}
              laneCount={group.entries.length}
            />
          )
        )
      )}
    </div>
  );
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function CurrentPanel({
  current,
  next,
  now,
  isToday,
}: {
  current?: Entry;
  next?: Entry;
  now: number;
  isToday: boolean;
}) {
  if (!isToday) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
          Selected day
        </p>

        <h2 className="mt-2 text-lg font-black text-slate-950">
          Timeline preview
        </h2>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          The live Now indicator follows
          campus time only on today&apos;s
          timeline.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-3xl bg-[#1746c7] p-5 text-white shadow-[0_14px_40px_rgba(23,70,199,0.20)]">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-100">
            Happening now
          </p>

          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-blue-50">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
            Live
          </span>
        </div>

        <h2 className="mt-3 text-xl font-black tracking-tight">
          {current?.title ??
            "Between scheduled activities"}
        </h2>

        {current?.end ? (
          <p className="mt-2 text-xs font-semibold text-blue-100">
            Until {formatTime(current.end)}
            {" · "}
            {Math.max(
              0,
              parseMinutes(current.end) -
                now
            )}{" "}
            min remaining
          </p>
        ) : (
          <p className="mt-2 text-xs text-blue-100">
            No timed activity is currently
            active.
          </p>
        )}

        {current?.end && (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white"
              style={{
                width: `${getProgress(
                  current,
                  now
                )}%`,
              }}
            />
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
          Up next
        </p>

        {next ? (
          <>
            <h2 className="mt-2 text-lg font-black text-slate-950">
              {next.title}
            </h2>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              {formatTime(next.start)}
              {next.end &&
                ` · ${formatDuration(
                  next.start,
                  next.end
                )}`}
            </p>

            <div className="mt-3">
              <CategoryTag
                category={next.category}
              />
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm font-semibold text-slate-500">
            No later scheduled activity.
          </p>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                        */
/* -------------------------------------------------------------------------- */

export default function TimetablePage() {
  const today = useMemo(
    () => getCurrentDateIndia(),
    []
  );

  const [view, setView] =
    useState<ViewMode>("today");

  const [selectedDate, setSelectedDate] =
    useState(today);

  const [grade, setGrade] =
    useState<Grade>("XI");

  const [now, setNow] =
    useState(getMinutesNow());

  const timelineRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = window.setInterval(
      () => setNow(getMinutesNow()),
      30_000
    );

    return () =>
      window.clearInterval(id);
  }, []);

  const selectedDay =
    getDayKey(selectedDate);

  const entries = useMemo(
    () =>
      selectedDay
        ? getEntries(
            selectedDay,
            grade
          )
        : [],
    [selectedDay, grade]
  );

  const isToday =
    selectedDate.toDateString() ===
    today.toDateString();

  const currentEntry =
    isToday
      ? getCurrentEntry(entries, now)
      : undefined;

  const nextEntry =
    isToday
      ? getNextEntry(entries, now)
      : undefined;

  const todayKey = getDayKey(today);

  const todayEntries = todayKey
    ? getEntries(todayKey, grade)
    : [];

  const currentForToday =
    getCurrentEntry(
      todayEntries,
      now
    );

  const nextForToday =
    getNextEntry(
      todayEntries,
      now
    );

  const setToday = () => {
    setSelectedDate(
      getCurrentDateIndia()
    );
    setView("today");
  };

  const shiftDate = (days: number) => {
    setSelectedDate(
      (current) => {
        const next = new Date(
          current
        );

        next.setDate(
          next.getDate() + days
        );

        return next;
      }
    );

    setView("today");
  };

  const selectDay = (day: DayKey) => {
    setSelectedDate(
      getDateForDay(
        selectedDate,
        day
      )
    );

    setView("today");
  };

  const dayLabel = selectedDay
    ? DAY_LABELS[selectedDay]
    : "Sunday";

  const activityCount =
    entries.length;

  const classCount =
    entries.filter(
      (entry) =>
        entry.category === "Classes"
    ).length;

  const mealCount =
    entries.filter(
      (entry) =>
        entry.category === "Meals"
    ).length;

  const activityCategoryCount =
    entries.filter(
      (entry) =>
        entry.category ===
        "Activities"
    ).length;

  const scrollToNow = () => {
    timelineRef.current?.scrollIntoView(
      {
        behavior: "smooth",
        block: "center",
      }
    );
  };

  return (
    <main className="min-h-screen bg-[#f4f7fc] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        {/* HERO */}

        <header className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0f1f4d] via-[#1746c7] to-[#3158d9] px-5 py-6 text-white shadow-[0_18px_55px_rgba(23,70,199,0.20)] sm:px-7 sm:py-7">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-36 left-1/3 h-80 w-80 rounded-full bg-indigo-300/15 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-blue-100 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_9px_rgba(103,232,249,0.9)]" />
                VidyaGyan Student Portal
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                  <TimelineIcon className="h-6 w-6" />
                </div>

                <div>
                  <h1 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                    Daily Timeline
                  </h1>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-blue-100 sm:text-sm">
                    Follow the school day from
                    morning routine to hostel
                    routine, with the current
                    activity always in view.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-blue-100">
                  Campus time
                </p>

                <p className="mt-1 text-sm font-black">
                  {getClockString()}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-blue-100">
                  Grade
                </p>

                <select
                  value={grade}
                  onChange={(event) =>
                    setGrade(
                      event.target
                        .value as Grade
                    )
                  }
                  className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                  aria-label="Select grade"
                >
                  {(
                    [
                      "VI",
                      "VII",
                      "VIII",
                      "IX",
                      "X",
                      "XI",
                      "XII",
                    ] as Grade[]
                  ).map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                        className="text-slate-900"
                      >
                        Class {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="col-span-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur sm:col-span-1">
                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-blue-100">
                  Today
                </p>

                <p className="mt-1 text-sm font-black">
                  {todayKey
                    ? DAY_LABELS[
                        todayKey
                      ]
                    : "Sunday"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* NAVIGATION */}

        <nav
          className="mt-5 flex gap-2 overflow-x-auto pb-1"
          aria-label="Timetable views"
        >
          {(
            [
              ["today", "Today"],
              ["week", "Week"],
              ["routine", "School Routine"],
              ["special", "Special"],
            ] as Array<
              [ViewMode, string]
            >
          ).map(
            ([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setView(key)
                }
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-black transition ${
                  view === key
                    ? "border-blue-700 bg-blue-700 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
                }`}
              >
                {label}
              </button>
            )
          )}
        </nav>

        {/* TODAY */}

        {view === "today" && (
          <div className="mt-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
              <section>
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-700">
                          Daily timeline
                        </p>

                        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                          {getDateLabel(
                            selectedDate
                          )}
                        </h2>

                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          Class {grade} ·{" "}
                          {dayLabel}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            shiftDate(-1)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          aria-label="Previous day"
                        >
                          <ChevronLeft />
                        </button>

                        <button
                          type="button"
                          onClick={setToday}
                          className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-blue-700 transition hover:bg-blue-100"
                        >
                          Today
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            shiftDate(1)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          aria-label="Next day"
                        >
                          <ChevronRight />
                        </button>
                      </div>
                    </div>

                    <DayStrip
                      selectedDate={
                        selectedDate
                      }
                      onSelect={selectDay}
                    />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <SummaryStat
                    label="Activities"
                    value={
                      activityCount
                    }
                  />
                  <SummaryStat
                    label="Class blocks"
                    value={classCount}
                  />
                  <SummaryStat
                    label="Meals"
                    value={mealCount}
                  />
                  <SummaryStat
                    label="Activities"
                    value={
                      activityCategoryCount
                    }
                  />
                </div>

                {!selectedDay ? (
                  <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                      Sunday
                    </span>

                    <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                      No Sunday routine has
                      been published.
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      The supplied institutional
                      schedule defines Monday–Friday
                      and Saturday. Sunday is left
                      unpublished rather than being
                      inferred.
                    </p>
                  </section>
                ) : (
                  <section
                    ref={timelineRef}
                    className="mt-5 rounded-3xl border border-slate-200 bg-white px-4 py-6 shadow-sm sm:px-6 sm:py-7"
                  >
                    <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Chronological view
                        </p>

                        <h2 className="mt-1 text-base font-black text-slate-950">
                          {dayLabel} timeline
                        </h2>
                      </div>

                      {isToday &&
                        currentEntry && (
                          <button
                            type="button"
                            onClick={
                              scrollToNow
                            }
                            className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-blue-700"
                          >
                            <ClockIcon className="h-3 w-3" />
                            Jump to now
                          </button>
                        )}
                    </div>

                    <Timeline
                      entries={entries}
                      now={now}
                      isToday={isToday}
                    />
                  </section>
                )}
              </section>

              <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
                <CurrentPanel
                  current={
                    isToday
                      ? currentEntry
                      : currentForToday
                  }
                  next={
                    isToday
                      ? nextEntry
                      : nextForToday
                  }
                  now={now}
                  isToday={isToday}
                />

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Timeline key
                  </p>

                  <div className="mt-4 space-y-2">
                    {(
                      Object.keys(
                        CATEGORY_META
                      ) as Category[]
                    ).map(
                      (category) => {
                        const meta =
                          CATEGORY_META[
                            category
                          ];

                        return (
                          <div
                            key={category}
                            className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5"
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${meta.dot}`}
                            />

                            <span className="text-xs font-bold text-slate-700">
                              {meta.label}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </section>

                <section className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-500">
                    Campus time
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-blue-950">
                    <ClockIcon className="h-4 w-4" />

                    <span className="text-lg font-black">
                      {getClockString()}
                    </span>
                  </div>

                  <p className="mt-2 text-[10px] leading-5 text-blue-700">
                    Live activity detection
                    uses Asia/Kolkata campus
                    time.
                  </p>
                </section>
              </aside>
            </div>
          </div>
        )}

        {/* WEEK */}

        {view === "week" && (
          <section className="mt-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-1">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-700">
                  Weekly overview
                </p>

                <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  The school week
                </h2>

                <p className="max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                  A compact chronological view
                  of Monday–Saturday. Select any
                  day to open its full timeline.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {DAY_ORDER.map((day) => {
                const date =
                  getDateForDay(
                    selectedDate,
                    day
                  );

                const dayEntries =
                  getEntries(
                    day,
                    grade
                  );

                const isSelected =
                  selectedDay === day;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setSelectedDate(
                        date
                      );
                      setView("today");
                    }}
                    className={`group overflow-hidden rounded-3xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected
                        ? "border-blue-300 ring-2 ring-blue-50"
                        : "border-slate-200 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-700">
                          {date.toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}
                        </p>

                        <h3 className="mt-1 text-lg font-black text-slate-950">
                          {DAY_LABELS[
                            day
                          ]}
                        </h3>
                      </div>

                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition group-hover:bg-blue-50 group-hover:text-blue-700">
                        <ArrowRight />
                      </span>
                    </div>

                    <div className="px-5 py-4">
                      <div className="relative">
                        <div className="absolute bottom-1 left-[6px] top-1 w-px bg-slate-200" />

                        <div className="space-y-3">
                          {dayEntries
                            .slice(0, 7)
                            .map(
                              (entry) => (
                                <div
                                  key={`${day}-${entry.id}`}
                                  className="relative flex gap-3"
                                >
                                  <span
                                    className={`relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-[2px] border-white ${CATEGORY_META[entry.category].dot}`}
                                  />

                                  <div className="min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-[0.05em] text-slate-400">
                                      {formatTime(
                                        entry.start
                                      )}
                                    </p>

                                    <p className="truncate text-xs font-bold text-slate-700">
                                      {
                                        entry.title
                                      }
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                        </div>
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-3 text-[9px] font-black uppercase tracking-[0.08em] text-blue-700">
                        {dayEntries.length}{" "}
                        scheduled entries ·
                        Open timeline
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ROUTINE */}

        {view === "routine" && (
          <section className="mt-6 space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-700">
                Institutional routine
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                Standard school routine
              </h2>

              <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500 sm:text-sm">
                The complete institutional
                timeline for Classes VI–XII,
                including weekday rules and
                Saturday-specific arrangements.
              </p>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              {DAY_ORDER.map(
                (day) => (
                  <section
                    key={day}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-700">
                          {day ===
                          "saturday"
                            ? "Saturday routine"
                            : "Weekday routine"}
                        </p>

                        <h2 className="mt-1 text-lg font-black text-slate-950">
                          {
                            DAY_LABELS[
                              day
                            ]
                          }
                        </h2>
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-slate-500">
                        {
                          getEntries(
                            day,
                            grade
                          ).length
                        }{" "}
                        entries
                      </span>
                    </div>

                    <div className="mt-5">
                      <Timeline
                        entries={getEntries(
                          day,
                          grade
                        )}
                        now={now}
                        isToday={
                          day ===
                          todayKey
                        }
                      />
                    </div>
                  </section>
                )
              )}
            </div>
          </section>
        )}

        {/* SPECIAL */}

        {view === "special" && (
          <section className="mt-6 space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-700">
                Date-specific timelines
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                Special schedules
              </h2>

              <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500 sm:text-sm">
                Special timetable changes can
                replace or augment the normal
                daily routine for a particular
                date.
              </p>
            </div>

            <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-7 shadow-sm sm:p-9">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <TimelineIcon />
              </div>

              <h2 className="mt-5 text-xl font-black tracking-tight text-slate-950">
                Special timeline engine ready
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                The page deliberately does not
                invent special schedules. Once
                date-specific timetable records
                are connected, they can override
                the normal timeline here.
              </p>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold leading-5 text-slate-500">
                Institutional events themselves
                remain the responsibility of
                <span className="font-black text-slate-700">
                  {" "}
                  /calendar
                </span>
                . This view is reserved for
                actual changes to the day&apos;s
                schedule.
              </div>
            </section>
          </section>
        )}

        <footer className="mt-10 border-t border-slate-200 pt-5 text-[10px] text-slate-400">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>
              VidyaGyan Leadership Academy ·
              Student Portal · 2026–27
            </span>

            <span>
              Campus time · Asia/Kolkata
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
