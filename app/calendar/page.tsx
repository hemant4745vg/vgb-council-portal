"use client";

import { useMemo, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type Category =
  | "Academic"
  | "Exams"
  | "Cultural"
  | "Sports"
  | "Excursion"
  | "Flagship"
  | "Holiday"
  | "School";

type CalendarPeriod = {
  start: string;
  end: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  periods: CalendarPeriod[];
  category: Category;
  description?: string;
  target?: string;
  time?: string;
  tentative?: boolean;
};

/* =========================================================
   SCHOOL YEAR
========================================================= */

const SCHOOL_YEAR_START = "2026-04-01";
const SCHOOL_YEAR_END = "2027-03-31";

/* =========================================================
   HELPERS
========================================================= */

const pad = (value: number) => String(value).padStart(2, "0");

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;

const parseDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addMonths = (date: Date, months: number) =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

const isBetween = (
  value: string,
  start: string,
  end: string
): boolean => {
  return value >= start && value <= end;
};

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

const formatLongDate = (value: string) =>
  parseDate(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatShortDate = (value: string) =>
  parseDate(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

const formatMonth = (date: Date) =>
  date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

const getDateRangeLabel = (period: CalendarPeriod) => {
  if (period.start === period.end) {
    return formatLongDate(period.start);
  }

  const start = parseDate(period.start);
  const end = parseDate(period.end);

  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    return `${start.toLocaleDateString("en-IN", {
      day: "numeric",
    })}–${end.toLocaleDateString("en-IN", {
      day: "numeric",
    })} ${end.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    })}`;
  }

  return `${formatLongDate(period.start)} – ${formatLongDate(period.end)}`;
};

const getCategoryClasses = (category: Category) => {
  switch (category) {
    case "Academic":
      return {
        dot: "bg-blue-500",
        chip: "border-blue-200 bg-blue-50 text-blue-700",
        badge: "bg-blue-100 text-blue-700",
      };

    case "Exams":
      return {
        dot: "bg-violet-500",
        chip: "border-violet-200 bg-violet-50 text-violet-700",
        badge: "bg-violet-100 text-violet-700",
      };

    case "Cultural":
      return {
        dot: "bg-rose-500",
        chip: "border-rose-200 bg-rose-50 text-rose-700",
        badge: "bg-rose-100 text-rose-700",
      };

    case "Sports":
      return {
        dot: "bg-emerald-500",
        chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
        badge: "bg-emerald-100 text-emerald-700",
      };

    case "Excursion":
      return {
        dot: "bg-cyan-500",
        chip: "border-cyan-200 bg-cyan-50 text-cyan-700",
        badge: "bg-cyan-100 text-cyan-700",
      };

    case "Flagship":
      return {
        dot: "bg-amber-500",
        chip: "border-amber-200 bg-amber-50 text-amber-700",
        badge: "bg-amber-100 text-amber-700",
      };

    case "Holiday":
      return {
        dot: "bg-orange-500",
        chip: "border-orange-200 bg-orange-50 text-orange-700",
        badge: "bg-orange-100 text-orange-700",
      };

    case "School":
      return {
        dot: "bg-slate-500",
        chip: "border-slate-200 bg-slate-50 text-slate-700",
        badge: "bg-slate-100 text-slate-700",
      };
  }
};

const categoryLabel = (category: Category) => category;

/* =========================================================
   EVENT DATA
   Source: VidyaGyan Bulandshahr Annual Calendar 2026–27
========================================================= */

const CALENDAR_EVENTS: CalendarEvent[] = [
  /* ---------------- APRIL 2026 ---------------- */

  {
    id: "apr-new-session",
    title: "New Session Begins",
    periods: [{ start: "2026-04-01", end: "2026-04-01" }],
    category: "School",
    target: "School",
  },
  {
    id: "apr-good-friday",
    title: "Good Friday",
    periods: [{ start: "2026-04-03", end: "2026-04-03" }],
    category: "Holiday",
  },
  {
    id: "apr-asset",
    title: "ASSET Test",
    periods: [{ start: "2026-04-09", end: "2026-04-11" }],
    category: "Academic",
    target: "Relevant students",
  },
  {
    id: "apr-sciencequisition",
    title: "SCIENCEIQUISITION",
    periods: [{ start: "2026-04-16", end: "2026-04-16" }],
    category: "Academic",
  },
  {
    id: "apr-investiture",
    title: "Investiture Ceremony",
    periods: [{ start: "2026-04-18", end: "2026-04-18" }],
    category: "Flagship",
  },
  {
    id: "apr-biodiversity",
    title: "Trip to Biodiversity Park at SNU",
    periods: [{ start: "2026-04-22", end: "2026-04-22" }],
    category: "Excursion",
    target: "Grade IX",
  },
  {
    id: "apr-bards-day",
    title: "Bard's Day",
    periods: [{ start: "2026-04-23", end: "2026-04-23" }],
    category: "Cultural",
    time: "Evening event",
  },
  {
    id: "apr-football",
    title: "IH Football",
    periods: [{ start: "2026-04-24", end: "2026-04-30" }],
    category: "Sports",
  },

  /* ---------------- MAY 2026 ---------------- */

  {
    id: "may-football",
    title: "IH Football",
    periods: [{ start: "2026-05-01", end: "2026-05-01" }],
    category: "Sports",
  },
  {
    id: "may-pt1-9-12",
    title: "PT 1",
    periods: [{ start: "2026-05-04", end: "2026-05-09" }],
    category: "Exams",
    target: "Grades 9–12",
  },
  {
    id: "may-pt1-7-8",
    title: "PT 1",
    periods: [{ start: "2026-05-04", end: "2026-05-11" }],
    category: "Exams",
    target: "Grades 7–8",
  },
  {
    id: "may-basketball",
    title: "IH Basketball",
    periods: [{ start: "2026-05-07", end: "2026-05-15" }],
    category: "Sports",
  },
  {
    id: "may-pt1-end-9-12",
    title: "PT 1 Ends",
    periods: [{ start: "2026-05-09", end: "2026-05-09" }],
    category: "Exams",
    target: "Grades 9–12",
  },
  {
    id: "may-pt1-end-7-8",
    title: "PT 1 Ends",
    periods: [{ start: "2026-05-11", end: "2026-05-11" }],
    category: "Exams",
    target: "Grades 7–8",
  },
  {
    id: "may-freshers",
    title: "Freshers' Party",
    periods: [{ start: "2026-05-12", end: "2026-05-12" }],
    category: "Cultural",
    target: "Grade 6",
  },
  {
    id: "may-ptm",
    title: "PTM",
    periods: [{ start: "2026-05-16", end: "2026-05-16" }],
    category: "School",
  },
  {
    id: "may-summer-break",
    title: "Summer Break Starts",
    periods: [{ start: "2026-05-17", end: "2026-06-27" }],
    category: "Holiday",
    target: "Students",
  },
  {
    id: "may-summer-camp",
    title: "Summer Camp",
    periods: [{ start: "2026-05-18", end: "2026-05-23" }],
    category: "Academic",
    target: "Grade 12",
  },
  {
    id: "may-spic-macay",
    title: "SPIC MACAY Annual Convention",
    periods: [{ start: "2026-05-25", end: "2026-05-31" }],
    category: "Cultural",
    description: "Annual Convention at IIT Kharagpur.",
  },
  {
    id: "may-eid",
    title: "Bakri Id / Eid ul-Adha",
    periods: [{ start: "2026-05-27", end: "2026-05-27" }],
    category: "Holiday",
  },

  /* ---------------- JUNE 2026 ---------------- */

  {
    id: "jun-teacher-reporting",
    title: "Reporting for Teachers",
    periods: [{ start: "2026-06-25", end: "2026-06-25" }],
    category: "School",
    target: "Teachers",
  },
  {
    id: "jun-in-service",
    title: "In-Service Training",
    periods: [{ start: "2026-06-26", end: "2026-06-27" }],
    category: "School",
    target: "Staff",
  },
  {
    id: "jun-student-reporting",
    title: "Reporting for Students",
    periods: [{ start: "2026-06-28", end: "2026-06-28" }],
    category: "School",
    target: "Students",
  },
  {
    id: "jun-classes",
    title: "Classes Begin",
    periods: [{ start: "2026-06-29", end: "2026-06-29" }],
    category: "School",
  },

  /* ---------------- JULY 2026 ---------------- */

  {
    id: "jul-monthly-off",
    title: "Monthly Off",
    periods: [{ start: "2026-07-04", end: "2026-07-04" }],
    category: "Holiday",
  },
  {
    id: "jul-industrial-visit",
    title: "Industrial Visit",
    periods: [{ start: "2026-07-06", end: "2026-07-06" }],
    category: "Excursion",
    target: "Commerce",
  },
  {
    id: "jul-volleyball",
    title: "IH Volleyball",
    periods: [{ start: "2026-07-07", end: "2026-07-11" }],
    category: "Sports",
  },
  {
    id: "jul-nadar-birthday",
    title: "Mr. Nadar's Birthday",
    periods: [{ start: "2026-07-14", end: "2026-07-14" }],
    category: "Flagship",
  },
  {
    id: "jul-project",
    title: "Project Submission",
    periods: [{ start: "2026-07-15", end: "2026-07-15" }],
    category: "Academic",
    target: "Grade 12",
  },
  {
    id: "jul-storytelling",
    title: "IH Story Telling",
    periods: [{ start: "2026-07-17", end: "2026-07-17" }],
    category: "Cultural",
    target: "Grade 7",
  },
  {
    id: "jul-delhi-trip",
    title: "Delhi Trip",
    periods: [{ start: "2026-07-18", end: "2026-07-18" }],
    category: "Excursion",
    target: "Grade 6",
  },
  {
    id: "jul-handball",
    title: "IH Handball",
    periods: [{ start: "2026-07-20", end: "2026-07-25" }],
    category: "Sports",
  },
  {
    id: "jul-sudoku",
    title: "SUDOKU Activity",
    periods: [{ start: "2026-07-25", end: "2026-07-25" }],
    category: "Academic",
    target: "Grade 7",
    description: "Activity during Converging Capacities.",
  },
  {
    id: "jul-speaker",
    title: "Speaker Session",
    periods: [{ start: "2026-07-28", end: "2026-07-28" }],
    category: "Flagship",
    time: "Evening · 1–2 hrs",
  },
  {
    id: "jul-cross-country",
    title: "Cross Country",
    periods: [{ start: "2026-07-29", end: "2026-07-29" }],
    category: "Sports",
  },
  {
    id: "jul-turncoat",
    title: "IH Turncoat",
    periods: [{ start: "2026-07-31", end: "2026-07-31" }],
    category: "Cultural",
    target: "Grade 8",
  },

  /* ---------------- AUGUST 2026 ---------------- */

  {
    id: "aug-monthly-off",
    title: "Monthly Off",
    periods: [{ start: "2026-08-01", end: "2026-08-01" }],
    category: "Holiday",
  },
  {
    id: "aug-table-tennis",
    title: "IH Table Tennis",
    periods: [{ start: "2026-08-03", end: "2026-08-06" }],
    category: "Sports",
  },
  {
    id: "aug-mun",
    title: "VGB MUN",
    periods: [{ start: "2026-08-07", end: "2026-08-08" }],
    category: "Flagship",
  },
  {
    id: "aug-vg-day",
    title: "VG Day",
    periods: [{ start: "2026-08-08", end: "2026-08-08" }],
    category: "Flagship",
  },
  {
    id: "aug-steam",
    title: "STEAM Conclave",
    periods: [{ start: "2026-08-12", end: "2026-08-12" }],
    category: "Academic",
    target: "Grades 9–12 Science Students",
    tentative: true,
  },
  {
    id: "aug-dance",
    title: "Inter House Dance Competition",
    periods: [{ start: "2026-08-14", end: "2026-08-14" }],
    category: "Cultural",
  },
  {
    id: "aug-independence",
    title: "Independence Day",
    periods: [{ start: "2026-08-15", end: "2026-08-15" }],
    category: "Flagship",
  },
  {
    id: "aug-declamation",
    title: "IH Declamation",
    periods: [{ start: "2026-08-18", end: "2026-08-18" }],
    category: "Cultural",
    target: "Grades 9–10",
  },
  {
    id: "aug-kaafila",
    title: "Kaafila",
    periods: [{ start: "2026-08-20", end: "2026-08-22" }],
    category: "Flagship",
    tentative: true,
  },
  {
    id: "aug-bvp",
    title: "Bharat Vikas Parishad",
    periods: [{ start: "2026-08-21", end: "2026-08-21" }],
    category: "Flagship",
    tentative: true,
  },
  {
    id: "aug-ted",
    title: "TED Event",
    periods: [{ start: "2026-08-22", end: "2026-08-22" }],
    category: "Flagship",
    tentative: true,
  },
  {
    id: "aug-national-dance",
    title: "National Dance Championship",
    periods: [{ start: "2026-08-24", end: "2026-08-24" }],
    category: "Cultural",
    tentative: true,
  },
  {
    id: "aug-debate",
    title: "IH Debate",
    periods: [{ start: "2026-08-26", end: "2026-08-26" }],
    category: "Cultural",
    target: "Grades 11–12",
  },
  {
    id: "aug-jantar-mantar",
    title: "Visit to Jantar Mantar",
    periods: [{ start: "2026-08-27", end: "2026-08-27" }],
    category: "Excursion",
    target: "Grade 7",
  },
  {
    id: "aug-raksha-bandhan",
    title: "Raksha Bandhan",
    periods: [{ start: "2026-08-28", end: "2026-08-28" }],
    category: "Holiday",
  },
  {
    id: "aug-math-games",
    title: "Math Game Challenges",
    periods: [{ start: "2026-08-29", end: "2026-08-29" }],
    category: "Academic",
    target: "Grade 8",
  },
  {
    id: "aug-kala-utsav",
    title: "CBSE Kala Utsav",
    periods: [{ start: "2026-08-29", end: "2026-08-29" }],
    category: "Cultural",
  },

  /* ---------------- SEPTEMBER 2026 ---------------- */

  {
    id: "sep-teachers-day",
    title: "Teachers' Day Celebration",
    periods: [{ start: "2026-09-03", end: "2026-09-03" }],
    category: "Cultural",
  },
  {
    id: "sep-janmashtami",
    title: "Janmashtami",
    periods: [{ start: "2026-09-04", end: "2026-09-04" }],
    category: "Holiday",
  },
  {
    id: "sep-monthly-off",
    title: "Monthly Off",
    periods: [{ start: "2026-09-05", end: "2026-09-05" }],
    category: "Holiday",
  },
  {
    id: "sep-midterm-7-12",
    title: "Mid-Term Examinations",
    periods: [{ start: "2026-09-12", end: "2026-09-21" }],
    category: "Exams",
    target: "Grades 11–12",
  },
  {
    id: "sep-midterm-9-10",
    title: "Mid-Term Examinations",
    periods: [{ start: "2026-09-12", end: "2026-09-23" }],
    category: "Exams",
    target: "Grades 9–10",
  },
  {
    id: "sep-midterm-7-8",
    title: "Mid-Term Examinations",
    periods: [{ start: "2026-09-12", end: "2026-09-25" }],
    category: "Exams",
    target: "Grades 7–8",
  },
  {
    id: "sep-hindi-diwas",
    title: "Hindi Diwas",
    periods: [{ start: "2026-09-14", end: "2026-09-14" }],
    category: "Cultural",
    time: "Evening programme",
  },
  {
    id: "sep-roshni-birthday",
    title: "Roshni Nadar's Birthday",
    periods: [{ start: "2026-09-16", end: "2026-09-16" }],
    category: "Flagship",
    description: "Duties to be assigned.",
  },
  {
    id: "sep-math-rangoli",
    title: "Math Rangoli",
    periods: [{ start: "2026-09-18", end: "2026-09-18" }],
    category: "Academic",
    target: "Grade 6",
    time: "Evening prep",
  },
  {
    id: "sep-midterm-11-12-end",
    title: "Mid-Term Examinations End",
    periods: [{ start: "2026-09-21", end: "2026-09-21" }],
    category: "Exams",
    target: "Grades 11–12",
  },
  {
    id: "sep-midterm-9-10-end",
    title: "Mid-Term Examinations End",
    periods: [{ start: "2026-09-23", end: "2026-09-23" }],
    category: "Exams",
    target: "Grades 9–10",
  },
  {
    id: "sep-midterm-7-8-end",
    title: "Mid-Term Examinations End",
    periods: [{ start: "2026-09-25", end: "2026-09-25" }],
    category: "Exams",
    target: "Grades 7–8",
  },
  {
    id: "sep-spandan",
    title: "SPANDAN Lit Fest",
    periods: [{ start: "2026-09-25", end: "2026-09-25" }],
    category: "Flagship",
    target: "Teachers",
  },
  {
    id: "sep-english-recitation",
    title: "Inter-Section English Recitation",
    periods: [{ start: "2026-09-25", end: "2026-09-25" }],
    category: "Cultural",
    target: "Grade 6",
  },
  {
    id: "sep-cultural-week",
    title: "Cultural Week",
    periods: [{ start: "2026-09-28", end: "2026-10-01" }],
    category: "Cultural",
  },

  /* ---------------- OCTOBER 2026 ---------------- */

  {
    id: "oct-cultural-week-end",
    title: "Cultural Week Ends",
    periods: [{ start: "2026-10-01", end: "2026-10-01" }],
    category: "Cultural",
  },
  {
    id: "oct-gandhi",
    title: "Gandhi Jayanti",
    periods: [{ start: "2026-10-02", end: "2026-10-02" }],
    category: "Holiday",
  },
  {
    id: "oct-theatre",
    title: "Theatre Visit",
    periods: [{ start: "2026-10-02", end: "2026-10-02" }],
    category: "Excursion",
  },
  {
    id: "oct-physics-dham",
    title: "Trip to Physics Dham",
    periods: [{ start: "2026-10-02", end: "2026-10-02" }],
    category: "Excursion",
    target: "Jaipur",
  },
  {
    id: "oct-monthly-off",
    title: "Monthly Off",
    periods: [{ start: "2026-10-03", end: "2026-10-03" }],
    category: "Holiday",
  },
  {
    id: "oct-kabaddi",
    title: "IH Kabaddi",
    periods: [{ start: "2026-10-05", end: "2026-10-09" }],
    category: "Sports",
  },
  {
    id: "oct-review-11-12",
    title: "Mid-Term Review",
    periods: [{ start: "2026-10-08", end: "2026-10-08" }],
    category: "Academic",
    target: "Grades 11–12",
  },
  {
    id: "oct-review-9-10",
    title: "Mid-Term Review",
    periods: [{ start: "2026-10-09", end: "2026-10-09" }],
    category: "Academic",
    target: "Grades 9–10",
  },
  {
    id: "oct-review-7-8",
    title: "Mid-Term Review",
    periods: [{ start: "2026-10-10", end: "2026-10-10" }],
    category: "Academic",
    target: "Grades 7–8",
  },
  {
    id: "oct-delhi-zoo",
    title: "Delhi Zoo Visit",
    periods: [{ start: "2026-10-12", end: "2026-10-12" }],
    category: "Excursion",
    target: "Grade 6",
  },
  {
    id: "oct-workshop",
    title: "Workshop",
    periods: [{ start: "2026-10-14", end: "2026-10-14" }],
    category: "Academic",
    target: "Grades 6–8",
  },
  {
    id: "oct-painting-6-7",
    title: "IH Painting Competition",
    periods: [{ start: "2026-10-15", end: "2026-10-15" }],
    category: "Cultural",
    target: "Grades 6–7",
  },
  {
    id: "oct-painting-8-9",
    title: "IH Painting Competition",
    periods: [{ start: "2026-10-16", end: "2026-10-16" }],
    category: "Cultural",
    target: "Grades 8–9",
  },
  {
    id: "oct-agra",
    title: "Inter-Disciplinary Trip to Agra",
    periods: [{ start: "2026-10-17", end: "2026-10-17" }],
    category: "Excursion",
    target: "Grades 7–8 & Grades 11–12 Eco",
  },
  {
    id: "oct-maha-navami",
    title: "Maha Navami",
    periods: [{ start: "2026-10-19", end: "2026-10-19" }],
    category: "Holiday",
  },
  {
    id: "oct-dussehra",
    title: "Dussehra",
    periods: [{ start: "2026-10-20", end: "2026-10-20" }],
    category: "Holiday",
  },
  {
    id: "oct-badminton",
    title: "IH Badminton",
    periods: [{ start: "2026-10-21", end: "2026-10-24" }],
    category: "Sports",
  },
  {
    id: "oct-delhi-haat",
    title: "Visit to Delhi Haat",
    periods: [{ start: "2026-10-26", end: "2026-10-26" }],
    category: "Excursion",
    target: "Commerce & Economics",
  },
  {
    id: "oct-sports-practice",
    title: "Annual Sports Practice",
    periods: [{ start: "2026-10-26", end: "2026-10-31" }],
    category: "Sports",
    time: "Evening",
  },
  {
    id: "oct-lit-fest",
    title: "Lit Fest 2026",
    periods: [{ start: "2026-10-30", end: "2026-10-31" }],
    category: "Flagship",
    description: "Inter-school event.",
  },
  {
    id: "oct-syllabus",
    title: "Syllabus Completion",
    periods: [{ start: "2026-10-31", end: "2026-10-31" }],
    category: "Academic",
    target: "Grades 10 & 12",
  },

  /* ---------------- NOVEMBER 2026 ---------------- */

  {
    id: "nov-hfp",
    title: "History for Peace 2026",
    periods: [{ start: "2026-11-02", end: "2026-11-03" }],
    category: "Academic",
  },
  {
    id: "nov-ptm",
    title: "PTM",
    periods: [{ start: "2026-11-04", end: "2026-11-04" }],
    category: "School",
  },
  {
    id: "nov-diwali-student",
    title: "Deepawali Break",
    periods: [{ start: "2026-11-05", end: "2026-11-21" }],
    category: "Holiday",
    target: "Students",
  },
  {
    id: "nov-diwali-teacher",
    title: "Deepawali Break",
    periods: [{ start: "2026-11-05", end: "2026-11-16" }],
    category: "Holiday",
    target: "Teachers",
  },
  {
    id: "nov-sports-practice-early",
    title: "Annual Sports Practice",
    periods: [{ start: "2026-11-01", end: "2026-11-03" }],
    category: "Sports",
    time: "Evening",
  },
  {
    id: "nov-staff-reporting",
    title: "Reporting for Staff",
    periods: [{ start: "2026-11-17", end: "2026-11-17" }],
    category: "School",
  },
  {
    id: "nov-ole",
    title: "OLE",
    periods: [{ start: "2026-11-18", end: "2026-11-21" }],
    category: "Academic",
    target: "Teachers",
  },
  {
    id: "nov-student-reporting",
    title: "Reporting for Students",
    periods: [{ start: "2026-11-22", end: "2026-11-22" }],
    category: "School",
  },
  {
    id: "nov-classes",
    title: "Classes Begin",
    periods: [{ start: "2026-11-23", end: "2026-11-23" }],
    category: "School",
  },
  {
    id: "nov-sports-practice",
    title: "Annual Sports Practice",
    periods: [{ start: "2026-11-23", end: "2026-11-24" }],
    category: "Sports",
    time: "Evening",
  },
  {
    id: "nov-annual-sports",
    title: "Annual Sports",
    periods: [{ start: "2026-11-25", end: "2026-11-27" }],
    category: "Sports",
  },
  {
    id: "nov-sports-day",
    title: "Annual Sports Day",
    periods: [{ start: "2026-11-28", end: "2026-11-28" }],
    category: "Sports",
  },
  {
    id: "nov-solanki",
    title: "Interaction with Mr. Solanki",
    periods: [{ start: "2026-11-30", end: "2026-11-30" }],
    category: "Flagship",
    description: "Environmentalist interaction.",
  },

  /* ---------------- DECEMBER 2026 ---------------- */

  {
    id: "dec-itihas",
    title: "Itihaas Anveshan",
    periods: [{ start: "2026-12-05", end: "2026-12-05" }],
    category: "Academic",
  },
  {
    id: "dec-vgee",
    title: "VGEE",
    periods: [{ start: "2026-12-06", end: "2026-12-06" }],
    category: "Academic",
  },
  {
    id: "dec-pt",
    title: "Periodic Tests",
    periods: [{ start: "2026-12-08", end: "2026-12-14" }],
    category: "Exams",
  },
  {
    id: "dec-pb",
    title: "Pre-Board Examinations",
    periods: [{ start: "2026-12-08", end: "2026-12-16" }],
    category: "Exams",
    target: "Grades 10 & 12",
  },
  {
    id: "dec-choir",
    title: "Inter-Section Choir",
    periods: [{ start: "2026-12-17", end: "2026-12-17" }],
    category: "Cultural",
    target: "Grade 6",
    time: "Morning Assembly",
  },
  {
    id: "dec-ptm",
    title: "PTM",
    periods: [{ start: "2026-12-19", end: "2026-12-19" }],
    category: "School",
    target: "Grades 6–9 & 11",
  },
  {
    id: "dec-winter-break",
    title: "Winter Break",
    periods: [{ start: "2026-12-20", end: "2027-01-09" }],
    category: "Holiday",
    target: "Grades 6–9 & 11",
  },
  {
    id: "dec-winter-camp",
    title: "Winter Camp",
    periods: [{ start: "2026-12-21", end: "2026-12-21" }],
    category: "Academic",
    target: "Grades 10 & 12",
  },
  {
    id: "dec-christmas",
    title: "Christmas",
    periods: [{ start: "2026-12-25", end: "2026-12-25" }],
    category: "Holiday",
  },
  {
    id: "dec-new-year",
    title: "New Year Eve Celebration",
    periods: [{ start: "2026-12-31", end: "2026-12-31" }],
    category: "Cultural",
  },

  /* ---------------- JANUARY 2027 ---------------- */

  {
    id: "jan-new-year",
    title: "New Year's Day",
    periods: [{ start: "2027-01-01", end: "2027-01-01" }],
    category: "Holiday",
  },
  {
    id: "jan-teacher-reporting",
    title: "Reporting Day for Teachers",
    periods: [{ start: "2027-01-09", end: "2027-01-09" }],
    category: "School",
  },
  {
    id: "jan-student-reporting",
    title: "Reporting Day for Students",
    periods: [{ start: "2027-01-10", end: "2027-01-10" }],
    category: "School",
  },
  {
    id: "jan-classes",
    title: "Classes Begin",
    periods: [{ start: "2027-01-11", end: "2027-01-11" }],
    category: "School",
  },
  {
    id: "jan-iccr",
    title: "ICCR International Festival",
    periods: [{ start: "2027-01-21", end: "2027-01-23" }],
    category: "Flagship",
    target: "Grade 8",
  },
  {
    id: "jan-music",
    title: "IH Music Competition",
    periods: [{ start: "2027-01-25", end: "2027-01-25" }],
    category: "Cultural",
    target: "Grades 7–9",
    description: "Singing / Orchestra.",
  },
  {
    id: "jan-republic",
    title: "Republic Day",
    periods: [{ start: "2027-01-26", end: "2027-01-26" }],
    category: "Holiday",
  },
  {
    id: "jan-book-fair",
    title: "Visit to Book Fair",
    periods: [{ start: "2027-01-30", end: "2027-01-30" }],
    category: "Excursion",
  },

  /* ---------------- FEBRUARY 2027 ---------------- */

  {
    id: "feb-monthly-off",
    title: "Monthly Off",
    periods: [{ start: "2027-02-06", end: "2027-02-06" }],
    category: "Holiday",
  },
  {
    id: "feb-annual-9-11",
    title: "Annual Examinations",
    periods: [{ start: "2027-02-09", end: "2027-02-19" }],
    category: "Exams",
    target: "Grades 9 & 11",
  },
  {
    id: "feb-annual-11-end",
    title: "Annual Examinations End",
    periods: [{ start: "2027-02-17", end: "2027-02-17" }],
    category: "Exams",
    target: "Grade 11",
  },
  {
    id: "feb-annual-9-end",
    title: "Annual Examinations End",
    periods: [{ start: "2027-02-19", end: "2027-02-19" }],
    category: "Exams",
    target: "Grade 9",
  },
  {
    id: "feb-ole",
    title: "OLE",
    periods: [{ start: "2027-02-22", end: "2027-02-27" }],
    category: "Academic",
    target: "Grades 9 & 11",
    tentative: true,
  },

  /* ---------------- MARCH 2027 ---------------- */

  {
    id: "mar-new-session",
    title: "New Session Begins",
    periods: [{ start: "2027-03-01", end: "2027-03-01" }],
    category: "School",
    target: "Grades 10 & 12",
  },
  {
    id: "mar-maha-shivaratri",
    title: "Maha Shivaratri",
    periods: [{ start: "2027-03-06", end: "2027-03-06" }],
    category: "Holiday",
  },
  {
    id: "mar-annual-6-8",
    title: "Annual Examinations",
    periods: [{ start: "2027-03-09", end: "2027-03-23" }],
    category: "Exams",
    target: "Grades 6–8",
  },
  {
    id: "mar-eid",
    title: "Eid ul-Fitr",
    periods: [{ start: "2027-03-10", end: "2027-03-10" }],
    category: "Holiday",
  },
  {
    id: "mar-holi",
    title: "Holi",
    periods: [{ start: "2027-03-22", end: "2027-03-22" }],
    category: "Holiday",
  },
  {
    id: "mar-annual-6-8-end",
    title: "Annual Examinations End",
    periods: [{ start: "2027-03-23", end: "2027-03-23" }],
    category: "Exams",
    target: "Grades 6–8",
  },
  {
    id: "mar-good-friday",
    title: "Good Friday",
    periods: [{ start: "2027-03-26", end: "2027-03-26" }],
    category: "Holiday",
  },
  {
    id: "mar-session-break",
    title: "Session Break",
    periods: [{ start: "2027-03-27", end: "2027-03-31" }],
    category: "Holiday",
    target: "Students",
  },
  {
    id: "mar-inservice",
    title: "In-Service Training",
    periods: [{ start: "2027-03-29", end: "2027-03-30" }],
    category: "School",
    target: "Staff",
  },
];

/* =========================================================
   CALENDAR COMPONENT
========================================================= */

export default function CalendarPage() {
  const today = new Date();
  const todayKey = dateKey(today);

  /*
   * September 2026 is the current month at the time this page
   * was designed. On later visits the calendar naturally opens
   * to the actual current month if it falls within the school year.
   */
  const initialMonth =
    today >= parseDate(SCHOOL_YEAR_START) &&
    today <= parseDate(SCHOOL_YEAR_END)
      ? startOfMonth(today)
      : new Date(2026, 8, 1);

  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    today >= parseDate(SCHOOL_YEAR_START) &&
      today <= parseDate(SCHOOL_YEAR_END)
      ? todayKey
      : null
  );

  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    null
  );

  const [activeCategories, setActiveCategories] = useState<
    Set<Category>
  >(new Set());

  const [search, setSearch] = useState("");

  /* =========================================================
     FILTERED EVENTS
  ========================================================= */

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return CALENDAR_EVENTS.filter((event) => {
      const categoryMatch =
        activeCategories.size === 0 ||
        activeCategories.has(event.category);

      if (!categoryMatch) return false;

      if (!query) return true;

      const searchable = [
        event.title,
        event.description,
        event.target,
        event.time,
        event.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [activeCategories, search]);

  /* =========================================================
     MONTH GRID
  ========================================================= */

  const calendarDays = useMemo(() => {
    const first = startOfMonth(currentMonth);

    /*
     * Sunday = 0.
     * We show the preceding days from the previous month so
     * every month begins on the correct weekday.
     */
    const firstDayOffset = first.getDay();

    const gridStart = addDays(first, -firstDayOffset);

    /*
     * Always render 6 weeks = 42 cells.
     * This keeps the calendar stable instead of jumping in height.
     */
    return Array.from({ length: 42 }, (_, index) =>
      addDays(gridStart, index)
    );
  }, [currentMonth]);

  /* =========================================================
     EVENT MATCHING
  ========================================================= */

  const eventOccursOnDate = (
    event: CalendarEvent,
    value: string
  ) => {
    return event.periods.some((period) =>
      isBetween(value, period.start, period.end)
    );
  };

  const eventsForDate = (value: string) =>
    filteredEvents.filter((event) =>
      eventOccursOnDate(event, value)
    );

  const eventsForMonth = useMemo(() => {
    const first = startOfMonth(currentMonth);
    const last = endOfMonth(currentMonth);

    const firstKey = dateKey(first);
    const lastKey = dateKey(last);

    return filteredEvents.filter((event) =>
      event.periods.some(
        (period) =>
          period.start <= lastKey && period.end >= firstKey
      )
    );
  }, [currentMonth, filteredEvents]);

  /* =========================================================
     MONTH SUMMARY
  ========================================================= */

  const monthEventCount = eventsForMonth.length;

  const selectedDateEvents = selectedDate
    ? eventsForDate(selectedDate)
    : [];

  /* =========================================================
     CONTROLS
  ========================================================= */

  const goToPreviousMonth = () => {
    const previous = addMonths(currentMonth, -1);

    if (previous >= startOfMonth(parseDate(SCHOOL_YEAR_START))) {
      setCurrentMonth(previous);
      setSelectedEventId(null);
    }
  };

  const goToNextMonth = () => {
    const next = addMonths(currentMonth, 1);

    if (next <= startOfMonth(parseDate(SCHOOL_YEAR_END))) {
      setCurrentMonth(next);
      setSelectedEventId(null);
    }
  };

  const goToToday = () => {
    const current = new Date();

    if (
      current >= parseDate(SCHOOL_YEAR_START) &&
      current <= parseDate(SCHOOL_YEAR_END)
    ) {
      setCurrentMonth(startOfMonth(current));
      setSelectedDate(dateKey(current));
    }
  };

  const toggleCategory = (category: Category) => {
    setActiveCategories((previous) => {
      const next = new Set(previous);

      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }

      return next;
    });
  };

  const clearFilters = () => {
    setActiveCategories(new Set());
    setSearch("");
  };

  /* =========================================================
     EVENT DETAIL
  ========================================================= */

  const selectedEvent = CALENDAR_EVENTS.find(
    (event) => event.id === selectedEventId
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  2026–27 Academic Year
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Campus Calendar
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Academic, cultural, sporting, excursion and school
                events across the VidyaGyan Bulandshahr session.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Month overview
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {monthEventCount}{" "}
                {monthEventCount === 1 ? "event" : "events"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            {/* Month controls */}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                aria-label="Previous month"
              >
                ‹
              </button>

              <div className="min-w-[190px] text-center">
                <h2 className="text-lg font-bold text-slate-900">
                  {formatMonth(currentMonth)}
                </h2>

                <p className="text-xs text-slate-400">
                  VidyaGyan Annual Calendar
                </p>
              </div>

              <button
                type="button"
                onClick={goToNextMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                aria-label="Next month"
              >
                ›
              </button>

              <button
                type="button"
                onClick={goToToday}
                className="ml-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Today
              </button>
            </div>

            {/* Search */}

            <div className="relative w-full xl:max-w-sm">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search events..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          {/* Category filters */}

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Filter
            </span>

            {(
              [
                "Academic",
                "Exams",
                "Cultural",
                "Sports",
                "Excursion",
                "Flagship",
                "Holiday",
                "School",
              ] as Category[]
            ).map((category) => {
              const active = activeCategories.has(category);
              const styles = getCategoryClasses(category);

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? `${styles.chip} ring-2 ring-slate-200`
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${styles.dot}`}
                  />
                  {category}
                </button>
              );
            })}

            {(activeCategories.size > 0 || search) && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            CALENDAR + SIDE PANEL
        =================================================== */}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* =================================================
              CALENDAR GRID
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Weekday header */}

            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <div
                  key={day}
                  className="px-2 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400 sm:px-3"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar cells */}

            <div className="grid grid-cols-7">
              {calendarDays.map((day) => {
                const key = dateKey(day);
                const inCurrentMonth =
                  day.getMonth() === currentMonth.getMonth() &&
                  day.getFullYear() === currentMonth.getFullYear();

                const isToday = key === todayKey;
                const isSelected = key === selectedDate;

                const dayEvents = eventsForDate(key);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedDate(key);
                      setSelectedEventId(null);
                    }}
                    className={`group relative min-h-[118px] border-b border-r border-slate-100 p-2 text-left align-top transition sm:min-h-[135px] sm:p-3 ${
                      inCurrentMonth
                        ? "bg-white"
                        : "bg-slate-50/70"
                    } ${
                      isSelected
                        ? "z-10 bg-blue-50/40 ring-2 ring-inset ring-blue-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Date number */}

                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          isToday
                            ? "bg-blue-600 text-white"
                            : isSelected
                            ? "bg-blue-100 text-blue-700"
                            : inCurrentMonth
                            ? "text-slate-800"
                            : "text-slate-300"
                        }`}
                      >
                        {day.getDate()}
                      </span>

                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-semibold text-slate-300">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Events */}

                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => {
                        const styles = getCategoryClasses(
                          event.category
                        );

                        return (
                          <span
                            key={event.id}
                            onClick={(eventClick) => {
                              eventClick.stopPropagation();
                              setSelectedDate(key);
                              setSelectedEventId(event.id);
                            }}
                            className={`block truncate rounded-md border px-1.5 py-1 text-[10px] font-semibold leading-tight transition hover:brightness-95 sm:text-[11px] ${styles.chip}`}
                            title={event.title}
                          >
                            <span
                              className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${styles.dot}`}
                            />

                            {event.title}
                          </span>
                        );
                      })}

                      {dayEvents.length > 3 && (
                        <span className="block px-1 text-[10px] font-semibold text-slate-400">
                          +{dayEvents.length - 3} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
              SIDE PANEL
          ================================================= */}

          <aside className="flex min-h-[500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Panel header */}

            <div className="border-b border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                    Event panel
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    {formatMonth(currentMonth)}
                  </h2>
                </div>

                <div className="rounded-xl bg-slate-100 px-3 py-2 text-center">
                  <p className="text-lg font-bold text-slate-900">
                    {monthEventCount}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Events
                  </p>
                </div>
              </div>
            </div>

            {/* Selected date */}

            {selectedDate && (
              <div className="border-b border-slate-100 bg-blue-50/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500">
                      Selected date
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {formatLongDate(selectedDate)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-700"
                  >
                    Clear
                  </button>
                </div>

                {selectedDateEvents.length === 0 ? (
                  <p className="mt-3 text-xs text-slate-500">
                    No events on this date.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {selectedDateEvents.map((event) => {
                      const styles = getCategoryClasses(
                        event.category
                      );

                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() =>
                            setSelectedEventId(event.id)
                          }
                          className={`w-full rounded-xl border p-3 text-left transition hover:shadow-sm ${styles.chip}`}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${styles.dot}`}
                            />

                            <div className="min-w-0">
                              <p className="text-xs font-bold">
                                {event.title}
                              </p>

                              {event.target && (
                                <p className="mt-1 text-[10px] opacity-70">
                                  {event.target}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Event list */}

            <div className="flex-1 overflow-y-auto">
              {eventsForMonth.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                    ◌
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    No matching events
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Try removing a filter or changing your search.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {eventsForMonth.map((event) => {
                    const styles = getCategoryClasses(
                      event.category
                    );

                    const relevantPeriod =
                      event.periods.find((period) => {
                        const monthStart = dateKey(
                          startOfMonth(currentMonth)
                        );
                        const monthEnd = dateKey(
                          endOfMonth(currentMonth)
                        );

                        return (
                          period.start <= monthEnd &&
                          period.end >= monthStart
                        );
                      }) || event.periods[0];

                    const isSelected =
                      selectedEventId === event.id;

                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => {
                          setSelectedEventId(event.id);
                          setSelectedDate(relevantPeriod.start);
                        }}
                        className={`w-full p-4 text-left transition ${
                          isSelected
                            ? "bg-slate-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center pt-1">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${styles.dot}`}
                            />

                            <span className="mt-1 h-full w-px bg-slate-100" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${styles.badge}`}
                              >
                                {categoryLabel(event.category)}
                              </span>

                              {event.tentative && (
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-600">
                                  Tentative
                                </span>
                              )}
                            </div>

                            <h3 className="mt-2 text-sm font-bold leading-5 text-slate-900">
                              {event.title}
                            </h3>

                            <p className="mt-1 text-xs font-medium text-slate-500">
                              {getDateRangeLabel(relevantPeriod)}
                            </p>

                            {event.target && (
                              <p className="mt-1 text-xs text-slate-400">
                                {event.target}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* ===================================================
            EVENT DETAILS
        =================================================== */}

        {selectedEvent && (
          <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        getCategoryClasses(
                          selectedEvent.category
                        ).badge
                      }`}
                    >
                      {selectedEvent.category}
                    </span>

                    {selectedEvent.tentative && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-600">
                        Tentative
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 text-xl font-bold text-slate-950">
                    {selectedEvent.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEventId(null)}
                  className="self-start rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Date
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedEvent.periods
                    .map(getDateRangeLabel)
                    .join(" · ")}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Category
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedEvent.category}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Target
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedEvent.target || "School-wide"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Time
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedEvent.time || "As scheduled"}
                </p>
              </div>
            </div>

            {selectedEvent.description && (
              <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                <p className="text-sm leading-6 text-slate-600">
                  {selectedEvent.description}
                </p>
              </div>
            )}
          </section>
        )}

        {/* ===================================================
            LEGEND
        =================================================== */}

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Legend
            </span>

            {(
              [
                "Academic",
                "Exams",
                "Cultural",
                "Sports",
                "Excursion",
                "Flagship",
                "Holiday",
                "School",
              ] as Category[]
            ).map((category) => {
              const styles = getCategoryClasses(category);

              return (
                <div
                  key={category}
                  className="flex items-center gap-2 text-xs font-medium text-slate-500"
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${styles.dot}`}
                  />
                  {category}
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================================================
            FOOTNOTE
        =================================================== */}

        <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">
          Calendar based on the VidyaGyan Bulandshahr Annual
          Calendar 2026–27. Events marked tentative retain that
          status from the source calendar.
        </p>
      </section>
    </main>
  );
}
