export type RoutineItem = {
  id: string;
  title: string;
  start: string;
  end: string;
  note?: string;
  kind?: "routine" | "break" | "activity" | "academic" | "hostel";
  days?: number[];
};

const WEEKDAY_ROUTINE: RoutineItem[] = [
  { id: "wake-up", title: "Wake Up Call", start: "05:00", end: "05:00", kind: "hostel" },
  { id: "freshen-up", title: "Freshen Up", start: "05:00", end: "05:30", kind: "hostel" },
  { id: "morning-activity", title: "Morning Yoga & Exercise", start: "05:30", end: "06:15", note: "Monday, Tuesday, Thursday & Friday. Wednesday: March Past. All students on field NCC Monday, Tuesday & Wednesday.", kind: "activity" },
  { id: "getting-ready", title: "Getting ready for school & breakfast", start: "06:15", end: "07:30", kind: "hostel" },
  { id: "reporting", title: "Reporting time students & teachers", start: "07:35", end: "07:35", kind: "academic" },
  { id: "huddle", title: "Huddle", start: "07:35", end: "07:40", kind: "academic" },
  { id: "zero-lesson", title: "Class Teacher’s Lesson / Zero Lesson", start: "07:40", end: "08:00", note: "Monday & Thursday: Morning Assembly.", kind: "academic" },
  { id: "period-1", title: "First Period", start: "08:00", end: "08:50", kind: "academic" },
  { id: "period-2", title: "Second Period", start: "08:50", end: "09:40", kind: "academic" },
  { id: "period-3", title: "Third Period", start: "09:40", end: "10:30", kind: "academic" },
  { id: "morning-snacks", title: "Morning Snacks", start: "10:30", end: "10:45", kind: "break" },
  { id: "period-4", title: "Fourth Period", start: "10:45", end: "11:35", kind: "academic" },
  { id: "period-5", title: "Fifth Period", start: "11:35", end: "12:25", kind: "academic" },
  { id: "period-6", title: "Sixth Period", start: "12:25", end: "13:15", kind: "academic" },
  { id: "period-7", title: "Seventh Period", start: "13:15", end: "14:00", kind: "academic" },
  { id: "lunch", title: "Lunch — Classes VI–XII", start: "14:00", end: "14:45", kind: "break" },
  { id: "rest", title: "Rest", start: "14:45", end: "15:45", kind: "break" },
  { id: "ncc", title: "NCC Classes & Parade", start: "15:10", end: "15:50", note: "NCC students only. Thursday & Friday.", kind: "activity" },
  { id: "evening-activity", title: "Evening Activity — Art / Music / Dance", start: "16:00", end: "17:15", note: "Wednesday: Clubs.", kind: "activity" },
  { id: "evening-snacks", title: "Evening Snacks", start: "17:15", end: "17:35", kind: "break" },
  { id: "get-ready-games", title: "Getting ready for Games / Art / Music / Dance", start: "17:35", end: "17:40", kind: "hostel" },
  { id: "games", title: "Evening Games", start: "17:40", end: "19:10", note: "Wednesday: Clubs.", kind: "activity" },
  { id: "dinner-hostel", title: "Return to hostels, freshen up, dinner and Hostel Routine", start: "19:10", end: "20:10", kind: "hostel" },
  { id: "prep", title: "Supervised Prep — Academic block", start: "20:15", end: "21:30", kind: "academic" },
  { id: "clean-up", title: "Clean spaces / organize next day", start: "21:35", end: "22:05", kind: "hostel" },
  { id: "hostel-routine", title: "Hostel Routine", start: "22:05", end: "22:05", kind: "hostel" },
];

const SATURDAY_ROUTINE: RoutineItem[] = [
  { id: "sat-wake", title: "Wake Up", start: "05:30", end: "05:30", kind: "hostel" },
  { id: "sat-morning", title: "Morning hostel routine / freshening / breakfast", start: "05:30", end: "07:30", kind: "hostel" },
  { id: "sat-reporting", title: "Reporting", start: "07:35", end: "07:35", kind: "academic" },
  { id: "sat-huddle", title: "Huddle", start: "07:35", end: "07:40", kind: "academic" },
  { id: "sat-p1", title: "First Period", start: "07:40", end: "08:25", note: "Grade 9–12. Grade 6–8: Wellness & Meditation.", kind: "academic" },
  { id: "sat-p2", title: "Second Period", start: "08:25", end: "09:10", note: "Grade 9–12. Grade 6: Converging Capacities. Grade 7–8: DTI, Finlit & Kaushal Bodh.", kind: "academic" },
  { id: "sat-p3", title: "Third Period", start: "09:10", end: "09:55", note: "Grade 9–12. Grade 6–8: DTI, Finlit & Kaushal Bodh.", kind: "academic" },
  { id: "sat-p4", title: "Fourth Period", start: "09:55", end: "10:40", note: "Grade 9–12. Grade 6: Soft Skill. Grade 7–8: DTI, Finlit & Kaushal Bodh.", kind: "academic" },
  { id: "sat-snacks", title: "Morning Snacks", start: "10:40", end: "11:00", kind: "break" },
  { id: "sat-p5", title: "Fifth Period", start: "11:00", end: "11:45", note: "Grade 9–12. Grade 6–8: Essential Skills.", kind: "academic" },
  { id: "sat-house", title: "House Meeting / Mentor-Mentee", start: "11:45", end: "12:30", note: "Classes VI–XII.", kind: "activity" },
  { id: "sat-clubs", title: "Club Activities / EMRC", start: "12:30", end: "13:30", note: "Classes 6–10: Club Activities. Classes 11–12: EMRC non-Maths.", kind: "activity" },
  { id: "sat-self-teachers", title: "Self-time — teachers", start: "13:30", end: "14:00", kind: "break" },
  { id: "sat-lunch", title: "Lunch", start: "14:00", end: "15:00", note: "Source schedule states ‘Class VI & XII’; this wording is retained pending verification.", kind: "break" },
  { id: "sat-rest", title: "Rest", start: "15:00", end: "16:00", kind: "break" },
  { id: "sat-self-study", title: "Freshen Up / Self-Study", start: "16:00", end: "17:30", kind: "academic" },
  { id: "sat-evening-snacks", title: "Evening Snacks", start: "17:30", end: "18:00", kind: "break" },
  { id: "sat-games", title: "Games / Me time", start: "18:00", end: "19:30", kind: "activity" },
  { id: "sat-dinner", title: "Dinner", start: "19:30", end: "20:30", kind: "break" },
  { id: "sat-hostel", title: "Hostel Routine", start: "20:30", end: "20:30", kind: "hostel" },
];

export function getRoutineForDate(date: Date): RoutineItem[] {
  const day = date.getDay();
  if (day === 0) return [];
  if (day === 6) return SATURDAY_ROUTINE.map((item) => ({ ...item }));
  return WEEKDAY_ROUTINE.map((item) => ({ ...item }));
}

export function getRoutineForWeek(startDate: Date): RoutineItem[][] {
  return Array.from({ length: 7 }, (_, index) => getRoutineForDate(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + index)));
}

export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatRoutineTime(value: string): string {
  const minutes = timeToMinutes(value);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function getCurrentRoutineItem(items: RoutineItem[], now: Date = new Date()): RoutineItem | null {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return items.find((item) => {
    const start = timeToMinutes(item.start);
    const end = timeToMinutes(item.end);
    return start !== end && start <= minutes && minutes < end;
  }) ?? null;
}

export function getNextRoutineItem(items: RoutineItem[], now: Date = new Date()): RoutineItem | null {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return items.find((item) => timeToMinutes(item.start) > minutes) ?? null;
}
