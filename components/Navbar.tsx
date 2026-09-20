"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

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

type UserProfile = {
  id: number;
  name: string | null;
  email: string;
  role: string | null;
  admin_status: string;
};

type RpcProfile = {
  id: number;
  name: string | null;
  email: string | null;
  role: string | null;
  admin_status: string | null;
};

/* =========================================================
   NAVIGATION
========================================================= */

const navItems = [
  { name: "Home", href: "/" },
  { name: "Leadership", href: "/leadership" },
  { name: "Council", href: "/council" },
  { name: "Cafeteria", href: "/cafeteria" },
  { name: "Calendar", href: "/calendar" },
  { name: "Activities", href: "/activities" },
  { name: "Study Material", href: "/study-material" },
];

/* =========================================================
   NAVBAR
========================================================= */

export default function Navbar() {
  const pathname = usePathname();

  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [profileError, setProfileError] =
    useState(false);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [signInOpen, setSignInOpen] =
    useState(false);

  const [email, setEmail] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const accountRef =
    useRef<HTMLDivElement | null>(null);

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  async function loadProfile(userEmail: string) {
    if (!userEmail.trim()) {
      setProfile(null);
      setProfileError(false);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    setProfileError(false);

    const { data, error } =
      await supabase.rpc(
        "get_my_portal_profile"
      );

    if (error) {
      console.error(
        "Portal profile RPC failed:",
        error
      );

      setProfile(null);
      setProfileError(true);
      setProfileLoading(false);
      return;
    }

    const profileData: RpcProfile | null =
      Array.isArray(data)
        ? ((data[0] as RpcProfile | undefined) ??
          null)
        : (data as RpcProfile | null);

    if (!profileData) {
      console.error(
        "No portal profile returned for:",
        userEmail
      );

      setProfile(null);
      setProfileError(true);
      setProfileLoading(false);
      return;
    }

    setProfile({
      id: Number(profileData.id),
      name: profileData.name ?? null,
      email:
        profileData.email ?? userEmail,
      role: profileData.role ?? null,
      admin_status:
        profileData.admin_status === "yes"
          ? "yes"
          : "no",
    });

    setProfileError(false);
    setProfileLoading(false);
  }

  /* =======================================================
     AUTH INITIALISATION
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(currentSession);

      if (currentSession?.user?.email) {
        await loadProfile(
          currentSession.user.email
        );
      } else {
        setProfile(null);
        setProfileError(false);
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (!mounted) return;

          setSession(nextSession);

          if (nextSession?.user?.email) {
            /*
             * Give Supabase's auth state transition
             * a moment to settle before calling the RPC.
             */
            window.setTimeout(() => {
              if (!mounted) return;

              loadProfile(
                nextSession.user.email!
              );
            }, 0);
          } else {
            setProfile(null);
            setProfileError(false);
          }
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =======================================================
     CLOSE ACCOUNT MENU WHEN CLICKING OUTSIDE
  ======================================================= */

  useEffect(() => {
    function handlePointerDown(
      event: MouseEvent
    ) {
      if (
        accountRef.current &&
        !accountRef.current.contains(
          event.target as Node
        )
      ) {
        setAccountOpen(false);
        setSignInOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
    };
  }, []);

  /* =======================================================
     CLOSE MENUS ON ESCAPE
  ======================================================= */

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setAccountOpen(false);
        setSignInOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /* =======================================================
     SIGN IN
  ======================================================= */

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

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
        `Sign-in failed: ${error.message}`
      );
    } else {
      setMessage(
        "Magic link sent. Check your Outlook inbox, then open the link to continue."
      );
    }

    setLoading(false);
  }

  /* =======================================================
     SIGN OUT
  ======================================================= */

  async function handleLogout() {
    await supabase.auth.signOut();

    setSession(null);
    setProfile(null);
    setProfileError(false);
    setAccountOpen(false);
  }

  /* =======================================================
     DISPLAY DATA
  ======================================================= */

  const displayName =
    profile?.name ||
    session?.user?.email?.split("@")[0] ||
    "Account";

  const initials =
    profile?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("") ||
    session?.user?.email
      ?.charAt(0)
      .toUpperCase() ||
    "A";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">

        {/* =================================================
            BRAND
        ================================================= */}

        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          onClick={() => {
            setAccountOpen(false);
            setSignInOpen(false);
          }}
        >
          <img
            src="/vidyagyan-logo.png"
            alt="VidyaGyan"
            className="h-10 w-auto object-contain"
          />

          <div className="hidden border-l border-slate-200 pl-3 sm:block">
            <p className="text-sm font-bold leading-tight text-slate-900">
              VidyaGyan
            </p>

            <p className="text-[11px] font-medium leading-tight text-slate-500">
              Council Portal
            </p>
          </div>
        </Link>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="ml-auto flex min-w-0 items-center">
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(
                      item.href
                    );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setAccountOpen(false);
                    setSignInOpen(false);
                  }}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* =================================================
              MOBILE NAVIGATION
          ================================================= */}

          <nav className="mr-2 flex max-w-[42vw] items-center gap-1 overflow-x-auto lg:hidden">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(
                      item.href
                    );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* =================================================
              AUTH AREA
          ================================================= */}

          <div
            ref={accountRef}
            className="relative ml-2 border-l border-slate-200 pl-3"
          >

            {/* =================================================
                LOGGED OUT
            ================================================= */}

            {!session ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSignInOpen(
                      (current) => !current
                    );
                    setAccountOpen(false);
                    setMessage("");
                  }}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Sign In
                </button>

                {signInOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                    <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                        Authorised Access
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-blue-950">
                        Sign in to the portal
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Use your official VidyaGyan
                        school email. No password required.
                      </p>
                    </div>

                    <div className="p-5">
                      <form
                        onSubmit={handleLogin}
                        className="space-y-4"
                      >
                        <div>
                          <label
                            htmlFor="navbar-school-email"
                            className="mb-1.5 block text-xs font-semibold text-slate-600"
                          >
                            School Email
                          </label>

                          <input
                            id="navbar-school-email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                              setEmail(
                                event.target.value
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

                      <p className="mt-4 text-center text-[10px] leading-4 text-slate-400">
                        Access is restricted to official
                        @vidyagyan.in accounts.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (

              /* =================================================
                 LOGGED IN
              ================================================= */

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(
                      (current) => !current
                    );
                    setSignInOpen(false);
                  }}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-950 text-[11px] font-bold text-white">
                    {initials}
                  </span>

                  <span className="hidden max-w-[120px] text-left sm:block">
                    <span className="block truncate text-xs font-semibold text-slate-800">
                      {displayName}
                    </span>

                    <span className="block truncate text-[9px] text-slate-400">
                      {profile?.role ||
                        "Portal Account"}
                    </span>
                  </span>

                  <span
                    className={`ml-1 text-slate-400 transition-transform ${
                      accountOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(330px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                  >

                    {/* Account identity */}

                    <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950 text-xs font-bold text-white">
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {displayName}
                          </p>

                          <p className="truncate text-[10px] text-slate-500">
                            {session.user.email}
                          </p>
                        </div>
                      </div>

                      {profile?.role && (
                        <div className="mt-3">
                          <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-blue-800">
                            {profile.role}
                          </span>

                          {profile.admin_status ===
                            "yes" && (
                            <span className="ml-2 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-800">
                              Admin
                            </span>
                          )}
                        </div>
                      )}

                      {profileLoading && (
                        <p className="mt-2 text-[10px] text-slate-400">
                          Loading account details...
                        </p>
                      )}

                      {profileError && (
                        <p className="mt-2 text-[10px] leading-4 text-amber-700">
                          Account authenticated, but portal
                          profile details could not be loaded.
                        </p>
                      )}
                    </div>

                    {/* Menu */}

                    <div className="p-2">
                      <Link
                        href="/dashboard"
                        role="menuitem"
                        onClick={() =>
                          setAccountOpen(false)
                        }
                        className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-800">
                          D
                        </span>

                        <span>
                          <span className="block text-sm font-semibold text-slate-800">
                            Dashboard
                          </span>

                          <span className="block text-[10px] text-slate-400">
                            Your authorised workspace
                          </span>
                        </span>
                      </Link>

                      {profile?.admin_status ===
                        "yes" && (
                        <Link
                          href="/dashboard"
                          role="menuitem"
                          onClick={() =>
                            setAccountOpen(false)
                          }
                          className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-emerald-50"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-800">
                            A
                          </span>

                          <span>
                            <span className="block text-sm font-semibold text-slate-800">
                              Administration
                            </span>

                            <span className="block text-[10px] text-slate-400">
                              Manage authorised portal functions
                            </span>
                          </span>
                        </Link>
                      )}

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-red-50"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-700">
                          ↪
                        </span>

                        <span>
                          <span className="block text-sm font-semibold text-slate-800">
                            Sign Out
                          </span>

                          <span className="block text-[10px] text-slate-400">
                            End this portal session
                          </span>
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
