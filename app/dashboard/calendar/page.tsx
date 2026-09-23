"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
type Category =
  | "Academic"
  | "Examinations"
  | "Sports"
  | "Cultural & Arts"
  | "Trips & Visits"
  | "Institutional"
  | "Holidays & Breaks"
  | "Special Events";

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
    pill: string;
    accent: string;
  }
> = {
  Academic: {
    dot: "bg-blue-500",
    text: "text-blue-700",
    soft: "bg-blue-50",
    border: "border-blue-100",
    pill: "bg-blue-50 text-blue-700 border-blue-100",
    accent: "bg-blue-500",
  },
  Examinations: {
    dot: "bg-violet-500",
    text: "text-violet-700",
    soft: "bg-violet-50",
    border: "border-violet-100",
    pill: "bg-violet-50 text-violet-700 border-violet-100",
    accent: "bg-violet-500",
  },
  Sports: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    soft: "bg-emerald-50",
    border: "border-emerald-100",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-100",
    accent: "bg-emerald-500",
  },
  "Cultural & Arts": {
    dot: "bg-rose-500",
    text: "text-rose-700",
    soft: "bg-rose-50",
    border: "border-rose-100",
    pill: "bg-rose-50 text-rose-700 border-rose-100",
    accent: "bg-rose-500",
  },
  "Trips & Visits": {
    dot: "bg-cyan-500",
    text: "text-cyan-700",
    soft: "bg-cyan-50",
    border: "border-cyan-100",
    pill: "bg-cyan-50 text-cyan-700 border-cyan-100",
    accent: "bg-cyan-500",
  },
  Institutional: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    soft: "bg-amber-50",
    border: "border-amber-100",
    pill: "bg-amber-50 text-amber-700 border-amber-100",
    accent: "bg-amber-500",
  },
  "Holidays & Breaks": {
    dot: "bg-orange-500",
    text: "text-orange-700",
    soft: "bg-orange-50",
    border: "border-orange-100",
    pill: "bg-orange-50 text-orange-700 border-orange-100",
    accent: "bg-orange-500",
  },
  "Special Events": {
    dot: "bg-fuchsia-500",
    text: "text-fuchsia-700",
    soft: "bg-fuchsia-50",
    border: "border-fuchsia-100",
    pill: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
    accent: "bg-fuchsia-500",
  },
};

const FILTERS: Array<{
  key: Category | "All";
  label: string;
}> = [
  { key: "All", label: "All events" },
  { key: "Academic", label: "Academic" },
  { key: "Examinations", label: "Examinations" },
  { key: "Sports", label: "Sports" },
  { key: "Cultural & Arts", label: "Cultural & Arts" },
  { key: "Trips & Visits", label: "Trips & Visits" },
  { key: "Institutional", label: "Institutional" },
  { key: "Holidays & Breaks", label: "Holidays & Breaks" },
  { key: "Special Events", label: "Special Events" },
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
return `${formatShortDate(period.start)} – ${formatShortDate(
    period.end
  )}`;
}
function formatPeriods(periods: Period[]) {
return periods.map(formatPeriod).join(" · ");
}
function eventOccursOn(
event: CalendarEvent,
dateKey: string
) {
return event.periods.some(
(period) =>
period.start <= dateKey &&
dateKey <= period.end
);
}
function eventTouchesMonth(
event: CalendarEvent,
year: number,
month: number
) {
const first = toDateKey(
new Date(year, month, 1)
);
const last = toDateKey(
new Date(year, month + 1, 0)
);
return event.periods.some(
(period) =>
period.start <= last &&
period.end >= first
);
}
function firstEventDate(event: CalendarEvent) {
return (
[...event.periods].sort((a, b) =>
a.start.localeCompare(b.start)
)[0]?.start ?? "9999-12-31"
);
}
function lastEventDate(event: CalendarEvent) {
return (
[...event.periods].sort((a, b) =>
b.end.localeCompare(a.end)
)[0]?.end ?? "0000-01-01"
);
}
function eventDuration(event: CalendarEvent) {
let max = 1;
for (const period of event.periods) {
const start = fromDateKey(period.start);
const end = fromDateKey(period.end);

const difference =
  Math.round(
    (end.getTime() - start.getTime()) /
      86400000
  ) + 1;

max = Math.max(max, difference);

}
return max;
}
function isMultiDay(event: CalendarEvent) {
return eventDuration(event) > 1;
}
function normalizeCategory(value?: string | null): Category {
  if (
    value === "Academic" ||
    value === "Examinations" ||
    value === "Sports" ||
    value === "Cultural & Arts" ||
    value === "Trips & Visits" ||
    value === "Institutional" ||
    value === "Holidays & Breaks" ||
    value === "Special Events"
  ) {
    return value;
  }

  return "Academic";
}

