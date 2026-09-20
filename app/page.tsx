"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { createClient, type Session } from "@supabase/supabase-js";

/* =========================================================
   SUPABASE
========================================================= */

const supabase = createClient(
  "https://lllmgmfofwczpqbmigey.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbG1nbWZvZndjenBxYm1pZ2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTIxNzYsImV4cCI6MjEwNTEyODE3Nn0.H_YfM8J3ZOy-B1lH7jgc4JtHu4rhUsigZ72qoI-b1ss"
);

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
  id?: number;
  title: string;
  event_date: string;
  description?: string;
  event_time?: string;
  category?: Category;
  created_by?: string;
  venue?: string;
  target?: string;
  time?: string;
}

/* =========================================================
   ANNUAL CALENDAR
========================================================= */

const ANNUAL_EVENTS: CalendarEvent[] = [
  {
    title: "Mid-Term Examinations End",
    category: "Exams",
    target: "Grades 11–12",
    event_date: "2026-09-21",
    venue: "Exam Halls",
  },
  {
    title: "Mid-Term Examinations End",
    category: "Exams",
    target: "Grades 9–10",
    event_date: "2026-09-23",
    venue: "Exam Halls",
  },
  {
    title: "Mid-Term Examinations End",
    category: "Exams",
    target: "Grades 7–8",
    event_date: "2026-09-25",
    venue: "Exam Halls",
  },
  {
    title: "SPANDAN Lit Fest",
    category: "Cultural",
    target: "Teachers",
    event_date: "2026-09-25",
    venue: "Campus",
  },
  {
    title: "Inter-Section English Recitation",
    category: "Cultural",
    target: "Grade 6",
    event_date: "2026-09-25",
    venue: "Campus",
  },
  {
    title: "Cultural Week",
    category: "Cultural",
    target: "School Community",
    event_date: "2026-09-28",
    venue: "Campus",
    time: "28 Sep – 1 Oct",
  },
  {
    title: "Cultural Week Ends",
    category: "Cultural",
    target: "School Community",
    event_date: "2026-10-01",
    venue: "Campus",
  },
  {
    title: "Gandhi Jayanti & Theatre Visit",
    category: "Cultural",
    target: "School Community",
    event_date: "2026-10-02",
    venue: "Campus / Theatre",
  },
  {
    title: "Trip to Physics Dham – Jaipur",
    category: "Excursion",
    target: "Selected Students",
    event_date: "2026-10-02",
    venue: "Physics Dham / Jaipur",
  },
  {
    title: "IH Kabaddi",
    category: "Sports",
    target: "Inter-House",
    event_date: "2026-10-05",
    venue: "Sports Ground",
    time: "5–7 Oct & 11–12 Oct",
  },
  {
    title: "Mid-Term Review",
    category: "Academic",
    target: "Grades 11–12",
    event_date: "2026-10-08",
    venue: "Campus",
  },
  {
    title: "Mid-Term Review",
    category: "Academic",
    target: "Grades 9–10",
    event_date: "2026-10-09",
    venue: "Campus",
  },
  {
    title: "Mid-Term Review",
    category: "Academic",
    target: "Grades 7–8",
    event_date: "2026-10-10",
    venue: "Campus",
  },
  {
    title: "Delhi Zoo Visit",
    category: "Excursion",
    target: "Grade 6",
    event_date: "2026-10-12",
    venue: "Delhi Zoo",
  },
  {
    title: "Workshop",
    category: "Academic",
    target: "Grades 6–8",
    event_date: "2026-10-14",
    venue: "Campus",
  },
  {
    title: "IH Painting Competition",
    category: "Cultural",
    target: "Grades 6–7",
    event_date: "2026-10-15",
    venue: "Campus",
  },
  {
    title: "IH Painting Competition",
    category: "Cultural",
    target: "Grades 8–9",
    event_date: "2026-10-16",
    venue: "Campus",
  },
  {
    title: "Inter-Disciplinary Trip to Agra",
    category: "Excursion",
    target: "Grades 7–8 & 11–12 Eco",
    event_date: "2026-10-17",
    venue: "Agra",
  },
  {
    title: "Maha Navami",
    category: "Cultural",
    target: "School Community",
    event_date: "2026-10-19",
  },
  {
    title: "Dussehra",
    category: "Cultural",
    target: "School Community",
    event_date: "2026-10-20",
  },
  {
    title: "IH Badminton",
    category: "Sports",
    target: "Inter-House",
    event_date: "2026-10-21",
    venue: "Sports Ground",
    time: "21–24 Oct",
  },
  {
    title: "Visit to Delhi Haat",
    category: "Excursion",
    target: "Commerce & Economics",
    event_date: "2026-10-26",
    venue: "Delhi Haat",
  },
  {
    title: "Annual Sports Practice",
    category: "Sports",
    target: "School Community",
    event_date: "2026-10-26",
    venue: "Sports Ground",
    time: "26–31 Oct · Evening",
  },
  {
    title: "Lit Fest 2026",
    category: "Cultural",
    target: "Inter-School Delegations",
    event_date: "2026-10-30",
    venue: "Campus",
    time: "30–31 Oct",
  },
  {
    title: "Syllabus Completion",
    category: "Academic",
    target: "Grades 10 & 12",
    event_date: "2026-10-31",
    venue: "Campus",
  },
  {
    title: "History for Peace 2026",
    category: "Academic",
    target: "School Community",
    event_date: "2026-11-02",
    venue: "Campus",
    time: "2–3 Nov",
  },
  {
    title: "PTM",
    category: "Academic",
    target: "Parents & Students",
    event_date: "2026-11-04",
    venue: "Campus",
  },
  {
    title: "Deepawali Break",
    category: "Flagship",
    target: "Students",
    event_date: "2026-11-05",
    time: "5–21 Nov",
  },
  {
    title: "Reporting Day",
    category: "Academic",
    target: "Teachers",
    event_date: "2026-11-17",
    venue: "Campus",
  },
  {
    title: "OLE",
    category: "Academic",
    target: "Teachers",
    event_date: "2026-11-18",
    venue: "Campus",
    time: "18–21 Nov",
  },
  {
    title: "Reporting Day",
    category: "Academic",
    target: "Students",
    event_date: "2026-11-22",
    venue: "Campus",
  },
  {
    title: "Classes Begin",
    category: "Academic",
    target: "Students",
    event_date: "2026-11-23",
    venue: "Campus",
  },
  {
    title: "Annual Sports Practice",
    category: "Sports",
    target: "School Community",
    event_date: "2026-11-23",
    venue: "Sports Ground",
    time: "23–24 Nov · Evening",
  },
  {
    title: "Annual Sports Day",
    category: "Sports",
    target: "All Houses",
    event_date: "2026-11-28",
    venue: "Sports Complex",
  },
  {
    title: "Interaction with Mr. Solanki",
    category: "Academic",
    target: "School Community",
    event_date: "2026-11-30",
    venue: "Campus",
    time: "Environmentalist Interaction",
  },
  {
    title: "Itihaas Anveshan",
    category: "Academic",
    target: "School Community",
    event_date: "2026-12-05",
    venue: "Campus",
  },
  {
    title: "VGEE",
    category: "Academic",
    target: "Eligible Students",
    event_date: "2026-12-06",
    venue: "Campus",
  },
  {
    title: "Periodic Tests",
    category: "Exams",
    target: "Relevant Grades",
    event_date: "2026-12-08",
    venue: "Exam Halls",
    time: "8–14 Dec",
  },
  {
    title: "Pre-Board Examinations",
    category: "Exams",
    target: "Grades 10 & 12",
    event_date: "2026-12-08",
    venue: "Exam Halls",
    time: "8–16 Dec",
  },
  {
    title: "Inter-Section Choir",
    category: "Cultural",
    target: "Grade 6",
    event_date: "2026-12-17",
    venue: "Morning Assembly",
  },
  {
    title: "PTM",
    category: "Academic",
    target: "Grades 6–9 & 11",
    event_date: "2026-12-19",
    venue: "Campus",
  },
  {
    title: "Winter Break Begins",
    category: "Flagship",
    target: "Grades 6–9 & 11",
    event_date: "2026-12-20",
    time: "20 Dec – 9 Jan",
  },
  {
    title: "Winter Camp",
    category: "Academic",
    target: "Grades 10 & 12",
    event_date: "2026-12-21",
    venue: "Campus",
  },
  {
    title: "Christmas",
    category: "Cultural",
    target: "School Community",
    event_date: "2026-12-25",
  },
  {
    title: "New Year Eve Celebration",
    category: "Cultural",
    target: "School Community",
    event_date: "2026-12-31",
    venue: "Campus",
  },
  {
    title: "Reporting Day",
    category: "Academic",
    target: "Teachers",
    event_date: "2027-01-09",
    venue: "Campus",
  },
  {
    title: "Reporting Day",
    category: "Academic",
    target: "Students",
    event_date: "2027-01-10",
    venue: "Campus",
  },
  {
    title: "Classes Begin",
    category: "Academic",
    target: "Students",
    event_date: "2027-01-11",
    venue: "Campus",
  },
  {
    title: "ICCR International Festival",
    category: "Cultural",
    target: "Grade 8",
    event_date: "2027-01-21",
    venue: "Campus",
    time: "21–23 Jan",
  },
  {
    title: "IH Music Competition",
    category: "Cultural",
    target: "Grades 7–9",
    event_date: "2027-01-25",
    venue: "Campus",
    time: "Singing / Orchestra",
  },
  {
    title: "Republic Day",
    category: "Flagship",
    target: "School Community",
    event_date: "2027-01-26",
  },
  {
    title: "Visit to Book Fair",
    category: "Excursion",
    target: "Students",
    event_date: "2027-01-30",
    venue: "Book Fair",
  },
  {
    title: "Annual Examinations",
    category: "Exams",
    target: "Grade 11",
    event_date: "2027-02-09",
    venue: "Exam Halls",
    time: "9–17 Feb",
  },
  {
    title: "Annual Examinations",
    category: "Exams",
    target: "Grade 9",
    event_date: "2027-02-09",
    venue: "Exam Halls",
    time: "9–19 Feb",
  },
  {
    title: "OLE",
    category: "Academic",
    target: "Grades 9 & 11",
    event_date: "2027-02-22",
    venue: "Campus",
    time: "Proposed · 22–27 Feb",
  },
  {
    title: "New Session Begins",
    category: "Academic",
    target: "Grades 10 & 12",
    event_date: "2027-03-01",
    venue: "Campus",
  },
  {
    title: "Annual Examinations",
    category: "Exams",
    target: "Grades 6–8",
    event_date: "2027-03-09",
    venue: "Exam Halls",
    time: "9–23 Mar",
  },
  {
    title: "Holi",
    category: "Cultural",
    target: "School Community",
    event_date: "2027-03-22",
  },
  {
    title: "Session Break",
    category: "Academic",
    target: "Students",
    event_date: "2027-03-27",
    time: "27–31 Mar",
  },
  {
    title: "In-Service Training",
    category: "Academic",
    target: "Staff",
    event_date: "2027-03-29",
    venue: "Campus",
    time: "29–30 Mar",
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
  action?: React.ReactNode;
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
   HOME
========================================================= */

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState("Council Member");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [clockTime, setClockTime] = useState("");
  const [clockDate, setClockDate] = useState("");

  const [supabaseEvents, setSupabaseEvents] = useState<
    CalendarEvent[]
  >([]);

  /* =======================================================
     CLOCK + AUTH + EVENTS
  ======================================================= */

  useEffect(() => {
    const updateClock = () => {
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
    };

    updateClock();

    const interval = setInterval(updateClock, 1000);

    supabase.auth.getSession().then(
      ({ data: { session } }) => {
        setSession(session);

        if (session?.user?.email) {
          fetchUserProfile(session.user.email);
        }
      }
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);

        if (session?.user?.email) {
          fetchUserProfile(session.user.email);
        }
      }
    );

    fetchEvents();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  /* =======================================================
     USER ROLE
  ======================================================= */

  const fetchUserProfile = async (userEmail: string) => {
  const { data, error } = await supabase
    .from("allowed_users")
    .select("id, name, email, role, admin_status")
    .ilike("email", userEmail)
    .maybeSingle();

  if (error) {
    console.error("Unable to fetch user profile:", error);
    setRoleError(true);
    return;
  }

  if (data) {
    setProfile(data);
    setRoleError(false);
  } else {
    console.error("No portal profile found for:", userEmail);
    setRoleError(true);
  }
};

  /* =======================================================
     DATABASE EVENTS
  ======================================================= */

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("event_date", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Unable to fetch calendar events:",
        error
      );
      return;
    }

    if (!data) return;

    const formattedEvents: CalendarEvent[] =
      data.map((event: any) => ({
        id: event.id,
        title: event.title,
        event_date: event.event_date,
        description: event.description,
        event_time: event.event_time,
        category: event.category,
        created_by: event.created_by,
        venue: event.description || "Campus",
        target: event.target || "All Students",
        time: event.event_time || "",
      }));

    setSupabaseEvents(formattedEvents);
  };

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const today = getIndiaDateString();

  const allEvents = useMemo(() => {
    return [...ANNUAL_EVENTS, ...supabaseEvents];
  }, [supabaseEvents]);

  const sortedEvents = useMemo(() => {
    return [...allEvents].sort((a, b) =>
      a.event_date.localeCompare(b.event_date)
    );
  }, [allEvents]);

  const todayEvents = useMemo(() => {
    return sortedEvents.filter(
      (event) => event.event_date === today
    );
  }, [sortedEvents, today]);

  const upcomingEvents = useMemo(() => {
    return sortedEvents
      .filter(
        (event) => event.event_date >= today
      )
      .slice(0, 5);
  }, [sortedEvents, today]);

  const nextEvent = upcomingEvents[0];

  const nextEventDays = nextEvent
    ? daysUntil(nextEvent.event_date, today)
    : null;

  const futureEventCount = useMemo(() => {
    return allEvents.filter(
      (event) => event.event_date >= today
    ).length;
  }, [allEvents, today]);

  /* =======================================================
     LOGIN
  ======================================================= */

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const formattedEmail =
      email.trim().toLowerCase();

    if (
      !formattedEmail.endsWith(
        "@vidyagyan.in"
      )
    ) {
      setMessage(
        "Access denied. Use an official @vidyagyan.in school email."
      );

      setLoading(false);
      return;
    }

    const { error } =
      await supabase.auth.signInWithOtp({
        email: formattedEmail,
        options: {
          emailRedirectTo:
            "https://vgb-student-council-portal.vercel.app",
        },
      });

    if (error) {
  console.error("Magic-link sign-in failed:", error);

  setMessage(
    `Sign-in failed: ${error.message}`
  );
    } else {
      setMessage(
        "Magic link sent. Check your Outlook inbox, then open the link to continue."
      );
    }

    setLoading(false);
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setSession(null);
    setUserRole("Council Member");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0,_#f7f8f5_42%,_#eef2ef_100%)] text-slate-900 font-sans">

      <main className="mx-auto max-w-7xl px-5 py-7 lg:px-8 lg:py-10">

        {/* =================================================
    HERO
================================================= */}

