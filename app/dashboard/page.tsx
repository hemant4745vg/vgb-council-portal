"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lllmgmfofwczpqbmigey.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsbGxtZ21mb2Z3Y3BxYm1pZ2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTIxNzYsImV4cCI6MjEwNTEyODE3Nn0.H_YfM8J3ZOy-B1lH7jgc4JtHu4rhUsigZ72qoI-b1ss"
);

type UserProfile = {
  id: number;
  name: string | null;
  email: string;
  role: string | null;
  admin_status: "yes" | "no";
};

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date())
  );

  return hour < 12
    ? "Good morning"
    : hour < 17
      ? "Good afternoon"
      : "Good evening";
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function Quick({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-700">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [profileLoading, setProfileLoading] = useState(true);

  const [profileError, setProfileError] = useState(false);

  const [loading, setLoading] = useState(true);

  /**
   * Load the authenticated user's portal profile.
   *
   * The authenticated Supabase user and the portal profile are
   * deliberately treated as two separate things:
   *
   * Supabase Auth → identity
   * allowed_users → name, role, admin permissions
   */
  async function loadProfile(userEmail: string) {
    const email = userEmail.toLowerCase().trim();

    if (!email) {
      setProfile(null);
      setProfileError(true);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    setProfileError(false);

    const { data, error } = await supabase
      .from("allowed_users")
      .select("id, name, email, role, admin_status")
      .ilike("email", email)
      .maybeSingle();

    if (error) {
      console.error("Profile lookup failed:", error);

      setProfile(null);
      setProfileError(true);
      setProfileLoading(false);

      return;
    }

    if (!data) {
      console.error("No portal profile found for:", email);

      setProfile(null);
      setProfileError(true);
      setProfileLoading(false);

      return;
    }

    setProfile(data as UserProfile);
    setProfileError(false);
    setProfileLoading(false);
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(currentSession);

      if (currentSession?.user?.email) {
        await loadProfile(currentSession.user.email);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }

      if (mounted) {
        setLoading(false);
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);

      if (nextSession?.user?.email) {
        await loadProfile(nextSession.user.email);
      } else {
        setProfile(null);
        setProfileError(false);
        setProfileLoading(false);
      }

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = profile?.admin_status === "yes";

  /*
   * Do not use the email prefix as the person's displayed name.
   *
   * If the profile has not loaded yet, show a neutral loading state.
   * This prevents "hr4745" from appearing as though it were the user's
   * actual name.
   */
  const displayName = profileLoading
    ? "Loading…"
    : profile?.name?.trim() || "Verified Student";

  const role = profile?.role?.trim() || null;

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-36 rounded-3xl bg-white" />

          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="h-56 rounded-2xl bg-white" />

          <div className="h-48 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white">
            VG
          </div>

          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Authenticated Workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Sign in to your dashboard
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            Your dashboard contains authenticated campus information and
            tools. Public information remains available without signing in.
          </p>

          <Link
            href="/#signin"
            className="mt-7 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const email = session.user.email || "";

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* Hero */}
        <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-sm">
          <div className="relative px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
                  Student Workspace
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  {greeting()}, {displayName}.
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  Your authenticated campus dashboard for the information,
                  resources and responsibilities that matter to you.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Account
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {profileLoading
                    ? "Loading profile…"
                    : role || "Verified School Account"}
                </p>

                <p className="mt-1 max-w-[250px] truncate text-xs text-slate-400">
                  {email}
                </p>

                {isAdmin && (
                  <span className="mt-2 inline-flex rounded-full bg-blue-500/15 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-blue-300">
                    Administrator
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Profile warning */}
        {profileError && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your account is authenticated, but your portal profile could not
            be loaded. The dashboard is therefore using restricted default
            permissions.
          </div>
        )}

        {/* Stats */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat
            label="Access"
            value="Active"
            detail="Authenticated school account"
          />

          <Stat
            label="Role"
            value={role || "Student"}
            detail="Portal permissions"
          />

          <Stat
            label="Account"
            value={isAdmin ? "Admin" : "Verified"}
            detail={isAdmin ? "Administrative access" : "Portal account"}
          />
        </section>

        {/* Account information */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
              Account
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              Your portal identity
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your identity and permissions are linked to your official
              VidyaGyan school account.
            </p>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Name
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {profileLoading
                  ? "Loading…"
                  : profile?.name?.trim() || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Email
              </p>

              <p className="mt-2 truncate text-sm font-semibold text-slate-900">
                {email}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Role
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {profileLoading ? "Loading…" : role || "Student"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Access
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {isAdmin ? "Administrator" : "Standard"}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Access */}
        <section className="mt-6">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
              Quick access
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              Your portal
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Quick
              href="/council"
              icon="L"
              title="Council"
              text="View the current student leadership structure and houses."
            />

            <Quick
              href="/cafeteria"
              icon="M"
              title="Cafeteria"
              text="Check the current weekly mess menu and meal information."
            />

            <Quick
              href="/study-material"
              icon="S"
              title="Study Material"
              text="Access notes, revision sheets, HOTS and VidyaGyan previous papers."
            />
          </div>
        </section>

        {/* Administrator section */}
        {isAdmin && (
          <section className="mt-6 rounded-2xl border border-blue-100 bg-white shadow-sm">
            <div className="border-b border-blue-50 px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                Administration
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                Portal management
              </h2>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                Administrative tools are available because your account is
                marked as an administrator in the portal database.
              </p>
            </div>

            <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
              <Link
                href="/dashboard/study-material"
                className="group bg-white p-6 transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-sm font-bold text-violet-700">
                  S
                </div>

                <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-violet-700">
                  Manage Study Material
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Upload, organize and maintain academic resources.
                </p>

                <span className="mt-4 inline-block text-xs font-semibold text-violet-700">
                  Open management →
                </span>
              </Link>

              <Link
                href="/dashboard/users"
                className="group bg-white p-6 transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                  U
                </div>

                <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-emerald-700">
                  Manage Users
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Maintain council identities, positions and administrative
                  access.
                </p>

                <span className="mt-4 inline-block text-xs font-semibold text-emerald-700">
                  Open management →
                </span>
              </Link>
            </div>
          </section>
        )}

        {/* Workspace roadmap */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Workspace roadmap
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              Authenticated tools
            </h2>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
              These modules will become role-aware as the portal's permissions
              and operational data model are expanded.
            </p>
          </div>

          <div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                t: "Tasks",
                d: "Assignments, deadlines and council responsibilities.",
                s: "Next",
              },
              {
                t: "Announcements",
                d: "Notices relevant to your role, class or activities.",
                s: "Planned",
              },
              {
                t: "Requests",
                d: "Event, resource, venue and activity requests.",
                s: "Planned",
              },
              {
                t: "Meetings",
                d: "Agendas, minutes, decisions and action items.",
                s: "Planned",
              },
            ].map((x) => (
              <div key={x.t} className="bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-900">{x.t}</h3>

                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                    {x.s}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {x.d}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>VidyaGyan Council Portal · Authenticated Workspace</p>

          <p>
            Access is controlled by your school account and portal role.
          </p>
        </div>
      </div>
    </main>
  );
}
