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
   HOME
========================================================= */

export default function Home() {
  const [clockTime, setClockTime] =
    useState("");

  const [clockDate, setClockDate] =
    useState("");

  const [supabaseEvents, setSupabaseEvents] =
    useState<CalendarEvent[]>([]);

  const [profile, setProfile] =
    useState<PortalProfile | null>(null);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [indiaHour, setIndiaHour] =
    useState<number | null>(null);

  const [weather, setWeather] =
    useState<WeatherData | null>(null);

  const [weatherLoading, setWeatherLoading] =
    useState(true);

  const [weatherError, setWeatherError] =
    useState(false);

  const [newsStories, setNewsStories] =
    useState<NewsItem[]>([]);

  const [newsLoading, setNewsLoading] =
    useState(true);

  /* =======================================================
     CLOCK
  ======================================================= */

  useEffect(() => {
    function updateClock() {
      const now = new Date();

      setClockTime(
        now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );

      setClockDate(
        now.toLocaleDateString("en-US", {
          timeZone: "Asia/Kolkata",
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );

      setIndiaHour(getIndiaHour());
    }

    updateClock();

    const interval = window.setInterval(
      updateClock,
      1000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /* =======================================================
     CAMPUS WEATHER
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadWeather() {
      try {
        const params = new URLSearchParams({
          latitude: "28.3835",
          longitude: "77.7049",
          current:
            "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day",
          daily:
            "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
          timezone: "Asia/Kolkata",
          forecast_days: "7",
        });

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Weather request failed");
        }

        const data = await response.json();

        if (!mounted) return;

        setWeather({
          current: {
            temperature: data.current.temperature_2m,
            apparentTemperature:
              data.current.apparent_temperature,
            humidity: data.current.relative_humidity_2m,
            precipitation: data.current.precipitation,
            windSpeed: data.current.wind_speed_10m,
            weatherCode: data.current.weather_code,
            isDay: Boolean(data.current.is_day),
          },
          daily: {
            date: data.daily.time,
            weatherCode: data.daily.weather_code,
            temperatureMax: data.daily.temperature_2m_max,
            temperatureMin: data.daily.temperature_2m_min,
            precipitationProbability:
              data.daily.precipitation_probability_max,
            sunrise: data.daily.sunrise,
            sunset: data.daily.sunset,
          },
        });

        setWeatherError(false);
      } catch {
        if (!mounted) return;
        setWeatherError(true);
      } finally {
        if (mounted) setWeatherLoading(false);
      }
    }

    loadWeather();

    const interval = window.setInterval(
      loadWeather,
      15 * 60 * 1000
    );

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  /* =======================================================
     PROFILE
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!session?.user?.email) {
          setProfile(null);
          setProfileLoading(false);
          return;
        }

        const { data, error } =
          await supabase.rpc(
            "get_my_portal_profile"
          );

        if (!mounted) return;

        if (error) {
          console.error(
            "Unable to load portal profile:",
            error
          );

          setProfile(null);
          setProfileLoading(false);
          return;
        }

        const profileData = Array.isArray(data)
          ? data[0]
          : data;

        if (!profileData) {
          setProfile(null);
          setProfileLoading(false);
          return;
        }

        setProfile({
          id: Number(profileData.id),
          name: profileData.name ?? null,
          email:
            profileData.email ??
            session.user.email,
          role:
            profileData.role ?? null,
          admin_status:
            profileData.admin_status ?? null,
        });

        setProfileLoading(false);
      } catch (error) {
        console.error(
          "Unexpected profile error:",
          error
        );

        if (mounted) {
          setProfile(null);
          setProfileLoading(false);
        }
      }
    }

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      () => {
        loadProfile();
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =======================================================
     CALENDAR EVENTS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function fetchEvents() {
      const currentDate =
        getIndiaDateString();

      const { data, error } =
        await supabase
          .from("calendar_events")
          .select(
            "id, title, event_date, description, event_time, category, created_by, target"
          )
          .gte(
            "event_date",
            currentDate
          )
          .order("event_date", {
            ascending: true,
          })
          .order("event_time", {
            ascending: true,
          });

      if (!mounted) return;

      if (error) {
        console.error(
          "Unable to fetch calendar events:",
          error
        );

        setSupabaseEvents([]);
        return;
      }

      setSupabaseEvents(
        (data as CalendarEvent[]) || []
      );
    }

    fetchEvents();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     NEWS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadNews() {
      try {
        const { data, error } = await supabase
          .from("news_items")
          .select(
            "id, title, summary, source, source_url, published_at, category, image_url"
          )
          .order("published_at", { ascending: false })
          .limit(6);

        if (error) throw error;
        if (!mounted) return;

        const seen = new Set<string>();
        const cleaned = ((data ?? []) as NewsItem[]).filter((story) => {
          const key = `${story.title.trim().toLowerCase()}|${story.source}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setNewsStories(cleaned);
      } catch (error) {
        console.error("Unable to fetch homepage news:", error);
        if (mounted) setNewsStories([]);
      } finally {
        if (mounted) setNewsLoading(false);
      }
    }

    loadNews();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const today = getIndiaDateString();

  const sortedEvents = useMemo(() => {
    return [...supabaseEvents].sort(
      (a, b) => {
        const dateComparison =
          a.event_date.localeCompare(
            b.event_date
          );

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return (
          (a.event_time || "").localeCompare(
            b.event_time || ""
          )
        );
      }
    );
  }, [supabaseEvents]);

  const todayEvents = useMemo(() => {
    return sortedEvents.filter(
      (event) =>
        event.event_date === today
    );
  }, [sortedEvents, today]);

  const upcomingEvents = useMemo(() => {
    return sortedEvents
      .filter(
        (event) =>
          event.event_date >= today
      )
      .slice(0, 5);
  }, [sortedEvents, today]);

  const nextEvent =
    upcomingEvents[0];

  const nextEventDays = nextEvent
    ? daysUntil(
        nextEvent.event_date,
        today
      )
    : null;

  const futureEventCount =
    sortedEvents.length;

  const currentMeal =
    indiaHour !== null
      ? getCurrentMeal(indiaHour)
      : null;

  const nextMeal =
    indiaHour !== null
      ? getNextMeal(indiaHour)
      : null;

  const greeting =
    indiaHour !== null
      ? getGreeting(indiaHour)
      : "Welcome";

  const displayName =
    profileLoading
      ? "there"
      : profile?.name?.trim() ||
        "there";

  const firstName =
    displayName !== "there"
      ? displayName
          .trim()
          .split(/\s+/)[0]
      : "there";

  /* =======================================================
     RENDER
  ======================================================= */

  /* =========================================================
     RENDER
  ========================================================= */

  const featuredNews = newsStories[0] ?? null;
  const secondaryNews = newsStories.slice(1, 4);

  const quickLinks = [
    {
      title: "News",
      description: "Current affairs from India, the world, the economy and science & technology.",
      href: "/news",
      label: "Current affairs",
    },
    {
      title: "Calendar",
      description: "Campus events, examinations, programmes and the wider academic year.",
      href: "/calendar",
      label: "Plan ahead",
    },
    {
      title: "Daily Timeline",
      description: "See the school-day routine as a clear, time-based campus timeline.",
      href: "/timetable",
      label: "Your day",
    },
    {
      title: "Academic Tools",
      description: "Interactive tools for mathematics, sciences, humanities and revision.",
      href: "/tools",
      label: "Study",
    },
    {
      title: "Council",
      description: "Student Council structure, leadership and house representation.",
      href: "/council",
      label: "Student leadership",
    },
    {
      title: "Cafeteria",
      description: "Daily and weekly campus menu information in one place.",
      href: "/cafeteria",
      label: "Campus life",
    },
  ];

  const academicTools = [
    { title: "Mathematics", description: "Explore calculations, graphs and mathematical workspaces.", href: "/tools/mathematics" },
    { title: "Physics", description: "Work through concepts, formulas and physics utilities.", href: "/tools/physics" },
    { title: "Chemistry", description: "Useful chemistry references and interactive study tools.", href: "/tools/chemistry" },
    { title: "Biology", description: "Explore systems, structures and simulation-style learning.", href: "/tools/biology" },
    { title: "Economics", description: "Build intuition around economic concepts and analysis.", href: "/tools/economics" },
    { title: "Political Science", description: "Study institutions, ideas, systems and political concepts.", href: "/tools/political-science" },
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fc] font-sans text-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">

        {/* =================================================
            HERO / WELCOME
        ================================================= */}
        <section className="relative overflow-hidden rounded-[2rem] bg-[#0f1f4d] text-white shadow-[0_20px_60px_-25px_rgba(15,31,77,0.45)]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-28 -top-28 h-[420px] w-[420px] rounded-full border border-white/[0.08]" />
            <div className="absolute -right-4 top-4 h-[280px] w-[280px] rounded-full border border-white/[0.06]" />
            <div className="absolute -bottom-44 -left-20 h-[440px] w-[440px] rounded-full border border-emerald-300/[0.08]" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <div className="relative px-6 py-8 sm:px-9 sm:py-10 md:px-12 md:py-12 lg:px-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-3.5 py-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                    VidyaGyan Bulandshahr · 2026–27
                  </span>
                </div>

                <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-5xl md:text-6xl">
                  {greeting}, {firstName}.
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100/75 sm:text-base">
                  Your campus, your day, and the information worth seeing first.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="#right-now"
                    className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#0f1f4d] shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-100"
                  >
                    See what matters now
                    <span className="ml-2">↓</span>
                  </a>
                  <Link
                    href="/news"
                    className="inline-flex items-center rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    Open News
                    <span className="ml-2">→</span>
                  </Link>
                </div>
              </div>

              <div className="w-full max-w-md lg:max-w-[390px]">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-200">
                      Campus time
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-semibold text-emerald-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      Live
                    </span>
                  </div>
                  <div className="mt-4">
                    <AnimatedClock time={clockTime} date={clockDate} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            RIGHT NOW
        ================================================= */}
        <section id="right-now" className="mt-10 scroll-mt-24">
          <SectionHeading
            eyebrow="Right Now"
            title="The useful stuff, without the scavenger hunt."
            description="The homepage surfaces the live pieces of the portal. Detailed information stays on its dedicated page."
          />

          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-50" />
              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">Your school day</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Daily Timeline</h2>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-700">Time-based</span>
                </div>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Your daily school routine is organised as a timeline, so the portal can tell you what comes before and after the current part of the day without pretending it is a teacher timetable.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">Today</p>
                    <p className="mt-2 text-sm font-bold text-slate-800">{clockDate || "Loading date"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">Current rhythm</p>
                    <p className="mt-2 text-sm font-bold text-slate-800">{currentMeal?.label || "Campus day"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">Next meal</p>
                    <p className="mt-2 text-sm font-bold text-slate-800">{nextMeal?.label || "—"}</p>
                  </div>
                </div>

                <Link href="/timetable" className="mt-6 inline-flex items-center rounded-xl bg-[#1746c7] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#123aa5]">
                  Open daily timeline <span className="ml-2">→</span>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-[#1746c7] p-6 text-white shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">Next on campus</p>
              {nextEvent ? (
                <>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight">{nextEvent.title}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-blue-100">
                    <span>{formatDate(nextEvent.event_date)}</span>
                    {nextEvent.event_time && <><span className="h-1 w-1 rounded-full bg-blue-300/60" /><span>{nextEvent.event_time}</span></>}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-blue-100/70">
                    {nextEvent.target || "School Community"}
                  </p>
                  <Link href={`/calendar?date=${nextEvent.event_date}`} className="mt-6 inline-flex items-center text-xs font-bold text-white hover:text-emerald-200">
                    View event <span className="ml-2">→</span>
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="mt-4 text-2xl font-bold">Nothing scheduled yet.</h2>
                  <p className="mt-3 text-sm leading-6 text-blue-100/70">No future campus event is currently recorded in the portal calendar.</p>
                  <Link href="/calendar" className="mt-6 inline-flex items-center text-xs font-bold text-white hover:text-emerald-200">Open calendar <span className="ml-2">→</span></Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            NEWS + UPCOMING
        ================================================= */}
        <section className="mt-14">
          <div className="grid gap-10 lg:grid-cols-[1.55fr_0.85fr]">
            <div>
              <SectionHeading
                eyebrow="Latest News"
                title="Know what changed."
                description="A small homepage window into the automatic VGB news feed. The full feed remains on News."
                action={<Link href="/news" className="text-sm font-bold text-blue-800 hover:text-blue-950">All news →</Link>}
              />

              {newsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="h-3 w-20 rounded bg-slate-100" />
                      <div className="mt-4 h-5 w-4/5 rounded bg-slate-100" />
                      <div className="mt-2 h-5 w-3/5 rounded bg-slate-100" />
                      <div className="mt-5 h-3 w-full rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : featuredNews ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <a href={featuredNews.source_url} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-sm sm:row-span-2">
                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-white/10" />
                    <div className="relative flex h-full min-h-[260px] flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-blue-200">{featuredNews.category}</span>
                          <span className="text-[10px] text-slate-400">{featuredNews.source}</span>
                        </div>
                        <h3 className="mt-6 text-2xl font-bold leading-tight tracking-tight group-hover:text-blue-200">{featuredNews.title}</h3>
                        {featuredNews.summary && <p className="mt-4 text-sm leading-6 text-slate-300">{featuredNews.summary.slice(0, 180)}{featuredNews.summary.length > 180 ? "…" : ""}</p>}
                      </div>
                      <div className="mt-8 text-xs font-bold text-white">Read story <span className="ml-1">↗</span></div>
                    </div>
                  </a>

                  {secondaryNews.map((story) => (
                    <a key={story.id} href={story.source_url} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-700">{story.category}</span>
                        <span className="text-[10px] text-slate-400">{story.source}</span>
                      </div>
                      <h3 className="mt-3 font-bold leading-5 text-slate-900 group-hover:text-blue-800">{story.title}</h3>
                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{story.summary || "Open the original story for the latest details."}</p>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                  <p className="text-sm font-semibold text-slate-800">News is being collected.</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">The automatic feed has no stories available to surface right now.</p>
                  <Link href="/news" className="mt-4 inline-flex text-xs font-bold text-blue-800">Open News →</Link>
                </div>
              )}
            </div>

            <div>
              <SectionHeading
                eyebrow="Upcoming"
                title="What is next."
                description="The next few campus events, not the entire calendar dumped onto your face."
                action={<Link href="/calendar" className="text-sm font-bold text-blue-800 hover:text-blue-950">Calendar →</Link>}
              />

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {upcomingEvents.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {upcomingEvents.slice(0, 4).map((event, index) => {
                      const styles = getCategoryStyles(event.category);
                      const isToday = event.event_date === today;
                      return (
                        <Link key={`${event.title}-${event.event_date}-${index}`} href={`/calendar?date=${event.event_date}`} className="group block p-5 transition hover:bg-slate-50">
                          <div className="flex items-start gap-3">
                            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`} />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-900">{event.title}</h3>
                                {isToday && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">Today</span>}
                              </div>
                              <p className="mt-1 text-xs text-slate-500">
                                {getShortDate(event.event_date)}{event.event_time ? ` · ${event.event_time}` : ""}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-7 text-sm leading-6 text-slate-500">No upcoming campus events are currently recorded.</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            WEATHER
        ================================================= */}
        <section className="mt-14">
          <SectionHeading
            eyebrow="Campus Weather"
            title="Conditions at VidyaGyan."
            description="Live conditions for the Bulandshahr campus, with the short forecast when the weather service cooperates with civilization."
          />

          {weatherLoading && !weather ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
              <div className="h-4 w-28 rounded bg-slate-100" />
              <div className="mt-4 h-10 w-40 rounded bg-slate-100" />
              <div className="mt-3 h-4 w-56 rounded bg-slate-100" />
            </div>
          ) : weather ? (
            <div className="grid gap-4 lg:grid-cols-[0.8fr_1.7fr]">
              <div className="relative overflow-hidden rounded-2xl bg-[#0f1f4d] p-6 text-white shadow-sm">
                <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full border border-white/10" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Now at campus</span>
                    <span className="text-3xl" aria-hidden="true">{getWeatherInfo(weather.current.weatherCode).icon}</span>
                  </div>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-5xl font-bold tracking-tight">{Math.round(weather.current.temperature)}°</span>
                    <span className="mb-1 text-sm text-blue-200">C</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold">{getWeatherInfo(weather.current.weatherCode).label}</p>
                  <p className="mt-1 text-xs text-blue-300">Feels like {Math.round(weather.current.apparentTemperature)}°C</p>
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/10 bg-white/[0.055] p-3"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-300">Humidity</p><p className="mt-1 text-sm font-semibold">{Math.round(weather.current.humidity)}%</p></div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.055] p-3"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-300">Wind</p><p className="mt-1 text-sm font-semibold">{Math.round(weather.current.windSpeed)} km/h</p></div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">7-day forecast</p>
                    <p className="mt-1 text-sm text-slate-500">High / low temperatures and rain probability.</p>
                  </div>
                  <Link href="/" className="hidden text-xs font-semibold text-slate-400 sm:block">Auto-refresh · 15 min</Link>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                  {weather.daily.date.map((date, index) => {
                    const info = getWeatherInfo(weather.daily.weatherCode[index] ?? 0);
                    return (
                      <div key={date} className={`rounded-xl border p-3 text-center ${index === 0 ? "border-emerald-200 bg-emerald-50/70" : "border-slate-100 bg-slate-50/70"}`}>
                        <p className="text-[10px] font-bold text-slate-700">{formatForecastDay(date, index)}</p>
                        <div className="mt-3 text-2xl" aria-label={info.label}>{info.icon}</div>
                        <p className="mt-2 text-sm font-bold text-blue-950">{Math.round(weather.daily.temperatureMax[index] ?? 0)}° <span className="font-normal text-slate-400">/ {Math.round(weather.daily.temperatureMin[index] ?? 0)}°</span></p>
                        <p className="mt-1 text-[10px] font-semibold text-cyan-700">{Math.round(weather.daily.precipitationProbability[index] ?? 0)}% rain</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span>Sunrise {formatWeatherTime(weather.daily.sunrise[0])}</span>
                  <span>Sunset {formatWeatherTime(weather.daily.sunset[0])}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Campus weather is temporarily unavailable.</p>
              <p className="mt-1 text-sm text-slate-500">The rest of the portal remains available normally.</p>
            </div>
          )}
        </section>

        {/* =================================================
            ACADEMIC TOOLS
        ================================================= */}
        <section className="mt-14">
          <SectionHeading
            eyebrow="Academic Tools"
            title="Tools for actually doing things."
            description="The homepage highlights the academic workspace. The Tools hub contains the complete catalogue."
            action={<Link href="/tools" className="text-sm font-bold text-blue-800 hover:text-blue-950">All tools →</Link>}
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {academicTools.map((tool, index) => (
              <Link key={tool.title} href={tool.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">0{index + 1}</span>
                  <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700">→</span>
                </div>
                <h3 className="mt-4 font-bold text-slate-900 group-hover:text-blue-800">{tool.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* =================================================
            QUICK ACCESS
        ================================================= */}
        <section className="mt-14">
          <SectionHeading
            eyebrow="Quick Access"
            title="Everything else, in its proper place."
            description="The homepage should help you get somewhere, not become somewhere you have to live."
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((item) => (
              <Link key={item.title} href={item.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[9px] font-bold uppercase tracking-[0.17em] text-slate-400">{item.label}</span>
                  <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700">→</span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-blue-800">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-9 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-bold text-[#0f1f4d]">VidyaGyan Portal</div>
              <p className="mt-1 text-xs text-slate-500">A unified digital layer for campus information, student life and academic tools.</p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <Link href="/news" className="hover:text-blue-900">News</Link>
              <Link href="/calendar" className="hover:text-blue-900">Calendar</Link>
              <Link href="/timetable" className="hover:text-blue-900">Daily Timeline</Link>
              <Link href="/tools" className="hover:text-blue-900">Tools</Link>
              <Link href="/council" className="hover:text-blue-900">Council</Link>
            </div>
          </div>
          <div className="mt-7 flex flex-col gap-2 border-t border-slate-100 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>VidyaGyan Leadership Academy · Bulandshahr</span>
            <span>Student Portal · 2026–27 · Asia/Kolkata</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
