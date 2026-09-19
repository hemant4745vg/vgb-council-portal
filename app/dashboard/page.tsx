"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lllmgmfofwczpqbmigey.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsbGxtZ21mb2Z3Y3BxYm1pZ2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTIxNzYsImV4cCI6MjEwNTEyODE3Nn0.H_YfM8J3ZOy-B1lH7jgc4JtHu4rhUsigZ72qoI-b1ss"
);

type CalendarEvent = {
  id?: number | string;
  title: string;
  event_date: string;
  category?: string | null;
  venue?: string | null;
  event_time?: string | null;
  target?: string | null;
};

const OFFICIAL_UPCOMING: CalendarEvent[] = [
  { title: "Mid-Term Examinations End", event_date: "2026-09-21", category: "Exams", target: "Grades 11–12", venue: "Exam Halls" },
  { title: "Mid-Term Examinations End", event_date: "2026-09-23", category: "Exams", target: "Grades 9–10", venue: "Exam Halls" },
  { title: "Mid-Term Examinations End", event_date: "2026-09-25", category: "Exams", target: "Grades 7–8", venue: "Exam Halls" },
  { title: "SPANDAN Lit Fest", event_date: "2026-09-25", category: "Cultural", target: "Teachers", venue: "Campus" },
  { title: "Cultural Week", event_date: "2026-09-28", category: "Cultural", target: "School Community", venue: "Campus", event_time: "28 Sep – 1 Oct" },
  { title: "Gandhi Jayanti & Theatre Visit", event_date: "2026-10-02", category: "Cultural", target: "School Community", venue: "Campus / Theatre" },
  { title: "Trip to Physics Dham – Jaipur", event_date: "2026-10-02", category: "Excursion", target: "Selected Students", venue: "Physics Dham / Jaipur" },
  { title: "IH Kabaddi", event_date: "2026-10-05", category: "Sports", target: "Inter-House", venue: "Sports Ground", event_time: "5–7 Oct & 11–12 Oct" },
];

