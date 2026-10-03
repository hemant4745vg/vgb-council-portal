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

  const featuredNews = newsStories[0] ?? null;
  const secondaryNews = newsStories.slice(1, 4);

  const quickLinks = [
    { title: "News", label: "Current affairs", href: "/news", description: "India, world, economy and science & technology." },
    { title: "Calendar", label: "Plan ahead", href: "/calendar", description: "Campus events, programmes and important dates." },
    { title: "Daily Timeline", label: "Your day", href: "/timetable", description: "A clear time-based view of the school day." },
    { title: "Tools", label: "Academic workspace", href: "/tools", description: "Interactive tools across sciences and humanities." },
    { title: "Council", label: "Student leadership", href: "/council", description: "Council structure, leadership and houses." },
    { title: "Leadership", label: "Leadership", href: "/leadership", description: "Student leadership and institutional information." },
    { title: "Activities", label: "Student life", href: "/activities", description: "Campus activities, programmes and participation." },
    { title: "Study Material", label: "Study", href: "/study-material", description: "Academic resources and learning material." },
    { title: "Cafeteria", label: "Campus life", href: "/cafeteria", description: "Daily and weekly campus menu information." },
  ];

  const academicTools = [
    { title: "Mathematics", mark: "∑", description: "Calculations, graphs and mathematical workspaces.", href: "/tools/mathematics" },
    { title: "Physics", mark: "◌", description: "Concepts, formulas and physics utilities.", href: "/tools/physics" },
    { title: "Chemistry", mark: "◇", description: "References, structures and interactive study tools.", href: "/tools/chemistry" },
    { title: "Biology", mark: "⌬", description: "Systems, structures and simulation-style learning.", href: "/tools/biology" },
    { title: "Economics", mark: "↗", description: "Models, concepts and economic analysis.", href: "/tools/economics" },
    { title: "Political Science", mark: "◎", description: "Institutions, ideas and political systems.", href: "/tools/political-science" },
  ];

  const featuredWeather = weather ? getWeatherInfo(weather.current.weatherCode) : null;

  return (
    <div className="vgb-home min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans text-slate-900">
      <style jsx global>{`
        @keyframes vgb-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes vgb-orbit-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes vgb-float { 0%, 100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(0,-9px,0); } }
        @keyframes vgb-pulse { 0%, 100% { opacity: .35; transform: scale(.92); } 50% { opacity: .8; transform: scale(1); } }
        @keyframes vgb-scan { 0% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
        @keyframes vgb-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes vgb-shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
        .vgb-orbit { animation: vgb-orbit 26s linear infinite; transform-origin: center; }
        .vgb-orbit-reverse { animation: vgb-orbit-reverse 34s linear infinite; transform-origin: center; }
        .vgb-float { animation: vgb-float 6s ease-in-out infinite; }
        .vgb-pulse { animation: vgb-pulse 3.2s ease-in-out infinite; }
        .vgb-marquee { animation: vgb-marquee 32s linear infinite; }
        .vgb-reveal { animation: vgb-reveal .7s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes vgb-reveal { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          .vgb-orbit, .vgb-orbit-reverse, .vgb-float, .vgb-pulse, .vgb-marquee, .vgb-reveal { animation: none !important; }
        }
      `}</style>

      <main className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

        {/* HERO / DIGITAL CAMPUS */}
        <section className="relative min-h-[570px] overflow-hidden rounded-[2rem] bg-[#071533] text-white shadow-[0_28px_90px_-34px_rgba(7,21,51,.65)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_44%,rgba(23,70,199,.45),transparent_28%),radial-gradient(circle_at_20%_100%,rgba(20,184,166,.12),transparent_34%),linear-gradient(120deg,#071533_0%,#0d2353_58%,#071533_100%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:56px_56px]" />

          <div className="absolute right-[-4%] top-[7%] hidden h-[510px] w-[510px] lg:block">
            <div className="absolute inset-[20%] rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute inset-[7%] rounded-full border border-white/[0.07]" />
            <div className="absolute inset-0 vgb-orbit rounded-full border border-blue-300/20 border-dashed" />
            <div className="absolute inset-[14%] vgb-orbit-reverse rounded-full border border-cyan-200/15" />
            <div className="absolute inset-[27%] rounded-full border border-white/[0.08]" />
            <div className="absolute inset-[35%] vgb-float rounded-full border border-blue-200/20 bg-blue-300/[0.06] shadow-[0_0_80px_rgba(59,130,246,.2)] backdrop-blur-sm">
              <div className="absolute inset-[18%] rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_30%,rgba(147,197,253,.32),rgba(23,70,199,.08)_48%,transparent_70%)]" />
            </div>
            <span className="absolute right-[13%] top-[17%] h-2 w-2 vgb-pulse rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,.8)]" />
            <span className="absolute bottom-[19%] left-[12%] h-1.5 w-1.5 vgb-pulse rounded-full bg-emerald-300" />
            <span className="absolute left-[18%] top-[43%] h-1.5 w-1.5 vgb-pulse rounded-full bg-blue-200" />
            <div className="absolute right-[1%] top-[42%] rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.2em] text-blue-200 backdrop-blur-sm">News</div>
            <div className="absolute bottom-[18%] left-[2%] rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.2em] text-blue-200 backdrop-blur-sm">Tools</div>
            <div className="absolute left-[17%] top-[18%] rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.2em] text-blue-200 backdrop-blur-sm">Calendar</div>
          </div>

          <div className="relative z-10 flex min-h-[570px] flex-col justify-between px-6 py-7 sm:px-9 sm:py-9 md:px-12 md:py-11 lg:px-14 lg:py-12">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-xs font-black tracking-tight">VG</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.24em] text-white">VidyaGyan Portal</p>
                  <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[.16em] text-blue-200/65">Bulandshahr · 2026–27</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                {profile && <span className="hidden rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.16em] text-blue-100/70 sm:inline-flex">{profile.role || "Student"}</span>}
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
                <span className="hidden text-[9px] font-bold uppercase tracking-[.2em] text-emerald-200 sm:inline">Campus systems live</span>
              </div>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1fr_390px] lg:items-end">
              <div className="max-w-2xl vgb-reveal">
                <p className="text-[10px] font-bold uppercase tracking-[.24em] text-blue-300">Your digital campus</p>
                <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-[.96] tracking-[-.055em] sm:text-6xl md:text-7xl">{greeting},<br /><span className="text-blue-100">{firstName}.</span></h1>
                <p className="mt-6 max-w-lg text-sm leading-6 text-blue-100/65 sm:text-base">Campus information, current affairs, your daily rhythm and academic tools, brought together without the usual portal clutter.</p>
                <div className="mt-7 flex flex-wrap gap-2.5">
                  <a href="#right-now" className="group inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#071533] transition duration-300 hover:-translate-y-0.5 hover:bg-blue-50">Explore today <span className="ml-2 transition-transform group-hover:translate-y-0.5">↓</span></a>
                  <Link href="/news" className="group inline-flex items-center rounded-xl border border-white/12 bg-white/[0.055] px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white/10">Read the latest <span className="ml-2 transition-transform group-hover:translate-x-1">↗</span></Link>
                </div>
              </div>

              <div className="relative lg:pb-1">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-[.22em] text-blue-200/70">Campus time</span>
                    <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.18em] text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live</span>
                  </div>
                  <AnimatedClock time={clockTime} date={clockDate} />
                  <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
                    <div><p className="text-[8px] font-bold uppercase tracking-[.18em] text-blue-300/60">Current rhythm</p><p className="mt-1 text-xs font-semibold text-white">{currentMeal?.label || "Campus day"}</p></div>
                    <div><p className="text-[8px] font-bold uppercase tracking-[.18em] text-blue-300/60">Next</p><p className="mt-1 text-xs font-semibold text-white">{nextMeal?.label || "—"}</p></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden items-center justify-between border-t border-white/10 pt-4 sm:flex">
              <span className="text-[9px] font-semibold uppercase tracking-[.2em] text-blue-200/50">A digital layer for campus life</span>
              <span className="text-[9px] font-semibold uppercase tracking-[.2em] text-blue-200/50">Asia / Kolkata · UTC +05:30</span>
            </div>
          </div>
        </section>

        {/* MOVING CAMPUS STRIP */}
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 py-3 text-[9px] font-bold uppercase tracking-[.22em] text-slate-400 shadow-sm">
          <div className="flex w-max vgb-marquee">
            <div className="flex items-center gap-8 pr-8"><span>VGB DIGITAL CAMPUS</span><i className="h-1 w-1 rounded-full bg-blue-500" /><span>2026–27</span><i className="h-1 w-1 rounded-full bg-slate-300" /><span>Campus information</span><i className="h-1 w-1 rounded-full bg-slate-300" /><span>Academic workspace</span><i className="h-1 w-1 rounded-full bg-slate-300" /><span>Student life</span><i className="h-1 w-1 rounded-full bg-slate-300" /></div>
            <div className="flex items-center gap-8 pr-8"><span>VGB DIGITAL CAMPUS</span><i className="h-1 w-1 rounded-full bg-blue-500" /><span>2026–27</span><i className="h-1 w-1 rounded-full bg-slate-300" /><span>Campus information</span><i className="h-1 w-1 rounded-full bg-slate-300" /><span>Academic workspace</span><i className="h-1 w-1 rounded-full bg-slate-300" /><span>Student life</span><i className="h-1 w-1 rounded-full bg-slate-300" /></div>
          </div>
        </div>

        {/* RIGHT NOW */}
        <section id="right-now" className="mt-12 scroll-mt-24">
          <SectionHeading eyebrow="01 · Right now" title="What matters today." description="The homepage surfaces the live pieces. Detailed information remains where it belongs." />
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_14px_45px_-28px_rgba(15,23,42,.35)]">
            <div className="grid lg:grid-cols-[1.35fr_.8fr_.8fr]">
              <Link href="/timetable" className="group relative p-6 transition hover:bg-slate-50 sm:p-7">
                <div className="absolute left-0 top-0 h-full w-1 bg-[#1746c7] opacity-0 transition group-hover:opacity-100" />
                <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-blue-700">Your day</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.035em] text-slate-950">Daily Timeline</h2></div><span className="text-lg text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700">↗</span></div>
                <p className="mt-3 max-w-lg text-xs leading-5 text-slate-500">A time-based view of the school day, designed around your routine rather than a teacher timetable.</p>
                <div className="mt-6 flex items-end justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">Today</p><p className="mt-1 text-sm font-semibold text-slate-800">{clockDate || "Loading date"}</p></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-blue-700">Open timeline</span></div>
              </Link>
              <div className="border-t border-slate-200 p-6 sm:p-7 lg:border-l lg:border-t-0">
                <p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-400">Next on campus</p>
                {nextEvent ? <><h3 className="mt-3 line-clamp-2 text-lg font-semibold tracking-[-.02em] text-slate-950">{nextEvent.title}</h3><p className="mt-2 text-xs text-slate-500">{formatDate(nextEvent.event_date)}{nextEvent.event_time ? ` · ${nextEvent.event_time}` : ""}</p><Link href="/calendar" className="mt-5 inline-flex text-[10px] font-bold uppercase tracking-[.16em] text-blue-700">View calendar ↗</Link></> : <p className="mt-3 text-sm text-slate-500">No upcoming event is currently recorded.</p>}
              </div>
              <div className="border-t border-slate-200 bg-slate-50/70 p-6 sm:p-7 lg:border-l lg:border-t-0">
                <p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-400">Campus rhythm</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-.04em] text-slate-950">{currentMeal?.label || "Campus day"}</p>
                <p className="mt-1 text-xs text-slate-500">{nextMeal ? `Next: ${nextMeal.label}` : "Daily rhythm"}</p>
                <Link href="/cafeteria" className="mt-5 inline-flex text-[10px] font-bold uppercase tracking-[.16em] text-blue-700">Cafeteria ↗</Link>
              </div>
            </div>
          </div>
        </section>

        {/* NEWS */}
        <section className="mt-16">
          <SectionHeading eyebrow="02 · The world, right now" title="Current affairs without the noise." description="A compact editorial window into the latest stories from the portal's news feed." action={<Link href="/news" className="text-xs font-bold uppercase tracking-[.16em] text-blue-700 hover:text-blue-950">All news ↗</Link>} />
          {newsLoading ? (
            <div className="grid gap-4 lg:grid-cols-[1.4fr_.8fr]"><div className="h-[360px] animate-pulse rounded-[1.5rem] bg-white ring-1 ring-slate-200" /><div className="space-y-3"><div className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" /><div className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" /><div className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" /></div></div>
          ) : featuredNews ? (
            <div className="grid gap-4 lg:grid-cols-[1.4fr_.8fr]">
              <a href={featuredNews.source_url} target="_blank" rel="noreferrer" className="group relative min-h-[360px] overflow-hidden rounded-[1.5rem] bg-[#0b1735] text-white shadow-[0_20px_60px_-35px_rgba(7,21,51,.6)]">
                {featuredNews.image_url && <div className="absolute inset-0 bg-cover bg-center transition duration-700 ease-out group-hover:scale-[1.025]" style={{ backgroundImage: `url(${featuredNews.image_url})` }} />}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06122d] via-[#071533]/55 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8"><div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.2em] text-blue-200"><span>{featuredNews.category}</span><span className="h-1 w-1 rounded-full bg-blue-300/60" /><span>{featuredNews.source}</span></div><h3 className="mt-3 max-w-3xl text-2xl font-semibold leading-tight tracking-[-.03em] sm:text-3xl">{featuredNews.title}</h3>{featuredNews.summary && <p className="mt-3 line-clamp-2 max-w-2xl text-xs leading-5 text-blue-100/70">{featuredNews.summary}</p>}<span className="mt-5 inline-flex text-[10px] font-bold uppercase tracking-[.18em] text-white">Read story <span className="ml-2 transition-transform group-hover:translate-x-1">↗</span></span></div>
              </a>
              <div className="divide-y divide-slate-200 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                {secondaryNews.length ? secondaryNews.map((story, index) => <a key={story.id} href={story.source_url} target="_blank" rel="noreferrer" className="group block p-5 transition hover:bg-slate-50"><div className="flex gap-4"><span className="pt-0.5 text-[10px] font-black text-slate-300">0{index + 2}</span><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.16em] text-blue-700">{story.category} · {story.source}</p><h3 className="mt-2 line-clamp-3 text-sm font-semibold leading-5 text-slate-900 group-hover:text-blue-800">{story.title}</h3><p className="mt-2 text-[10px] text-slate-400">{formatDate(story.published_at.slice(0, 10))}</p></div><span className="ml-auto pt-1 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-700">↗</span></div></a>) : <div className="p-6 text-sm text-slate-500">More stories will appear here as the feed updates.</div>}
                <Link href="/news" className="block bg-slate-50 p-5 text-[10px] font-black uppercase tracking-[.18em] text-slate-500 transition hover:bg-blue-50 hover:text-blue-800">Open the full news desk →</Link>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-8 text-center"><p className="text-sm font-semibold text-slate-900">The news desk is quiet right now.</p><p className="mt-1 text-xs text-slate-500">The homepage will populate automatically when new stories are available.</p></div>
          )}
        </section>

        {/* CALENDAR */}
        <section className="mt-16">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[9px] font-black uppercase tracking-[.22em] text-blue-700">03 · Campus calendar</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.045em] text-slate-950 sm:text-4xl">What is coming up.</h2><p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">A quiet timeline for the events that shape the campus week.</p></div><Link href="/calendar" className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">Open calendar ↗</Link></div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_.42fr]">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-7">
              {upcomingEvents.length ? <div className="relative ml-2 border-l border-slate-200">{upcomingEvents.slice(0, 4).map((event, index) => <Link href="/calendar" key={event.id} className="group relative block pb-7 pl-7 last:pb-1"><span className={`absolute -left-[6px] top-1 h-3 w-3 rounded-full border-2 border-white ${index === 0 ? "bg-[#1746c7] shadow-[0_0_0_4px_rgba(23,70,199,.1)]" : "bg-slate-300"}`} /><div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"><div><p className={`text-[9px] font-black uppercase tracking-[.18em] ${index === 0 ? "text-blue-700" : "text-slate-400"}`}>{index === 0 && nextEventDays === 0 ? "Today" : formatDate(event.event_date)}</p><h3 className="mt-1 text-base font-semibold text-slate-900 group-hover:text-blue-800">{event.title}</h3></div><span className="text-[10px] text-slate-400">{event.event_time || "All day"}</span></div></Link>)}</div> : <p className="text-sm text-slate-500">No upcoming campus events are currently recorded.</p>}
            </div>
            <div className="relative overflow-hidden rounded-[1.5rem] bg-[#0f1f4d] p-7 text-white"><div className="absolute -right-16 -top-16 h-44 w-44 rounded-full border border-white/10" /><div className="relative"><p className="text-[9px] font-black uppercase tracking-[.2em] text-blue-300">Campus horizon</p><p className="mt-4 text-5xl font-semibold tracking-[-.06em]">{futureEventCount}</p><p className="mt-1 text-xs text-blue-200/70">recorded upcoming events</p><div className="mt-8 h-px bg-white/10" /><p className="mt-5 text-xs leading-5 text-blue-100/65">Keep the homepage light. Use the calendar when you need the complete institutional picture.</p></div></div>
          </div>
        </section>

        {/* WEATHER */}
        <section className="mt-16">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[9px] font-black uppercase tracking-[.22em] text-emerald-700">04 · Campus atmosphere</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.045em] text-slate-950 sm:text-4xl">Outside, at VidyaGyan.</h2><p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">Live conditions and the short forecast for the campus.</p></div></div>
          {weatherLoading && !weather ? <div className="mt-6 h-64 animate-pulse rounded-[1.5rem] bg-white ring-1 ring-slate-200" /> : weather ? <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"><div className="grid lg:grid-cols-[.8fr_1.2fr]">
            <div className="relative min-h-[270px] overflow-hidden bg-[radial-gradient(circle_at_70%_22%,rgba(125,211,252,.5),transparent_16%),linear-gradient(145deg,#0b2a66,#1746c7_62%,#12347f)] p-7 text-white"><div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-white/10" /><div className="absolute right-12 top-12 h-20 w-20 rounded-full bg-white/10 blur-2xl" /><div className="relative flex h-full flex-col justify-between"><div className="flex items-center justify-between"><p className="text-[9px] font-black uppercase tracking-[.2em] text-blue-100/70">Now at campus</p><span className="text-3xl" aria-hidden="true">{featuredWeather?.icon}</span></div><div><div className="flex items-end gap-2"><span className="text-7xl font-semibold tracking-[-.08em]">{Math.round(weather.current.temperature)}°</span><span className="mb-3 text-sm text-blue-100">C</span></div><p className="text-base font-semibold">{featuredWeather?.label}</p><p className="mt-1 text-xs text-blue-100/65">Feels like {Math.round(weather.current.apparentTemperature)}° · {Math.round(weather.current.humidity)}% humidity · {Math.round(weather.current.windSpeed)} km/h wind</p></div></div></div>
            <div className="p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-400">7-day forecast</p><p className="mt-1 text-xs text-slate-500">High / low and rain probability.</p></div><span className="hidden text-[9px] font-bold uppercase tracking-[.16em] text-slate-400 sm:block">Auto-refresh · 15 min</span></div><div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">{weather.daily.date.map((date, index) => { const info = getWeatherInfo(weather.daily.weatherCode[index] ?? 0); return <div key={date} className={`rounded-xl p-3 text-center transition ${index === 0 ? "bg-blue-50 ring-1 ring-blue-100" : "bg-slate-50 hover:bg-slate-100"}`}><p className="text-[9px] font-bold text-slate-600">{formatForecastDay(date, index)}</p><div className="mt-3 text-xl" aria-label={info.label}>{info.icon}</div><p className="mt-2 text-xs font-bold text-slate-900">{Math.round(weather.daily.temperatureMax[index] ?? 0)}° <span className="font-normal text-slate-400">/ {Math.round(weather.daily.temperatureMin[index] ?? 0)}°</span></p><p className="mt-1 text-[9px] font-semibold text-cyan-700">{Math.round(weather.daily.precipitationProbability[index] ?? 0)}% rain</p></div>; })}</div><div className="mt-5 flex gap-6 border-t border-slate-100 pt-4 text-[10px] text-slate-500"><span>Sunrise {formatWeatherTime(weather.daily.sunrise[0])}</span><span>Sunset {formatWeatherTime(weather.daily.sunset[0])}</span></div></div>
          </div></div> : <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-8 text-center"><p className="text-sm font-semibold text-slate-900">Campus weather is temporarily unavailable.</p><p className="mt-1 text-xs text-slate-500">The rest of the portal remains available normally.</p></div>}
        </section>

        {/* ACADEMIC WORKSPACE */}
        <section className="mt-16">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[9px] font-black uppercase tracking-[.22em] text-blue-700">05 · The workspace</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.045em] text-slate-950 sm:text-4xl">Tools for doing the work.</h2><p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">A curated entrance into the academic tools, with the full catalogue one click away.</p></div><Link href="/tools" className="text-xs font-bold uppercase tracking-[.16em] text-blue-700">All tools ↗</Link></div>
          <div className="mt-6 grid gap-3 md:grid-cols-4 md:grid-rows-2">
            {academicTools.map((tool, index) => <Link key={tool.title} href={tool.href} className={`group relative min-h-[175px] overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_-28px_rgba(23,70,199,.5)] ${index === 0 ? "md:col-span-2 md:row-span-2" : index === 3 ? "md:col-span-2" : ""}`}><div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-50 transition duration-500 group-hover:scale-125" /><div className="relative flex h-full flex-col justify-between"><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-lg font-semibold text-blue-700 ring-1 ring-slate-100 transition group-hover:bg-blue-50">{tool.mark}</span><span className="text-[9px] font-black uppercase tracking-[.16em] text-slate-300">0{index + 1}</span></div><div><h3 className={`${index === 0 ? "text-2xl" : "text-lg"} font-semibold tracking-[-.03em] text-slate-950 group-hover:text-blue-800`}>{tool.title}</h3><p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">{tool.description}</p><span className="mt-4 inline-flex text-[9px] font-black uppercase tracking-[.16em] text-slate-400 transition group-hover:text-blue-700">Open workspace ↗</span></div></div></Link>)}
          </div>
        </section>

        {/* EXPLORE */}
        <section className="mt-16">
          <div className="rounded-[1.75rem] bg-[#071533] p-7 text-white shadow-[0_24px_70px_-35px_rgba(7,21,51,.55)] sm:p-9 lg:p-10"><div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.22em] text-blue-300">06 · Explore VGB</p><h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-.045em] sm:text-4xl">Everything has a place.</h2><p className="mt-3 max-w-xl text-xs leading-5 text-blue-100/60">The homepage stays intentionally selective. The rest of the portal is one click away.</p></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{quickLinks.map((item) => <Link key={item.title} href={item.href} className="group rounded-xl border border-white/10 bg-white/[.045] px-4 py-3 transition hover:-translate-y-0.5 hover:bg-white/[.09]"><span className="block text-[9px] font-black uppercase tracking-[.14em] text-blue-200/60">{item.label}</span><span className="mt-1 block text-xs font-semibold text-white">{item.title}</span><span className="mt-2 block text-xs text-blue-300 transition group-hover:translate-x-1">↗</span></Link>)}</div></div></div>
        </section>
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-9 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8"><div><div className="text-sm font-bold tracking-[-.01em] text-[#0f1f4d]">VidyaGyan Portal</div><p className="mt-1 text-[10px] text-slate-400">A unified digital layer for campus information, student life and academic tools.</p></div><div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">{quickLinks.map((item) => <Link key={item.title} href={item.href} className="transition hover:text-blue-800">{item.title}</Link>)}</div></div>
        <div className="mx-auto max-w-[1440px] border-t border-slate-100 px-5 py-4 text-[9px] text-slate-400 sm:px-6 lg:px-8"><div className="flex flex-col gap-1 sm:flex-row sm:justify-between"><span>VidyaGyan Leadership Academy · Bulandshahr</span><span>Student Portal · 2026–27 · Asia/Kolkata</span></div></div>
      </footer>
    </div>
  );
}
