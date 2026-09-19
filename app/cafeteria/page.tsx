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
  return (
    <article
      className={`group relative overflow-hidden rounded-[1.75rem] border bg-white shadow-[0_14px_40px_-28px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-28px_rgba(15,23,42,0.42)] ${
        featured
          ? "border-slate-300"
          : "border-slate-200/80"
      }`}
    >
      <div
        className={`h-1.5 w-full ${
          meal.title === "Breakfast"
            ? "bg-amber-400"
            : meal.title === "Lunch"
              ? "bg-emerald-500"
              : meal.title === "Dinner"
                ? "bg-indigo-500"
                : "bg-sky-400"
        }`}
      />

      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-xl">
              {meal.icon}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Meal
              </p>

              <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                {meal.title}
              </h3>
            </div>
          </div>

          {featured && (
            <span className="rounded-full bg-slate-950 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
              Today
            </span>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {meal.items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-start gap-3"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />

              <p className="text-sm font-medium leading-5 text-slate-700">
                {item}
              </p>
            </div>
          ))}
        </div>

        {meal.alternatives && meal.alternatives.length > 0 && (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Alternatives / options
            </p>

            <div className="mt-3 space-y-2">
              {meal.alternatives.map((item, index) => (
                <p
                  key={`${item}-${index}`}
                  className="text-xs font-semibold leading-5 text-slate-600"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
        )}

        {meal.notes && meal.notes.length > 0 && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Notes
            </p>

            <div className="mt-2 space-y-1.5">
              {meal.notes.map((note, index) => (
                <p
                  key={`${note}-${index}`}
                  className="text-xs leading-5 text-slate-500"
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
      <div className="flex min-w-max gap-2">
        {WEEK_MENU.map((day) => {
          const selected = day.day === selectedDay;
          const isToday = day.day === today;

          return (
            <button
              key={day.day}
              onClick={() => onSelect(day.day)}
              className={`relative min-w-[76px] rounded-2xl border px-4 py-3 text-center transition-all ${
                selected
                  ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]">
                {day.day}
              </p>

              {isToday && (
                <span
                  className={`absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 ${
                    selected
                      ? "border-slate-950 bg-emerald-400"
                      : "border-white bg-emerald-500"
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

export default function MenuPage() {
  const [today, setToday] = useState("MON");
  const [selectedDay, setSelectedDay] = useState("MON");
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

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

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f7f3] text-slate-900">
      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(251,191,36,0.17),transparent_26%),radial-gradient(circle_at_88%_10%,rgba(16,185,129,0.14),transparent_27%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.1),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-10 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-16">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.55)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(245,158,11,0.45),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.35),transparent_28%),radial-gradient(circle_at_65%_90%,rgba(59,130,246,0.3),transparent_30%)]" />

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/[0.03]" />
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/10 bg-white/[0.03]" />
            <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-white/10" />

            <div className="relative grid min-h-[400px] items-center lg:grid-cols-[1.2fr_0.8fr]">
              <div className="px-7 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                    VidyaGyan Dulhera · Mess Menu
                  </span>
                </div>

                <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.94] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                  What's
                  <br />
                  <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-emerald-300 bg-clip-text text-transparent">
                    cooking?
                  </span>
                </h1>

                <p className="mt-7 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                  The weekly mess menu, organised by day and meal so you can
                  see what is being served without decoding a spreadsheet.
                </p>

                {currentDate && (
                  <div className="mt-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                      Today
                    </p>

                    <p className="mt-1 text-xl font-bold text-white">
                      {DAY_NAMES[today]} · {formatDate(currentDate)}
                    </p>
                  </div>
                )}
              </div>

              <div className="relative hidden min-h-[400px] items-center justify-center lg:flex">
                <div className="absolute h-72 w-72 rounded-full bg-gradient-to-br from-amber-400/20 via-emerald-400/15 to-blue-400/20 blur-3xl" />

                <div className="relative h-64 w-64">
                  <div className="absolute inset-0 rounded-full border border-white/10" />
                  <div className="absolute inset-7 rounded-full border border-white/10" />
                  <div className="absolute inset-14 rounded-full border border-white/10" />

                  <div className="absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 rounded-full bg-amber-300 shadow-[0_0_25px_rgba(252,211,77,0.8)]" />
                  <div className="absolute bottom-6 left-8 h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_22px_rgba(110,231,183,0.8)]" />
                  <div className="absolute right-5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_25px_rgba(103,232,249,0.8)]" />

                  <div className="absolute inset-[4.5rem] flex items-center justify-center rounded-full border border-white/15 bg-white/10 text-center shadow-2xl backdrop-blur-md">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">
                        5 meals
                      </p>

                      <p className="mt-1 text-xl font-black tracking-tight text-white">
                        Every day
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white/75 px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Daily
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                Breakfast · Lunch · Dinner
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/75 px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Between meals
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                Morning · Evening Snacks
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/75 px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Menu cycle
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                Monday · Sunday
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TODAY / SELECTED DAY */}
      <section
        id="daily-menu"
        className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28"
      >
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {isToday ? "Today · 01" : "Selected Day · 01"}
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {DAY_NAMES[selectedMenu.day]}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {isToday
                  ? "Here is what is on the menu today."
                  : `Menu for ${DAY_NAMES[selectedMenu.day]}.`}
              </p>
            </div>

            {!isToday && (
              <button
                onClick={() => setSelectedDay(today)}
                className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(245,158,11,0.07),transparent_22%),radial-gradient(circle_at_90%_20%,rgba(16,185,129,0.07),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.06),transparent_25%)]" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-9 max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              02 · Week at a glance
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              The whole week.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              A compact overview of the weekly cycle. Select a day above for
              the full menu.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {WEEK_MENU.map((day, index) => (
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
                className={`group rounded-[1.5rem] border bg-[#f9faf7] p-5 text-left transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_-28px_rgba(15,23,42,0.4)] ${
                  selectedDay === day.day
                    ? "border-slate-900 ring-1 ring-slate-900"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-slate-400">
                      Day {String(index + 1).padStart(2, "0")}
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-950">
                      {DAY_NAMES[day.day]}
                    </h3>
                  </div>

                  {day.day === today && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                      Today
                    </span>
                  )}
                </div>

                <div className="mt-5 space-y-2.5">
                  {day.meals.map((meal) => (
                    <div
                      key={meal.title}
                      className="flex items-center gap-2"
                    >
                      <span className="text-sm">
                        {meal.icon}
                      </span>

                      <span className="text-xs font-medium text-slate-500">
                        {meal.title}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 transition-colors group-hover:text-slate-700">
                    View day →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* NOTES */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.3)] sm:p-9">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                03 · Menu notes
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                A few things to know.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-800">
                  Rotating items
                </p>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  Some items in the supplied menu rotate monthly or seasonally.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-800">
                  Alternatives
                </p>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  Alternatives are shown separately wherever the menu provides
                  them.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-800">
                  Quantities
                </p>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  Quantities are retained where specified in the original menu.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-800">
                  Source menu
                </p>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  VidyaGyan Dulhera · menu dated 17 August 2026.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section className="bg-slate-950 py-14">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
            VidyaGyan Dulhera · Mess Menu
          </p>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/50">
            Five meals. Seven days. One considerably more readable menu.
          </p>
        </div>
      </section>
    </main>
  );
}
