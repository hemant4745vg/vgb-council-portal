"use client";

import { useEffect, useMemo, useState } from "react";

type Meal = {
  title: string;
  icon: string;
  items: string[];
};

type DayMenu = {
  day: string;
  meals: Meal[];
};

type MealStatus =
  | "current"
  | "next"
  | "served"
  | "upcoming";

const WEEK_MENU: DayMenu[] = [
  {
    day: "MON",
    meals: [
      {
        title: "Breakfast",
        icon: "☀️",
        items: [
          "Boiled egg",
          "Aloo sandwich × 2",
          "Sweet daliya",
          "Banana",
          "Chutney",
        ],
      },
      {
        title: "Morning Snack",
        icon: "🥤",
        items: ["Squash", "Vegetable patties"],
      },
      {
        title: "Lunch",
        icon: "🍛",
        items: [
          "Rajma dal",
          "Jeera aloo",
          "Chapati",
          "Jeera rice",
          "Raita",
          "Chilli & onion salad",
        ],
      },
      {
        title: "Evening Snack",
        icon: "☕",
        items: ["Roasted peanut chaat with squash / Pasta"],
      },
      {
        title: "Dinner",
        icon: "🌙",
        items: [
          "Dal Makhni / Arhar dal",
          "Seasonal vegetable",
          "Wheat roti",
          "Rice",
          "Onion & cucumber",
        ],
      },
    ],
  },

  {
    day: "TUE",
    meals: [
      {
        title: "Breakfast",
        icon: "☀️",
        items: [
          "Vada × 2",
          "Idli × 2",
          "Sambar",
          "Coconut chutney",
          "Rawa idli",
        ],
      },
      {
        title: "Morning Snack",
        icon: "🥤",
        items: ["Samosa", "Jaljeera (made in-house)"],
      },
      {
        title: "Lunch",
        icon: "🍛",
        items: [
          "Mix dal fry",
          "Any green leafy vegetable",
          "Wheat roti",
          "Rice",
          "Jeera raita",
        ],
      },
      {
        title: "Evening Snack",
        icon: "☕",
        items: ["Cold milk", "Bakery cookies"],
      },
      {
        title: "Dinner",
        icon: "🌙",
        items: [
          "Seasonal vegetable / Ramas aloo sabzi / Jeera aloo",
          "Chana dal",
          "Wheat chapati",
          "Rice",
          "Seasonal salad",
          "Besan ladoo",
        ],
      },
    ],
  },

  {
    day: "WED",
    meals: [
      {
        title: "Breakfast",
        icon: "☀️",
        items: [
          "Puri",
          "Aloo tomato ki sabji / Black channa ki sabji",
          "Dahi",
        ],
      },
      {
        title: "Morning Snack",
        icon: "🥤",
        items: ["Boiled chana chaat", "Squash × 1 cup"],
      },
      {
        title: "Lunch",
        icon: "🍛",
        items: [
          "Any seasonal vegetable",
          "Dal",
          "Rice",
          "Roti",
          "Cut cucumber and onion, served separately",
          "Raita",
        ],
      },
      {
        title: "Evening Snack",
        icon: "☕",
        items: [
          "Papaya",
          "Watermelon",
          "Guava × 1",
          "Other seasonal fruits",
        ],
      },
      {
        title: "Dinner",
        icon: "🌙",
        items: [
          "Veg. Manchurian",
          "Fried rice",
          "Noodles",
          "Chilli paneer",
          "Fruit custard / Ice-cream",
        ],
      },
    ],
  },

  {
    day: "THU",
    meals: [
      {
        title: "Breakfast",
        icon: "☀️",
        items: [
          "Rotation 1: Poha + peanut butter sandwich + cold coffee",
          "Rotation 2: Poha + cornflakes + hot milk",
          "Boiled egg",
          "Banana",
        ],
      },
      {
        title: "Morning Snack",
        icon: "🥤",
        items: ["Coconut cookies / Bounce", "Flavoured milk"],
      },
      {
        title: "Lunch",
        icon: "🍛",
        items: [
          "Chole",
          "Seasonal vegetable",
          "Jeera rice",
          "Chapati",
          "Papad",
          "Onion salad",
        ],
      },
      {
        title: "Evening Snack",
        icon: "☕",
        items: ["Macaroni"],
      },
      {
        title: "Dinner",
        icon: "🌙",
        items: [
          "Soya bean sabzi / Soya chap",
          "Mix dal",
          "Wheat roti",
          "Rice",
          "Seasonal salad",
          "Kheer",
        ],
      },
    ],
  },

  {
    day: "FRI",
    meals: [
      {
        title: "Breakfast",
        icon: "☀️",
        items: [
          "Pav bhaji (pav must be heated in butter)",
          "Milk porridge",
          "Chutney",
        ],
      },
      {
        title: "Morning Snack",
        icon: "🥤",
        items: [
          "Chocolate muffin / Vanilla muffin with squash",
          "Vanilla muffin once a month",
        ],
      },
      {
        title: "Lunch",
        icon: "🍛",
        items: [
          "Tehri",
          "Seasonal vegetable gravy",
          "Wheat roti",
          "Onion",
          "Cucumber / Jeera raita",
        ],
      },
      {
        title: "Evening Snack",
        icon: "☕",
        items: [
          "Vegetable sandwich (cucumber, tomato & cheese) with squash",
          "Golgappa with channa & potato",
        ],
      },
      {
        title: "Dinner",
        icon: "🌙",
        items: [
          "Paneer curry",
          "Chicken curry",
          "Dal",
          "Wheat chapati",
          "Rice",
          "Seasonal salad",
          "Gulab jamun",
          "Once a month: Veg/non-veg biryani with tomato chutney, dal & chapati",
          "White rasgulla once a month",
        ],
      },
    ],
  },

  {
    day: "SAT",
    meals: [
      {
        title: "Breakfast",
        icon: "☀️",
        items: [
          "Chole kulcha × 3",
          "3–5 kulchas for senior students",
          "Coffee",
        ],
      },
      {
        title: "Morning Snack",
        icon: "🥤",
        items: ["Flavoured chocolate milk", "Rusk × 3"],
      },
      {
        title: "Lunch",
        icon: "🍛",
        items: [
          "Lobhiya",
          "Rice",
          "Chapati",
          "Mixed vegetable",
          "Salad",
          "Papad",
        ],
      },
      {
        title: "Evening Snack",
        icon: "☕",
        items: ["Bhelpuri", "Lemon water"],
      },
      {
        title: "Dinner",
        icon: "🌙",
        items: [
          "Seasonal vegetable",
          "Arhar dal",
          "Wheat roti",
          "Rice",
          "Seasonal salad",
        ],
      },
    ],
  },

  {
    day: "SUN",
    meals: [
      {
        title: "Breakfast",
        icon: "☀️",
        items: [
          "Plain paratha",
          "Aloo tomato ki sabji",
        ],
      },
      {
        title: "Morning Snack",
        icon: "🥤",
        items: [
          "Cream roll × 1 / Seasonal fruits",
          "No banana",
        ],
      },
      {
        title: "Lunch",
        icon: "🍛",
        items: [
          "Lauki chana dal",
          "Seasonal veg sukha",
          "Wheat chapati",
          "Rice",
          "Raita",
          "Seasonal salad",
        ],
      },
      {
        title: "Evening Snack",
        icon: "☕",
        items: ["Dhokla with squash / Papri chaat"],
      },
      {
        title: "Dinner",
        icon: "🌙",
        items: [
          "Paneer curry / Egg curry",
          "Dal",
          "Wheat chapati",
          "Rice",
          "Salad",
        ],
      },
    ],
  },
];

