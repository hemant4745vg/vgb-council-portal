"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  formatMealWindow,
  getCurrentMealWindow,
  getNextMealWindow,
  getTimelineForDate,
  type TimelineEntry,
} from "@/lib/schedule";

type Category = "Flagship" | "Academic" | "Cultural" | "Exams" | "Sports" | "Excursion";

type CalendarEvent = {
  id: number;
  title: string;
  event_date: string;
  description?: string | null;
  event_time?: string | null;
  category?: Category | null;
  created_by?: string | null;
  target?: string | null;
};

type PortalProfile = {
  id: number;
  name: string | null;
  email: string;
  role: string | null;
  admin_status: string | null;
};

type NewsItem = {
  id: string | number;
  title: string;
  summary?: string | null;
  source: string;
  source_url: string;
  published_at: string;
  category: "India" | "World" | "Economy" | "Science & Tech";
  image_url?: string | null;
};

type WeatherData = {
  current: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    weatherCode: number;
    cloudCover: number;
    pressure: number;
    surfacePressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    uvIndex: number;
    isDay: boolean;
  };
  hourly: {
    time: string[];
    temperature: number[];
    apparentTemperature: number[];
    precipitationProbability: number[];
    precipitation: number[];
    weatherCode: number[];
    cloudCover: number[];
    humidity: number[];
    windSpeed: number[];
  };
  daily: {
    date: string[];
    weatherCode: number[];
    temperatureMax: number[];
    temperatureMin: number[];
    precipitationProbability: number[];
    precipitationSum: number[];
    rainSum: number[];
    showersSum: number[];
    uvMax: number[];
    sunrise: string[];
    sunset: string[];
  };
};



const VIDYAGYAN_LAT = "28.3835";
const VIDYAGYAN_LON = "77.7049";

function indiaDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);
}

function indiaHour(date = new Date()) {
  return Number(new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false }).format(date));
}

function indiaMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(date);
  return Number(parts.find((part) => part.type === "hour")?.value ?? 0) * 60 + Number(parts.find((part) => part.type === "minute")?.value ?? 0);
}

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  if (hour < 21) return "Good evening,";
  return "Good night,";
}

function formatEventDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

function formatNewsDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime12(value?: string) {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function minutesFrom(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function indiaWeekdayNumber(date = new Date()) {
  const label = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", weekday: "short" }).format(date);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(label);
}

const ACADEMIC_TOOLS = [
  { title: "Mathematics", kind: "math", mark: "∑", description: "Graphs, functions, calculations and mathematical workspaces.", href: "/tools/mathematics" },
  { title: "Physics", kind: "physics", mark: "◌", description: "Physical systems, formulas, motion and interactive models.", href: "/tools/physics" },
  { title: "Chemistry", kind: "chemistry", mark: "⌬", description: "Molecular structures, reactions and chemistry workspaces.", href: "/tools/chemistry" },
  { title: "Biology", kind: "biology", mark: "◈", description: "Systems, cells, membranes and biological simulations.", href: "/tools/biology" },
  { title: "Economics", kind: "economics", mark: "↗", description: "Economic models, curves and analytical tools.", href: "/tools/economics" },
  { title: "Geography", kind: "geography", mark: "⌁", description: "Maps, spatial systems and geographic exploration.", href: "/tools/geography" },
  { title: "History", kind: "history", mark: "│", description: "Chronology, historical context and visual study tools.", href: "/tools/history" },
  { title: "Political Science", kind: "politics", mark: "◎", description: "Institutions, ideas, constitutions and political systems.", href: "/tools/political-science" },
];

const FOOTER_LINKS = [
  { group: "Portal", links: [{ title: "News", href: "/news" }, { title: "Calendar", href: "/calendar" }, { title: "Daily Timeline", href: "/timetable" }, { title: "Tools", href: "/tools" }] },
  { group: "Campus", links: [{ title: "Cafeteria", href: "/cafeteria" }, { title: "Study Materials", href: "/study-material" }, { title: "Activities", href: "/activities" }] },
  { group: "Community", links: [{ title: "Council", href: "/council" }, { title: "Leadership", href: "/leadership" }, { title: "Editorial", href: "/editorial" }] },
];

function getTimelineForToday() {
  return getTimelineForDate();
}

function eventStartMinutes(value?: string | null) {
  if (!value) return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = match[3]?.toUpperCase();
  if (suffix === "PM" && hours < 12) hours += 12;
  if (suffix === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function currentTimelineEntry(now: number, entries: TimelineEntry[]) {
  return entries.find((entry) => {
    const start = minutesFrom(entry.start);
    const end = entry.end ? minutesFrom(entry.end) : start + 30;
    return now >= start && now < end && (!entry.days || entry.days.includes(indiaWeekdayNumber()));
  });
}

function nextTimelineEntry(now: number, entries: TimelineEntry[]) {
  return entries.find((entry) => minutesFrom(entry.start) > now && (!entry.days || entry.days.includes(indiaWeekdayNumber())));
}

function weatherLabel(code: number) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Changing conditions";
}

function windDirection(degrees: number) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(degrees / 45) % 8];
}

function formatForecastTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });
}

function formatForecastDay(value: string, index: number) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

function ClockDigit({ value }: { value: string }) {
  const [displayed, setDisplayed] = useState(value);
  const [incoming, setIncoming] = useState(value);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (value === displayed) return;

    setIncoming(value);
    setRolling(false);
    const frame = window.requestAnimationFrame(() => setRolling(true));
    const timer = window.setTimeout(() => {
      setDisplayed(value);
      setRolling(false);
      setIncoming(value);
    }, 560);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [value, displayed]);

  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-bottom" aria-hidden="true">
      <span
        className={`absolute inset-x-0 top-0 flex flex-col will-change-transform ${rolling ? "clock-digit-roll" : "translate-y-0"}`}
      >
        <span className="flex h-[1em] shrink-0 items-center justify-center">{displayed}</span>
        <span className="flex h-[1em] shrink-0 items-center justify-center">{incoming}</span>
      </span>
    </span>
  );
}

