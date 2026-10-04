export type Category = "Classes" | "Meals" | "Activities" | "Rest/Admin";
export type Grade = "VI" | "VII" | "VIII" | "IX" | "X" | "XI" | "XII";
export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type Entry = {
  id: string;
  title: string;
  start: string;
  end?: string;
  category: Category;
  note?: string;
  grades?: Grade[];
  days?: DayKey[];
  badge?: string;
};

export const DAY_LABELS: Record<DayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

export const DAY_SHORT: Record<DayKey, string> = {
  monday: "MON",
  tuesday: "TUE",
  wednesday: "WED",
  thursday: "THU",
  friday: "FRI",
  saturday: "SAT",
};

export const DAY_ORDER: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const CATEGORY_META: Record<
  Category,
  {
    label: string;
    dot: string;
    line: string;
    soft: string;
    border: string;
    text: string;
  }
> = {
  Classes: {
    label: "Class",
    dot: "bg-blue-600",
    line: "bg-blue-200",
    soft: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-700",
  },
  Meals: {
    label: "Meal",
    dot: "bg-amber-500",
    line: "bg-amber-200",
    soft: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-700",
  },
  Activities: {
    label: "Activity",
    dot: "bg-emerald-600",
    line: "bg-emerald-200",
    soft: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-700",
  },
  "Rest/Admin": {
    label: "Rest / Admin",
    dot: "bg-slate-500",
    line: "bg-slate-200",
    soft: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
  },
};

export const WEEKDAY_BASE: Entry[] = [
  {
    id: "wake",
    title: "Wake Up Call",
    start: "05:00",
    category: "Rest/Admin",
    note: "Start of the daily routine.",
  },
  {
    id: "freshen",
    title: "Freshen Up",
    start: "05:00",
    end: "05:30",
    category: "Rest/Admin",
    note: "30 minutes.",
  },
  {
    id: "morning",
    title: "Morning Yoga & Exercise",
    start: "05:30",
    end: "06:15",
    category: "Activities",
  },
  {
    id: "breakfast",
    title: "Getting Ready for School & Breakfast",
    start: "06:15",
    end: "07:30",
    category: "Meals",
  },
  {
    id: "reporting",
    title: "Reporting Time",
    start: "07:35",
    category: "Classes",
    note: "Students & teachers report to school.",
  },
  {
    id: "huddle",
    title: "Huddle Time",
    start: "07:35",
    end: "07:40",
    category: "Activities",
  },
  {
    id: "zero",
    title: "Class Teacher's Lesson / Zero Lesson",
    start: "07:40",
    end: "08:00",
    category: "Classes",
  },
  {
    id: "p1",
    title: "First Period",
    start: "08:00",
    end: "08:50",
    category: "Classes",
    badge: "P1",
  },
  {
    id: "p2",
    title: "Second Period",
    start: "08:50",
    end: "09:40",
    category: "Classes",
    badge: "P2",
  },
  {
    id: "p3",
    title: "Third Period",
    start: "09:40",
    end: "10:30",
    category: "Classes",
    badge: "P3",
  },
  {
    id: "snack1",
    title: "Break for Morning Snacks",
    start: "10:30",
    end: "10:45",
    category: "Meals",
  },
  {
    id: "p4",
    title: "Fourth Period",
    start: "10:45",
    end: "11:35",
    category: "Classes",
    badge: "P4",
  },
  {
    id: "p5",
    title: "Fifth Period",
    start: "11:35",
    end: "12:25",
    category: "Classes",
    badge: "P5",
  },
  {
    id: "p6",
    title: "Sixth Period",
    start: "12:25",
    end: "13:15",
    category: "Classes",
    badge: "P6",
  },
  {
    id: "p7",
    title: "Seventh Period",
    start: "13:15",
    end: "14:00",
    category: "Classes",
    badge: "P7",
  },
  {
    id: "lunch",
    title: "Lunch",
    start: "14:00",
    end: "14:45",
    category: "Meals",
    grades: ["VI", "VII", "VIII", "IX", "X", "XI", "XII"],
  },
  {
    id: "rest",
    title: "Rest Time",
    start: "14:45",
    end: "15:45",
    category: "Rest/Admin",
  },
  {
    id: "ncc",
    title: "NCC Classes & Parade",
    start: "15:10",
    end: "15:50",
    category: "Activities",
    note: "NCC students only.",
    days: ["thursday", "friday"],
  },
  {
    id: "evening",
    title: "Evening Activity / Clubs",
    start: "16:00",
    end: "17:15",
    category: "Activities",
    days: ["wednesday"],
  },
  {
    id: "snack2",
    title: "Evening Snacks",
    start: "17:15",
    end: "17:35",
    category: "Meals",
  },
  {
    id: "ready",
    title: "Getting Ready for Games / Art / Music / Dance",
    start: "17:35",
    end: "17:40",
    category: "Rest/Admin",
  },
  {
    id: "games",
    title: "Evening Games / Clubs",
    start: "17:40",
    end: "19:10",
    category: "Activities",
    days: ["wednesday"],
  },
  {
    id: "hostel",
    title: "Return to Hostels, Freshen Up, Dinner & Hostel Routine",
    start: "19:10",
    end: "20:10",
    category: "Meals",
  },
  {
    id: "prep",
    title: "Supervised Prep in the Academic Block",
    start: "20:15",
    end: "21:30",
    category: "Classes",
  },
  {
    id: "clean",
    title: "Clean Your Spaces & Organize for the Next Day",
    start: "21:35",
    end: "22:05",
    category: "Rest/Admin",
  },
  {
    id: "hostel-night",
    title: "Hostel Routine",
    start: "22:05",
    category: "Rest/Admin",
    note: "Continues overnight.",
  },
];