<section
  id="home"
  className="relative overflow-hidden rounded-[2rem] bg-blue-950 text-white shadow-xl"
>
  {/* Background geometry */}
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full border border-white/[0.08]" />

    <div className="absolute -right-8 -top-8 h-[300px] w-[300px] rounded-full border border-white/[0.07]" />

    <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.025]" />

    <div className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full border border-emerald-300/[0.08]" />

    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>

  <div className="relative px-6 py-10 sm:px-10 md:px-14 md:py-12 lg:px-16 lg:py-14">

    {/* ─────────────────────────────────────────────
        BRAND / INTRO
    ───────────────────────────────────────────── */}

    <div className="text-center">

      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-3.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />

        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">
          VidyaGyan Bulandshahr
        </span>
      </div>

      <h1 className="mt-6 text-4xl font-bold tracking-[-0.035em] leading-[1.05] sm:text-5xl md:text-6xl">
        One portal for
        <br />
        <span className="text-white/90">
          campus life.
        </span>
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-blue-100/80 md:text-base">
        A unified student-facing platform for campus information,
        events, activities, leadership and essential resources.
      </p>

    </div>


    {/* ─────────────────────────────────────────────
        CAMPUS TIME
    ───────────────────────────────────────────── */}

    <div className="mx-auto mt-9 max-w-xl">

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] px-5 py-6 shadow-inner backdrop-blur-sm sm:px-8 sm:py-7">

        {/* Label */}

        <div className="flex items-center justify-center gap-2">

          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />

          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-200">
            Campus Time
          </span>

        </div>


        {/* Clock */}

        <div
          className="mt-3 text-center text-4xl font-semibold tracking-[-0.04em] tabular-nums text-white sm:text-5xl md:text-6xl"
          aria-live="polite"
        >
          {clockTime || "--:--:--"}
        </div>


        {/* Date */}

        <div className="mt-2 text-center text-sm font-medium text-blue-200">
          {clockDate || "Loading campus time..."}
        </div>


        {/* Timezone */}

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-blue-300/80">

          <span>India Standard Time</span>

          <span className="h-1 w-1 rounded-full bg-blue-400/60" />

          <span>UTC +05:30</span>

        </div>

      </div>

    </div>


    {/* ─────────────────────────────────────────────
        ACTIONS
    ───────────────────────────────────────────── */}

    <div className="mt-7 flex flex-wrap items-center justify-center gap-3">

      <a
        href="#today"
        className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-blue-950 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-md"
      >
        View Today
      </a>

      <a
        href="/cafeteria"
        className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
      >
        Today&apos;s Menu
      </a>

      <a
        href="/calendar"
        className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
      >
        Open Calendar
      </a>

    </div>


    {/* ─────────────────────────────────────────────
        BOTTOM STATUS
    ───────────────────────────────────────────── */}

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

          <div className="grid gap-4 md:grid-cols-3">

            {/* Campus status */}

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Campus
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
                  : "No recorded events"}
              </h3>

              {todayEvents.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {todayEvents.slice(0, 3).map(
                    (event, index) => {
                      const styles =
                        getCategoryStyles(
                          event.category
                        );

                      return (
                        <div
                          key={`${event.title}-${index}`}
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
                      + {todayEvents.length - 3} more on Calendar →
                    </Link>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  No event is recorded for today in the
                  current calendar.
                </p>
              )}

            </div>

            {/* Next event */}

            <div className="relative overflow-hidden rounded-2xl bg-blue-950 p-5 text-white shadow-sm">

              <div className="pointer-events-none absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full border border-white/10" />

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

                      {nextEvent.category && (
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-blue-100">
                          {nextEvent.category}
                        </span>
                      )}

                    </div>

                    <p className="mt-3 text-xs leading-5 text-blue-300">
                      {nextEvent.target ||
                        "School Community"}

                      {nextEvent.venue &&
                        ` · ${nextEvent.venue}`}
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
                  <h3 className="mt-4 text-xl font-bold">
                    No upcoming events
                  </h3>
                )}

              </div>

            </div>

            {/* Portal status */}

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
                Browse the complete academic year,
                including examinations, sports,
                cultural programmes and excursions.
              </p>

              <Link
                href="/calendar"
                className="mt-5 inline-flex items-center text-xs font-semibold text-blue-950 transition hover:text-emerald-700"
              >
                Explore full calendar
                <span className="ml-1">→</span>
              </Link>

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
                  (event, index) => {
                    const styles =
                      getCategoryStyles(
                        event.category
                      );

                    const isToday =
                      event.event_date === today;

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

                              {event.venue &&
                                ` · ${event.venue}`}

                              {event.time &&
                                ` · ${event.time}`}
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

                          <span className="text-xs font-semibold whitespace-nowrap text-slate-500">
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
                No upcoming events are currently available.
              </div>
            )}

          </div>
        </section>

        {/* =================================================
            QUICK ACCESS
        ================================================= */}

        <section className="mt-14">

          <SectionHeading
            eyebrow="Explore"
            title="Everything else, in its proper place."
            description="Each section has a focused page instead of making Home carry the entire school on its back."
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
                eyebrow: "Student Leadership",
                accent:
                  "from-emerald-50 to-teal-50",
              },
              {
                title: "Cafeteria",
                description:
                  "Daily and weekly menu information for the campus.",
                href: "/cafeteria",
                eyebrow: "Campus Life",
                accent:
                  "from-orange-50 to-amber-50",
              },
              {
                title: "Calendar",
                description:
                  "Annual events, live additions and the complete campus schedule.",
                href: "/calendar",
                eyebrow: "Planning",
                accent:
                  "from-purple-50 to-violet-50",
              },
              {
                title: "Activities",
                description:
                  "Sports, cultural programmes, student initiatives and participation.",
                href: "/activities",
                eyebrow: "Student Life",
                accent:
                  "from-rose-50 to-pink-50",
              },
              {
                title: "Resources",
                description:
                  "Useful documents, links and institutional references.",
                href: "/resources",
                eyebrow: "Reference",
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

        {/* =================================================
            SIGN IN
        ================================================= */}

        <section
          id="signin"
          className="mt-14 scroll-mt-24"
        >

          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm">

            <div className="grid lg:grid-cols-[1fr_420px]">

              {/* Information */}

              <div className="relative overflow-hidden bg-blue-950 p-8 text-white md:p-10">

                <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full border border-white/10" />

                <div className="relative">

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                    Authorised Access
                  </p>

                  <h2 className="mt-3 text-3xl font-bold tracking-tight">
                    Your portal workspace.
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-blue-200">
                    Sign in with your official
                    VidyaGyan school account to access
                    authorised portal functions.
                  </p>

                  {session && (
                    <div className="mt-7 rounded-xl border border-white/10 bg-white/10 p-4">

                      <div className="text-[10px] uppercase tracking-[0.16em] text-blue-300">
                        Current account
                      </div>

                      <div className="mt-1 break-all text-sm font-semibold">
                        {session.user.email}
                      </div>

                      <div className="mt-1 text-xs text-blue-300">
                        {userRole}
                      </div>

                    </div>
                  )}

                </div>

              </div>

              {/* Form */}

              <div className="p-8 md:p-10">

                {session ? (
                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                      Access Granted
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-blue-950">
                      You&apos;re signed in.
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Continue to your authorised
                      dashboard or sign out of this session.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">

                      <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center rounded-xl bg-blue-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
                      >
                        Open Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Sign Out
                      </button>

                    </div>

                  </div>
                ) : (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                      VidyaGyan Account
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-blue-950">
                      Send a magic link
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      No password required. Use your
                      official school email.
                    </p>

                    <form
                      onSubmit={handleLogin}
                      className="mt-6 space-y-4"
                    >

                      <div>

                        <label
                          htmlFor="school-email"
                          className="mb-1.5 block text-xs font-semibold text-slate-600"
                        >
                          School Email
                        </label>

                        <input
                          id="school-email"
                          type="email"
                          value={email}
                          onChange={(e) =>
                            setEmail(
                              e.target.value
                            )
                          }
                          placeholder="username@vidyagyan.in"
                          required
                          autoComplete="email"
                          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                        />

                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-950 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading
                          ? "Sending..."
                          : "Send Magic Link"}
                      </button>

                    </form>

                    {message && (
                      <div
                        className={`mt-4 rounded-xl border p-3 text-center text-xs ${
                          message
                            .toLowerCase()
                            .includes("sent")
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {message}
                      </div>
                    )}

                    <p className="mt-5 text-center text-[10px] text-slate-400">
                      Access is restricted to official
                      @vidyagyan.in accounts.
                    </p>
                  </>
                )}

              </div>

            </div>

          </div>
        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="mt-16 border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">

          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">

            <div>

              <div className="font-bold text-blue-950">
                VidyaGyan Portal
              </div>

              <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                A unified digital layer for campus
                information, student life and
                institutional leadership.
              </p>

            </div>

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
                  href="/resources"
                  className="transition hover:text-blue-950"
                >
                  Resources
                </Link>

              </div>

            </div>

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