function ClockDisplay({ time, date }: { time: string; date: string }) {
  const match = time.match(/^(\d{2}):(\d{2}):(\d{2})\s?(AM|PM)$/i);
  const digits = match ? `${match[1]}${match[2]}${match[3]}` : "000000";
  const meridiem = match?.[4]?.toUpperCase() ?? "";

  return (
    <div className="text-right">
      <div className="font-mono text-[clamp(3.5rem,7vw,7.8rem)] font-medium leading-none tracking-[-0.09em] text-white tabular-nums">
        <ClockDigit value={digits[0]} /><ClockDigit value={digits[1]} /><span className="mx-[.025em] text-blue-200/70">:</span><ClockDigit value={digits[2]} /><ClockDigit value={digits[3]} /><span className="mx-[.025em] text-blue-200/70">:</span><ClockDigit value={digits[4]} /><ClockDigit value={digits[5]} />
        <span className="ml-3 align-[.14em] font-sans text-[.2em] font-semibold tracking-[.02em] text-blue-200">{meridiem}</span>
      </div>
      <div className="mt-5 text-xl font-medium tracking-[-0.025em] text-white sm:text-2xl">{date}</div>
      <div className="mt-4 flex justify-end gap-2 text-[9px] font-bold uppercase tracking-[.18em] text-blue-200/75 sm:text-[10px]">
        <span className="h-1.5 w-1.5 self-center rounded-full bg-blue-300 shadow-[0_0_14px_3px_rgba(147,197,253,.35)]" />
        Indian Standard Time · UTC +05:30
      </div>
    </div>
  );
}

function HeroField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(147,197,253,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(147,197,253,.045)_1px,transparent_1px)] [background-size:72px_72px] [transform:perspective(900px)_rotateX(62deg)_scale(1.35)] [transform-origin:center_bottom]" />
      <div className="absolute right-[-8%] top-[-20%] h-[700px] w-[700px] rounded-full bg-blue-500/[.08] blur-3xl" />
      <div className="absolute left-[-12%] bottom-[-34%] h-[560px] w-[900px] rounded-full bg-blue-900/[.22] blur-3xl" />

      <svg viewBox="0 0 1600 760" preserveAspectRatio="none" className="absolute inset-0 h-full w-full text-blue-300/25" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M-40 72 C180 20 340 120 520 58 S860 35 1010 100 S1330 150 1640 42" opacity=".52" />
          <path d="M-40 122 C170 70 330 155 535 104 S830 75 1000 142 S1330 190 1640 105" opacity=".38" />
          <path d="M-40 174 C180 125 360 215 570 155 S850 130 1050 198 S1370 250 1640 168" opacity=".26" />
          <path d="M-40 410 C190 340 330 455 560 385 S850 325 1080 402 S1390 470 1640 365" opacity=".55" />
          <path d="M-40 458 C190 390 370 505 600 432 S860 380 1090 448 S1390 520 1640 420" opacity=".38" />
          <path d="M-40 510 C200 438 370 558 620 485 S900 435 1110 500 S1400 565 1640 470" opacity=".25" />
          <path d="M-40 620 C180 560 390 660 610 605 S900 545 1120 615 S1400 680 1640 585" opacity=".28" />
        </g>
        <g fill="currentColor">
          <circle cx="118" cy="88" r="6" opacity=".78" />
          <circle cx="585" cy="67" r="6" opacity=".68" />
          <circle cx="1015" cy="100" r="5" opacity=".6" />
          <circle cx="1280" cy="144" r="7" opacity=".75" />
          <circle cx="430" cy="432" r="6" opacity=".72" />
          <circle cx="915" cy="380" r="6" opacity=".65" />
          <circle cx="1370" cy="470" r="5" opacity=".6" />
        </g>
        <g fill="none" stroke="currentColor" strokeWidth="1" opacity=".35">
          <circle cx="118" cy="88" r="23" />
          <circle cx="585" cy="67" r="23" />
          <circle cx="1280" cy="144" r="26" />
          <circle cx="430" cy="432" r="23" />
          <circle cx="915" cy="380" r="23" />
        </g>
      </svg>

      <div className="absolute right-[18%] top-[16%] h-[3px] w-[3px] rounded-full bg-cyan-200/70 shadow-[0_0_28px_8px_rgba(103,232,249,.1)] hero-pulse" />
      <div className="absolute left-[8%] bottom-[17%] h-[2px] w-[2px] rounded-full bg-blue-300/60 hero-pulse" />
      <div className="absolute right-[20%] top-[50%] h-[520px] w-[520px] -translate-y-1/2 rounded-full border border-blue-200/[.04] hero-orbit" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#06142f] to-transparent" />
    </div>
  );
}

function SectionHeader({ eyebrow, title, description, href, label }: { eyebrow: string; title: string; description?: string; href?: string; label?: string }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[.24em] text-blue-700">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-.055em] text-slate-950 sm:text-4xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {href && <Link href={href} className="shrink-0 text-[10px] font-black uppercase tracking-[.16em] text-blue-700 transition hover:text-blue-950">{label ?? "Explore ↗"}</Link>}
    </div>
  );
}

function TimelineGraphic() {
  return (
    <svg viewBox="0 0 220 180" className="h-full w-full" aria-hidden="true">
      <circle cx="112" cy="88" r="57" fill="none" stroke="currentColor" strokeWidth="2" opacity=".14" />
      <circle cx="112" cy="88" r="45" fill="currentColor" opacity=".035" />
      <circle cx="112" cy="88" r="39" fill="none" stroke="currentColor" strokeWidth="2" opacity=".32" />
      <path d="M112 88V61M112 88L134 100" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".7" />
      <circle cx="112" cy="88" r="4" fill="currentColor" opacity=".9" />
      <path d="M112 28v10M112 138v10M52 88h10M162 88h10" stroke="currentColor" strokeWidth="2" opacity=".22" />
      <circle cx="112" cy="88" r="67" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 8" opacity=".2" />
    </svg>
  );
}

function CalendarGraphic() {
  return (
    <svg viewBox="0 0 220 180" className="h-full w-full" aria-hidden="true">
      <rect x="42" y="40" width="136" height="106" rx="10" fill="currentColor" opacity=".035" stroke="currentColor" strokeWidth="2" />
      <path d="M42 70H178" stroke="currentColor" strokeWidth="2" opacity=".3" />
      <path d="M72 30v25M148 30v25" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity=".55" />
      {Array.from({ length: 12 }).map((_, i) => {
        const x = 65 + (i % 4) * 30;
        const y = 88 + Math.floor(i / 4) * 22;
        return <circle key={i} cx={x} cy={y} r={i === 5 ? 7 : 3} fill="currentColor" opacity={i === 5 ? ".45" : ".16"} />;
      })}
      <path d="M143 119l8 8 17-20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".6" />
    </svg>
  );
}