const DAY_NAMES: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

const DAY_SHORT: Record<number, string> = {
  0: "SUN",
  1: "MON",
  2: "TUE",
  3: "WED",
  4: "THU",
  5: "FRI",
  6: "SAT",
};

const CAFETERIA_COMMITTEE = [
  "Col. Abhishake Rai",
  "Bhupal Giri Goswami",
  "Narendra",
];

const HOUSE_SUPPORT = [
  {
    house: "Jal",
    person: "Sushil Thapa",
    color: "from-blue-500 to-cyan-400",
    soft: "bg-blue-50 border-blue-100 text-blue-950",
    accent: "bg-blue-500",
  },
  {
    house: "Vayu",
    person: "Tarannum",
    color: "from-amber-400 to-yellow-300",
    soft: "bg-amber-50 border-amber-100 text-amber-950",
    accent: "bg-amber-400",
  },
  {
    house: "Agni",
    person: "Animesh Singh",
    color: "from-red-500 to-orange-400",
    soft: "bg-red-50 border-red-100 text-red-950",
    accent: "bg-red-500",
  },
  {
    house: "Prithvi",
    person: "Sakshi",
    color: "from-emerald-500 to-green-400",
    soft: "bg-emerald-50 border-emerald-100 text-emerald-950",
    accent: "bg-emerald-500",
  },
];

