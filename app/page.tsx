"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type TransitionEvent,
} from "react";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type Category =
  | "Flagship"
  | "Academic"
  | "Cultural"
  | "Exams"
  | "Sports"
  | "Excursion";

interface CalendarEvent {
  id: number;
  title: string;
  event_date: string;
  description?: string | null;
  event_time?: string | null;
  category?: Category | null;
  created_by?: string | null;
  target?: string | null;
}

interface PortalProfile {
  id: number;
  name: string | null;
  email: string;
  role: string | null;
  admin_status: string | null;
}

interface NewsItem {
  id: string | number;
  title: string;
  summary?: string | null;
  source: string;
  source_url: string;
  published_at: string;
  category: "India" | "World" | "Economy" | "Science & Tech";
  image_url?: string | null;
}

interface WeatherData {
  current: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    weatherCode: number;
    isDay: boolean;
  };
  daily: {
    date: string[];
    weatherCode: number[];
    temperatureMax: number[];
    temperatureMin: number[];
    precipitationProbability: number[];
    sunrise: string[];
    sunset: string[];
  };
}

type MealType =
  | "Breakfast"
  | "Morning Snacks"
  | "Lunch"
  | "Evening Snacks"
  | "Dinner";

interface MealWindow {
  type: MealType;
  startHour: number;
  endHour: number;
  label: string;
  description: string;
}

/* =========================================================
   MEAL WINDOWS
========================================================= */

const MEAL_WINDOWS: MealWindow[] = [
  {
    type: "Breakfast",
    startHour: 0,
    endHour: 9,
    label: "Breakfast",
    description: "Morning meal",
  },
  {
    type: "Morning Snacks",
    startHour: 9,
    endHour: 12,
    label: "Morning Snacks",
    description: "Morning break",
  },
  {
    type: "Lunch",
    startHour: 12,
    endHour: 15,
    label: "Lunch",
    description: "Midday meal",
  },
  {
    type: "Evening Snacks",
    startHour: 15,
    endHour: 18,
    label: "Evening Snacks",
    description: "Afternoon break",
  },
  {
    type: "Dinner",
    startHour: 18,
    endHour: 21,
    label: "Dinner",
    description: "Evening meal",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getIndiaDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

function getIndiaHour() {
  return Number(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      hour12: false,
    }).format(new Date())
  );
}

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getShortDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

function daysUntil(dateString: string, today: string) {
  const start = new Date(`${today}T00:00:00`).getTime();

  const end = new Date(`${dateString}T00:00:00`).getTime();

  return Math.round(
    (end - start) / (1000 * 60 * 60 * 24)
  );
}

function getCategoryStyles(category?: string) {
  switch (category?.toLowerCase()) {
    case "flagship":
      return {
        bg: "bg-amber-100",
        text: "text-amber-800",
        dot: "bg-amber-500",
      };

    case "cultural":
      return {
        bg: "bg-rose-100",
        text: "text-rose-800",
        dot: "bg-rose-500",
      };

    case "academic":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        dot: "bg-blue-500",
      };

    case "exams":
      return {
        bg: "bg-purple-100",
        text: "text-purple-800",
        dot: "bg-purple-500",
      };

    case "sports":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        dot: "bg-emerald-500",
      };

    case "excursion":
      return {
        bg: "bg-cyan-100",
        text: "text-cyan-800",
        dot: "bg-cyan-500",
      };

    default:
      return {
        bg: "bg-slate-100",
        text: "text-slate-700",
        dot: "bg-slate-500",
      };
  }
}

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function getCurrentMeal(hour: number): MealWindow {
  const meal = MEAL_WINDOWS.find(
    (item) =>
      hour >= item.startHour &&
      hour < item.endHour
  );

  if (meal) return meal;

  return {
    type: "Dinner",
    startHour: 18,
    endHour: 21,
    label: "Dinner",
    description: "Evening meal",
  };
}

function getNextMeal(hour: number): MealWindow {
  const next = MEAL_WINDOWS.find(
    (item) => item.startHour > hour
  );

  return (
    next || {
      type: "Breakfast",
      startHour: 0,
      endHour: 9,
      label: "Breakfast",
      description: "Tomorrow morning",
    }
  );
}

function getWeatherInfo(code: number) {
  if (code === 0) return { label: "Clear sky", icon: "☀️" };
  if (code === 1) return { label: "Mainly clear", icon: "🌤️" };
  if (code === 2) return { label: "Partly cloudy", icon: "⛅" };
  if (code === 3) return { label: "Overcast", icon: "☁️" };
  if ([45, 48].includes(code)) return { label: "Foggy", icon: "🌫️" };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "Drizzle", icon: "🌦️" };
  if ([61, 63, 65, 66, 67].includes(code)) return { label: "Rain", icon: "🌧️" };
  if ([71, 73, 75, 77].includes(code)) return { label: "Snow", icon: "🌨️" };
  if ([80, 81, 82].includes(code)) return { label: "Rain showers", icon: "🌦️" };
  if ([85, 86].includes(code)) return { label: "Snow showers", icon: "🌨️" };
  if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", icon: "⛈️" };

  return { label: "Changing conditions", icon: "🌥️" };
}