function CafeteriaGraphic() {
  return (
    <svg viewBox="0 0 220 180" className="h-full w-full" aria-hidden="true">
      <ellipse cx="112" cy="137" rx="69" ry="13" fill="currentColor" opacity=".08" />
      <ellipse cx="112" cy="125" rx="58" ry="25" fill="currentColor" opacity=".07" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="112" cy="116" rx="45" ry="18" fill="currentColor" opacity=".12" />
      <path d="M72 105c5-22 22-34 40-34s35 12 40 34" fill="none" stroke="currentColor" strokeWidth="3" opacity=".45" />
      <path d="M83 81c-4-13 6-24 17-28M112 76V45M141 81c4-13-6-24-17-28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".22" />
      <circle cx="96" cy="108" r="5" fill="currentColor" opacity=".3" /><circle cx="112" cy="103" r="7" fill="currentColor" opacity=".2" /><circle cx="129" cy="109" r="5" fill="currentColor" opacity=".3" />
    </svg>
  );
}

function PanelGraphic({ kind }: { kind: "timeline" | "calendar" | "cafeteria" }) {
  const common = "pointer-events-none absolute -right-1 -top-2 h-44 w-48 opacity-[.18] transition duration-700 group-hover:scale-105 group-hover:opacity-[.28]";
  if (kind === "timeline") return <div className={`${common} text-blue-600`}><TimelineGraphic /></div>;
  if (kind === "calendar") return <div className={`${common} text-violet-600`}><CalendarGraphic /></div>;
  return <div className={`${common} text-amber-600`}><CafeteriaGraphic /></div>;
}

function TimelinePanel({ current, next }: { current?: TimelineEntry; next?: TimelineEntry }) {
  return (
    <Link href="/timetable" className="group relative block min-h-[270px] overflow-hidden border border-slate-200 bg-white p-7 transition duration-500 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_70px_-50px_rgba(23,70,199,.7)] sm:p-8">
      <PanelGraphic kind="timeline" />
      <div className="relative z-10 flex items-start justify-between"><span className="text-[9px] font-black uppercase tracking-[.2em] text-blue-700">Timeline · now</span><span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700">↗</span></div>
      <div className="relative z-10 mt-10 max-w-[72%]">
        <p className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">Current event</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-slate-950">{current?.title ?? "Between scheduled activities"}</h3>
        <p className="mt-2 text-sm text-slate-500">{current?.end ? `Until ${formatTime12(current.end)}` : current ? `From ${formatTime12(current.start)}` : "No published activity at this moment."}</p>
      </div>
      <div className="relative z-10 mt-8 border-t border-slate-100 pt-4"><span className="text-[9px] font-black uppercase tracking-[.16em] text-slate-400">Up next</span><p className="mt-2 text-sm font-semibold text-slate-800">{next?.title ?? "No later activity today"}{next?.start ? ` · ${formatTime12(next.start)}` : ""}</p></div>
    </Link>
  );
}

function CalendarPanel({ current, next, today }: { current?: CalendarEvent; next?: CalendarEvent; today: string }) {
  return (
    <Link href="/calendar" className="group relative block min-h-[270px] overflow-hidden border border-slate-200 bg-white p-7 transition duration-500 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_24px_70px_-50px_rgba(109,40,217,.45)] sm:p-8">
      <PanelGraphic kind="calendar" />
      <div className="relative z-10 flex items-start justify-between"><span className="text-[9px] font-black uppercase tracking-[.2em] text-blue-700">Calendar · campus</span><span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700">↗</span></div>
      <div className="relative z-10 mt-10 max-w-[72%]">
        {current ? <><p className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">Current event</p><h3 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-slate-950">{current.title}</h3><p className="mt-2 text-sm text-slate-500">Today{current.event_time ? ` · ${current.event_time}` : ""}</p></> : <><p className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">Next event</p><h3 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-slate-950">{next?.title ?? "No upcoming event"}</h3><p className="mt-2 text-sm text-slate-500">{next ? `${next.event_date === today ? "Today" : formatEventDate(next.event_date)}${next.event_time ? ` · ${next.event_time}` : ""}` : "The calendar is clear."}</p></>}
      </div>
      {current && next && current.id !== next.id && <div className="relative z-10 mt-8 border-t border-slate-100 pt-4"><span className="text-[9px] font-black uppercase tracking-[.16em] text-slate-400">Next</span><p className="mt-2 text-sm font-semibold text-slate-800">{next.title} · {next.event_date === today ? "Today" : formatEventDate(next.event_date)}</p></div>}
    </Link>
  );
}

function CafeteriaPanel({ totalMinutes }: { totalMinutes: number }) {
  const current = getCurrentMealWindow(totalMinutes);
  const next = getNextMealWindow(totalMinutes);
  const active = current ?? next;
  const isNext = !current;
  return (
    <Link href="/cafeteria" className="group relative block min-h-[270px] overflow-hidden border border-slate-200 bg-[#fbfaf7] p-7 transition duration-500 hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_24px_70px_-50px_rgba(146,104,24,.35)] sm:p-8">
      <PanelGraphic kind="cafeteria" />
      <div className="relative z-10 flex items-start justify-between"><span className="text-[9px] font-black uppercase tracking-[.2em] text-amber-700">Cafeteria · {isNext ? "next" : "now"}</span><span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-amber-700">↗</span></div>
      <div className="relative z-10 mt-10 max-w-[72%]">
        <p className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">{isNext ? "Next meal" : "Current meal"}</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-slate-950">{active?.title ?? "Campus meals"}</h3>
        <p className="mt-2 text-sm text-slate-500">{active ? formatMealWindow(active) : "Daily cafeteria schedule"}</p>
      </div>
      <div className="relative z-10 mt-8 flex items-center gap-2 text-[9px] font-black uppercase tracking-[.16em] text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Campus dining</div>
    </Link>
  );
}