function normalizeEvents(
rawEvents: RawEvent[],
rawPeriods: RawPeriod[]
): CalendarEvent[] {
const periodsByEvent = new Map<
string,
Period[]
>();

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
const dbPeriods =
periodsByEvent.get(String(event.id)) ?? [];

const periods =
  dbPeriods.length > 0
    ? dbPeriods.sort((a, b) =>
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
  description:
    event.description || undefined,
  createdBy:
    event.created_by || undefined,
};

});
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
function CalendarIcon({
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
<rect
     x="3.5"
     y="5"
     width="17"
     height="15"
     rx="2.5"
     stroke="currentColor"
     strokeWidth="1.6"
   />

  <path
    d="M7.5 3.5V7M16.5 3.5V7M3.5 9.5h17"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
  />

  <path
    d="M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  />
</svg>

);
}
function MapPinIcon() {
return (
<svg
   viewBox="0 0 20 20"
   fill="none"
   className="h-3.5 w-3.5"
   aria-hidden="true"
 >
<path
     d="M15.5 8.2c0 4.2-5.5 8.3-5.5 8.3S4.5 12.4 4.5 8.2a5.5 5.5 0 1 1 11 0Z"
     stroke="currentColor"
     strokeWidth="1.5"
   />

  <circle
    cx="10"
    cy="8"
    r="1.8"
    stroke="currentColor"
    strokeWidth="1.5"
  />
</svg>

);
}
function ClockIcon() {
return (
<svg
   viewBox="0 0 20 20"
   fill="none"
   className="h-3.5 w-3.5"
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
function SparkIcon() {
return (
<svg
   viewBox="0 0 20 20"
   fill="none"
   className="h-4 w-4"
   aria-hidden="true"
 >
<path
     d="M10 2.8l1.15 4.1L15.2 8l-4.05 1.1L10 13.2 8.85 9.1 4.8 8l4.05-1.1L10 2.8Z"
     fill="currentColor"
   />

  <path
    d="M15.6 12.8l.55 1.95 1.95.55-1.95.55-.55 1.95-.55-1.95-1.95-.55 1.95-.55.55-1.95Z"
    fill="currentColor"
  />
</svg>

);
}
function EventDot({
category,
}: {
category: Category;
}) {
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
<div className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
{label}
</div>

  <div className="mt-1 text-[12px] font-semibold leading-5 text-slate-700">
    {value}
  </div>
</div>

);
}
/* -------------------------------------------------------------------------- */
/* PAGE                                                                        */
/* -------------------------------------------------------------------------- */

type FormState = {
  title: string;
  category: Category;
  startDate: string;
  endDate: string;
  time: string;
  venue: string;
  target: string;
  description: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  category: "Academic",
  startDate: "",
  endDate: "",
  time: "",
  venue: "",
  target: "School Community",
  description: "",
};

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M12.8 4.2l3 3M4.2 15.8l.7-3.1L13.9 3.7a1.4 1.4 0 0 1 2 0l.4.4a1.4 1.4 0 0 1 0 2l-8.9 8.9-3.2.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M5 6h10M8 6V4.5h4V6M7 8.2v6.8M10 8.2v6.8M13 8.2v6.8M6 6l.5 11h7L14 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M16 7.5A6.5 6.5 0 1 0 16.2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 4.5v3.5h-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function toFormState(event: CalendarEvent): FormState {
  const first = [...event.periods].sort((a, b) => a.start.localeCompare(b.start))[0];
  const last = [...event.periods].sort((a, b) => b.end.localeCompare(a.end))[0];
  return {
    title: event.title,
    category: event.category,
    startDate: first?.start ?? "",
    endDate: last?.end ?? first?.start ?? "",
    time: event.time ?? "",
    venue: event.venue ?? "",
    target: event.target ?? "",
    description: event.description ?? "",
  };
}

function validateForm(form: FormState) {
  if (!form.title.trim()) return "Event title is required.";
  if (!form.startDate) return "Start date is required.";
  if (!form.endDate) return "End date is required.";
  if (form.endDate < form.startDate) return "End date cannot be before the start date.";
  return null;
}

export default function DashboardCalendarPage() {
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const today = useMemo(() => fromDateKey(todayKey), [todayKey]);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | "All">("All");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileEmail, setProfileEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  async function fetchCalendar() {
    setLoading(true);
    setCalendarError(null);

    const [eventsResponse, periodsResponse] = await Promise.all([
      supabase
        .from("calendar_events")
        .select("id,title,event_date,description,event_time,category,created_by,target,venue")
        .order("event_date", { ascending: true }),
      supabase
        .from("calendar_event_periods")
        .select("id,event_id,start_date,end_date")
        .order("start_date", { ascending: true }),
    ]);

    if (eventsResponse.error || periodsResponse.error) {
      const message =
        eventsResponse.error?.message ||
        periodsResponse.error?.message ||
        "Unable to load calendar data.";
      setCalendarError(message);
      setEvents([]);
      setLoading(false);
      return;
    }

    setEvents(
      normalizeEvents(
        (eventsResponse.data || []) as RawEvent[],
        (periodsResponse.data || []) as RawPeriod[]
      )
    );
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;

    async function loadAccess() {
      setProfileLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setIsAdmin(false);
        setProfileLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("get_my_portal_profile");

      if (!mounted) return;

      if (error || !data?.[0]) {
        setIsAdmin(false);
        setProfileLoading(false);
        return;
      }

      const profile = data[0] as {
        email?: string | null;
        admin_status?: string | null;
      };

      setProfileEmail(profile.email ?? user.email ?? "");
      setIsAdmin(profile.admin_status === "yes");
      setProfileLoading(false);
    }

    loadAccess();
    fetchCalendar();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events
      .filter((event) => category === "All" || event.category === category)
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
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .sort(
        (a, b) =>
          firstEventDate(a).localeCompare(firstEventDate(b)) ||
          a.title.localeCompare(b.title)
      );
  }, [events, category, search]);

  const selectedDateEvents = useMemo(
    () => filteredEvents.filter((event) => eventOccursOn(event, selectedDate)),
    [filteredEvents, selectedDate]
  );

  const selectedEvent = useMemo(
    () => filteredEvents.find((event) => event.id === selectedEventId) ?? null,
    [filteredEvents, selectedEventId]
  );

  const upcomingEvents = useMemo(
    () =>
      filteredEvents
        .filter((event) => lastEventDate(event) >= todayKey)
        .sort((a, b) => firstEventDate(a).localeCompare(firstEventDate(b)))
        .slice(0, 7),
    [filteredEvents, todayKey]
  );

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

  const openCreate = (dateKey = selectedDate) => {
    setEditingEventId(null);
    setForm({
      ...EMPTY_FORM,
      startDate: dateKey,
      endDate: dateKey,
    });
    setFormError(null);
    setNotice(null);
    setModalOpen(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setEditingEventId(event.id);
    setForm(toFormState(event));
    setFormError(null);
    setNotice(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setFormError(null);
  };

  const handleSave = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    setFormError(null);
    setNotice(null);

    const validationError = validateForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (!isAdmin) {
      setFormError("Only portal administrators can modify calendar events.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        event_date: form.startDate,
        event_time: form.time.trim() || null,
        venue: form.venue.trim() || null,
        target: form.target.trim() || null,
        description: form.description.trim() || null,
        updated_by: profileEmail || null,
        updated_at: new Date().toISOString(),
      };

      let eventId = editingEventId;

      if (editingEventId) {
        const { error } = await supabase
          .from("calendar_events")
          .update(payload)
          .eq("id", editingEventId);

        if (error) throw error;

        const { error: deletePeriodsError } = await supabase
          .from("calendar_event_periods")
          .delete()
          .eq("event_id", editingEventId);

        if (deletePeriodsError) throw deletePeriodsError;
      } else {
        const { data, error } = await supabase
          .from("calendar_events")
          .insert({
            ...payload,
            created_by: profileEmail || null,
            created_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (error) throw error;
        eventId = String(data.id);
      }

      const { error: periodError } = await supabase
        .from("calendar_event_periods")
        .insert({
          event_id: Number(eventId),
          start_date: form.startDate,
          end_date: form.endDate,
        });

      if (periodError) throw periodError;

      setModalOpen(false);
      setNotice(editingEventId ? "Event updated successfully." : "Event added successfully.");
      await fetchCalendar();

      const savedId = eventId ? String(eventId) : null;
      if (savedId) {
        setSelectedEventId(savedId);
        setSelectedDate(form.startDate);
      }
    } catch (error) {
      console.error("Calendar save error:", error);
      setFormError(
        error instanceof Error ? error.message : "Unable to save this event."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event: CalendarEvent) => {
    if (!isAdmin || deleting) return;

    const confirmed = window.confirm(
      `Delete "${event.title}" from the calendar? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setNotice(null);
    setCalendarError(null);

    try {
      const { error: periodsError } = await supabase
        .from("calendar_event_periods")
        .delete()
        .eq("event_id", Number(event.id));

      if (periodsError) throw periodsError;

      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", Number(event.id));

      if (error) throw error;

      setSelectedEventId(null);
      setNotice("Event deleted successfully.");
      await fetchCalendar();
    } catch (error) {
      console.error("Calendar delete error:", error);
      setCalendarError(
        error instanceof Error ? error.message : "Unable to delete this event."
      );
    } finally {
      setDeleting(false);
    }
  };

  const goMonth = (amount: number) => {
    setCurrentMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + amount, 1)
    );
    setSelectedEventId(null);
  };

  const goToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
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
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
  };

  if (profileLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f7fc]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600" />
          <p className="mt-3 text-xs font-bold text-slate-400">
            Verifying calendar access...
          </p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f7fc] px-6">
        <div className="max-w-md rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-[0_10px_35px_rgba(15,23,42,0.07)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-lg font-black text-slate-900">
            Calendar administration
          </h1>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            This page is restricted to portal administrators.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fc] text-slate-900">
      <div className="mx-auto max-w-[1540px] px-3 pb-10 pt-4 sm:px-5 lg:px-7 lg:pt-6">
        <section className="relative mb-5 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#172554] via-[#1d4ed8] to-[#4f46e5] px-5 py-6 text-white shadow-[0_18px_50px_rgba(30,64,175,0.20)] sm:px-7 sm:py-7">
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-fuchsia-400/15 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.2em] text-blue-100 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                Dashboard · Calendar
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 backdrop-blur">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                    Calendar Management
                  </h1>
                  <p className="mt-1 text-xs font-medium text-blue-100 sm:text-sm">
                    Add, edit and maintain the school calendar from one place.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openCreate()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[10px] font-black text-blue-700 shadow-lg shadow-blue-950/20 transition hover:bg-blue-50"
            >
              <PlusIcon />
              Add event
            </button>
          </div>
        </section>

        {notice && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[10px] font-bold text-emerald-700">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice(null)} className="font-black">
              Dismiss
            </button>
          </div>
        )}

        <section className="mb-5 overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goMonth(-1)}
                aria-label="Previous month"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <ChevronLeft />
              </button>
              <div className="min-w-[180px] px-2 text-center">
                <div className="text-lg font-black tracking-tight text-slate-950">
                  {monthLabel}
                </div>
                <div className="mt-0.5 text-[8px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  2026–27 academic calendar
                </div>
              </div>
              <button
                type="button"
                onClick={() => goMonth(1)}
                aria-label="Next month"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <ChevronRight />
              </button>
              <button
                type="button"
                onClick={goToday}
                className="ml-1 rounded-xl bg-slate-950 px-4 py-2.5 text-[10px] font-extrabold text-white transition hover:bg-blue-700"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => fetchCalendar()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                aria-label="Refresh calendar"
              >
                <RefreshIcon />
              </button>
            </div>

            <div className="relative w-full xl:max-w-[380px]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search events, grades, venues..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2 overflow-x-auto">
              {FILTERS.map((item) => {
                const active = category === item.key;
                const config = item.key !== "All" ? CATEGORY_CONFIG[item.key] : null;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setCategory(item.key)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-extrabold transition ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    {config && (
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : config.dot}`} />
                    )}
                    {item.label}
                  </button>
                );
              })}
              {(search || category !== "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-auto shrink-0 px-2 text-[9px] font-extrabold text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {calendarError && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
            <div className="text-xs font-bold text-red-800">Calendar operation failed.</div>
            <p className="mt-1 text-[11px] leading-5 text-red-700">{calendarError}</p>
          </div>
        )}

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.07)]">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50">
              {WEEKDAYS.map((day, index) => (
                <div
                  key={day.short}
                  className={`border-r border-slate-100 px-2 py-3 text-center ${
                    index === 0 || index === 6 ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  <span className="hidden text-[8px] font-black uppercase tracking-[0.18em] sm:block">
                    {day.full}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.16em] sm:hidden">
                    {day.short}
                  </span>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="grid min-h-[650px] place-items-center">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600" />
                  <p className="mt-3 text-xs font-bold text-slate-400">Loading calendar...</p>
                </div>
              </div>
            ) : (
              <div>
                {weeks.map((week, weekIndex) => (
                  <div key={`week-${weekIndex}`} className="grid grid-cols-7">
                    {week.map((date) => {
                      const dateKey = toDateKey(date);
                      const inMonth =
                        date.getMonth() === currentMonth.getMonth() &&
                        date.getFullYear() === currentMonth.getFullYear();
                      const isToday = dateKey === todayKey;
                      const isSelected = dateKey === selectedDate;

                      const dayEvents = filteredEvents
                        .filter((event) => eventOccursOn(event, dateKey))
                        .sort(
                          (a, b) =>
                            Number(isMultiDay(b)) -
                            Number(isMultiDay(a)) ||
                            a.title.localeCompare(b.title)
                        );

                      const visibleEvents = dayEvents.slice(0, 3);
                      const moreCount = Math.max(dayEvents.length - visibleEvents.length, 0);

                      return (
                        <div
                          key={dateKey}
                          className={`group relative min-h-[116px] border-b border-r border-slate-100 p-1.5 transition sm:min-h-[132px] sm:p-2 ${
                            !inMonth ? "bg-slate-50/80" : "bg-white"
                          } ${isSelected ? "bg-blue-50/60" : ""}`}
                        >
                          <button
                            type="button"
                            onClick={() => selectDate(dateKey)}
                            aria-label={`Select ${formatLongDate(dateKey)}`}
                            className="mb-1.5 flex w-full items-center justify-between text-left"
                          >
                            <span
                              className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[10px] font-black transition ${
                                isToday
                                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                  : isSelected
                                    ? "bg-blue-100 text-blue-700"
                                    : inMonth
                                      ? "text-slate-700 group-hover:bg-slate-100"
                                      : "text-slate-300"
                              }`}
                            >
                              {date.getDate()}
                            </span>
                            {isToday && (
                              <span className="text-[7px] font-black uppercase tracking-[0.12em] text-blue-600">
                                Today
                              </span>
                            )}
                          </button>

                          <div className="space-y-1">
                            {visibleEvents.map((event) => {
                              const config = CATEGORY_CONFIG[event.category];
                              const active = selectedEventId === event.id;
                              return (
                                <button
                                  key={`${event.id}-${dateKey}`}
                                  type="button"
                                  onClick={() => selectEvent(event, dateKey)}
                                  title={`${event.title} · ${formatPeriods(event.periods)}`}
                                  className={`group/event relative flex w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-lg border px-1.5 py-1.5 text-left transition ${
                                    active
                                      ? `${config.soft} ${config.border} ring-2 ring-blue-400/25`
                                      : `${config.pill} hover:brightness-[0.97]`
                                  }`}
                                >
                                  <span className={`absolute left-0 top-0 h-full w-0.5 ${config.accent}`} />
                                  <EventDot category={event.category} />
                                  <span className="min-w-0 flex-1 truncate text-[8px] font-extrabold leading-3 sm:text-[9px]">
                                    {event.title}
                                  </span>
                                </button>
                              );
                            })}

                            {moreCount > 0 && (
                              <button
                                type="button"
                                onClick={() => selectDate(dateKey)}
                                className="flex w-full items-center gap-1 px-1 text-left text-[8px] font-black text-slate-400 transition hover:text-blue-600"
                              >
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                +{moreCount} more
                              </button>
                            )}
                          </div>

                          {isSelected && (
                            <span className="pointer-events-none absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-blue-500" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {FILTERS.filter((item) => item.key !== "All").map((item) => (
                  <div key={item.key} className="inline-flex items-center gap-1.5 text-[8px] font-bold text-slate-500">
                    <span className={`h-1.5 w-1.5 rounded-full ${CATEGORY_CONFIG[item.key].dot}`} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.07)]">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#eef4ff] via-white to-[#f6f0ff] px-5 py-5">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-blue-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Selected day
                  </div>
                  {selectedDate === todayKey && (
                    <span className="rounded-full bg-blue-600 px-2 py-1 text-[7px] font-black uppercase tracking-[0.12em] text-white">
                      Today
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-xl font-black tracking-[-0.025em] text-slate-950">
                  {fromDateKey(selectedDate).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h2>
                <p className="mt-1 text-[10px] font-medium text-slate-400">
                  {selectedDateEvents.length === 0
                    ? "No events scheduled"
                    : `${selectedDateEvents.length} scheduled event${selectedDateEvents.length === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={() => openCreate(selectedDate)}
                className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-[10px] font-black text-white shadow-sm transition hover:bg-blue-700"
              >
                <PlusIcon />
                Add event on this date
              </button>

              {selectedDateEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center">
                  <div className="text-xs font-black text-slate-600">Nothing scheduled</div>
                  <p className="mt-1 text-[9px] leading-4 text-slate-400">
                    Use the button above to add an event.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDateEvents.map((event) => {
                    const config = CATEGORY_CONFIG[event.category];
                    const active = selectedEventId === event.id;

                    return (
                      <div
                        key={event.id}
                        className={`relative overflow-hidden rounded-2xl border p-3 transition ${
                          active
                            ? `${config.soft} ${config.border} shadow-sm`
                            : "border-slate-100 bg-white"
                        }`}
                      >
                        <span className={`absolute bottom-0 left-0 top-0 w-1 ${config.accent}`} />
                        <div className="pl-1">
                          <button
                            type="button"
                            onClick={() => selectEvent(event, selectedDate)}
                            className="w-full text-left"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${config.dot}`} />
                              <div className="min-w-0 flex-1">
                                <div className="text-[11px] font-black leading-4 text-slate-800">
                                  {event.title}
                                </div>
                                <div className={`mt-1 text-[7px] font-black uppercase tracking-[0.12em] ${config.text}`}>
                                  {event.category}
                                </div>
                                <p className="mt-1 text-[8px] font-semibold text-slate-400">
                                  {formatPeriods(event.periods)}
                                </p>
                              </div>
                            </div>
                          </button>

                          <div className="mt-3 flex gap-2 border-t border-slate-200/70 pt-2">
                            <button
                              type="button"
                              onClick={() => openEdit(event)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[8px] font-black text-slate-600 ring-1 ring-slate-200 hover:text-blue-700"
                            >
                              <EditIcon />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(event)}
                              disabled={deleting}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[8px] font-black text-red-500 ring-1 ring-red-100 hover:bg-red-50 disabled:opacity-50"
                            >
                              <TrashIcon />
                              {deleting ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedEvent && (
              <div className="border-t border-slate-100 p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`rounded-full border px-2 py-1 text-[7px] font-black uppercase tracking-[0.13em] ${CATEGORY_CONFIG[selectedEvent.category].pill}`}>
                    {selectedEvent.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => openEdit(selectedEvent)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[8px] font-black text-slate-600 hover:border-blue-200 hover:text-blue-700"
                  >
                    <EditIcon />
                    Edit
                  </button>
                </div>

                <h3 className="mt-3 text-base font-black leading-5 tracking-tight text-slate-950">
                  {selectedEvent.title}
                </h3>
                <p className="mt-1 text-[9px] font-semibold text-slate-400">
                  {formatPeriods(selectedEvent.periods)}
                </p>

                <div className="mt-3">
                  <DetailRow label="Audience" value={selectedEvent.target || "School Community"} />
                  <DetailRow label="Venue" value={selectedEvent.venue || "Not specified"} />
                  <DetailRow label="Time" value={selectedEvent.time || "Not specified"} />
                  <DetailRow label="Schedule" value={formatPeriods(selectedEvent.periods)} />
                </div>

                {selectedEvent.description && (
                  <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-[9px] leading-4 text-slate-600">
                    {selectedEvent.description}
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-slate-100 p-4">
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-blue-600">
                    <SparkIcon />
                    Up next
                  </div>
                  <div className="mt-0.5 text-sm font-black text-slate-800">Upcoming events</div>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-black text-slate-500">
                  {upcomingEvents.length}
                </span>
              </div>

              <div className="space-y-1">
                {upcomingEvents.map((event) => {
                  const config = CATEGORY_CONFIG[event.category];
                  const date = fromDateKey(firstEventDate(event));

                  return (
                    <button
                      key={`upcoming-${event.id}`}
                      type="button"
                      onClick={() => selectEvent(event)}
                      className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-slate-50"
                    >
                      <div className={`flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl ${config.soft}`}>
                        <div className={`text-[6px] font-black uppercase tracking-[0.12em] ${config.text}`}>
                          {date.toLocaleDateString("en-IN", { month: "short" })}
                        </div>
                        <div className={`text-sm font-black leading-4 ${config.text}`}>{date.getDate()}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} />
                          <span className="truncate text-[9px] font-black text-slate-700 group-hover:text-blue-700">
                            {event.title}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[8px] font-medium text-slate-400">
                          {formatPeriods(event.periods)}
                        </p>
                      </div>
                      <ChevronRight />
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-event-modal-title"
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[24px] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 id="calendar-event-modal-title" className="text-lg font-black text-slate-950">
                  {editingEventId ? "Edit calendar event" : "Add calendar event"}
                </h2>
                <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                  Changes are written directly to the school calendar.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 p-5 sm:p-6">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-bold leading-4 text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Event title
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                  placeholder="e.g. Mid-Term Exams"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((current) => ({ ...current, category: e.target.value as Category }))}
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  >
                    {FILTERS.filter((item) => item.key !== "All").map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Time
                  </label>
                  <input
                    value={form.time}
                    onChange={(e) => setForm((current) => ({ ...current, time: e.target.value }))}
                    placeholder="e.g. 10:00 AM"
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((current) => ({ ...current, startDate: e.target.value }))}
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                    End date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate || undefined}
                    onChange={(e) => setForm((current) => ({ ...current, endDate: e.target.value }))}
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Venue
                  </label>
                  <input
                    value={form.venue}
                    onChange={(e) => setForm((current) => ({ ...current, venue: e.target.value }))}
                    placeholder="e.g. Campus"
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Audience
                  </label>
                  <input
                    value={form.target}
                    onChange={(e) => setForm((current) => ({ ...current, target: e.target.value }))}
                    placeholder="e.g. Grades 7–12"
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                  placeholder="Optional details about the event"
                  rows={4}
                  className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-xs font-medium leading-5 text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-[10px] font-black text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                  {saving ? "Saving..." : editingEventId ? "Save changes" : "Add event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