const HONOUR_LEADERSHIP = [
  {
    role: "Honour Secretaries",
    people: ["Krish", "Pravesh"],
  },
  {
    role: "Joint Honour Secretaries",
    people: ["Hemant Rathore", "Tejaswani"],
  },
];

const MEAL_STYLES: Record<
  string,
  {
    accent: string;
    soft: string;
    icon: string;
    label: string;
  }
> = {
  Breakfast: {
    accent: "from-amber-400 to-orange-400",
    soft: "bg-amber-50",
    icon: "bg-amber-100 text-amber-700",
    label: "Start strong",
  },

  "Morning Snack": {
    accent: "from-cyan-400 to-sky-500",
    soft: "bg-cyan-50",
    icon: "bg-cyan-100 text-cyan-700",
    label: "Between meals",
  },

  Lunch: {
    accent: "from-emerald-400 to-green-500",
    soft: "bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-700",
    label: "Main meal",
  },

  "Evening Snack": {
    accent: "from-orange-400 to-rose-400",
    soft: "bg-orange-50",
    icon: "bg-orange-100 text-orange-700",
    label: "Afternoon",
  },

  Dinner: {
    accent: "from-indigo-500 to-violet-500",
    soft: "bg-indigo-50",
    icon: "bg-indigo-100 text-indigo-700",
    label: "End the day",
  },
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/*
 * Returns the current India Standard Time.
 *
 * We deliberately use Asia/Kolkata instead of the browser's local
 * timezone so the cafeteria schedule follows campus time.
 */
function getIndiaTimeParts() {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());

  const hour = Number(
    parts.find((part) => part.type === "hour")?.value ?? 0,
  );

  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0,
  );

  return {
    hour,
    minute,
    totalMinutes: hour * 60 + minute,
  };
}

/*
 * Meal schedule:
 *
 * Breakfast       < 09:00
 * Morning Snack   09:00–11:59
 * Lunch           12:00–14:59
 * Evening Snack   15:00–17:59
 * Dinner          18:00–20:59
 * After 21:00     No active meal
 */
function getCurrentMealIndex() {
  const { totalMinutes } = getIndiaTimeParts();

  if (totalMinutes < 9 * 60) {
    return 0;
  }

  if (totalMinutes < 12 * 60) {
    return 1;
  }

  if (totalMinutes < 15 * 60) {
    return 2;
  }

  if (totalMinutes < 18 * 60) {
    return 3;
  }

  if (totalMinutes < 21 * 60) {
    return 4;
  }

  return -1;
}

function getMealStatus(
  index: number,
  currentMealIndex: number,
): MealStatus {
  if (currentMealIndex === -1) {
    return "served";
  }

  if (index === currentMealIndex) {
    return "current";
  }

  if (index < currentMealIndex) {
    return "served";
  }

  if (index === currentMealIndex + 1) {
    return "next";
  }

  return "upcoming";
}