function WeatherVisual({ isDay, code }: { isDay: boolean; code: number }) {
  const rainy = code >= 51 && code <= 67 || code >= 80 && code <= 82;
  const storm = code >= 95;
  const cloudy = code >= 1 && code <= 48;
  return (
    <div className="relative h-36 w-40 shrink-0 overflow-hidden rounded-[2rem] border border-cyan-100/10 bg-white/[.035] shadow-[inset_0_0_50px_rgba(56,189,248,.05)] sm:h-40 sm:w-44">
      <div className={`absolute inset-0 ${isDay ? "bg-[radial-gradient(circle_at_68%_32%,rgba(253,224,71,.22),transparent_28%),linear-gradient(145deg,rgba(14,165,233,.12),transparent)" : "bg-[radial-gradient(circle_at_68%_28%,rgba(191,219,254,.16),transparent_24%),linear-gradient(145deg,rgba(37,99,235,.12),transparent)"}`} />
      {isDay ? <div className="absolute right-7 top-7 h-14 w-14 rounded-full bg-amber-200/80 shadow-[0_0_45px_18px_rgba(253,224,71,.16)]" /> : <div className="absolute right-8 top-7 h-14 w-14 rounded-full bg-slate-100/75 shadow-[0_0_42px_14px_rgba(191,219,254,.13)] after:absolute after:-right-2 after:top-[-2px] after:h-14 after:w-14 after:rounded-full after:bg-[#0a2854]" />}
      {!isDay && Array.from({ length: 8 }).map((_, i) => <span key={i} className="absolute h-1 w-1 rounded-full bg-blue-100/45" style={{ left: `${18 + (i * 19) % 72}%`, top: `${15 + (i * 23) % 48}%` }} />)}
      {cloudy && <div className="absolute bottom-8 left-7 h-8 w-24 rounded-full bg-blue-50/35 shadow-[0_0_28px_rgba(147,197,253,.1)]"><span className="absolute -left-1 bottom-1 h-8 w-8 rounded-full bg-blue-50/35" /><span className="absolute left-8 bottom-3 h-10 w-10 rounded-full bg-blue-50/40" /><span className="absolute right-2 bottom-1 h-7 w-7 rounded-full bg-blue-50/30" /></div>}
      {rainy && <div className="absolute inset-x-9 bottom-2 flex justify-between opacity-70">{Array.from({ length: 6 }).map((_, i) => <span key={i} className="weather-rain h-6 w-px rotate-[18deg] bg-cyan-200/55" style={{ animationDelay: `${i * 180}ms` }} />)}</div>}
      {storm && <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-3xl text-amber-200/80">ϟ</div>}
      <div className="absolute inset-x-5 bottom-4 flex items-center justify-between text-[8px] font-black uppercase tracking-[.16em] text-cyan-100/45"><span>{isDay ? "DAYLIGHT" : "NIGHT"}</span><span>{rainy ? "RAIN" : storm ? "STORM" : cloudy ? "CLOUD" : "CLEAR"}</span></div>
    </div>
  );
}

function MapExplorer() {
  const mapEmbedUrl = `https://www.google.com/maps?q=${VIDYAGYAN_LAT},${VIDYAGYAN_LON}&t=k&z=17&output=embed`;
  return (
    <div className="relative h-full min-h-[520px] overflow-hidden rounded-[1.25rem] border border-slate-200 bg-[#dfe7ee] text-white shadow-[0_30px_90px_-60px_rgba(37,99,235,.45)] sm:min-h-[560px] lg:min-h-0">
      <iframe
        title="Interactive VidyaGyan campus map"
        src={mapEmbedUrl}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-2xl border border-white/30 bg-[#06142f]/80 px-4 py-3 shadow-lg backdrop-blur-md">
        <p className="text-[8px] font-black uppercase tracking-[.18em] text-cyan-200">Campus location</p>
        <p className="mt-1 text-sm font-semibold text-white">VidyaGyan · Bulandshahr</p>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between bg-gradient-to-t from-[#06142f]/80 via-[#06142f]/25 to-transparent px-5 pb-5 pt-20">
        <div><p className="text-[8px] font-black uppercase tracking-[.16em] text-white/55">Interactive map</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.14em] text-white/75">28.3835° N · 77.7049° E</p></div>
        <span className="text-[8px] font-black uppercase tracking-[.14em] text-cyan-200">Google Maps · Pan · Zoom · Directions</span>
      </div>
    </div>
  );
}

function AcademicVisual({ kind }: { kind: string }) {
  if (kind === "math") return <svg viewBox="0 0 420 240" className="h-full w-full"><g stroke="currentColor" strokeOpacity=".16">{Array.from({ length: 11 }).map((_, i) => <line key={`v${i}`} x1={i * 42} y1="0" x2={i * 42} y2="240" />)}{Array.from({ length: 7 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 40} x2="420" y2={i * 40} />)}</g><path d="M0 190 C70 190 85 45 160 80 S260 220 330 85 S380 60 420 40" fill="none" stroke="currentColor" strokeWidth="3" /><circle cx="264" cy="171" r="5" fill="currentColor" className="subject-dot" /></svg>;
  if (kind === "physics") return <svg viewBox="0 0 420 240" className="h-full w-full"><ellipse cx="210" cy="120" rx="130" ry="52" fill="none" stroke="currentColor" strokeWidth="2" opacity=".4" /><ellipse cx="210" cy="120" rx="70" ry="125" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".24" transform="rotate(-28 210 120)" /><circle cx="210" cy="120" r="17" fill="currentColor" opacity=".18" /><circle cx="325" cy="104" r="6" fill="currentColor" className="subject-dot" /></svg>;
  if (kind === "chemistry") return <svg viewBox="0 0 420 240" className="h-full w-full"><g stroke="currentColor" strokeWidth="1.5" opacity=".35"><line x1="210" y1="120" x2="120" y2="65" /><line x1="210" y1="120" x2="300" y2="65" /><line x1="210" y1="120" x2="300" y2="180" /><line x1="210" y1="120" x2="120" y2="180" /></g>{[[210,120,18],[120,65,10],[300,65,10],[300,180,10],[120,180,10]].map(([x,y,r], i) => <circle key={i} cx={x} cy={y} r={r} fill="currentColor" opacity={i === 0 ? ".28" : ".13"} />)}</svg>;
  if (kind === "biology") return <svg viewBox="0 0 420 240" className="h-full w-full"><circle cx="210" cy="120" r="82" fill="none" stroke="currentColor" strokeWidth="2" opacity=".3" /><circle cx="210" cy="120" r="29" fill="currentColor" opacity=".16" /><path d="M140 120 C165 75 190 165 220 115 S275 60 295 125" fill="none" stroke="currentColor" strokeWidth="2" opacity=".55" /><circle cx="150" cy="95" r="5" fill="currentColor" className="subject-dot" /></svg>;
  if (kind === "economics") return <svg viewBox="0 0 420 240" className="h-full w-full"><path d="M55 205H385M55 205V25" fill="none" stroke="currentColor" opacity=".25" /><path d="M75 45 C145 78 205 118 365 188" fill="none" stroke="currentColor" strokeWidth="3" opacity=".55" /><path d="M75 185 C145 160 205 95 365 48" fill="none" stroke="currentColor" strokeWidth="3" opacity=".42" /><circle cx="221" cy="123" r="5" fill="currentColor" className="subject-dot" /></svg>;
  if (kind === "geography") return <svg viewBox="0 0 420 240" className="h-full w-full"><g fill="none" stroke="currentColor"><ellipse cx="210" cy="120" rx="175" ry="86" opacity=".22" /><ellipse cx="210" cy="120" rx="140" ry="67" opacity=".27" /><ellipse cx="210" cy="120" rx="105" ry="48" opacity=".32" /><ellipse cx="210" cy="120" rx="70" ry="31" opacity=".38" /><path d="M35 155 C90 100 128 170 178 116 S270 64 340 120 S385 162 405 140" opacity=".46" /></g></svg>;
  if (kind === "history") return <svg viewBox="0 0 420 240" className="h-full w-full"><path d="M45 160 H375" stroke="currentColor" strokeWidth="2" opacity=".35" />{[80,155,230,305].map((x, i) => <g key={x}><line x1={x} y1="130" x2={x} y2="190" stroke="currentColor" opacity=".35" /><circle cx={x} cy="160" r="7" fill="currentColor" opacity={i === 1 ? ".35" : ".16"} className={i === 1 ? "subject-dot" : ""} /></g>)}<path d="M80 112 C125 65 165 100 205 72 S290 100 340 48" fill="none" stroke="currentColor" strokeWidth="2" opacity=".38" /></svg>;
  return <svg viewBox="0 0 420 240" className="h-full w-full"><g stroke="currentColor" strokeWidth="1.5" opacity=".3"><line x1="210" y1="120" x2="85" y2="55" /><line x1="210" y1="120" x2="330" y2="55" /><line x1="210" y1="120" x2="105" y2="195" /><line x1="210" y1="120" x2="330" y2="195" /></g>{[[210,120,11],[85,55,7],[330,55,7],[105,195,7],[330,195,7]].map(([x,y,r], i) => <circle key={i} cx={x} cy={y} r={r} fill="currentColor" opacity={i === 0 ? ".42" : ".18"} />)}</svg>;
}

function ForecastMetric({ label, value }: { label: string; value: string }) {
  return <div className="border-l border-blue-100 pl-4"><p className="text-[9px] font-black uppercase tracking-[.16em] text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-900">{value}</p></div>;
}

export default function Home() {
  const supabase = createClient();
  const [clock, setClock] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [hour, setHour] = useState<number>(0);
  const [minute, setMinute] = useState<number>(0);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
      setDateLabel(now.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", weekday: "long", day: "2-digit", month: "long", year: "numeric" }));
      setHour(indiaHour(now));
      setMinute(indiaMinutes(now));
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const params = new URLSearchParams({
          latitude: VIDYAGYAN_LAT,
          longitude: VIDYAGYAN_LON,
          current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,visibility,uv_index,is_day",
          hourly: "temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,relative_humidity_2m,wind_speed_10m",
          daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,rain_sum,showers_sum,uv_index_max,sunrise,sunset",
          timezone: "Asia/Kolkata",
          forecast_days: "4",
        });
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Weather request failed");
        const data = await response.json();
        if (!active) return;
        const current = data.current;
        const daily = data.daily;
        setWeather({
          current: {
            temperature: current.temperature_2m,
            apparentTemperature: current.apparent_temperature,
            humidity: current.relative_humidity_2m,
            precipitation: current.precipitation,
            rain: current.rain,
            showers: current.showers,
            snowfall: current.snowfall,
            weatherCode: current.weather_code,
            cloudCover: current.cloud_cover,
            pressure: current.pressure_msl,
            surfacePressure: current.surface_pressure,
            windSpeed: current.wind_speed_10m,
            windDirection: current.wind_direction_10m,
            visibility: current.visibility,
            uvIndex: current.uv_index,
            isDay: Boolean(current.is_day),
          },
          hourly: {
            time: data.hourly.time,
            temperature: data.hourly.temperature_2m,
            apparentTemperature: data.hourly.apparent_temperature,
            precipitationProbability: data.hourly.precipitation_probability,
            precipitation: data.hourly.precipitation,
            weatherCode: data.hourly.weather_code,
            cloudCover: data.hourly.cloud_cover,
            humidity: data.hourly.relative_humidity_2m,
            windSpeed: data.hourly.wind_speed_10m,
          },
          daily: {
            date: daily.time,
            weatherCode: daily.weather_code,
            temperatureMax: daily.temperature_2m_max,
            temperatureMin: daily.temperature_2m_min,
            precipitationProbability: daily.precipitation_probability_max,
            precipitationSum: daily.precipitation_sum,
            rainSum: daily.rain_sum,
            showersSum: daily.showers_sum,
            uvMax: daily.uv_index_max,
            sunrise: daily.sunrise,
            sunset: daily.sunset,
          },
        });
      } catch (error) {
        console.error("Unable to load VidyaGyan weather:", error);
      } finally {
        if (active) setWeatherLoading(false);
      }
    };
    load();
    const timer = window.setInterval(load, 15 * 60 * 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        if (!session?.user?.email) { setProfile(null); setProfileLoading(false); return; }
        const { data, error } = await supabase.rpc("get_my_portal_profile");
        if (!active) return;
        if (error) throw error;
        const row = Array.isArray(data) ? data[0] : data;
        setProfile(row ? { id: Number(row.id), name: row.name ?? null, email: row.email ?? session.user.email, role: row.role ?? null, admin_status: row.admin_status ?? null } : null);
      } catch (error) {
        console.error("Unable to load portal profile:", error);
        if (active) setProfile(null);
      } finally {
        if (active) setProfileLoading(false);
      }
    };
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(load);
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const today = indiaDateKey();
      const { data, error } = await supabase.from("calendar_events").select("id, title, event_date, description, event_time, category, created_by, target").gte("event_date", today).order("event_date", { ascending: true }).order("event_time", { ascending: true });
      if (!active) return;
      if (error) { console.error("Unable to fetch calendar events:", error); setEvents([]); return; }
      setEvents((data ?? []) as CalendarEvent[]);
    };
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data, error } = await supabase.from("news_items").select("id, title, summary, source, source_url, published_at, category, image_url").order("published_at", { ascending: false }).limit(6);
        if (error) throw error;
        const seen = new Set<string>();
        const clean = ((data ?? []) as NewsItem[]).filter((item) => { const key = `${item.title.trim().toLowerCase()}|${item.source}`; if (seen.has(key)) return false; seen.add(key); return true; });
        if (active) setNews(clean);
      } catch (error) {
        console.error("Unable to load homepage news:", error);
        if (active) setNews([]);
      } finally {
        if (active) setNewsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const today = indiaDateKey();
  const todayEvents = useMemo(() => events.filter((event) => event.event_date === today), [events, today]);
  const upcomingEvents = useMemo(() => events.filter((event) => event.event_date >= today), [events, today]);
  const currentCalendar = useMemo(() => todayEvents.find((event) => {
    if (!event.event_time) return false;
    const match = event.event_time.match(/(\d{1,2}):(\d{2})/);
    if (!match) return false;
    const start = eventStartMinutes(event.event_time);
    return start !== null && minute >= start && minute < start + 60;
  }), [todayEvents, minute]);
  const nextCalendar = currentCalendar ? todayEvents.find((event) => event.id !== currentCalendar.id) ?? upcomingEvents.find((event) => event.id !== currentCalendar.id) : upcomingEvents[0];
  const timelineEntries = useMemo(getTimelineForToday, []);
  const currentTimeline = useMemo(() => currentTimelineEntry(minute, timelineEntries), [minute, timelineEntries]);
  const nextTimeline = useMemo(() => nextTimelineEntry(minute, timelineEntries), [minute, timelineEntries]);
  const isSignedIn = Boolean(profile);
  const firstName = profile?.name?.trim()?.split(/\s+/)[0] ?? "VIDYAGYAN";
  const greeting = isSignedIn ? greetingFor(hour) : "Welcome to,";
  const featuredNews = news[0];
  const secondaryNews = news.slice(1, 4);
  const todayHourly = useMemo(() => {
    if (!weather) return [];
    return weather.hourly.time.map((time, index) => ({ time, temperature: weather.hourly.temperature[index], apparent: weather.hourly.apparentTemperature[index], rainProbability: weather.hourly.precipitationProbability[index], precipitation: weather.hourly.precipitation[index], code: weather.hourly.weatherCode[index], cloud: weather.hourly.cloudCover[index] })).filter((item) => item.time.startsWith(today)).slice(0, 24);
  }, [weather, today]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f8fc] text-[#0f172a]">
      <style jsx global>{`
        @keyframes heroOrbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes heroPulse { 0%,100% { opacity:.25; transform:scale(.8); } 50% { opacity:1; transform:scale(1.08); } }
        @keyframes clockDigitRoll { from { transform:translate3d(0,0,0); } to { transform:translate3d(0,-1em,0); } }
        @keyframes weatherRain { 0% { transform:translateY(-60px); opacity:0; } 20% { opacity:.65; } 100% { transform:translateY(300px); opacity:0; } }
        @keyframes subjectFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
        .hero-orbit { animation:heroOrbit 48s linear infinite; }
        .hero-pulse { animation:heroPulse 4s ease-in-out infinite; }
        .clock-digit-roll { animation:clockDigitRoll 520ms cubic-bezier(.16,1,.3,1) forwards; }
        .hero-contours { animation:heroContour 14s ease-in-out infinite; transform-box:fill-box; }
        .weather-rain { animation:weatherRain 1.7s linear infinite; }
        .weather-pulse { animation:heroPulse 2s ease-in-out infinite; }
        .subject-dot { animation:subjectFloat 4s ease-in-out infinite; transform-box:fill-box; transform-origin:center; }
        @media (prefers-reduced-motion: reduce) {
          .hero-orbit,.hero-pulse,.weather-rain,.weather-pulse,.subject-dot,.clock-digit-roll { animation:none !important; }
          * { scroll-behavior:auto !important; }
        }
      `}</style>

      <main>
        {/* HERO */}
        <section className="relative min-h-[720px] overflow-hidden bg-[#06142f] text-white lg:min-h-[760px]">
          <HeroField />
          <div className="relative mx-auto flex min-h-[720px] max-w-[1500px] flex-col justify-center px-6 py-24 sm:px-10 lg:min-h-[760px] lg:px-16 xl:px-20">
            <div className="grid items-center gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-10">
              <div className="relative z-10 max-w-xl">
                <p className="hero-reveal text-[10px] font-black uppercase tracking-[.3em] text-blue-300">VidyaGyan Student Portal</p>
                <p className="mt-10 text-[clamp(1.05rem,1.7vw,1.5rem)] font-medium tracking-[-.035em] text-blue-100/95">{greeting}</p>
                <h1 className="mt-1 text-[clamp(4rem,9vw,8.5rem)] font-semibold leading-[.86] tracking-[-.09em] text-white">{firstName.toUpperCase()}</h1>
                <div className="mt-9 border-l border-blue-400/50 pl-5">
                  <p className="text-[11px] font-black uppercase tracking-[.2em] text-blue-100/80">{profileLoading ? "Student Portal" : profile?.role || "Student Portal"}</p>
                  <p className="mt-2 text-sm font-medium tracking-[.02em] text-blue-100/65">VIDYAGYAN · 2026–27</p>
                </div>
              </div>
              <div className="relative z-10 flex translate-y-4 justify-end lg:translate-y-5">
                <ClockDisplay time={clock} date={dateLabel} />
              </div>
            </div>
            <div className="absolute bottom-9 left-6 right-6 flex items-center justify-between border-t border-white/10 pt-4 sm:left-10 sm:right-10 lg:left-16 lg:right-16 xl:left-20 xl:right-20">
              <span className="text-[9px] font-bold uppercase tracking-[.22em] text-blue-200/35">VGB · BULANDSHAHR · INDIA</span>
              <span className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[.22em] text-blue-200/45"><span>Scroll to explore</span><span className="h-8 w-px bg-blue-300/25" /><span>↓</span></span>
            </div>
          </div>
        </section>

        {/* TODAY */}
        <section className="mx-auto max-w-[1500px] px-6 py-16 sm:px-10 lg:px-16 lg:py-20 xl:px-20">
          <SectionHeader eyebrow="Today at VGB" title="What is happening now." description="Three live contexts from the campus, without turning the homepage into a duplicate timetable or calendar." />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <TimelinePanel current={currentTimeline} next={nextTimeline} />
            <CalendarPanel current={currentCalendar} next={nextCalendar} today={today} />
            <CafeteriaPanel totalMinutes={minute} />
          </div>
        </section>

        {/* NEWS */}
        <section className="bg-white">
          <div className="mx-auto max-w-[1500px] px-6 py-16 sm:px-10 lg:px-16 lg:py-20 xl:px-20">
            <SectionHeader eyebrow="The world, right now" title="The news portal, without the clutter." description="A curated homepage window into the live news feed. The full newsroom remains at /news." href="/news" label="Open news desk ↗" />
            {newsLoading ? <div className="mt-8 grid gap-7 lg:grid-cols-[1.35fr_.65fr]"><div className="h-[430px] animate-pulse bg-slate-100" /><div className="h-[430px] animate-pulse bg-slate-100" /></div> : featuredNews ? <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_.65fr]">
              <a href={featuredNews.source_url} target="_blank" rel="noreferrer" className="group relative min-h-[430px] overflow-hidden bg-[#071633] text-white">
                {featuredNews.image_url ? <img src={featuredNews.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-[1.035]" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(59,130,246,.42),transparent_30%),linear-gradient(135deg,#071633,#1746c7)]" />}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06142f] via-[#06142f]/30 to-transparent" />
                <div className="relative flex min-h-[430px] flex-col justify-end p-7 sm:p-10"><p className="text-[9px] font-black uppercase tracking-[.22em] text-blue-200">{featuredNews.category} · {featuredNews.source}</p><h3 className="mt-4 max-w-4xl text-3xl font-semibold leading-[1.02] tracking-[-.055em] sm:text-5xl">{featuredNews.title}</h3>{featuredNews.summary && <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100/70">{featuredNews.summary}</p>}<div className="mt-7 flex items-center justify-between border-t border-white/15 pt-4 text-[9px] font-bold uppercase tracking-[.15em] text-blue-100/55"><span>{formatNewsDate(featuredNews.published_at)}</span><span className="transition group-hover:translate-x-1">Read story ↗</span></div></div>
              </a>
              <div className="border-y border-slate-200">{secondaryNews.map((story, index) => <a key={story.id} href={story.source_url} target="_blank" rel="noreferrer" className="group block border-b border-slate-200 py-6 last:border-0"><div className="flex gap-4"><span className="text-[10px] font-black text-slate-300">0{index + 2}</span><div className="min-w-0 flex-1"><p className="text-[9px] font-black uppercase tracking-[.16em] text-blue-700">{story.category}</p><h3 className="mt-2 text-base font-semibold leading-6 text-slate-950 transition group-hover:text-blue-800">{story.title}</h3><p className="mt-2 text-[10px] text-slate-400">{story.source} · {formatNewsDate(story.published_at)}</p></div><span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700">↗</span></div></a>)}</div>
            </div> : <div className="mt-8 border-y border-dashed border-slate-300 py-14 text-center"><p className="text-sm font-semibold text-slate-900">The news desk is quiet right now.</p><p className="mt-1 text-xs text-slate-500">New stories will appear automatically when the feed updates.</p></div>}
          </div>
        </section>

        {/* WEATHER */}
        <section className="mx-auto max-w-[1500px] px-6 py-16 sm:px-10 lg:px-16 lg:py-20 xl:px-20">
          <SectionHeader eyebrow="VidyaGyan weather" title="The campus atmosphere, now and next." description="Forecast data for the VidyaGyan campus coordinates, with a detailed view of today and a compact three-day horizon." />
          {weatherLoading && !weather ? <div className="mt-8 h-[620px] animate-pulse bg-slate-200" /> : weather ? <div className="mt-8 overflow-hidden border border-slate-200 bg-white">
            <div className="grid items-stretch lg:min-h-[560px] lg:grid-cols-[.82fr_1.18fr]">
              <div className="relative overflow-hidden bg-[radial-gradient(circle_at_12%_18%,rgba(56,189,248,.24),transparent_28%),radial-gradient(circle_at_82%_88%,rgba(37,99,235,.24),transparent_34%),linear-gradient(145deg,#06142f,#0a2854)] p-7 text-white sm:p-10 lg:p-12">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
                <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
                <div className="relative z-10 flex items-start justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-cyan-200/80">Right now</p><p className="mt-3 text-sm font-semibold text-blue-50/75">VidyaGyan · Bulandshahr</p></div><span className="rounded-full border border-white/10 bg-white/[.05] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.15em] text-cyan-100/65">Open-Meteo · live</span></div>
                <div className="relative z-10 mt-8 flex items-center justify-between gap-6"><div><div className="flex items-end gap-2"><span className="text-[clamp(4.5rem,8vw,7.5rem)] font-semibold leading-none tracking-[-.09em] text-white">{Math.round(weather.current.temperature)}°</span><span className="mb-3 text-xl font-semibold text-cyan-100/55">C</span></div><p className="mt-3 text-lg font-semibold text-white">{weatherLabel(weather.current.weatherCode)}</p><p className="mt-2 text-sm text-blue-100/55">Feels like {Math.round(weather.current.apparentTemperature)}°C · {weather.current.isDay ? "daytime" : "night"}</p></div><div className="relative hidden h-28 w-28 shrink-0 sm:block">{weather.current.isDay ? <div className="absolute inset-5 rounded-full bg-amber-200/80 shadow-[0_0_55px_20px_rgba(253,224,71,.14)]" /> : <div className="absolute inset-5 rounded-full bg-slate-200/45 shadow-[0_0_55px_20px_rgba(191,219,254,.1)]" />}<div className="absolute inset-0 rounded-full border border-cyan-200/15" /></div></div>
                <div className="relative z-10 mt-9 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    ["Humidity", `${Math.round(weather.current.humidity)}%`],
                    ["Cloud cover", `${Math.round(weather.current.cloudCover)}%`],
                    ["Wind", `${Math.round(weather.current.windSpeed)} km/h ${windDirection(weather.current.windDirection)}`],
                    ["Pressure", `${Math.round(weather.current.pressure)} hPa`],
                    ["Visibility", `${Math.round(weather.current.visibility / 1000)} km`],
                    ["UV index", weather.current.uvIndex.toFixed(1)],
                  ].map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-white/[.055] p-3 backdrop-blur-sm"><p className="text-[8px] font-black uppercase tracking-[.15em] text-cyan-100/45">{label}</p><p className="mt-1 text-xs font-semibold text-white/90">{value}</p></div>)}
                </div>
                <div className="relative z-10 mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/10 bg-white/[.04] p-3"><p className="text-[8px] font-black uppercase tracking-[.15em] text-blue-100/40">Rain</p><p className="mt-1 text-xs font-semibold text-white/80">{weather.current.rain.toFixed(1)} mm</p></div>
                  <div className="rounded-xl border border-white/10 bg-white/[.04] p-3"><p className="text-[8px] font-black uppercase tracking-[.15em] text-blue-100/40">Sunrise</p><p className="mt-1 text-xs font-semibold text-white/80">{formatForecastTime(weather.daily.sunrise[0])}</p></div>
                  <div className="rounded-xl border border-white/10 bg-white/[.04] p-3"><p className="text-[8px] font-black uppercase tracking-[.15em] text-blue-100/40">Sunset</p><p className="mt-1 text-xs font-semibold text-white/80">{formatForecastTime(weather.daily.sunset[0])}</p></div>
                </div>
              </div>
              <div className="min-h-[520px] border-t border-slate-200 bg-slate-50 p-3 sm:p-4 lg:min-h-0 lg:border-t-0 lg:border-l">
                <MapExplorer />
              </div>
            </div>
            <div className="border-t border-slate-200 p-7 sm:p-10">
              <div className="flex items-end justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-blue-700">Today · hourly</p><h3 className="mt-2 text-xl font-semibold tracking-[-.035em]">How the day is expected to move.</h3></div><span className="text-[9px] font-bold uppercase tracking-[.15em] text-slate-400">24-hour window</span></div>
              <div className="mt-6 overflow-x-auto pb-2"><div className="flex min-w-max gap-2">{todayHourly.map((item) => <div key={item.time} className="w-[78px] border border-slate-100 bg-slate-50 p-3 text-center"><p className="text-[9px] font-bold text-slate-400">{formatForecastTime(item.time)}</p><p className="mt-3 text-lg font-semibold text-slate-900">{Math.round(item.temperature)}°</p><p className="mt-1 text-[9px] font-semibold text-blue-700">{item.rainProbability}% rain</p><div className="mx-auto mt-3 h-10 w-px bg-blue-200" /><p className="mt-2 text-[8px] text-slate-400">{Math.round(item.cloud)}% cloud</p></div>)}</div></div>
            </div>
            <div className="border-t border-slate-200 p-7 sm:p-10"><div className="flex items-end justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-blue-700">Next three days</p><h3 className="mt-2 text-xl font-semibold tracking-[-.035em]">A compact horizon.</h3></div></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{weather.daily.date.slice(1, 4).map((day, index) => { const i = index + 1; return <div key={day} className="grid grid-cols-[1fr_auto] items-center border border-slate-200 p-5"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-slate-400">{formatForecastDay(day, i)}</p><p className="mt-2 text-sm font-semibold text-slate-900">{weatherLabel(weather.daily.weatherCode[i])}</p><p className="mt-1 text-[10px] text-slate-500">Rain chance {weather.daily.precipitationProbability[i]}% · UV {Number(weather.daily.uvMax[i] ?? 0).toFixed(1)}</p></div><div className="text-right"><p className="text-2xl font-semibold tracking-[-.05em]">{Math.round(weather.daily.temperatureMax[i])}°</p><p className="text-xs text-slate-400">{Math.round(weather.daily.temperatureMin[i])}° low</p></div></div>; })}</div></div>
          </div> : <div className="mt-8 border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">VidyaGyan weather is temporarily unavailable.</div>}
        </section>

        {/* ACADEMIC */}
        <section className="bg-[#071633] text-white">
          <div className="mx-auto max-w-[1500px] px-6 py-16 sm:px-10 lg:px-16 lg:py-20 xl:px-20">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.24em] text-blue-300">Academic tools</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.055em] sm:text-4xl">One visual language. Eight disciplines.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/55">Every subject has the same space and hierarchy. The visualization changes; the importance does not.</p></div><Link href="/tools" className="text-[10px] font-black uppercase tracking-[.16em] text-blue-300">Open tools hub ↗</Link></div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{ACADEMIC_TOOLS.map((tool, index) => <Link key={tool.title} href={tool.href} className="group relative min-h-[280px] overflow-hidden border border-white/10 bg-white/[.035] p-6 transition duration-500 hover:-translate-y-1 hover:border-blue-300/35 hover:bg-white/[.055]"><div className="absolute inset-0 text-blue-300/80 opacity-25 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-40"><AcademicVisual kind={tool.kind} /></div><div className="relative flex h-full flex-col justify-between"><div className="flex items-start justify-between"><span className="text-[9px] font-black uppercase tracking-[.18em] text-blue-100/35">{String(index + 1).padStart(2, "0")}</span><span className="text-blue-100/30 transition group-hover:translate-x-1 group-hover:text-blue-200">↗</span></div><div><div className="mb-4 text-2xl font-medium text-blue-200">{tool.mark}</div><h3 className="text-xl font-semibold tracking-[-.04em] text-white">{tool.title}</h3><p className="mt-2 text-xs leading-5 text-blue-100/50">{tool.description}</p><span className="mt-5 inline-block text-[9px] font-black uppercase tracking-[.16em] text-blue-300">Open tool</span></div></div></Link>)}</div>
          </div>
        </section>

        {/* FOOTER / EXPLORE */}
        <footer className="bg-[#06142f] text-white">
          <div className="mx-auto max-w-[1500px] px-6 py-16 sm:px-10 lg:px-16 lg:py-24 xl:px-20">
            <div className="grid gap-14 lg:grid-cols-[1.25fr_1fr]">
              <div><p className="text-[10px] font-black uppercase tracking-[.28em] text-blue-300">Explore VGB</p><h2 className="mt-5 max-w-2xl text-[clamp(3rem,6vw,6rem)] font-semibold leading-[.9] tracking-[-.08em]">Everything else,<br />one route away.</h2><p className="mt-7 max-w-xl text-sm leading-6 text-blue-100/50">The homepage previews the campus. These are the spaces where you go deeper.</p></div>
              <div className="grid gap-10 sm:grid-cols-3">{FOOTER_LINKS.map((group) => <div key={group.group}><p className="text-[9px] font-black uppercase tracking-[.2em] text-blue-300/60">{group.group}</p><div className="mt-5 space-y-4">{group.links.map((link) => <Link key={link.title} href={link.href} className="group flex items-center justify-between border-b border-white/10 pb-3 text-sm font-medium text-blue-50/70 transition hover:text-white"><span>{link.title}</span><span className="text-blue-300/35 transition group-hover:translate-x-1 group-hover:text-blue-300">↗</span></Link>)}</div></div>)}</div>
            </div>
            <div className="mt-20 border-t border-white/10 pt-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-black uppercase tracking-[.18em]">VidyaGyan Student Portal</p><p className="mt-2 text-[10px] uppercase tracking-[.16em] text-blue-100/35">2026–27 · Bulandshahr · Asia / Kolkata</p></div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-blue-100/25">A digital space for the VGB community.</p></div></div>
          </div>
        </footer>
      </main>
    </div>
  );
}