function formatWeatherTime(value?: string) {
  if (!value) return "—";

  return new Date(value).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatForecastDay(dateString: string, index: number) {
  const date = new Date(`${dateString}T00:00:00`);

  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

/* =========================================================
   ROLLING CLOCK
========================================================= */

function RollingDigit({
  value,
  delay,
  animate,
}: {
  value: string;
  delay: number;
  animate: boolean;
}) {
  const numericValue = Number(value);

  const [fromDigit, setFromDigit] =
    useState(numericValue);

  const [toDigit, setToDigit] =
    useState(numericValue);

  const [rolling, setRolling] =
    useState(false);

  useEffect(() => {
    if (numericValue === toDigit) return;

    setFromDigit(toDigit);
    setToDigit(numericValue);

    if (animate) {
      setRolling(true);
    } else {
      setFromDigit(numericValue);
      setRolling(false);
    }
  }, [numericValue, animate, toDigit]);

  const handleTransitionEnd = (
    event: TransitionEvent<HTMLSpanElement>
  ) => {
    if (event.propertyName !== "transform") return;

    setFromDigit(toDigit);
    setRolling(false);
  };

  return (
    <span
      className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-middle"
      aria-hidden="true"
    >
      <span
        className="absolute left-0 top-0 flex w-full flex-col"
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: rolling
            ? "translateY(-1em)"
            : "translateY(0em)",
          transition: rolling
            ? `transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
            : "none",
        }}
      >
        <span className="flex h-[1em] w-full items-center justify-center">
          {fromDigit}
        </span>

        <span className="flex h-[1em] w-full items-center justify-center">
          {toDigit}
        </span>
      </span>
    </span>
  );
}

function AnimatedClock({
  time,
  date,
}: {
  time: string;
  date: string;
}) {
  const [hasAnimated, setHasAnimated] =
    useState(false);

  const [displayTime, setDisplayTime] =
    useState("00:00:00");

  const [meridiem, setMeridiem] =
    useState("");

  useEffect(() => {
    if (!time) return;

    const match = time.match(
      /^(\d{2}):(\d{2}):(\d{2})\s?(AM|PM)$/i
    );

    if (!match) return;

    const target = `${match[1]}:${match[2]}:${match[3]}`;

    setDisplayTime(target);
    setMeridiem(match[4].toUpperCase());
    setHasAnimated(true);
  }, [time]);

  const digits = displayTime.replace(/:/g, "");

  const digitDelays = [
    0,
    0,
    0,
    0,
    0,
    0,
  ];

  return (
    <div>
      <div
        className="flex items-center justify-center whitespace-nowrap text-4xl font-semibold tracking-[-0.055em] text-white tabular-nums sm:text-5xl md:text-6xl lg:text-7xl"
        aria-live="polite"
        aria-label={`${time || "Loading campus time"}, ${date}`}
      >
        <RollingDigit
          value={digits[0] || "0"}
          delay={digitDelays[0]}
          animate={hasAnimated}
        />

        <RollingDigit
          value={digits[1] || "0"}
          delay={digitDelays[1]}
          animate={hasAnimated}
        />

        <span
          className="mx-[0.04em] opacity-70"
          aria-hidden="true"
        >
          :
        </span>

        <RollingDigit
          value={digits[2] || "0"}
          delay={digitDelays[2]}
          animate={hasAnimated}
        />

        <RollingDigit
          value={digits[3] || "0"}
          delay={digitDelays[3]}
          animate={hasAnimated}
        />

        <span
          className="mx-[0.04em] opacity-70"
          aria-hidden="true"
        >
          :
        </span>

        <RollingDigit
          value={digits[4] || "0"}
          delay={digitDelays[4]}
          animate={hasAnimated}
        />

        <RollingDigit
          value={digits[5] || "0"}
          delay={digitDelays[5]}
          animate={hasAnimated}
        />

        <span className="ml-2 self-end pb-[0.17em] text-sm font-bold tracking-[0.05em] text-blue-200 sm:text-base md:text-lg">
          {meridiem}
        </span>
      </div>

      <div className="mt-3 text-center text-sm font-medium text-blue-200">
        {date || "Loading campus time..."}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-blue-300/80">
        <span>India Standard Time</span>

        <span className="h-1 w-1 rounded-full bg-blue-400/60" />

        <span>UTC +05:30</span>
      </div>
    </div>
  );
}

/* =========================================================
   WEATHER SCENE
========================================================= */

function WeatherScene({ code, isDay }: { code: number; isDay: boolean }) {
  const rainy = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
  const cloudy = [1, 2, 3, 45, 48, 51, 53, 55, 56, 57].includes(code);
  const storm = [95, 96, 99].includes(code);

  return (
    <div className="relative min-h-[330px] overflow-hidden border border-white/10 bg-gradient-to-br from-[#102c62] via-[#0a1f48] to-[#06142f]">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(147,197,253,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(147,197,253,.08)_1px,transparent_1px)] [background-size:46px_46px]" />
      <div className={`absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${isDay ? 'bg-sky-300/10' : 'bg-indigo-400/10'}`} />

      {!cloudy && !storm && (
        <div className={`absolute right-16 top-14 h-28 w-28 rounded-full border border-white/10 ${isDay ? 'bg-amber-100/80 shadow-[0_0_70px_25px_rgba(253,224,71,.09)]' : 'bg-slate-200/15 shadow-[0_0_60px_18px_rgba(191,219,254,.08)]'}`} />
      )}

      {cloudy && (
        <div className="absolute left-1/2 top-24 h-16 w-44 -translate-x-1/2 rounded-full bg-slate-200/15 blur-[1px]">
          <div className="absolute -left-4 -top-7 h-20 w-20 rounded-full bg-slate-100/15" />
          <div className="absolute left-12 -top-10 h-24 w-24 rounded-full bg-slate-100/15" />
          <div className="absolute right-0 -top-5 h-16 w-16 rounded-full bg-slate-100/15" />
        </div>
      )}

      {rainy && (
        <div className="absolute inset-x-12 top-28 bottom-10 overflow-hidden opacity-60">
          {Array.from({ length: 18 }).map((_, index) => (
            <span
              key={index}
              className="vgb-rain absolute top-0 h-10 w-px bg-blue-200/60"
              style={{ left: `${(index * 17) % 100}%`, animationDelay: `${(index % 6) * 180}ms` }}
            />
          ))}
        </div>
      )}

      {storm && (
        <div className="absolute left-1/2 top-32 h-28 w-px -translate-x-1/2 rotate-[18deg] bg-cyan-100/70 shadow-[0_0_22px_8px_rgba(165,243,252,.18)] vgb-pulse" />
      )}

      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#06142f] to-transparent" />
      <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[.2em] text-blue-200/40">Atmospheric view</p>
          <p className="mt-2 text-sm font-semibold text-blue-50/80">Bulandshahr campus</p>
        </div>
        <div className="text-right text-[9px] font-bold uppercase tracking-[.16em] text-blue-200/35">
          {isDay ? 'Day field' : 'Night field'}
          <br />
          live conditions
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ACADEMIC SUBJECT VISUALS
========================================================= */

function SubjectVisual({ kind }: { kind: string }) {
  if (kind === 'math') {
    return (
      <svg viewBox="0 0 420 300" className="h-full w-full" preserveAspectRatio="none">
        <g stroke="currentColor" strokeOpacity=".16" strokeWidth="1">
          {Array.from({ length: 11 }).map((_, i) => <line key={`v-${i}`} x1={i * 42} y1="0" x2={i * 42} y2="300" />)}
          {Array.from({ length: 8 }).map((_, i) => <line key={`h-${i}`} x1="0" y1={i * 42} x2="420" y2={i * 42} />)}
        </g>
        <path d="M0 230 C70 215 95 90 165 110 S260 245 325 105 S380 70 420 40" fill="none" stroke="currentColor" strokeWidth="3" strokeOpacity=".62" />
        <path d="M0 150 C80 125 120 160 180 145 S300 80 420 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity=".28" />
        <circle cx="266" cy="191" r="5" fill="currentColor" opacity=".75" />
      </svg>
    );
  }

  if (kind === 'physics') {
    return (
      <svg viewBox="0 0 420 240" className="h-full w-full">
        <ellipse cx="210" cy="120" rx="125" ry="48" fill="none" stroke="currentColor" strokeWidth="2" opacity=".35" />
        <ellipse cx="210" cy="120" rx="72" ry="125" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".22" transform="rotate(-28 210 120)" />
        <circle cx="210" cy="120" r="18" fill="currentColor" opacity=".22" />
        <circle cx="320" cy="106" r="6" fill="currentColor" opacity=".75" />
        <circle cx="151" cy="22" r="4" fill="currentColor" opacity=".55" />
      </svg>
    );
  }

  if (kind === 'economics') {
    return (
      <svg viewBox="0 0 420 240" className="h-full w-full">
        <path d="M55 205H385M55 205V25" fill="none" stroke="currentColor" strokeWidth="2" opacity=".25" />
        <path d="M75 45 C145 78 205 118 365 188" fill="none" stroke="currentColor" strokeWidth="3" opacity=".55" />
        <path d="M75 185 C145 160 205 95 365 48" fill="none" stroke="currentColor" strokeWidth="3" opacity=".42" />
        <circle cx="221" cy="123" r="5" fill="currentColor" opacity=".75" />
        <path d="M221 123V205M55 123H221" stroke="currentColor" strokeDasharray="4 6" opacity=".2" />
      </svg>
    );
  }

  if (kind === 'geography') {
    return (
      <svg viewBox="0 0 420 240" className="h-full w-full">
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          <ellipse cx="210" cy="120" rx="175" ry="86" opacity=".22" />
          <ellipse cx="210" cy="120" rx="140" ry="67" opacity=".26" />
          <ellipse cx="210" cy="120" rx="105" ry="48" opacity=".32" />
          <ellipse cx="210" cy="120" rx="70" ry="31" opacity=".38" />
          <path d="M38 154 C90 105 128 170 178 116 S270 64 340 120 S385 162 405 140" opacity=".42" />
        </g>
      </svg>
    );
  }

  if (kind === 'pol') {
    return (
      <svg viewBox="0 0 420 240" className="h-full w-full">
        <g stroke="currentColor" strokeWidth="1.5" opacity=".28">
          <path d="M210 120L85 55M210 120L330 52M210 120L105 195M210 120L332 190M210 120L210 32" />
        </g>
        {[['210','120',10],['85','55',6],['330','52',6],['105','195',6],['332','190',6],['210','32',6]].map(([x,y,r], i) => <circle key={i} cx={Number(x)} cy={Number(y)} r={Number(r)} fill="currentColor" opacity={i === 0 ? '.55' : '.3'} />)}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 420 240" className="h-full w-full">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".34">
        <polygon points="210,35 260,64 260,122 210,151 160,122 160,64" />
        <polygon points="210,89 260,118 260,176 210,205 160,176 160,118" />
        <line x1="160" y1="64" x2="160" y2="122" />
        <line x1="260" y1="64" x2="260" y2="122" />
        <line x1="210" y1="35" x2="210" y2="89" />
      </g>
      <circle cx="210" cy="120" r="13" fill="currentColor" opacity=".22" />
    </svg>
  );
}

/* =========================================================
   HERO CAMPUS FIELD
========================================================= */

function CampusField() {
  const nodes = [
    { x: 18, y: 30, label: "NEWS", r: 3.5 },
    { x: 34, y: 68, label: "TOOLS", r: 2.5 },
    { x: 52, y: 42, label: "TIMELINE", r: 3 },
    { x: 68, y: 72, label: "COUNCIL", r: 2.5 },
    { x: 82, y: 34, label: "CAMPUS", r: 3.5 },
    { x: 76, y: 55, label: "WEATHER", r: 2 },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(148,163,184,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.045)_1px,transparent_1px)] [background-size:72px_72px]" />

      <svg
        className="absolute inset-0 h-full w-full opacity-90"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="vgb-field-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5ea1ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#5ea1ff" stopOpacity="0.42" />
            <stop offset="1" stopColor="#8ee8ff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="vgb-field-glow">
            <stop offset="0" stopColor="#4f8cff" stopOpacity=".22" />
            <stop offset="1" stopColor="#4f8cff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="70" cy="50" rx="31" ry="27" fill="url(#vgb-field-glow)" />

        <g fill="none" stroke="url(#vgb-field-line)" strokeWidth="0.18">
          <path d="M-5 76 C18 60 30 82 51 67 S82 45 105 61" />
          <path d="M-5 82 C18 66 32 87 53 73 S84 51 105 67" />
          <path d="M-5 88 C19 72 35 93 55 79 S86 57 105 73" />
          <path d="M-5 94 C20 78 37 99 57 85 S88 63 105 79" />
          <path d="M5 12 C25 28 35 5 54 22 S80 45 101 28" />
          <path d="M5 18 C25 34 37 11 56 28 S82 51 101 34" />
          <path d="M5 24 C25 40 39 17 58 34 S84 57 101 40" />
        </g>

        <g stroke="#78c7ff" strokeOpacity=".16" strokeWidth=".12">
          {nodes.slice(0, -1).map((node, index) => {
            const next = nodes[index + 1];
            return (
              <line
                key={`${node.label}-${next.label}`}
                x1={node.x}
                y1={node.y}
                x2={next.x}
                y2={next.y}
              />
            );
          })}
          <line x1="18" y1="30" x2="52" y2="42" />
          <line x1="34" y1="68" x2="68" y2="72" />
          <line x1="52" y1="42" x2="82" y2="34" />
          <line x1="68" y1="72" x2="76" y2="55" />
        </g>

        {nodes.map((node, index) => (
          <g key={node.label}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.r * 2.8}
              fill="#4f8cff"
              fillOpacity=".035"
              className={index % 2 === 0 ? "vgb-pulse" : ""}
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill="#9ad9ff"
              fillOpacity=".85"
            />
            <text
              x={node.x + 1.4}
              y={node.y - 2.2}
              fill="#a9d5ff"
              fillOpacity=".42"
              fontSize="1.35"
              letterSpacing=".18"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="absolute -right-32 top-1/2 h-[540px] w-[540px] -translate-y-1/2 rounded-full border border-blue-200/[.055] vgb-orbit" />
      <div className="absolute right-[8%] top-[18%] h-2 w-2 rounded-full bg-cyan-200/80 shadow-[0_0_24px_8px_rgba(103,232,249,.16)] vgb-pulse" />
      <div className="absolute left-[12%] top-[72%] h-1.5 w-1.5 rounded-full bg-blue-300/70 vgb-pulse" />
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-blue-300/[.025] to-transparent vgb-scan" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#06142f] via-[#06142f]/60 to-transparent" />
    </div>
  );
}

/* =========================================================
   HOME
========================================================= */

export default function Home() {
  const [clockTime, setClockTime] = useState('');
  const [clockDate, setClockDate] = useState('');
  const [supabaseEvents, setSupabaseEvents] = useState<CalendarEvent[]>([]);
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [indiaHour, setIndiaHour] = useState<number | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);
  const [newsStories, setNewsStories] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setClockTime(now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setClockDate(now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
      setIndiaHour(getIndiaHour());
    }
    updateClock();
    const interval = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadWeather() {
      try {
        const params = new URLSearchParams({ latitude: '28.3835', longitude: '77.7049', current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day', daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset', timezone: 'Asia/Kolkata', forecast_days: '7' });
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Weather request failed');
        const data = await response.json();
        if (!mounted) return;
        setWeather({ current: { temperature: data.current.temperature_2m, apparentTemperature: data.current.apparent_temperature, humidity: data.current.relative_humidity_2m, precipitation: data.current.precipitation, windSpeed: data.current.wind_speed_10m, weatherCode: data.current.weather_code, isDay: Boolean(data.current.is_day) }, daily: { date: data.daily.time, weatherCode: data.daily.weather_code, temperatureMax: data.daily.temperature_2m_max, temperatureMin: data.daily.temperature_2m_min, precipitationProbability: data.daily.precipitation_probability_max, sunrise: data.daily.sunrise, sunset: data.daily.sunset } });
        setWeatherError(false);
      } catch { if (mounted) setWeatherError(true); } finally { if (mounted) setWeatherLoading(false); }
    }
    loadWeather();
    const interval = window.setInterval(loadWeather, 15 * 60 * 1000);
    return () => { mounted = false; window.clearInterval(interval); };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (!session?.user?.email) { setProfile(null); setProfileLoading(false); return; }
        const { data, error } = await supabase.rpc('get_my_portal_profile');
        if (!mounted) return;
        if (error) { console.error('Unable to load portal profile:', error); setProfile(null); setProfileLoading(false); return; }
        const profileData = Array.isArray(data) ? data[0] : data;
        if (!profileData) { setProfile(null); setProfileLoading(false); return; }
        setProfile({ id: Number(profileData.id), name: profileData.name ?? null, email: profileData.email ?? session.user.email, role: profileData.role ?? null, admin_status: profileData.admin_status ?? null });
        setProfileLoading(false);
      } catch (error) { console.error('Unexpected profile error:', error); if (mounted) { setProfile(null); setProfileLoading(false); } }
    }
    loadProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { loadProfile(); });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchEvents() {
      const currentDate = getIndiaDateString();
      const { data, error } = await supabase.from('calendar_events').select('id, title, event_date, description, event_time, category, created_by, target').gte('event_date', currentDate).order('event_date', { ascending: true }).order('event_time', { ascending: true });
      if (!mounted) return;
      if (error) { console.error('Unable to fetch calendar events:', error); setSupabaseEvents([]); return; }
      setSupabaseEvents((data as CalendarEvent[]) || []);
    }
    fetchEvents();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadNews() {
      try {
        const { data, error } = await supabase.from('news_items').select('id, title, summary, source, source_url, published_at, category, image_url').order('published_at', { ascending: false }).limit(6);
        if (error) throw error;
        if (!mounted) return;
        const seen = new Set<string>();
        const cleaned = ((data ?? []) as NewsItem[]).filter((story) => { const key = `${story.title.trim().toLowerCase()}|${story.source}`; if (seen.has(key)) return false; seen.add(key); return true; });
        setNewsStories(cleaned);
      } catch (error) { console.error('Unable to fetch homepage news:', error); if (mounted) setNewsStories([]); } finally { if (mounted) setNewsLoading(false); }
    }
    loadNews();
    return () => { mounted = false; };
  }, []);

  const today = getIndiaDateString();
  const sortedEvents = useMemo(() => [...supabaseEvents].sort((a, b) => a.event_date.localeCompare(b.event_date) || (a.event_time || '').localeCompare(b.event_time || '')), [supabaseEvents]);
  const todayEvents = useMemo(() => sortedEvents.filter((event) => event.event_date === today), [sortedEvents, today]);
  const upcomingEvents = useMemo(() => sortedEvents.filter((event) => event.event_date >= today), [sortedEvents, today]);
  const nextEvent = upcomingEvents[0];
  const nextEventDays = nextEvent ? daysUntil(nextEvent.event_date, today) : null;
  const currentMeal = indiaHour !== null ? getCurrentMeal(indiaHour) : null;
  const nextMeal = indiaHour !== null ? getNextMeal(indiaHour) : null;
  const greeting = indiaHour !== null ? getGreeting(indiaHour) : 'Welcome';
  const displayName = profileLoading ? 'there' : profile?.name?.trim() || 'there';
  const firstName = displayName !== 'there' ? displayName.trim().split(/\s+/)[0] : 'there';
  const featuredNews = newsStories[0] ?? null;
  const secondaryNews = newsStories.slice(1, 4);

  const quickLinks = [
    { title: 'News', href: '/news' }, { title: 'Calendar', href: '/calendar' }, { title: 'Daily Timeline', href: '/timetable' }, { title: 'Tools', href: '/tools' }, { title: 'Council', href: '/council' }, { title: 'Leadership', href: '/leadership' }, { title: 'Activities', href: '/activities' }, { title: 'Study Material', href: '/study-material' }, { title: 'Cafeteria', href: '/cafeteria' },
  ];
  const academicTools = [
    { title: 'Mathematics', mark: '∑', kind: 'math', description: 'Graphs, calculations and mathematical workspaces.', href: '/tools/mathematics', size: 'large' },
    { title: 'Physics', mark: '◌', kind: 'physics', description: 'Models, formulas and physical systems.', href: '/tools/physics', size: 'small' },
    { title: 'Economics', mark: '↗', kind: 'economics', description: 'Models and economic analysis.', href: '/tools/economics', size: 'small' },
    { title: 'Geography', mark: '⌁', kind: 'geography', description: 'Maps, systems and spatial thinking.', href: '/tools/geography', size: 'small' },
    { title: 'Political Science', mark: '◎', kind: 'pol', description: 'Institutions, ideas and political systems.', href: '/tools/political-science', size: 'small' },
    { title: 'Biology & Chemistry', mark: '⌬', kind: 'science', description: 'Interactive science workspaces.', href: '/tools', size: 'wide' },
  ];

  return (
    <div className="vgb-home min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans text-[#0f172a]">
      <style jsx global>{`
        @keyframes vgb-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes vgb-orbit-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes vgb-float { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(0,-8px,0); } }
        @keyframes vgb-pulse { 0%,100% { opacity:.25; transform:scale(.82); } 50% { opacity:1; transform:scale(1.1); } }
        @keyframes vgb-scan { 0% { transform:translateY(-120%); opacity:0; } 20%,70% { opacity:.6; } 100% { transform:translateY(120%); opacity:0; } }
        @keyframes vgb-rain { 0% { transform:translateY(-35px); opacity:0; } 20% { opacity:.55; } 100% { transform:translateY(220px); opacity:0; } }
        @keyframes vgb-rise { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .vgb-orbit { animation:vgb-orbit 34s linear infinite; transform-origin:center; }
        .vgb-orbit-reverse { animation:vgb-orbit-reverse 47s linear infinite; transform-origin:center; }
        .vgb-float { animation:vgb-float 7s ease-in-out infinite; }
        .vgb-pulse { animation:vgb-pulse 3.6s ease-in-out infinite; }
        .vgb-scan { animation:vgb-scan 9s ease-in-out infinite; }
        .vgb-rain { animation:vgb-rain 1.8s linear infinite; }
        .vgb-rise { animation:vgb-rise .7s cubic-bezier(.2,.8,.2,1) both; }
        @media (prefers-reduced-motion:reduce) { .vgb-orbit,.vgb-orbit-reverse,.vgb-float,.vgb-pulse,.vgb-scan,.vgb-rain,.vgb-rise { animation:none!important; } }
      `}</style>

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#f5f7fb]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#102b66] text-[11px] font-black tracking-tight text-white shadow-[0_8px_25px_-12px_rgba(16,43,102,.7)]">VG</span>
            <span><span className="block text-[11px] font-black uppercase tracking-[.18em] text-[#102b66]">VidyaGyan</span><span className="block text-[9px] font-semibold uppercase tracking-[.14em] text-slate-400">Student Portal</span></span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {quickLinks.slice(0,4).map((item) => <Link key={item.title} href={item.href} className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500 transition hover:text-[#1746c7]">{item.title}</Link>)}
          </nav>
          <span className="text-[9px] font-black uppercase tracking-[.18em] text-slate-400">2026–27</span>
        </div>
      </header>

      <main>
        {/* CLOCK HERO */}
        <section className="relative overflow-hidden bg-[#06142f] text-white">
          <CampusField />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(23,70,199,.24),transparent_25%),linear-gradient(120deg,#06142f,#0a2453_56%,#06142f)]" />
          <div className="relative mx-auto grid min-h-[700px] max-w-[1440px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-14 lg:py-20">
            <div className="relative z-10 max-w-xl vgb-rise">
              <p className="text-[10px] font-black uppercase tracking-[.28em] text-blue-300">Digital campus · VidyaGyan</p>
              <h1 className="mt-5 text-[4rem] font-semibold leading-[.9] tracking-[-.07em] sm:text-7xl lg:text-[6.2rem]">{greeting},<br /><span className="text-blue-100">{firstName}.</span></h1>
              <p className="mt-7 max-w-md text-sm leading-6 text-blue-100/60 sm:text-base">The live front door to your campus, your day and your academic workspace.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#today" className="group inline-flex items-center rounded-[12px] bg-white px-5 py-3 text-xs font-black text-[#06142f] transition hover:-translate-y-0.5 hover:bg-blue-50">Enter today <span className="ml-3 transition-transform group-hover:translate-y-0.5">↓</span></a>
                <Link href="/tools" className="group inline-flex items-center rounded-[12px] border border-white/15 bg-white/[.04] px-5 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/[.09]">Academic workspace <span className="ml-3 transition-transform group-hover:translate-x-1">↗</span></Link>
              </div>
            </div>
            <div className="relative z-10 flex min-h-[390px] items-center justify-center lg:min-h-[510px]">
              <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[.06]" />
              <div className="absolute left-1/2 top-1/2 h-[315px] w-[315px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-200/[.1] border-dashed vgb-orbit" />
              <div className="absolute left-1/2 top-1/2 h-[205px] w-[410px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-cyan-200/[.1] vgb-orbit-reverse" />
              <div className="relative z-20 w-[310px] text-center sm:w-[390px]">
                <p className="text-[9px] font-black uppercase tracking-[.28em] text-blue-200/55">Campus time</p>
                <div className="mt-4"><AnimatedClock time={clockTime} date={clockDate} /></div>
                <div className="mx-auto mt-8 grid max-w-[270px] grid-cols-3 border-y border-white/10 py-4 text-left">
                  <div><p className="text-[8px] font-black uppercase tracking-[.18em] text-blue-200/45">Today</p><p className="mt-1 text-xs font-semibold text-white">{todayEvents.length} campus {todayEvents.length === 1 ? 'item' : 'items'}</p></div>
                  <div className="border-l border-white/10 pl-4"><p className="text-[8px] font-black uppercase tracking-[.18em] text-blue-200/45">Next</p><p className="mt-1 truncate text-xs font-semibold text-white">{nextEvent?.title || 'Nothing set'}</p></div>
                  <div className="border-l border-white/10 pl-4"><p className="text-[8px] font-black uppercase tracking-[.18em] text-blue-200/45">Role</p><p className="mt-1 truncate text-xs font-semibold text-white">{profile?.role || 'Student'}</p></div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative border-t border-white/10"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 text-[9px] font-bold uppercase tracking-[.2em] text-blue-200/45 sm:px-8 lg:px-14"><span>VidyaGyan Leadership Academy · Bulandshahr</span><span className="hidden sm:inline">Asia / Kolkata · UTC +05:30</span></div></div>
        </section>

        {/* TODAY */}
        <section id="today" className="mx-auto max-w-[1440px] scroll-mt-20 px-5 py-16 sm:px-8 lg:px-14 lg:py-20">
          <div className="flex items-end justify-between border-b border-slate-200 pb-5"><div><p className="text-[10px] font-black uppercase tracking-[.24em] text-blue-700">Today at VGB</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.05em] text-slate-950 sm:text-4xl">What matters right now.</h2></div><Link href="/timetable" className="text-[10px] font-black uppercase tracking-[.16em] text-blue-700">Open timeline ↗</Link></div>
          <div className="mt-7 grid divide-y divide-slate-200 border-b border-slate-200 lg:grid-cols-[1.1fr_1fr_.8fr] lg:divide-x lg:divide-y-0">
            <Link href="/timetable" className="group py-7 pr-0 lg:pr-10"><p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-400">Your day</p><div className="mt-3 flex items-end justify-between gap-4"><h3 className="text-2xl font-semibold tracking-[-.04em] text-slate-950">Daily Timeline</h3><span className="text-lg text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700">↗</span></div><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">A clean time-based view of your school day, without turning Home into another timetable.</p></Link>
            <Link href="/calendar" className="group py-7 lg:px-10"><p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-400">Next on campus</p><h3 className="mt-3 text-2xl font-semibold tracking-[-.04em] text-slate-950">{nextEvent?.title || 'Nothing scheduled'}</h3><p className="mt-2 text-sm text-slate-500">{nextEvent ? `${nextEventDays === 0 ? 'Today' : getShortDate(nextEvent.event_date)}${nextEvent.event_time ? ` · ${nextEvent.event_time}` : ''}` : 'Your calendar is clear for now.'}</p><span className="mt-4 inline-block text-[9px] font-black uppercase tracking-[.16em] text-blue-700">View calendar ↗</span></Link>
            <Link href="/cafeteria" className="group py-7 lg:pl-10"><p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-400">Campus rhythm</p><h3 className="mt-3 text-2xl font-semibold tracking-[-.04em] text-slate-950">{currentMeal?.label || 'Campus day'}</h3><p className="mt-2 text-sm text-slate-500">{currentMeal?.description || 'Daily campus services'}. {nextMeal ? `Next: ${nextMeal.label}.` : ''}</p><span className="mt-4 inline-block text-[9px] font-black uppercase tracking-[.16em] text-blue-700">Cafeteria ↗</span></Link>
          </div>
        </section>

        {/* NEWS */}
        <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-14 lg:pb-20">
          <div className="flex items-end justify-between border-b border-slate-200 pb-5"><div><p className="text-[10px] font-black uppercase tracking-[.24em] text-blue-700">The world, right now</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.05em] text-slate-950 sm:text-4xl">Current affairs, without the clutter.</h2></div><Link href="/news" className="text-[10px] font-black uppercase tracking-[.16em] text-blue-700">News desk ↗</Link></div>
          {newsLoading ? <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_.8fr]"><div className="h-[380px] animate-pulse bg-slate-200" /><div className="h-[380px] animate-pulse bg-slate-200" /></div> : featuredNews ? <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_.65fr]">
            <a href={featuredNews.source_url} target="_blank" rel="noreferrer" className="group relative min-h-[420px] overflow-hidden bg-[#081a3d] text-white">
              {featuredNews.image_url ? <img src={featuredNews.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-700 group-hover:scale-[1.025]" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(37,99,235,.45),transparent_28%),linear-gradient(135deg,#071633,#1746c7)]" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[#06142f] via-[#06142f]/35 to-transparent" />
              <div className="relative flex min-h-[420px] flex-col justify-end p-7 sm:p-10"><p className="text-[9px] font-black uppercase tracking-[.22em] text-blue-200">{featuredNews.category} · {featuredNews.source}</p><h3 className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.02] tracking-[-.045em] sm:text-5xl">{featuredNews.title}</h3>{featuredNews.summary && <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100/70">{featuredNews.summary}</p>}<div className="mt-7 flex items-center justify-between border-t border-white/15 pt-4 text-[9px] font-bold uppercase tracking-[.15em] text-blue-100/60"><span>{formatDate(featuredNews.published_at.slice(0,10))}</span><span className="transition group-hover:translate-x-1">Read story ↗</span></div></div>
            </a>
            <div className="border-y border-slate-200">
              {secondaryNews.map((story, index) => <a key={story.id} href={story.source_url} target="_blank" rel="noreferrer" className="group block border-b border-slate-200 py-6 last:border-0"><div className="flex gap-4"><span className="text-[10px] font-black text-slate-300">0{index + 2}</span><div className="min-w-0 flex-1"><p className="text-[9px] font-black uppercase tracking-[.16em] text-blue-700">{story.category}</p><h3 className="mt-2 text-base font-semibold leading-6 text-slate-950 transition group-hover:text-blue-800">{story.title}</h3><p className="mt-2 text-[10px] text-slate-400">{story.source} · {formatDate(story.published_at.slice(0,10))}</p></div><span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700">↗</span></div></a>)}
              {!secondaryNews.length && <p className="py-8 text-sm text-slate-500">More stories will appear as the news feed updates.</p>}
            </div>
          </div> : <div className="mt-8 border-y border-dashed border-slate-300 py-12 text-center"><p className="text-sm font-semibold text-slate-900">The news desk is quiet right now.</p><p className="mt-1 text-xs text-slate-500">New stories will appear automatically when available.</p></div>}
        </section>

        {/* CAMPUS PULSE */}
        <section className="bg-[#0a1e45] text-white">
          <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-14 lg:py-20">
            <div className="flex items-end justify-between border-b border-white/10 pb-5"><div><p className="text-[10px] font-black uppercase tracking-[.24em] text-blue-300">Campus pulse</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.05em] sm:text-4xl">A live glimpse of campus.</h2></div><span className="text-[9px] font-bold uppercase tracking-[.18em] text-blue-200/40">Not another calendar</span></div>
            <div className="mt-8 grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
              <div className="flex flex-col justify-between border border-white/10 bg-white/[.035] p-7 sm:p-9"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-blue-200/50">Next event</p><p className="mt-4 text-3xl font-semibold leading-tight tracking-[-.045em]">{nextEvent?.title || 'No major event scheduled'}</p><p className="mt-3 text-sm text-blue-100/55">{nextEvent ? `${nextEventDays === 0 ? 'Today' : getShortDate(nextEvent.event_date)}${nextEvent.event_time ? ` · ${nextEvent.event_time}` : ''}` : 'Open the calendar when you need the full schedule.'}</p></div><Link href="/calendar" className="mt-10 text-[9px] font-black uppercase tracking-[.18em] text-blue-300">Open calendar ↗</Link></div>
              {weatherLoading && !weather ? <div className="h-[330px] animate-pulse bg-white/10" /> : weather ? <div className="grid gap-4 sm:grid-cols-[.75fr_1.25fr]"><div className="border border-white/10 bg-white/[.035] p-7 sm:p-9"><p className="text-[9px] font-black uppercase tracking-[.2em] text-blue-200/50">Outside now</p><div className="mt-7 flex items-end gap-2"><span className="text-7xl font-semibold tracking-[-.08em]">{Math.round(weather.current.temperature)}°</span><span className="mb-3 text-sm text-blue-200/60">C</span></div><p className="mt-2 text-base font-semibold">{getWeatherInfo(weather.current.weatherCode).label}</p><p className="mt-3 text-xs leading-5 text-blue-100/55">Feels like {Math.round(weather.current.apparentTemperature)}° · {Math.round(weather.current.humidity)}% humidity · {Math.round(weather.current.windSpeed)} km/h wind</p><div className="mt-8 border-t border-white/10 pt-5 text-[10px] text-blue-100/45"><p>Sunrise {formatWeatherTime(weather.daily.sunrise[0])}</p><p className="mt-1">Sunset {formatWeatherTime(weather.daily.sunset[0])}</p></div></div><WeatherScene code={weather.current.weatherCode} isDay={weather.current.isDay} /></div> : <div className="border border-white/10 bg-white/[.035] p-8 text-sm text-blue-100/60">Campus weather is temporarily unavailable.</div>}
            </div>
          </div>
        </section>

        {/* ACADEMIC SPACE */}
        <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-14 lg:py-20">
          <div className="flex items-end justify-between border-b border-slate-200 pb-5"><div><p className="text-[10px] font-black uppercase tracking-[.24em] text-blue-700">Academic space</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.05em] text-slate-950 sm:text-4xl">Where the work happens.</h2></div><Link href="/tools" className="text-[10px] font-black uppercase tracking-[.16em] text-blue-700">All tools ↗</Link></div>
          <div className="mt-8 grid gap-3 md:grid-cols-4 md:grid-rows-2">
            {academicTools.map((tool, index) => <Link key={tool.title} href={tool.href} className={`group relative overflow-hidden border border-slate-200 bg-white p-6 transition duration-500 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_28px_70px_-45px_rgba(23,70,199,.65)] ${tool.size === 'large' ? 'md:col-span-2 md:row-span-2 min-h-[390px]' : tool.size === 'wide' ? 'md:col-span-2 min-h-[185px]' : 'min-h-[185px]'}`}>
              <div className="absolute inset-0 text-blue-700/80 opacity-[.16] transition duration-700 group-hover:scale-[1.04] group-hover:opacity-[.25]"><SubjectVisual kind={tool.kind} /></div>
              <div className="relative flex h-full flex-col justify-between"><div className="flex items-start justify-between"><span className="text-[9px] font-black uppercase tracking-[.18em] text-slate-400">{String(index + 1).padStart(2,'0')}</span><span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700">↗</span></div><div><div className="mb-4 text-2xl font-semibold text-blue-800">{tool.mark}</div><h3 className={`${tool.size === 'large' ? 'text-3xl' : 'text-xl'} font-semibold tracking-[-.045em] text-slate-950`}>{tool.title}</h3><p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">{tool.description}</p></div></div>
            </Link>)}
          </div>
        </section>

        {/* EXPLORE */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-7 px-5 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-14"><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-slate-400">Explore VGB</p><p className="mt-2 text-lg font-semibold tracking-[-.025em] text-slate-950">Everything else, one clean route away.</p></div><div className="flex flex-wrap gap-x-6 gap-y-3">{quickLinks.map((item) => <Link key={item.title} href={item.href} className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-400 transition hover:text-blue-700">{item.title}</Link>)}</div></div>
        </section>
      </main>

      <footer className="bg-[#06142f] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-10 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-14"><div><p className="text-sm font-black uppercase tracking-[.16em]">VidyaGyan Portal</p><p className="mt-2 text-xs text-blue-100/45">Student digital campus · 2026–27</p></div><div className="text-left text-[9px] font-bold uppercase tracking-[.18em] text-blue-100/35 lg:text-right"><p>VidyaGyan Leadership Academy</p><p className="mt-1">Bulandshahr · Asia / Kolkata</p></div></div>
      </footer>
    </div>
  );
}