export const SATURDAY_BASE: Entry[] = [
  {
    id: "sat-morning",
    title: "Morning Routine at Hostel, Freshening Up & Breakfast",
    start: "05:30",
    end: "07:30",
    category: "Meals",
  },
  {
    id: "sat-report",
    title: "Reporting Time",
    start: "07:35",
    category: "Classes",
    note: "Students & teachers.",
  },
  {
    id: "sat-huddle",
    title: "Huddle Time",
    start: "07:35",
    end: "07:40",
    category: "Activities",
  },
  {
    id: "sat-p1",
    title: "First Period",
    start: "07:40",
    end: "08:25",
    category: "Classes",
    grades: ["IX", "X", "XI", "XII"],
    badge: "P1",
  },
  {
    id: "sat-p1-jr",
    title: "Wellness & Meditation Session",
    start: "07:40",
    end: "08:25",
    category: "Activities",
    grades: ["VI", "VII", "VIII"],
  },
  {
    id: "sat-p2",
    title: "Second Period",
    start: "08:25",
    end: "09:10",
    category: "Classes",
    grades: ["IX", "X", "XI", "XII"],
    badge: "P2",
  },
  {
    id: "sat-p2-jr",
    title: "Converging Capacities / DTI / FinLit / Kaushal Bodh",
    start: "08:25",
    end: "09:10",
    category: "Classes",
    grades: ["VI", "VII", "VIII"],
  },
  {
    id: "sat-p3",
    title: "Third Period",
    start: "09:10",
    end: "09:55",
    category: "Classes",
    grades: ["IX", "X", "XI", "XII"],
    badge: "P3",
  },
  {
    id: "sat-p3-jr",
    title: "DTI / FinLit / Kaushal Bodh",
    start: "09:10",
    end: "09:55",
    category: "Classes",
    grades: ["VI", "VII", "VIII"],
  },
  {
    id: "sat-p4",
    title: "Fourth Period",
    start: "09:55",
    end: "10:40",
    category: "Classes",
    grades: ["IX", "X", "XI", "XII"],
    badge: "P4",
  },
  {
    id: "sat-p4-jr",
    title: "Soft Skill / DTI / FinLit / Kaushal Bodh",
    start: "09:55",
    end: "10:40",
    category: "Activities",
    grades: ["VI", "VII", "VIII"],
  },
  {
    id: "sat-snack",
    title: "Break for Morning Snacks",
    start: "10:40",
    end: "11:00",
    category: "Meals",
  },
  {
    id: "sat-p5",
    title: "Fifth Period",
    start: "11:00",
    end: "11:45",
    category: "Classes",
    grades: ["IX", "X", "XI", "XII"],
    badge: "P5",
  },
  {
    id: "sat-skills",
    title: "Essential Skills Session",
    start: "11:00",
    end: "11:45",
    category: "Activities",
    grades: ["VI", "VII", "VIII"],
  },
  {
    id: "sat-mentor",
    title: "House Meeting / Mentor–Mentee Meeting",
    start: "11:45",
    end: "12:30",
    category: "Activities",
    note: "Grades VI–XII.",
  },
  {
    id: "sat-clubs",
    title: "Club Activities",
    start: "12:30",
    end: "13:30",
    category: "Activities",
    grades: ["VI", "VII", "VIII", "IX", "X"],
  },
  {
    id: "sat-emrc",
    title: "EMRC",
    start: "12:30",
    end: "13:30",
    category: "Classes",
    grades: ["XI", "XII"],
    note: "Non-Maths students of Grades XI–XII.",
  },
  {
    id: "sat-teacher",
    title: "Self-time for Teachers",
    start: "13:30",
    end: "14:00",
    category: "Rest/Admin",
  },
  {
    id: "sat-lunch",
    title: "Lunch",
    start: "14:00",
    end: "15:00",
    category: "Meals",
    note: "Official schedule source lists Classes VI & XII; verify institutional wording before database publication.",
  },
  {
    id: "sat-rest",
    title: "Rest Time",
    start: "15:00",
    end: "16:00",
    category: "Rest/Admin",
  },
  {
    id: "sat-study",
    title: "Freshen Up / Self-Study",
    start: "16:00",
    end: "17:30",
    category: "Rest/Admin",
  },
  {
    id: "sat-snack2",
    title: "Evening Snacks",
    start: "17:30",
    end: "18:00",
    category: "Meals",
  },
  {
    id: "sat-games",
    title: "Games / Me Time",
    start: "18:00",
    end: "19:30",
    category: "Activities",
  },
  {
    id: "sat-dinner",
    title: "Dinner",
    start: "19:30",
    end: "20:30",
    category: "Meals",
  },
  {
    id: "sat-hostel",
    title: "Hostel Routine",
    start: "20:30",
    category: "Rest/Admin",
    note: "Continues overnight.",
  },
];

