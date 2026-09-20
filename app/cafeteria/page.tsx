"use client";

import { useEffect, useMemo, useState } from "react";

type Meal = {
  title: string;
  icon: string;
  items: string[];
  alternatives?: string[];
  notes?: string[];
};

type DayMenu = {
  day: string;
  meals: Meal[];
};

const WEEK_MENU: DayMenu[] = [
  {
    day: "MON",
    meals: [
      {
        title: "Breakfast",
        icon: "☀️",
        items: [
          "Boiled egg",
          "Aloo Sandwich × 2",
          "Sweet Daliya",
          "Banana",
          "Chutney",
        ],
      },
      {
        title: "Morning Snack",
        icon: "🥤",
        items: ["Squash", "Vegetable Patties"],
      },
      {
        title: "Lunch",
        icon: "🍛",
        items: [
          "Rajma Dal",
          "Jeera Aloo",
          "Chapati",
          "Jeera Rice",
          "Raita",
          "Chilli & onion salad",
        ],
      },
      {
        title: "Evening Snack",
        icon: "☕",
        items: ["Roasted peanut chaat", "Squash / Pasta"],
      },
      {
        title: "Dinner",
        icon: "🌙",
        items: [
          "Dal Makhni / Arhar Dal",
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
        ],
        notes: ["Rawa idli"],
      },
      {
        title: "Morning Snack",
        icon: "🥤",
        items: ["Samosa", "Jaljeera"],
        notes: ["Made in-house"],
      },
      {
        title: "Lunch",
        icon: "🍛",
        items: [
          "Mix Dal Fry",
          "Green leafy vegetable",
          "Wheat roti",
          "Rice",
          "Jeera Raita",
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
          "Seasonal vegetable / Ramas Aloo Sabzi / Jeera Aloo",
          "Chana Dal",
          "Wheat chapati",
          "Rice",
          "Seasonal salad",
        ],
        notes: ["Besan Ladoo"],
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
          "Aloo tomato / Black Channa ki sabji",
          "Dahi",
        ],
      },
      {
        title: "Morning Snack",
        icon: "🥤",
        items: ["Boiled Chana Chaat", "Squash"],
        notes: ["PS: 1 cup"],
      },
      {
        title: "Lunch",
        icon: "🍛",
        items: [
          "Seasonal vegetable",
          "Dal",
          "Rice",
          "Roti",
          "Cut cucumber",
          "Cut onion",
          "Raita",
        ],
        notes: ["Cucumber and onion served separately"],
      },
      {
        title: "Evening Snack",
        icon: "☕",
        items: ["Cut fruit · 1 bowl"],
        alternatives: [
          "Papaya",
          "Watermelon",
          "Guava",
          "Seasonal fruits",
        ],
      },
      {
        title: "Dinner",
        icon: "🌙",
        items: [
          "Veg. Manchurian",
          "Fried Rice",
          "Noodles",
          "Chilli Paneer",
        ],
        alternatives: ["Fruit Custard", "Ice-cream"],
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
          "Poha",
          "Peanut butter sandwich",
          "Cold coffee",
        ],
        alternatives: [
          "Poha",
          "Cornflakes",
          "Hot milk",
        ],
        notes: [
          "Boiled egg / banana provided according to vegetarian or non-vegetarian option.",
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
          "Jeera Rice",
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
          "Soya bean Sabzi / Soya Chap",
          "Mix Dal",
          "Wheat roti",
          "Rice",
          "Seasonal salad",
        ],
        notes: ["Kheer"],
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
          "Pav Bhaji",
          "Milk porridge",
          "Chutney",
        ],
        notes: ["Pav must be heated in butter."],
      },
      {
        title: "Morning Snack",
        icon: "🥤",
        items: ["Chocolate / Vanilla muffin", "Squash"],
        notes: ["Vanilla muffin once a month."],
      },
      {
        title: "Lunch",
        icon: "🍛",
        items: [
          "Tehri",
          "Seasonal vegetable gravy",
          "Wheat roti",
          "Onion",
          "Cucumber / Jeera Raita",
        ],
      },
      {
        title: "Evening Snack",
        icon: "☕",
        items: [
          "Vegetable sandwich",
          "Cucumber & tomato",
          "Cheese",
          "Squash",
        ],
        alternatives: ["Golgappa", "Channa & potato"],
      },
      {
        title: "Dinner",
        icon: "🌙",
        items: [
          "Dal",
          "Wheat chapati",
          "Rice",
          "Seasonal salad",
        ],
        alternatives: [
          "Paneer Curry",
          "Chicken Curry",
          "Veg / non-veg Biryani",
          "Tomato chutney",
          "Dal",
          "Chapati",
        ],
        notes: [
          "Gulab Jamun.",
          "White Rasgulla once a month.",
          "Biryani option is listed as a monthly rotation.",
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
          "Chole Kulcha × 3",
          "Coffee",
        ],
        notes: ["Senior students: 3–5 pieces."],
      },
      {
        title: "Morning Snack",
        icon: "🥤",
        items: ["Flavoured chocolate milk", "Rusk × 3"],
        notes: ["PS: 3 pieces"],
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
          "Arhar Dal",
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
        items: ["Cream Roll × 1"],
        alternatives: ["Seasonal fruits"],
        notes: ["No banana with the seasonal fruit option."],
      },
      {
        title: "Lunch",
        icon: "🍛",
        items: [
          "Lauki Chana Dal",
          "Seasonal dry vegetable",
          "Wheat chapati",
          "Rice",
          "Raita",
          "Seasonal salad",
        ],
      },
      {
        title: "Evening Snack",
        icon: "☕",
        items: ["Dhokla", "Squash"],
        alternatives: ["Papri Chaat"],
      },
      {
        title: "Dinner",
        icon: "🌙",
        items: [
          "Paneer Curry / Egg Curry",
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

function MealCard({
  meal,
  featured = false,
}: {
  meal: Meal;
  featured?: boolean;
}) {
  const style =
    MEAL_STYLES[meal.title] ?? MEAL_STYLES.Breakfast;

  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border bg-white shadow-[0_18px_55px_-34px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_60px_-32px_rgba(15,23,42,0.45)] ${
        featured
          ? "border-slate-900 ring-2 ring-slate-900/5"
          : "border-slate-200"
      }`}
    >
      <div
        className={`h-1.5 bg-gradient-to-r ${style.accent}`}
      />

      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${style.icon}`}
            >
              {meal.icon}
            </div>

            <div className="min-w-0">
              <p
                className={`text-[9px] font-bold uppercase tracking-[0.17em] ${style.soft.replace(
                  "bg-",
                  "text-",
                )}`}
              >
                {style.label}
              </p>

              <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                {meal.title}
              </h3>
            </div>
          </div>

          {featured && (
            <span className="shrink-0 rounded-full bg-slate-950 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-white">
              Today
            </span>
          )}
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

              <p className="text-sm font-semibold leading-5 text-slate-700">
                {item}
              </p>
            </div>
          ))}
        </div>

        {meal.alternatives &&
          meal.alternatives.length > 0 && (
            <div
              className={`mt-6 rounded-2xl border border-white/80 p-4 ${style.soft}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">↔</span>

                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
                  Alternatives
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {meal.alternatives.map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

        {meal.notes && meal.notes.length > 0 && (
          <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">ℹ️</span>

              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-700">
                Notes
              </p>
            </div>

            <div className="mt-2 space-y-1.5">
              {meal.notes.map((note, index) => (
                <p
                  key={`${note}-${index}`}
                  className="text-xs leading-5 text-amber-900/70"
                >
                  {note}
                </p>
              ))}
            </div>
          </div>
        )}
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
                  selected ? "text-white/60" : "text-slate-400"
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

  useEffect(() => {
    const now = new Date();
    const currentDay = DAY_SHORT[now.getDay()];

    setToday(currentDay);
    setSelectedDay(currentDay);
    setCurrentDate(now);
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

      {/* TODAY */}
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
                  {isToday
                    ? "Today's menu"
                    : "Selected day"}
                </p>
              </div>

              <h2 className="mt-2 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl">
                {DAY_NAMES[selectedMenu.day]}
                <span className="text-slate-300">.</span>
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {isToday
                  ? "Here is what is being served today."
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
          {selectedMenu.meals.map((meal, index) => (
            <MealCard
              key={meal.title}
              meal={meal}
              featured={isToday && index === 0}
            />
          ))}
        </div>
      </section>

      {/* WEEK AT A GLANCE */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(245,158,11,0.08),transparent_22%),radial-gradient(circle_at_92%_15%,rgba(16,185,129,0.08),transparent_23%)]" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                02 · Week at a glance
              </p>

              <h2 className="mt-2 text-4xl font-black tracking-[-0.035em] text-slate-950">
                Seven days.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                A quick look at what's coming. Click any day to jump back
                to its complete menu.
              </p>
            </div>

            <div className="hidden rounded-full bg-slate-100 px-4 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 sm:block">
              5 meals · 7 days
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {WEEK_MENU.map((day, index) => {
              const lunch = day.meals.find(
                (meal) => meal.title === "Lunch",
              );

              const dinner = day.meals.find(
                (meal) => meal.title === "Dinner",
              );

              const selected = selectedDay === day.day;
              const isCurrentDay = today === day.day;

              return (
                <button
                  key={day.day}
                  onClick={() => {
                    setSelectedDay(day.day);

                    document
                      .getElementById("daily-menu")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  }}
                  className={`group relative overflow-hidden rounded-[1.75rem] border p-5 text-left transition-all duration-300 hover:-translate-y-1.5 ${
                    selected
                      ? "border-slate-900 bg-slate-950 text-white shadow-xl shadow-slate-900/15"
                      : "border-slate-200 bg-[#fafbf8] hover:border-slate-300 hover:bg-white hover:shadow-[0_20px_50px_-30px_rgba(15,23,42,0.4)]"
                  }`}
                >
                  {selected && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400" />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className={`text-[9px] font-black uppercase tracking-[0.17em] ${
                          selected
                            ? "text-white/40"
                            : "text-slate-400"
                        }`}
                      >
                        Day {String(index + 1).padStart(2, "0")}
                      </p>

                      <h3
                        className={`mt-1 text-xl font-black ${
                          selected
                            ? "text-white"
                            : "text-slate-950"
                        }`}
                      >
                        {DAY_NAMES[day.day]}
                      </h3>
                    </div>

                    {isCurrentDay && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] ${
                          selected
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        Today
                      </span>
                    )}
                  </div>

                  <div className="mt-6 space-y-3">
                    {lunch && (
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 text-sm">
                          🍛
                        </span>

                        <div className="min-w-0">
                          <p
                            className={`text-[9px] font-black uppercase tracking-[0.12em] ${
                              selected
                                ? "text-white/40"
                                : "text-slate-400"
                            }`}
                          >
                            Lunch
                          </p>

                          <p
                            className={`mt-0.5 line-clamp-2 text-xs font-semibold ${
                              selected
                                ? "text-white/80"
                                : "text-slate-600"
                            }`}
                          >
                            {lunch.items.slice(0, 2).join(" · ")}
                          </p>
                        </div>
                      </div>
                    )}

                    {dinner && (
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 text-sm">
                          🌙
                        </span>

                        <div className="min-w-0">
                          <p
                            className={`text-[9px] font-black uppercase tracking-[0.12em] ${
                              selected
                                ? "text-white/40"
                                : "text-slate-400"
                            }`}
                          >
                            Dinner
                          </p>

                          <p
                            className={`mt-0.5 line-clamp-2 text-xs font-semibold ${
                              selected
                                ? "text-white/80"
                                : "text-slate-600"
                            }`}
                          >
                            {dinner.items.slice(0, 2).join(" · ")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className={`mt-6 border-t pt-4 ${
                      selected
                        ? "border-white/10"
                        : "border-slate-200"
                    }`}
                  >
                    <span
                      className={`text-[9px] font-black uppercase tracking-[0.14em] transition-colors ${
                        selected
                          ? "text-white/60"
                          : "text-slate-400 group-hover:text-slate-800"
                      }`}
                    >
                      View full menu →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CAFETERIA COMMITTEE */}
      <section className="relative overflow-hidden bg-[#f5f7f2] py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,0.09),transparent_25%),radial-gradient(circle_at_85%_85%,rgba(59,130,246,0.07),transparent_25%)]" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
              03 · Cafeteria Committee
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
              04 · House coordination
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
              05 · Student representatives
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

      {/* NOTES */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="overflow-hidden rounded-[2.25rem] bg-slate-950 p-7 shadow-[0_25px_70px_-35px_rgba(15,23,42,0.5)] sm:p-9">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                06 · Menu notes
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
                A few things to know.
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-white/45">
                Details retained from the supplied menu so quantities,
                alternatives and rotations don't mysteriously vanish into
                the design department.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "Rotating items",
                  text: "Some items in the supplied menu rotate monthly or seasonally.",
                },
                {
                  title: "Alternatives",
                  text: "Alternatives are shown separately wherever the menu provides them.",
                },
                {
                  title: "Quantities",
                  text: "Quantities are retained where specified in the original menu.",
                },
                {
                  title: "Source menu",
                  text: "VidyaGyan Dulhera · menu dated 17 August 2026.",
                },
              ].map((note, index) => (
                <div
                  key={note.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-[10px] font-black text-white/60">
                      0{index + 1}
                    </span>

                    <p className="text-xs font-black text-white">
                      {note.title}
                    </p>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-white/45">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>
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
