/*
 * Extended cafeteria serving windows.
 *
 * These are not class periods. A meal stays current across the
 * whole serving window, which is wider than the short meal slot
 * on the school timetable.
 *
 * Breakfast       until 09:00
 * Morning Snack   09:00–12:00
 * Lunch           12:00–15:00
 * Evening Snack   15:00–18:00
 * Dinner          18:00–21:00
 * After 21:00     no active meal
 */

export type MealTitle =
  | "Breakfast"
  | "Morning Snack"
  | "Lunch"
  | "Evening Snack"
  | "Dinner";

export type MealWindow = {
  title: MealTitle;
  startHour: number;
  endHour: number;
  description: string;
};

export const MEAL_WINDOWS: MealWindow[] = [
  {
    title: "Breakfast",
    startHour: 0,
    endHour: 9,
    description: "Morning meal",
  },
  {
    title: "Morning Snack",
    startHour: 9,
    endHour: 12,
    description: "Morning break",
  },
  {
    title: "Lunch",
    startHour: 12,
    endHour: 15,
    description: "Midday meal",
  },
  {
    title: "Evening Snack",
    startHour: 15,
    endHour: 18,
    description: "Afternoon break",
  },
  {
    title: "Dinner",
    startHour: 18,
    endHour: 21,
    description: "Evening meal",
  },
];

export function formatMealWindow(meal: MealWindow) {
  const start = String(meal.startHour).padStart(2, "0");
  const end = String(meal.endHour).padStart(2, "0");
  return `${start}:00 – ${end}:00`;
}

export function getCurrentMealWindow(totalMinutes: number) {
  return (
    MEAL_WINDOWS.find(
      (meal) =>
        totalMinutes >= meal.startHour * 60 &&
        totalMinutes < meal.endHour * 60
    ) ?? null
  );
}

export function getNextMealWindow(totalMinutes: number) {
  return (
    MEAL_WINDOWS.find(
      (meal) => meal.startHour * 60 > totalMinutes
    ) ?? null
  );
}

export function getCurrentMealIndex(totalMinutes: number) {
  return MEAL_WINDOWS.findIndex(
    (meal) =>
      totalMinutes >= meal.startHour * 60 &&
      totalMinutes < meal.endHour * 60
  );
}
