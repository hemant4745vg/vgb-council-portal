"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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

interface WeatherDay {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number;
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
  daily: WeatherDay[];
  sunrise: string;
  sunset: string;
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
  if (code === 0) return { icon: "☀️", label: "Clear sky" };
  if (code === 1) return { icon: "🌤️", label: "Mainly clear" };
  if (code === 2) return { icon: "⛅", label: "Partly cloudy" };
  if (code === 3) return { icon: "☁️", label: "Overcast" };
  if ([45, 48].includes(code)) return { icon: "🌫️", label: "Foggy" };
  if ([51, 53, 55].includes(code)) return { icon: "🌦️", label: "Drizzle" };
  if ([56, 57].includes(code)) return { icon: "🌧️", label: "Freezing drizzle" };
  if ([61, 63, 65].includes(code)) return { icon: "🌧️", label: "Rain" };
  if ([66, 67].includes(code)) return { icon: "🌧️", label: "Freezing rain" };
  if ([71, 73, 75, 77].includes(code)) return { icon: "❄️", label: "Snow" };
  if ([80, 81, 82].includes(code)) return { icon: "🌦️", label: "Rain showers" };
  if ([85, 86].includes(code)) return { icon: "🌨️", label: "Snow showers" };
  if ([95, 96, 99].includes(code)) return { icon: "⛈️", label: "Thunderstorm" };

  return { icon: "🌡️", label: "Variable conditions" };
}