function MealCard({
  meal,
  status = "upcoming",
}: {
  meal: Meal;
  status?: MealStatus;
}) {
  const style =
    MEAL_STYLES[meal.title] ?? MEAL_STYLES.Breakfast;

  const isCurrent = status === "current";
  const isNext = status === "next";
  const isServed = status === "served";

  const labelColor = (() => {
    switch (meal.title) {
      case "Breakfast":
        return "text-amber-700";

      case "Morning Snack":
        return "text-cyan-700";

      case "Lunch":
        return "text-emerald-700";

      case "Evening Snack":
        return "text-orange-700";

      case "Dinner":
        return "text-indigo-700";

      default:
        return "text-slate-600";
    }
  })();

  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border bg-white transition-all duration-300 ${
        isCurrent
          ? "border-emerald-400 ring-2 ring-emerald-400/20 shadow-[0_24px_70px_-30px_rgba(16,185,129,0.5)]"
          : isNext
          ? "border-slate-300 shadow-[0_18px_55px_-34px_rgba(15,23,42,0.4)]"
          : "border-slate-200 shadow-[0_18px_55px_-34px_rgba(15,23,42,0.25)]"
      } ${
        isServed
          ? "opacity-75"
          : "hover:-translate-y-1.5 hover:shadow-[0_26px_60px_-32px_rgba(15,23,42,0.45)]"
      }`}
    >
      <div
        className={`h-1.5 bg-gradient-to-r ${style.accent}`}
      />

      {isCurrent && (
        <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-white shadow-lg shadow-emerald-500/20">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Now serving
        </div>
      )}

      {isNext && (
        <div className="absolute right-5 top-5 rounded-full bg-slate-950 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-white">
          Next
        </div>
      )}

      {isServed && (
        <div className="absolute right-5 top-5 rounded-full bg-slate-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-slate-500">
          Served
        </div>
      )}

      <div
        className={`p-6 sm:p-7 ${
          isCurrent ? "bg-emerald-50/35" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${style.icon}`}
            >
              {meal.icon}
            </div>

            <div className="min-w-0">
              <p
                className={`text-[9px] font-bold uppercase tracking-[0.17em] ${labelColor}`}
              >
                {style.label}
              </p>

              <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                {meal.title}
              </h3>
            </div>
          </div>
        </div>

        <div className="mt-7 space-y-2.5">
          {meal.items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-start gap-3"
            >
              <span
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r ${style.accent}`}
              />

              <p
                className={`text-sm font-semibold leading-5 ${
                  isServed
                    ? "text-slate-500"
                    : "text-slate-700"
                }`}
              >
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function DaySelector({
  selectedDay,
  onSelect,
  today,
}: {
  selectedDay: string;
  onSelect: (day: string) => void;
  today: string;
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-2.5">
        {WEEK_MENU.map((day, index) => {
          const selected = day.day === selectedDay;
          const isToday = day.day === today;

          return (
            <button
              key={day.day}
              onClick={() => onSelect(day.day)}
              className={`group relative min-w-[88px] overflow-hidden rounded-2xl border px-4 py-3.5 text-center transition-all duration-200 ${
                selected
                  ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-900/15"
                  : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {selected && (
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400" />
              )}

              <p
                className={`text-[9px] font-black uppercase tracking-[0.16em] ${
                  selected
                    ? "text-white/60"
                    : "text-slate-400"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </p>

              <p className="mt-1 text-xs font-black">
                {day.day}
              </p>

              {isToday && (
                <span
                  className={`mx-auto mt-2 block h-1.5 w-1.5 rounded-full ${
                    selected
                      ? "bg-emerald-300"
                      : "bg-emerald-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CommitteeCard({
  name,
  index,
}: {
  name: string;
  index: number;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_55px_-30px_rgba(15,23,42,0.4)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500" />

      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 to-slate-700 text-sm font-black text-white">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-600">
            Committee Member
          </p>

          <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950">
            {name}
          </h3>
        </div>
      </div>
    </article>
  );
}

function HouseSupportCard({
  house,
  person,
  color,
  soft,
  accent,
}: {
  house: string;
  person: string;
  color: string;
  soft: string;
  accent: string;
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[1.75rem] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_-30px_rgba(15,23,42,0.35)] ${soft}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color}`}
      />

      <div className="flex items-center justify-between gap-5">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-60">
            {house} House
          </p>

          <p className="mt-3 text-[9px] font-black uppercase tracking-[0.14em] opacity-50">
            Co-House Master
          </p>

          <h3 className="mt-1 text-xl font-black tracking-tight">
            {person}
          </h3>
        </div>

        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] ${accent} shadow-lg`}
        >
          <span className="text-lg font-black text-white">
            {house[0]}
          </span>
        </div>
      </div>
    </article>
  );
}

function StudentLeadershipCard({
  role,
  people,
}: {
  role: string;
  people: string[];
}) {
  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-rose-400" />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-600">
            Student Leadership
          </p>

          <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
            {role}
          </h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm text-white shadow-lg shadow-violet-500/20">
          ✦
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {people.map((person) => (
          <div
            key={person}
            className="rounded-2xl bg-gradient-to-br from-slate-50 to-white px-4 py-4 ring-1 ring-slate-100"
          >
            <p className="text-sm font-bold text-slate-800">
              {person}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function CafeteriaPage() {
  const [today, setToday] = useState("MON");
  const [selectedDay, setSelectedDay] = useState("MON");
  const [currentDate, setCurrentDate] =
    useState<Date | null>(null);

  const [currentMealIndex, setCurrentMealIndex] =
    useState(-1);

  useEffect(() => {
    function updateCampusTime() {
      const now = new Date();
      const currentDay = DAY_SHORT[now.getDay()];

      setToday(currentDay);
      setCurrentDate(now);
      setCurrentMealIndex(getCurrentMealIndex());
    }

    updateCampusTime();

    const interval = window.setInterval(
      updateCampusTime,
      30_000,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const selectedMenu = useMemo(
    () =>
      WEEK_MENU.find((day) => day.day === selectedDay) ??
      WEEK_MENU[0],
    [selectedDay],
  );

  const isToday = selectedDay === today;

  const todayMenu =
    WEEK_MENU.find((day) => day.day === today) ??
    WEEK_MENU[0];

  const todayMealCount = todayMenu.meals.length;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7f2] text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(245,158,11,0.18),transparent_25%),radial-gradient(circle_at_90%_12%,rgba(16,185,129,0.16),transparent_27%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.1),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-8 sm:pt-12 lg:px-8 lg:pb-16">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-emerald-950 shadow-[0_35px_90px_-40px_rgba(15,23,42,0.65)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(245,158,11,0.45),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.38),transparent_27%),radial-gradient(circle_at_70%_90%,rgba(59,130,246,0.32),transparent_30%)]" />

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/[0.03]" />
            <div className="absolute -right-4 -top-4 h-40 w-40 rounded-full border border-white/10" />
            <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-white/10" />

            <div className="relative grid items-center lg:grid-cols-[1.15fr_0.85fr]">
              <div className="px-7 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]" />

                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
                    VidyaGyan Dulhera · Mess Menu
                  </span>
                </div>

                <h1 className="mt-7 max-w-2xl text-5xl font-black leading-[0.92] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                  What's
                  <br />
                  <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-emerald-300 bg-clip-text text-transparent">
                    cooking?
                  </span>
                </h1>

                <p className="mt-7 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                  Your weekly mess menu, organised by day and meal. No
                  spreadsheet archaeology required.
                </p>

                {currentDate && (
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/45">
                        Today
                      </p>

                      <p className="mt-1 text-sm font-bold text-white">
                        {DAY_NAMES[today]}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/45">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-bold text-white">
                        {formatDate(currentDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative hidden min-h-[420px] items-center justify-center lg:flex">
                <div className="absolute h-80 w-80 rounded-full bg-gradient-to-br from-amber-400/20 via-emerald-400/15 to-cyan-400/20 blur-3xl" />

                <div className="relative h-72 w-72">
                  <div className="absolute inset-0 rounded-full border border-white/10" />
                  <div className="absolute inset-8 rounded-full border border-white/10" />
                  <div className="absolute inset-16 rounded-full border border-white/10" />

                  <div className="absolute left-1/2 top-0 -translate-x-1/2 text-3xl">
                    ☀️
                  </div>

                  <div className="absolute bottom-5 left-4 text-2xl">
                    🥤
                  </div>

                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-3xl">
                    🍛
                  </div>

                  <div className="absolute bottom-12 right-7 text-2xl">
                    🌙
                  </div>

                  <div className="absolute inset-20 flex items-center justify-center rounded-full border border-white/15 bg-white/10 text-center shadow-2xl backdrop-blur-xl">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
                        Every day
                      </p>

                      <p className="mt-1 text-4xl font-black text-white">
                        {todayMealCount}
                      </p>

                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                        meals
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Daily",
                value: "Breakfast · Lunch · Dinner",
                icon: "🍽️",
                color: "text-amber-600",
              },
              {
                label: "Between meals",
                value: "Morning · Evening Snacks",
                icon: "🥤",
                color: "text-cyan-600",
              },
              {
                label: "Menu cycle",
                value: "Monday · Sunday",
                icon: "↻",
                color: "text-emerald-600",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/85 px-5 py-4 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-lg ${stat.color}`}
                >
                  {stat.icon}
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                    {stat.label}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-800">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DAILY MENU */}
      <section
        id="daily-menu"
        className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28"
      >
        <div className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.55)]" />

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                  {isToday ? "Today's menu" : "Selected day"}
                </p>
              </div>

              <h2 className="mt-2 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl">
                {DAY_NAMES[selectedMenu.day]}
                <span className="text-slate-300">.</span>
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {isToday
                  ? currentMealIndex >= 0
                    ? `Now serving: ${todayMenu.meals[currentMealIndex]?.title}.`
                    : "Today's menu. All scheduled meals have been served."
                  : `Menu for ${DAY_NAMES[selectedMenu.day]}.`}
              </p>
            </div>

            {!isToday && (
              <button
                onClick={() => setSelectedDay(today)}
                className="w-fit rounded-full bg-slate-950 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Back to today
              </button>
            )}
          </div>
        </div>

        <DaySelector
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
          today={today}
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {selectedMenu.meals.map((meal, index) => {
            const status = isToday
              ? getMealStatus(index, currentMealIndex)
              : "upcoming";

            return (
              <MealCard
                key={meal.title}
                meal={meal}
                status={status}
              />
            );
          })}
        </div>
      </section>

      {/* CAFETERIA COMMITTEE */}
      <section className="relative overflow-hidden bg-[#f5f7f2] py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,0.09),transparent_25%),radial-gradient(circle_at_85%_85%,rgba(59,130,246,0.07),transparent_25%)]" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
              02 · Cafeteria Committee
            </p>

            <h2 className="mt-2 text-4xl font-black tracking-[-0.035em] text-slate-950">
              The people behind the mess.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              The institutional team associated with cafeteria and mess
              coordination.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {CAFETERIA_COMMITTEE.map((name, index) => (
              <CommitteeCard
                key={name}
                name={name}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* HOUSE SUPPORT */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28">
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
              03 · House coordination
            </p>

            <h2 className="mt-2 text-4xl font-black tracking-[-0.035em] text-slate-950">
              House support.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Co-House Masters connected with each house.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {HOUSE_SUPPORT.map((house) => (
              <HouseSupportCard
                key={house.house}
                house={house.house}
                person={house.person}
                color={house.color}
                soft={house.soft}
                accent={house.accent}
              />
            ))}
          </div>
        </div>
      </section>

      {/* STUDENT REPRESENTATIVES */}
      <section className="relative overflow-hidden bg-[#f5f7f2] py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(168,85,247,0.09),transparent_25%),radial-gradient(circle_at_10%_85%,rgba(59,130,246,0.07),transparent_25%)]" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
              04 · Student representatives
            </p>

            <h2 className="mt-2 text-4xl font-black tracking-[-0.035em] text-slate-950">
              Student representatives.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Student leadership connected with cafeteria coordination and
              representation.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {HONOUR_LEADERSHIP.map((group) => (
              <StudentLeadershipCard
                key={group.role}
                role={group.role}
                people={group.people}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section className="bg-slate-950 py-14">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
              VidyaGyan Dulhera · Mess Menu
            </p>
          </div>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/40">
            Five meals. Seven days. One considerably more readable menu.
          </p>
        </div>
      </section>
    </main>
  );
}