export const SPECIAL_RULES: Record<
  DayKey,
  Partial<Record<string, string>>
> = {
  monday: {
    morning: "Morning Yoga & Exercise",
    zero: "Morning Assembly",
  },
  tuesday: {
    morning: "Morning Yoga & Exercise",
    zero: "Class Teacher's Lesson / Zero Lesson",
  },
  wednesday: {
    morning: "March Past",
    zero: "Class Teacher's Lesson / Zero Lesson",
  },
  thursday: {
    morning: "Morning Yoga & Exercise",
    zero: "Morning Assembly",
  },
  friday: {
    morning: "Morning Yoga & Exercise",
    zero: "Class Teacher's Lesson / Zero Lesson",
  },
  saturday: {},
};

export const DAY_TO_NUMBER: Record<DayKey, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};



export type TimelineEntry = {
  id: string;
  title: string;
  start: string;
  end?: string;
  category: Category;
  note?: string;
  days?: number[];
};

export const WEEKDAY_TIMELINE: TimelineEntry[] = [
  { id: "wake", title: "Wake Up Call", start: "05:00", category: "Rest/Admin" },
  { id: "morning", title: "Morning Yoga & Exercise", start: "05:30", end: "06:15", category: "Activities" },
  { id: "breakfast", title: "Getting Ready for School & Breakfast", start: "06:15", end: "07:30", category: "Meals" },
  { id: "reporting", title: "Reporting Time", start: "07:35", category: "Classes" },
  { id: "huddle", title: "Huddle Time", start: "07:35", end: "07:40", category: "Activities" },
  { id: "zero", title: "Class Teacher's Lesson / Zero Lesson", start: "07:40", end: "08:00", category: "Classes" },
  { id: "p1", title: "First Period", start: "08:00", end: "08:50", category: "Classes" },
  { id: "p2", title: "Second Period", start: "08:50", end: "09:40", category: "Classes" },
  { id: "p3", title: "Third Period", start: "09:40", end: "10:30", category: "Classes" },
  { id: "snack1", title: "Break for Morning Snacks", start: "10:30", end: "10:45", category: "Meals" },
  { id: "p4", title: "Fourth Period", start: "10:45", end: "11:35", category: "Classes" },
  { id: "p5", title: "Fifth Period", start: "11:35", end: "12:25", category: "Classes" },
  { id: "p6", title: "Sixth Period", start: "12:25", end: "13:15", category: "Classes" },
  { id: "p7", title: "Seventh Period", start: "13:15", end: "14:00", category: "Classes" },
  { id: "lunch", title: "Lunch", start: "14:00", end: "14:45", category: "Meals" },
  { id: "rest", title: "Rest Time", start: "14:45", end: "15:45", category: "Rest/Admin" },
  { id: "evening", title: "Evening Activity / Clubs", start: "16:00", end: "17:15", category: "Activities", days: [3] },
  { id: "snack2", title: "Evening Snacks", start: "17:15", end: "17:35", category: "Meals" },
  { id: "games", title: "Evening Games / Clubs", start: "17:40", end: "19:10", category: "Activities", days: [3] },
  { id: "hostel", title: "Return to Hostels, Dinner & Hostel Routine", start: "19:10", end: "20:10", category: "Meals" },
  { id: "prep", title: "Supervised Prep in the Academic Block", start: "20:15", end: "21:30", category: "Classes" },
  { id: "clean", title: "Clean Your Spaces & Organize for the Next Day", start: "21:35", end: "22:05", category: "Rest/Admin" },
  { id: "night", title: "Hostel Routine", start: "22:05", category: "Rest/Admin" },
];