const styles: Record<string, { dot: string; bg: string; text: string }> = {
  Academic: { dot: "bg-blue-600", bg: "bg-blue-50", text: "text-blue-700" },
  Exams: { dot: "bg-purple-600", bg: "bg-purple-50", text: "text-purple-700" },
  Cultural: { dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-700" },
  Sports: { dot: "bg-emerald-600", bg: "bg-emerald-50", text: "text-emerald-700" },
  Excursion: { dot: "bg-cyan-600", bg: "bg-cyan-50", text: "text-cyan-700" },
  Flagship: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
};

function styleFor(category?: string | null) {
  return styles[category || ""] || { dot: "bg-slate-500", bg: "bg-slate-100", text: "text-slate-700" };
}

function todayIndia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${value}T00:00:00+05:30`));
}

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}

function Quick({ href, icon, title, text }: { href: string; icon: string; title: string; text: string }) {
  return <Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"><div className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">{icon}</div><div><h3 className="font-semibold text-slate-900 group-hover:text-blue-700">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div></div></Link>;
}

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [roleError, setRoleError] = useState(false);
  const [liveEvents, setLiveEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function init() {
      const { data: { session: current } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(current);
      if (current?.user?.email) {
        const { data, error } = await supabase.from("allowed_users").select("role").eq("email", current.user.email.toLowerCase()).maybeSingle();
        if (!mounted) return;
        if (error) setRoleError(true);
        else if (data?.role) setRole(data.role);
      }
      setLoading(false);
    }
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!mounted) return;
      setSession(next);
      if (!next) setRole(null);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session) return;
    async function load() {
      setEventsLoading(true);
      const { data } = await supabase.from("calendar_events").select("id,title,event_date,category,venue,event_time,target").gte("event_date", todayIndia()).order("event_date", { ascending: true }).limit(8);
      setLiveEvents(data || []);
      setEventsLoading(false);
    }
    load();
  }, [session]);

  const upcoming = useMemo(() => {
    const seen = new Set<string>();
    return [...liveEvents, ...OFFICIAL_UPCOMING]
      .filter(e => e.event_date >= todayIndia())
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .filter(e => {
        const key = `${e.title}|${e.event_date}|${e.target || ""}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [liveEvents]);

  if (loading) return <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-8"><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-36 rounded-3xl bg-white" /><div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl bg-white" />)}</div><div className="h-72 rounded-2xl bg-white" /></div></main>;

  if (!session) return <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-20"><div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white">VG</div><p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">Authenticated Workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Sign in to your dashboard</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Your dashboard contains authenticated campus information and tools. Public information remains available without signing in.</p><Link href="/#signin" className="mt-7 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Sign In</Link></div></main>;

  const email = session.user.email || "";
  const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split("@")[0] || "Student";
  const next = upcoming[0];

  return <main className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
    <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-sm"><div className="relative px-6 py-8 sm:px-8 lg:px-10 lg:py-10"><div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" /><div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">Student Workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{greeting()}, {name}.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Your authenticated campus dashboard for the information, events and responsibilities that matter to you.</p></div><div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Account</p><p className="mt-1 text-sm font-semibold text-white">{role || "Verified School Account"}</p><p className="mt-1 max-w-[250px] truncate text-xs text-slate-400">{email}</p></div></div></div></section>

    {roleError && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Your account is authenticated, but the portal role could not be loaded. No additional permissions are granted by this dashboard.</div>}

    <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Access" value="Active" detail="Authenticated session" /><Stat label="Role" value={role || "Student"} detail="Portal permissions" /><Stat label="Upcoming" value={String(upcoming.length)} detail="Visible events" /><Stat label="Today" value={new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(new Date())} detail="India Standard Time" /></section>

    <section className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Campus Calendar</p><h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Next up</h2><p className="mt-1 text-xs text-slate-500">Your nearest institutional events.</p></div><Link href="/calendar" className="text-xs font-semibold text-blue-700 hover:text-blue-900">Full calendar →</Link></div><div className="divide-y divide-slate-100">{eventsLoading ? <div className="px-6 py-10 text-center text-sm text-slate-400">Loading upcoming events…</div> : upcoming.slice(0,5).map((event, i) => { const s = styleFor(event.category); return <div key={`${event.title}-${event.event_date}-${i}`} className="flex gap-4 px-6 py-4 hover:bg-slate-50"><div className="w-12 shrink-0 text-center"><p className="text-[10px] font-bold uppercase text-slate-400">{new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "Asia/Kolkata" }).format(new Date(`${event.event_date}T00:00:00+05:30`))}</p><p className="text-xl font-bold text-slate-900">{event.event_date.slice(8,10)}</p></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`h-2 w-2 rounded-full ${s.dot}`} /><h3 className="font-semibold text-slate-900">{event.title}</h3>{event.category && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.bg} ${s.text}`}>{event.category}</span>}</div><p className="mt-1 text-xs text-slate-500">{event.target || "School Community"}{event.venue ? ` · ${event.venue}` : ""}{event.event_time ? ` · ${event.event_time}` : ""}</p></div></div>; })}</div></div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Immediate context</p><h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Next event</h2></div>{next ? <div className="p-6"><span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${styleFor(next.category).bg} ${styleFor(next.category).text}`}>{next.category || "Campus"}</span><h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">{next.title}</h3><div className="mt-5 space-y-3 text-sm"><div className="flex gap-3"><span className="w-20 shrink-0 text-xs font-semibold text-slate-400">Date</span><span className="font-medium text-slate-700">{formatDate(next.event_date)}</span></div>{next.event_time && <div className="flex gap-3"><span className="w-20 shrink-0 text-xs font-semibold text-slate-400">Time</span><span className="font-medium text-slate-700">{next.event_time}</span></div>}{next.venue && <div className="flex gap-3"><span className="w-20 shrink-0 text-xs font-semibold text-slate-400">Venue</span><span className="font-medium text-slate-700">{next.venue}</span></div>}{next.target && <div className="flex gap-3"><span className="w-20 shrink-0 text-xs font-semibold text-slate-400">For</span><span className="font-medium text-slate-700">{next.target}</span></div>}</div><Link href="/calendar" className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">Open Calendar</Link></div> : <div className="p-6 text-sm text-slate-500">No upcoming event available.</div>}</div>
    </section>

    <section className="mt-6"><div className="mb-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Quick access</p><h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Your portal</h2></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Quick href="/calendar" icon="C" title="My Calendar" text="View the institutional calendar and upcoming campus events." /><Quick href="/council" icon="L" title="Council" text="View the current student leadership structure and houses." /><Quick href="/cafeteria" icon="M" title="Cafeteria" text="Check the current weekly mess menu and meal information." /><Quick href="/resources" icon="R" title="Resources" text="Access the portal's growing academic and institutional library." /></div></section>

    <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace roadmap</p><h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Authenticated tools</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">These modules will become role-aware as the portal's permissions and operational data model are expanded.</p></div><div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-4">{[{t:"Tasks",d:"Assignments, deadlines and council responsibilities.",s:"Next"},{t:"Announcements",d:"Notices relevant to your role, class or activities.",s:"Planned"},{t:"Requests",d:"Event, resource, venue and activity requests.",s:"Planned"},{t:"Meetings",d:"Agendas, minutes, decisions and action items.",s:"Planned"}].map(x => <div key={x.t} className="bg-white p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-900">{x.t}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">{x.s}</span></div><p className="mt-2 text-xs leading-5 text-slate-500">{x.d}</p></div>)}</div></section>

    <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between"><p>VidyaGyan Council Portal · Authenticated Workspace</p><p>Access is controlled by your school account and portal role.</p></div>
  </div></main>;
}