function formatForecastDay(dateString: string, index: number) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function formatWeatherTime(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  return date.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
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

  const digits = Array.from(
    { length: 20 },
    (_, index) => index % 10
  );

  const targetIndex = 10 + numericValue;

  return (
    <span
      className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-middle"
      aria-hidden="true"
    >
      <span
        className="absolute left-0 top-0 flex flex-col"
        style={{
          transform: animate
            ? `translateY(-${targetIndex}em)`
            : "translateY(-0em)",
          transition: animate
            ? `transform 1.25s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
            : "none",
        }}
      >
        {digits.map((digit, index) => (
          <span
            key={`${digit}-${index}`}
            className="flex h-[1em] items-center justify-center"
          >
            {digit}
          </span>
        ))}
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

    const numericTime = time.match(
      /^(\d{2}):(\d{2}):(\d{2})/
    );

    if (!numericTime) return;

    const target = `${numericTime[1]}:${numericTime[2]}:${numericTime[3]}`;

    const timeout = window.setTimeout(() => {
      setDisplayTime(target);
      setMeridiem(
        time.includes("PM") ? "PM" : "AM"
      );
      setHasAnimated(true);
    }, 50);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [time]);

  const digits = displayTime.replace(
    /:/g,
    ""
  );

  const digitDelays = [
    0,
    90,
    180,
    300,
    390,
    480,
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

        <span className="mx-[0.04em] opacity-70">
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

        <span className="mx-[0.04em] opacity-70">
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

function WeatherCard({
  weather,
  loading,
  error,
}: {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-sm">
        <div className="animate-pulse p-6 sm:p-7">
          <div className="h-3 w-36 rounded bg-slate-200" />
          <div className="mt-5 h-12 w-32 rounded bg-slate-100" />
          <div className="mt-3 h-4 w-48 rounded bg-slate-100" />
          <div className="mt-7 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !weather) {
    return (
      <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl">
            🌦️
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Campus Weather
            </p>
            <h3 className="mt-2 text-xl font-bold text-blue-950">
              Weather unavailable
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              The live forecast could not be loaded right now. The rest of the portal is still available normally.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const currentInfo = getWeatherInfo(weather.current.weatherCode);

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[0.9fr_1.7fr]">
        <div className="relative overflow-hidden bg-blue-950 p-6 text-white sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full border border-emerald-300/10" />

          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                  Campus Weather
                </p>
                <p className="mt-1 text-xs text-blue-300">
                  VidyaGyan · Dulhera, Bulandshahr
                </p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[9px] font-semibold text-blue-200">
                Live
              </span>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <span className="text-5xl leading-none" aria-hidden="true">
                {currentInfo.icon}
              </span>

              <div>
                <div className="text-5xl font-bold tracking-[-0.05em] tabular-nums">
                  {Math.round(weather.current.temperature)}°
                </div>
                <p className="mt-1 text-sm font-medium text-blue-200">
                  {currentInfo.label}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.055] p-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-300">
                  Feels like
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {Math.round(weather.current.apparentTemperature)}°C
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.055] p-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-300">
                  Humidity
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {Math.round(weather.current.humidity)}%
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.055] p-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-300">
                  Wind
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {Math.round(weather.current.windSpeed)} km/h
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.055] p-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-300">
                  Precipitation
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {weather.current.precipitation.toFixed(1)} mm
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-blue-300">
              <span>☀ Sunrise {formatWeatherTime(weather.sunrise)}</span>
              <span>☾ Sunset {formatWeatherTime(weather.sunset)}</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                7-day forecast
              </p>
              <h3 className="mt-2 text-xl font-bold text-blue-950">
                The week ahead.
              </h3>
            </div>

            <span className="hidden text-[10px] text-slate-400 sm:block">
              °C · precipitation chance
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {weather.daily.map((day, index) => {
              const info = getWeatherInfo(day.weatherCode);

              return (
                <div
                  key={day.date}
                  className={`rounded-xl border p-3 ${
                    index === 0
                      ? "border-blue-200 bg-blue-50/70"
                      : "border-slate-100 bg-slate-50/60"
                  }`}
                >
                  <p className="text-[10px] font-bold text-slate-700">
                    {formatForecastDay(day.date, index)}
                  </p>

                  <div className="mt-3 text-2xl" aria-hidden="true">
                    {info.icon}
                  </div>

                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    {info.label}
                  </p>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-sm font-bold text-blue-950">
                      {Math.round(day.temperatureMax)}°
                    </span>
                    <span className="text-xs text-slate-400">
                      / {Math.round(day.temperatureMin)}°
                    </span>
                  </div>

                  <p className="mt-2 text-[10px] font-medium text-sky-700">
                    💧 {Math.round(day.precipitationProbability)}%
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>Forecast for the school campus coordinates.</span>
            <span>Weather data · Open-Meteo</span>
          </div>
        </div>
      </div>
    </section>
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
    useState<string | null>(null);

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
     CAMPUS WEATHER
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function fetchWeather() {
      try {
        setWeatherLoading(true);
        setWeatherError(null);

        const params = new URLSearchParams({
          latitude: "28.3835",
          longitude: "77.7049",
          current:
            "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day",
          daily:
            "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
          temperature_unit: "celsius",
          wind_speed_unit: "kmh",
          precipitation_unit: "mm",
          timezone: "Asia/Kolkata",
          forecast_days: "7",
        });

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            `Weather request failed with status ${response.status}`
          );
        }

        const data = await response.json();

        if (!mounted) return;

        if (
          !data.current ||
          !data.daily ||
          !Array.isArray(data.daily.time)
        ) {
          throw new Error("Weather response was incomplete.");
        }

        setWeather({
          current: {
            temperature: Number(data.current.temperature_2m),
            apparentTemperature: Number(
              data.current.apparent_temperature
            ),
            humidity: Number(
              data.current.relative_humidity_2m
            ),
            precipitation: Number(
              data.current.precipitation
            ),
            windSpeed: Number(
              data.current.wind_speed_10m
            ),
            weatherCode: Number(
              data.current.weather_code
            ),
            isDay: Number(data.current.is_day) === 1,
          },
          daily: data.daily.time.map(
            (date: string, index: number) => ({
              date,
              weatherCode: Number(
                data.daily.weather_code[index]
              ),
              temperatureMax: Number(
                data.daily.temperature_2m_max[index]
              ),
              temperatureMin: Number(
                data.daily.temperature_2m_min[index]
              ),
              precipitationProbability: Number(
                data.daily.precipitation_probability_max?.[index] ?? 0
              ),
            })
          ),
          sunrise: data.daily.sunrise?.[0] || "",
          sunset: data.daily.sunset?.[0] || "",
        });
      } catch (error) {
        console.error("Unable to fetch campus weather:", error);

        if (mounted) {
          setWeatherError(
            "Live weather is temporarily unavailable."
          );
        }
      } finally {
        if (mounted) {
          setWeatherLoading(false);
        }
      }
    }

    fetchWeather();

    const refreshInterval = window.setInterval(
      fetchWeather,
      15 * 60 * 1000
    );

    return () => {
      mounted = false;
      window.clearInterval(refreshInterval);
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0,_#f7f8f5_42%,_#eef2ef_100%)] font-sans text-slate-900">

      <main className="mx-auto max-w-7xl px-5 py-7 lg:px-8 lg:py-10">

        {/* =================================================
            HERO
        ================================================= */}

        <section
          id="home"
          className="relative overflow-hidden rounded-[2rem] bg-blue-950 text-white shadow-xl"
        >

          {/* Background geometry */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden">

            <div className="absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full border border-white/[0.08]" />

            <div className="absolute -right-8 -top-8 h-[300px] w-[300px] rounded-full border border-white/[0.07]" />

            <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.025]" />

            <div className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full border border-emerald-300/[0.08]" />

            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          </div>

          <div className="relative px-6 py-9 sm:px-10 md:px-14 md:py-12 lg:px-16 lg:py-14">

            {/* =================================================
                TOP CONTEXT
            ================================================= */}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

              <div>

                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-3.5 py-1.5">

                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                    VidyaGyan Bulandshahr
                  </span>

                </div>

                <h1 className="mt-5 text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl md:text-5xl">
                  {greeting},{" "}
                  {firstName}.
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-200/80 md:text-base">
                  Here&apos;s what&apos;s
                  happening on campus
                  today.
                </p>

              </div>

              {profile && (
                <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 backdrop-blur-sm">

                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <div className="text-right">

                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-300">
                      {profile.role ||
                        "Student"}
                    </p>

                    <p className="text-xs font-medium text-white">
                      Campus account
                    </p>

                  </div>

                </div>
              )}

            </div>

            {/* =================================================
                CLOCK + NEXT EVENT
            ================================================= */}

            <div className="mx-auto mt-8 max-w-5xl">

              <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">

                {/* =================================================
                    CLOCK
                ================================================= */}

                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.055] px-5 py-7 shadow-inner backdrop-blur-sm sm:px-8 sm:py-8">

                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035]" />

                  <div className="relative">

                    <div className="flex items-center justify-center gap-2">

                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                      <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-200">
                        Campus Time
                      </span>

                    </div>

                    <div className="mt-5">

                      <AnimatedClock
                        time={clockTime}
                        date={clockDate}
                      />

                    </div>

                  </div>

                </div>

                {/* =================================================
                    NEXT EVENT
                ================================================= */}

                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.055] px-6 py-6 backdrop-blur-sm sm:px-8 sm:py-7">

                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full border border-white/10" />

                  <div className="relative">

                    <div className="flex items-center justify-between gap-3">

                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                        Next on Campus
                      </span>

                      {nextEvent && (
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold text-blue-100">
                          {nextEventDays === 0
                            ? "Today"
                            : nextEventDays === 1
                            ? "Tomorrow"
                            : `${nextEventDays} days`}
                        </span>
                      )}

                    </div>

                    {nextEvent ? (
                      <>
                        <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
                          {nextEvent.title}
                        </h2>

                        <div className="mt-4 flex flex-wrap items-center gap-2">

                          <span className="text-sm font-medium text-blue-200">
                            {formatDate(
                              nextEvent.event_date
                            )}
                          </span>

                          {nextEvent.event_time && (
                            <>
                              <span className="h-1 w-1 rounded-full bg-blue-400/50" />

                              <span className="text-sm text-blue-200">
                                {nextEvent.event_time}
                              </span>
                            </>
                          )}

                          {nextEvent.category && (
                            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-blue-100">
                              {nextEvent.category}
                            </span>
                          )}

                        </div>

                        <p className="mt-4 text-xs leading-5 text-blue-300">
                          {nextEvent.target ||
                            "School Community"}

                          {nextEvent.description &&
                            ` · ${nextEvent.description}`}
                        </p>

                        <Link
                          href={`/calendar?date=${nextEvent.event_date}`}
                          className="mt-5 inline-flex items-center rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                        >
                          View event

                          <span className="ml-1.5">
                            →
                          </span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
                          No upcoming events
                        </h2>

                        <p className="mt-3 text-xs leading-5 text-blue-300">
                          There are currently
                          no future events
                          recorded in the
                          portal calendar.
                        </p>

                        <Link
                          href="/calendar"
                          className="mt-5 inline-flex items-center rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                        >
                          Open Calendar

                          <span className="ml-1.5">
                            →
                          </span>
                        </Link>
                      </>
                    )}

                  </div>
                </div>

              </div>

            </div>

            {/* =================================================
                HERO ACTIONS
            ================================================= */}

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">

              <a
                href="#today"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-blue-950 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-md"
              >
                View Today
              </a>

              <Link
                href="/cafeteria"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                Today&apos;s Menu
              </Link>

              <Link
                href="/calendar"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                Open Calendar
              </Link>

            </div>

            {/* =================================================
                STATUS
            ================================================= */}

            <div className="mt-8 flex items-center justify-center gap-3 text-[10px] text-blue-300/60">

              <span className="h-px w-10 bg-white/10" />

              <span>
                Student Portal · 2026–27
              </span>

              <span className="h-px w-10 bg-white/10" />

            </div>

          </div>
        </section>

        {/* =================================================
            TODAY
        ================================================= */}

        <section
          id="today"
          className="mt-10 scroll-mt-24"
        >

          <SectionHeading
            eyebrow="Today"
            title="What matters right now."
            description="A quick campus snapshot. The detailed pages contain the full information."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {/* =================================================
                TODAY ON CAMPUS
            ================================================= */}

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Today on Campus
                </span>

                <span className="text-xs text-slate-400">
                  {formatDate(today)}
                </span>

              </div>

              <h3 className="mt-4 text-xl font-bold text-blue-950">
                {todayEvents.length > 0
                  ? `${todayEvents.length} scheduled event${
                      todayEvents.length > 1
                        ? "s"
                        : ""
                    }`
                  : "A quieter day"}
              </h3>

              {todayEvents.length > 0 ? (
                <div className="mt-4 space-y-3">

                  {todayEvents
                    .slice(0, 3)
                    .map(
                      (event, index) => {
                        const styles =
                          getCategoryStyles(
                            event.category
                          );

                        return (
                          <div
                            key={`${event.title}-${event.event_date}-${index}`}
                            className="flex items-start gap-3"
                          >

                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${styles.dot}`}
                            />

                            <div className="min-w-0">

                              <p className="text-sm font-semibold text-slate-800">
                                {event.title}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {event.target ||
                                  "School Community"}

                                {event.event_time &&
                                  ` · ${event.event_time}`}
                              </p>

                            </div>

                          </div>
                        );
                      }
                    )}

                  {todayEvents.length > 3 && (
                    <Link
                      href="/calendar"
                      className="inline-block pt-1 text-xs font-semibold text-blue-900 hover:text-emerald-700"
                    >
                      +{" "}
                      {todayEvents.length -
                        3}{" "}
                      more on Calendar →
                    </Link>
                  )}

                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  No event is recorded for
                  today in the current
                  calendar.
                </p>
              )}

            </div>

            {/* =================================================
                TIME-AWARE MENU
            ================================================= */}

            <div className="relative overflow-hidden rounded-2xl bg-blue-950 p-5 text-white shadow-sm">

              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full border border-white/10" />

              <div className="relative">

                <div className="flex items-center justify-between">

                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                    Today&apos;s Menu
                  </span>

                  {currentMeal && (
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold text-blue-100">
                      Now
                    </span>
                  )}

                </div>

                <h3 className="mt-4 text-xl font-bold">
                  {currentMeal?.label ||
                    "Campus dining"}
                </h3>

                <p className="mt-1 text-xs text-blue-300">
                  {currentMeal?.description ||
                    "Daily cafeteria menu"}
                </p>

                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.055] p-4">

                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-300">
                    Menu
                  </p>

                  <p className="mt-2 text-sm leading-6 text-blue-100/80">
                    Menu details are maintained
                    on the Cafeteria page.
                  </p>

                  <Link
                    href="/cafeteria"
                    className="mt-3 inline-flex items-center text-xs font-semibold text-white hover:text-emerald-300"
                  >
                    View {currentMeal?.label || "menu"}
                    <span className="ml-1.5">
                      →
                    </span>
                  </Link>

                </div>

                {nextMeal && (
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs">

                    <span className="text-blue-300">
                      Next
                    </span>

                    <span className="font-semibold text-blue-100">
                      {nextMeal.label}
                    </span>

                  </div>
                )}

              </div>

            </div>

            {/* =================================================
                QUICK CAMPUS STATUS
            ================================================= */}

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-700">
                  Calendar
                </span>

                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
                  {futureEventCount} upcoming
                </span>

              </div>

              <h3 className="mt-4 text-xl font-bold text-blue-950">
                Plan ahead.
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Browse the academic year,
                examinations, sports,
                cultural programmes and
                excursions.
              </p>

              <Link
                href="/calendar"
                className="mt-5 inline-flex items-center text-xs font-semibold text-blue-950 transition hover:text-emerald-700"
              >
                Explore full calendar

                <span className="ml-1">
                  →
                </span>
              </Link>

            </div>

          </div>
        </section>

        {/* =================================================
            CAMPUS WEATHER
        ================================================= */}

        <section className="mt-14">

          <SectionHeading
            eyebrow="Campus Weather"
            title="Conditions at VidyaGyan."
            description="Live conditions and the next seven days for the Bulandshahr campus. No device location access is required."
          />

          <WeatherCard
            weather={weather}
            loading={weatherLoading}
            error={weatherError}
          />

        </section>

        {/* =================================================
            CAMPUS SNAPSHOT
        ================================================= */}

        <section className="mt-14">

          <SectionHeading
            eyebrow="Campus Snapshot"
            title="A few things worth knowing."
            description="Quick access to the parts of campus life you are most likely to need."
          />

          <div className="grid gap-4 md:grid-cols-3">

            {/* =================================================
                NEXT EVENT
            ================================================= */}

            <div className="relative overflow-hidden rounded-2xl bg-blue-950 p-5 text-white shadow-sm">

              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/10" />

              <div className="relative">

                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                  Next Up
                </div>

                {nextEvent ? (
                  <>
                    <h3 className="mt-4 text-xl font-bold">
                      {nextEvent.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-2">

                      <span className="text-sm text-blue-200">
                        {formatDate(
                          nextEvent.event_date
                        )}
                      </span>

                      {nextEvent.event_time && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-blue-400/50" />

                          <span className="text-sm text-blue-200">
                            {nextEvent.event_time}
                          </span>
                        </>
                      )}

                    </div>

                    <p className="mt-3 text-xs leading-5 text-blue-300">
                      {nextEvent.target ||
                        "School Community"}

                      {nextEvent.description &&
                        ` · ${nextEvent.description}`}
                    </p>

                    <div className="mt-5 inline-flex rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white">
                      {nextEventDays === 0
                        ? "Happening today"
                        : nextEventDays === 1
                        ? "Tomorrow"
                        : `${nextEventDays} days away`}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="mt-4 text-xl font-bold">
                      No upcoming events
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-blue-300">
                      Nothing is currently
                      scheduled in the
                      portal calendar.
                    </p>
                  </>
                )}

              </div>

            </div>

            {/* =================================================
                CAMPUS NOTICES
            ================================================= */}

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">
                  Campus Notices
                </span>

                <span className="h-2 w-2 rounded-full bg-slate-300" />

              </div>

              <h3 className="mt-4 text-xl font-bold text-blue-950">
                No notices connected yet.
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                The homepage is ready for
                official campus announcements
                once a notice source is
                connected.
              </p>

              <div className="mt-5 text-xs font-semibold text-slate-400">
                Official notices only
              </div>

            </div>

            {/* =================================================
                PROFILE
            ================================================= */}

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Your Portal
                </span>

                <span className="h-2 w-2 rounded-full bg-emerald-400" />

              </div>

              {profile ? (
                <>
                  <h3 className="mt-4 text-xl font-bold text-blue-950">
                    {profile.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {profile.role ||
                      "Student"}
                  </p>

                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Your portal access is
                    connected to your verified
                    campus account.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mt-4 text-xl font-bold text-blue-950">
                    Campus portal
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Sign in to see your
                    personalized campus
                    information.
                  </p>
                </>
              )}

            </div>

          </div>
        </section>

        {/* =================================================
            UPCOMING
        ================================================= */}

        <section className="mt-14">

          <SectionHeading
            eyebrow="Upcoming"
            title="The immediate horizon."
            description="Only the next few events appear here. The complete calendar remains on the Calendar page."
            action={
              <Link
                href="/calendar"
                className="text-sm font-semibold text-blue-950 hover:text-emerald-700"
              >
                View full calendar →
              </Link>
            }
          />

          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-sm">

            {upcomingEvents.length > 0 ? (
              <div className="divide-y divide-slate-100">

                {upcomingEvents.map(
                  (
                    event,
                    index
                  ) => {
                    const styles =
                      getCategoryStyles(
                        event.category
                      );

                    const isToday =
                      event.event_date ===
                      today;

                    return (
                      <Link
                        key={`${event.title}-${event.event_date}-${index}`}
                        href={`/calendar?date=${event.event_date}`}
                        className="group flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      >

                        <div className="flex min-w-0 items-start gap-4">

                          <div className="pt-1">

                            <span
                              className={`block h-2.5 w-2.5 rounded-full ${styles.dot}`}
                            />

                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="font-semibold text-slate-800 group-hover:text-blue-950">
                                {event.title}
                              </h3>

                              {isToday && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-800">
                                  Today
                                </span>
                              )}

                            </div>

                            <p className="mt-1 text-xs text-slate-500">

                              {event.target ||
                                "School Community"}

                              {event.description &&
                                ` · ${event.description}`}

                              {event.event_time &&
                                ` · ${event.event_time}`}

                            </p>

                          </div>

                        </div>

                        <div className="flex shrink-0 items-center gap-3 sm:justify-end">

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles.bg} ${styles.text}`}
                          >
                            {event.category ||
                              "Campus"}
                          </span>

                          <span className="whitespace-nowrap text-xs font-semibold text-slate-500">
                            {getShortDate(
                              event.event_date
                            )}
                          </span>

                          <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-950">
                            →
                          </span>

                        </div>

                      </Link>
                    );
                  }
                )}

              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                No upcoming events are
                currently available.
              </div>
            )}

          </div>
        </section>

        {/* =================================================
            QUICK ACCESS
        ================================================= */}

        <section className="mt-14">

          <SectionHeading
            eyebrow="Quick Access"
            title="Everything else, in its proper place."
            description="Focused pages for the parts of campus life that deserve more than a homepage card."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {[
              {
                title: "Leadership",
                description:
                  "Institutional leadership, house administration and campus structure.",
                href: "/leadership",
                eyebrow: "Institution",
                accent:
                  "from-blue-50 to-indigo-50",
              },
              {
                title: "Council",
                description:
                  "Student Council, functional leadership and house representatives.",
                href: "/council",
                eyebrow:
                  "Student Leadership",
                accent:
                  "from-emerald-50 to-teal-50",
              },
              {
                title: "Cafeteria",
                description:
                  "Daily and weekly menu information for the campus.",
                href: "/cafeteria",
                eyebrow:
                  "Campus Life",
                accent:
                  "from-orange-50 to-amber-50",
              },
              {
                title: "Calendar",
                description:
                  "Annual events, live additions and the complete campus schedule.",
                href: "/calendar",
                eyebrow:
                  "Planning",
                accent:
                  "from-purple-50 to-violet-50",
              },
              {
                title: "Activities",
                description:
                  "Sports, cultural programmes, student initiatives and participation.",
                href: "/activities",
                eyebrow:
                  "Student Life",
                accent:
                  "from-rose-50 to-pink-50",
              },
              {
                title: "Study Material",
                description:
                  "Notes, revision sheets, HOTS and VidyaGyan previous papers.",
                href: "/study-material",
                eyebrow:
                  "Academics",
                accent:
                  "from-cyan-50 to-sky-50",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`group rounded-2xl border border-slate-200/80 bg-gradient-to-br ${item.accent} p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
              >

                <div className="flex items-center justify-between">

                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    {item.eyebrow}
                  </span>

                  <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-950">
                    →
                  </span>

                </div>

                <h3 className="mt-4 text-lg font-bold text-blue-950">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {item.description}
                </p>

                <div className="mt-5 text-xs font-semibold text-blue-950">
                  Explore →
                </div>

              </Link>
            ))}

          </div>
        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="mt-16 border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">

          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">

            {/* Portal */}

            <div>

              <div className="font-bold text-blue-950">
                VidyaGyan Portal
              </div>

              <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                A unified digital layer for
                campus information, student
                life and institutional
                leadership.
              </p>

            </div>

            {/* Portal links */}

            <div>

              <div className="text-xs font-bold text-slate-700">
                Portal
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-500">

                <Link
                  href="/leadership"
                  className="transition hover:text-blue-950"
                >
                  Leadership
                </Link>

                <Link
                  href="/council"
                  className="transition hover:text-blue-950"
                >
                  Council
                </Link>

                <Link
                  href="/cafeteria"
                  className="transition hover:text-blue-950"
                >
                  Cafeteria
                </Link>

                <Link
                  href="/calendar"
                  className="transition hover:text-blue-950"
                >
                  Calendar
                </Link>

                <Link
                  href="/activities"
                  className="transition hover:text-blue-950"
                >
                  Activities
                </Link>

                <Link
                  href="/study-material"
                  className="transition hover:text-blue-950"
                >
                  Study Material
                </Link>

              </div>

            </div>

            {/* Institution */}

            <div className="md:text-right">

              <div className="text-xs font-bold text-slate-700">
                VidyaGyan Bulandshahr
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Student Portal · 2026–27
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Campus Time · Asia/Kolkata
              </p>

            </div>

          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-slate-100 pt-5 md:flex-row md:items-center md:justify-between">

            <span className="text-[10px] text-slate-400">
              VidyaGyan Leadership Academy
            </span>

            <span className="text-[10px] text-slate-400">
              Portal Infrastructure · 2026–27
            </span>

          </div>

        </div>

      </footer>

    </div>
  );
}