export const SATURDAY_TIMELINE: TimelineEntry[] = [
  { id: "sat-morning", title: "Morning Routine & Breakfast", start: "05:30", end: "07:30", category: "Meals" },
  { id: "sat-report", title: "Reporting Time", start: "07:35", category: "Classes" },
  { id: "sat-huddle", title: "Huddle Time", start: "07:35", end: "07:40", category: "Activities" },
  { id: "sat-p1", title: "First Period", start: "07:40", end: "08:25", category: "Classes" },
  { id: "sat-p2", title: "Second Period", start: "08:25", end: "09:10", category: "Classes" },
  { id: "sat-p3", title: "Third Period", start: "09:10", end: "09:55", category: "Classes" },
  { id: "sat-p4", title: "Fourth Period", start: "09:55", end: "10:40", category: "Classes" },
  { id: "sat-snack", title: "Break for Morning Snacks", start: "10:40", end: "11:00", category: "Meals" },
  { id: "sat-p5", title: "Fifth Period", start: "11:00", end: "11:45", category: "Classes" },
  { id: "sat-mentor", title: "House Meeting / Mentor–Mentee Meeting", start: "11:45", end: "12:30", category: "Activities" },
  { id: "sat-clubs", title: "Club Activities", start: "12:30", end: "13:30", category: "Activities" },
  { id: "sat-lunch", title: "Lunch", start: "14:00", end: "15:00", category: "Meals" },
  { id: "sat-rest", title: "Rest Time", start: "15:00", end: "16:00", category: "Rest/Admin" },
  { id: "sat-study", title: "Freshen Up / Self-Study", start: "16:00", end: "17:30", category: "Rest/Admin" },
  { id: "sat-snack2", title: "Evening Snacks", start: "17:30", end: "18:00", category: "Meals" },
  { id: "sat-games", title: "Games / Me Time", start: "18:00", end: "19:30", category: "Activities" },
  { id: "sat-dinner", title: "Dinner", start: "19:30", end: "20:30", category: "Meals" },
  { id: "sat-hostel", title: "Hostel Routine", start: "20:30", category: "Rest/Admin" },
];

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

export function minutesFrom(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function indiaWeekdayNumber(date = new Date()) {
  const label = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", weekday: "short" }).format(date);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(label);
}


export function getTimelineForDate(date = new Date()) {
  return indiaWeekdayNumber(date) === 6 ? SATURDAY_TIMELINE : WEEKDAY_TIMELINE;
}

export function getRoutineEntries(day: DayKey) {
  return day === "saturday" ? SATURDAY_BASE : WEEKDAY_BASE;
}
