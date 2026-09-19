"use client";

import { useEffect, useMemo, useState } from "react";
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
   Keep the same ANNUAL_EVENTS array from your current file.
   
   IMPORTANT:
   Paste your existing ANNUAL_EVENTS array here unchanged.
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
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
        {title}
      </h2>

      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-500 max-w-2xl">
          {description}
        </p>
      )}
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
          fetchUserRole(session.user.email);
        }
      }
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);

        if (session?.user?.email) {
          fetchUserRole(session.user.email);
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

  const fetchUserRole = async (userEmail: string) => {
    const { data, error } = await supabase
      .from("allowed_users")
      .select("role")
      .eq("email", userEmail.toLowerCase())
      .single();

    if (error) {
      console.error(
        "Unable to fetch user role:",
        error
      );
      return;
    }

    if (data?.role) {
      setUserRole(data.role);
    }
  };

  /* =======================================================
     FETCH DATABASE EVENTS
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
     CALENDAR DATA FOR HOMEPAGE
  ======================================================= */

  const today = getIndiaDateString();

  const allEvents = useMemo(() => {
    return [...ANNUAL_EVENTS, ...supabaseEvents];
  }, [supabaseEvents]);

  const todayEvents = useMemo(() => {
    return allEvents.filter(
      (event) => event.event_date === today
    );
  }, [allEvents, today]);

  const upcomingEvents = useMemo(() => {
    return allEvents
      .filter(
        (event) => event.event_date >= today
      )
      .sort((a, b) =>
        a.event_date.localeCompare(
          b.event_date
        )
      )
      .slice(0, 3);
  }, [allEvents, today]);

  /* =======================================================
     LOGIN
  ======================================================= */

  const handleLogin = async (
    e: React.FormEvent
  ) => {
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
      console.error(
        "Magic-link sign-in failed:",
        error
      );

      setMessage(
        "We could not send the sign-in link. Please verify the email address and try again."
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0,_#f7f8f5_42%,_#eef2ef_100%)] text-slate-900 font-sans scroll-smooth">

      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-7 lg:py-10">

        {/* =================================================
            HERO
        ================================================= */}

        <section
          id="home"
          className="relative overflow-hidden rounded-[2rem] bg-blue-950 text-white shadow-xl"
        >
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute right-[-100px] top-[-100px] h-[380px] w-[380px] rounded-full border border-white/30" />

            <div className="absolute right-[-30px] top-[-30px] h-[230px] w-[230px] rounded-full border border-white/20" />

            <div className="absolute left-[-100px] bottom-[-160px] h-[350px] w-[350px] rounded-full border border-emerald-300/20" />
          </div>

          <div className="relative grid lg:grid-cols-[1fr_auto] gap-10 items-end px-7 py-10 md:px-12 md:py-14">

            <div className="max-w-3xl">

              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300 mb-5">
                VidyaGyan Bulandshahr
              </p>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.04]">
                One portal for
                <br />
                campus life.
              </h1>

              <p className="mt-6 max-w-2xl text-sm md:text-base leading-7 text-blue-100">
                A unified student-facing platform for
                campus information, events, activities,
                leadership and essential resources.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                <a
                  href="#today"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-950 hover:bg-slate-100 transition"
                >
                  View Today
                </a>

                <a
                  href="/cafeteria"
                  className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15 transition"
                >
                  Today&apos;s Menu
                </a>

                <a
                  href="/calendar"
                  className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15 transition"
                >
                  Calendar
                </a>

              </div>
            </div>

            <div className="lg:min-w-[245px] lg:text-right">

              <div className="text-[10px] uppercase tracking-[0.2em] text-blue-300">
                Campus Time
              </div>

              <div className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
                {clockTime || "--:--:--"}
              </div>

              <div className="mt-1 text-sm text-blue-200">
                {clockDate}
              </div>

              <div className="mt-5 inline-flex items-center gap-2 text-xs text-blue-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                India Standard Time
              </div>

            </div>
          </div>
        </section>

        {/* =================================================
            TODAY
        ================================================= */}

        <section
          id="today"
          className="mt-6 scroll-mt-24"
        >
          <SectionHeading
            eyebrow="Today"
            title="What matters right now."
            description="A compact snapshot of the campus, without making you scroll through the entire institution."
          />

          <div className="grid md:grid-cols-3 gap-4">

            {/* Today */}

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Campus
                </span>

                <span className="text-xs text-slate-400">
                  {today}
                </span>

              </div>

              <div className="mt-3 text-xl font-bold text-blue-950">
                {todayEvents.length > 0
                  ? `${todayEvents.length} event${
                      todayEvents.length > 1
                        ? "s"
                        : ""
                    } today`
                  : "Regular campus day"}
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {todayEvents.length > 0
                  ? todayEvents
                      .map(
                        (event) =>
                          event.title
                      )
                      .join(" · ")
                  : "No annual-calendar event is recorded for today."}
              </p>

            </div>

            {/* Next Event */}

            <div className="bg-blue-950 rounded-2xl p-5 text-white shadow-sm">

              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                Next Up
              </div>

              {upcomingEvents[0] ? (
                <>
                  <div className="mt-3 text-xl font-bold">
                    {upcomingEvents[0].title}
                  </div>

                  <p className="mt-2 text-sm text-blue-200">
                    {formatDate(
                      upcomingEvents[0]
                        .event_date
                    )}
                  </p>

                  {upcomingEvents[0].target && (
                    <p className="mt-1 text-xs text-blue-300">
                      {upcomingEvents[0].target}
                    </p>
                  )}
                </>
              ) : (
                <div className="mt-3 text-xl font-bold">
                  No upcoming event
                </div>
              )}

            </div>

            {/* Cafeteria */}

            <a
              href="/cafeteria"
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >

              <div className="flex items-center justify-between">

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">
                  Cafeteria
                </span>

                <span className="text-slate-400 group-hover:text-orange-600 transition">
                  →
                </span>

              </div>

              <div className="mt-3 text-xl font-bold text-blue-950">
                Today&apos;s Menu
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                View the complete daily and weekly
                cafeteria menu.
              </p>

              <div className="mt-4 text-xs font-semibold text-orange-700">
                Open Cafeteria →
              </div>

            </a>

          </div>
        </section>

        {/* =================================================
            UPCOMING
        ================================================= */}

        <section className="mt-12">

          <SectionHeading
            eyebrow="Upcoming"
            title="The next few things on the calendar."
            description="The homepage shows only the immediate horizon. The full calendar has its own page, because apparently one calendar deserves one calendar."
          />

          <div className="bg-white rounded-[1.5rem] border border-slate-200/80 shadow-sm overflow-hidden">

            {upcomingEvents.length > 0 ? (
              <div className="divide-y divide-slate-100">

                {upcomingEvents.map(
                  (event, index) => {
                    const styles =
                      getCategoryStyles(
                        event.category
                      );

                    return (
                      <div
                        key={`${event.title}-${event.event_date}-${index}`}
                        className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >

                        <div className="flex items-start gap-4">

                          <div
                            className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${styles.dot}`}
                          />

                          <div>

                            <div className="font-semibold text-slate-800">
                              {event.title}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              {event.target ||
                                "School Community"}

                              {event.venue &&
                                ` · ${event.venue}`}

                              {event.time &&
                                ` · ${event.time}`}
                            </div>

                          </div>

                        </div>

                        <div className="flex items-center gap-3">

                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${styles.bg} ${styles.text}`}
                          >
                            {event.category ||
                              "Campus"}
                          </span>

                          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                            {formatDate(
                              event.event_date
                            )}
                          </span>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                No upcoming events are currently available.
              </div>
            )}

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">

              <a
                href="/calendar"
                className="text-sm font-semibold text-blue-950 hover:text-emerald-700 transition"
              >
                View Full Calendar →
              </a>

            </div>

          </div>
        </section>

        {/* =================================================
            EXPLORE PORTAL
        ================================================= */}

        <section className="mt-12">

          <SectionHeading
            eyebrow="Explore"
            title="The rest of the portal."
            description="Each section now has its own proper home, instead of being crammed into this one."
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

            {[
              {
                title: "Leadership",
                description:
                  "Institutional leadership and house administration.",
                href: "/leadership",
                accent:
                  "from-blue-50 to-indigo-50",
              },
              {
                title: "Council",
                description:
                  "Student Council and house leadership for 2026–27.",
                href: "/council",
                accent:
                  "from-emerald-50 to-teal-50",
              },
              {
                title: "Cafeteria",
                description:
                  "Daily and weekly mess menu information.",
                href: "/cafeteria",
                accent:
                  "from-orange-50 to-amber-50",
              },
              {
                title: "Calendar",
                description:
                  "Complete annual and live campus calendar.",
                href: "/calendar",
                accent:
                  "from-purple-50 to-violet-50",
              },
              {
                title: "Activities",
                description:
                  "Sports, cultural programmes and student initiatives.",
                href: "/activities",
                accent:
                  "from-rose-50 to-pink-50",
              },
              {
                title: "Resources",
                description:
                  "Documents, links and institutional references.",
                href: "/resources",
                accent:
                  "from-cyan-50 to-sky-50",
              },
            ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                className={`group rounded-2xl border border-slate-200/80 bg-gradient-to-br ${item.accent} p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition`}
              >

                <div className="flex items-center justify-between">

                  <h3 className="font-bold text-blue-950">
                    {item.title}
                  </h3>

                  <span className="text-slate-400 group-hover:text-blue-950 transition">
                    →
                  </span>

                </div>

                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {item.description}
                </p>

                <div className="mt-5 text-xs font-semibold text-blue-950">
                  Explore →
                </div>

              </a>
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

          <div className="rounded-[1.75rem] bg-white border border-slate-200/80 shadow-sm overflow-hidden">

            <div className="grid lg:grid-cols-[1fr_420px]">

              {/* Information */}

              <div className="bg-blue-950 text-white p-8 md:p-10">

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                  Authorised Access
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight">
                  Sign in to the portal.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-blue-200">
                  Use your official VidyaGyan school
                  email to access authorised portal
                  functions and your leadership workspace.
                </p>

                {session && (
                  <div className="mt-7 rounded-xl border border-white/10 bg-white/10 p-4">

                    <div className="text-[10px] uppercase tracking-[0.16em] text-blue-300">
                      Signed in as
                    </div>

                    <div className="mt-1 text-sm font-semibold">
                      {session.user.email}
                    </div>

                    <div className="mt-1 text-xs text-blue-300">
                      {userRole}
                    </div>

                  </div>
                )}

              </div>

              {/* Form / Signed-in state */}

              <div className="p-8 md:p-10">

                {session ? (
                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                      Access Granted
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-blue-950">
                      Your session is active.
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Continue to the authorised dashboard
                      to manage portal operations.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">

                      <a
                        href="/dashboard"
                        className="inline-flex items-center justify-center rounded-xl bg-blue-950 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900 transition"
                      >
                        Open Dashboard
                      </a>

                      <button
                        onClick={handleLogout}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
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
                      Enter your official school email.
                      No password required.
                    </p>

                    <form
                      onSubmit={handleLogin}
                      className="mt-6 space-y-4"
                    >

                      <div>

                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          School Email
                        </label>

                        <input
                          type="email"
                          value={email}
                          onChange={(e) =>
                            setEmail(
                              e.target.value
                            )
                          }
                          placeholder="username@vidyagyan.in"
                          required
                          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                        />

                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-950 text-white py-3 font-semibold text-sm hover:bg-blue-900 transition disabled:opacity-50"
                      >
                        {loading
                          ? "Sending..."
                          : "Send Magic Link"}
                      </button>

                    </form>

                    {message && (
                      <div
                        className={`mt-4 rounded-xl p-3 text-xs text-center ${
                          message
                            .toLowerCase()
                            .includes("sent")
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {message}
                      </div>
                    )}

                    <p className="mt-5 text-[10px] text-center text-slate-400">
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

        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">

          <div className="grid md:grid-cols-3 gap-8">

            <div>

              <div className="font-bold text-blue-950">
                VidyaGyan Portal
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500 max-w-sm">
                A unified digital layer for campus
                information, student life and
                institutional leadership.
              </p>

            </div>

            <div>

              <div className="text-xs font-bold text-slate-700">
                Portal
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">

                <a
                  href="/leadership"
                  className="hover:text-blue-950"
                >
                  Leadership
                </a>

                <a
                  href="/council"
                  className="hover:text-blue-950"
                >
                  Council
                </a>

                <a
                  href="/cafeteria"
                  className="hover:text-blue-950"
                >
                  Cafeteria
                </a>

                <a
                  href="/calendar"
                  className="hover:text-blue-950"
                >
                  Calendar
                </a>

                <a
                  href="/activities"
                  className="hover:text-blue-950"
                >
                  Activities
                </a>

                <a
                  href="/resources"
                  className="hover:text-blue-950"
                >
                  Resources
                </a>

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

          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-2">

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
