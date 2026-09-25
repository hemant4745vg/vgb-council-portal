"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Session } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserProfile = {
  id: number;
  name: string | null;
  email: string;
  role: string | null;
  admin_status: "yes" | "no";
};

type RpcProfile = {
  id: number;
  name: string | null;
  email: string | null;
  role: string | null;
  admin_status: string | null;
};

const navItems = [
  { name: "Home", href: "/" },
  { name: "Leadership", href: "/leadership" },
  { name: "Council", href: "/council" },
  { name: "Editorial", href: "/editorial" },
  { name: "Calendar", href: "/calendar" },
  { name: "Study Materials", href: "/study-material" },
  { name: "Cafeteria", href: "/cafeteria" },
];

/* =========================================================
   SIGN-IN PANEL
   ========================================================= */

type SignInPanelProps = {
  email: string;
  password: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  message: string;
  handleLogin: (
    event: React.FormEvent<HTMLFormElement>
  ) => Promise<void>;
  closeMenus: () => void;
};

function SignInPanel({
  email,
  password,
  setEmail,
  setPassword,
  loading,
  message,
  handleLogin,
  closeMenus,
}: SignInPanelProps) {
  const isError =
    message.toLowerCase().includes("failed") ||
    message.toLowerCase().includes("denied") ||
    message.toLowerCase().includes("enter");

  return (
    <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[60] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
          Authorised Access
        </p>

        <h3 className="mt-1 text-lg font-bold text-blue-950">
          Sign in to the portal
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Use your registered VidyaGyan school email and password.
        </p>
      </div>

      <div className="p-5">
        <form onSubmit={handleLogin} className="space-y-4">
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
              onChange={(event) => setEmail(event.target.value)}
              placeholder="username@vidyagyan.in"
              required
              autoComplete="username"
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div>
            <label
              htmlFor="navbar-school-password"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Password
            </label>

            <input
              id="navbar-school-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-950 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-3 text-center">
          <Link
            href="/forgot-password"
            onClick={closeMenus}
            className="text-xs font-medium text-blue-700 hover:text-blue-900 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {message && (
          <div
            className={`mt-4 rounded-xl border p-3 text-center text-xs ${
              isError
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {message}
          </div>
        )}

        <p className="mt-4 text-center text-[10px] leading-4 text-slate-400">
          Access is restricted to registered Student Council
          Portal accounts.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   ACCOUNT MENU
   ========================================================= */

type AccountMenuProps = {
  session: Session | null;
  profile: UserProfile | null;
  profileLoading: boolean;
  profileError: boolean;
  displayName: string;
  initials: string;
  closeMenus: () => void;
  handleLogout: () => Promise<void>;
};

function AccountMenu({
  session,
  profile,
  profileLoading,
  profileError,
  displayName,
  initials,
  closeMenus,
  handleLogout,
}: AccountMenuProps) {
  return (
    <div
      role="menu"
      className="absolute right-0 top-[calc(100%+0.75rem)] z-[60] w-[min(330px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
    >
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
              {session?.user.email}
            </p>
          </div>
        </div>

        {profile?.role && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-blue-800">
              {profile.role}
            </span>

            {profile.admin_status === "yes" && (
              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-800">
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
            Your portal profile could not be loaded.
            Please refresh the page.
          </p>
        )}
      </div>

      <div className="p-2">
        <Link
          href="/dashboard"
          role="menuitem"
          onClick={closeMenus}
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

        {profile?.admin_status === "yes" && (
          <Link
            href="/dashboard"
            role="menuitem"
            onClick={closeMenus}
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
  );
}

/* =========================================================
   NAVBAR
   ========================================================= */

export default function Navbar() {
  const pathname = usePathname();

  const [session, setSession] = useState<Session | null>(null);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [profileError, setProfileError] =
    useState(false);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [signInOpen, setSignInOpen] =
    useState(false);

  const [mobileNavOpen, setMobileNavOpen] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const accountRef =
    useRef<HTMLDivElement | null>(null);

  /* =========================================================
     AUTH INITIALISATION
     ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      console.log(
        "NAV: Initial session:",
        currentSession?.user?.email ?? "none"
      );

      setSession(currentSession);

      if (!currentSession) {
        setProfile(null);
        setProfileError(false);
        setProfileLoading(false);
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mounted) return;

        console.log(
          "NAV: Auth state changed:",
          nextSession?.user?.email ?? "none"
        );

        setSession(nextSession);

        if (!nextSession) {
          setProfile(null);
          setProfileError(false);
          setProfileLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =========================================================
     LOAD PROFILE WHEN SESSION CHANGES
     ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      if (!session?.user?.email) {
        setProfile(null);
        setProfileError(false);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      setProfileError(false);

      const userEmail = session.user.email;

      console.log(
        "NAV: Fetching profile for session:",
        userEmail
      );

      const { data, error } =
        await supabase.rpc("get_my_portal_profile");

      if (cancelled) return;

      console.log("NAV: Profile result:", {
        data,
        error,
      });

      if (error) {
        console.error(
          "NAV: Profile RPC failed:",
          error
        );

        setProfile(null);
        setProfileError(true);
        setProfileLoading(false);

        return;
      }

      const profileData: RpcProfile | null =
        Array.isArray(data)
          ? ((data[0] as RpcProfile | undefined) ?? null)
          : (data as RpcProfile | null);

      if (!profileData) {
        console.warn(
          "NAV: No portal profile found for:",
          userEmail
        );

        setProfile(null);
        setProfileError(true);
        setProfileLoading(false);

        await supabase.auth.signOut();

        if (!cancelled) {
          setSession(null);
          setProfile(null);
        }

        return;
      }

      const normalizedProfile: UserProfile = {
        id: Number(profileData.id),
        name: profileData.name ?? null,
        email: profileData.email ?? userEmail,
        role: profileData.role ?? null,
        admin_status:
          profileData.admin_status === "yes"
            ? "yes"
            : "no",
      };

      console.log(
        "NAV: Profile successfully loaded:",
        normalizedProfile
      );

      setProfile(normalizedProfile);
      setProfileError(false);
      setProfileLoading(false);
    }

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [session]);

  /* =========================================================
     CLOSE MENUS ON OUTSIDE CLICK
     ========================================================= */

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
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

  /* =========================================================
     CLOSE MENUS ON ESCAPE
     ========================================================= */

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountOpen(false);
        setSignInOpen(false);
        setMobileNavOpen(false);
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

  /* =========================================================
     CLOSE MOBILE NAV WHEN ROUTE CHANGES
     ========================================================= */

  useEffect(() => {
    setMobileNavOpen(false);
    setAccountOpen(false);
    setSignInOpen(false);
  }, [pathname]);

  /* =========================================================
     RESOLVE CANONICAL EMAIL
     ========================================================= */

  async function resolveCanonicalEmail(
    inputEmail: string
  ): Promise<string | null> {
    const normalizedEmail =
      inputEmail.trim().toLowerCase();

    const { data, error } =
      await supabase.rpc(
        "resolve_portal_email",
        {
          input_email: normalizedEmail,
        }
      );

    if (error) {
      console.error(
        "NAV: Email resolution failed:",
        error
      );

      return null;
    }

    if (
      typeof data !== "string" ||
      !data.trim()
    ) {
      return null;
    }

    return data.trim().toLowerCase();
  }

  /* =========================================================
     SIGN IN
     ========================================================= */

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const formattedEmail =
      email.trim().toLowerCase();

    const formattedPassword =
      password;

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

    if (!formattedPassword) {
      setMessage("Enter your password.");
      setLoading(false);
      return;
    }

    const canonicalEmail =
      await resolveCanonicalEmail(
        formattedEmail
      );

    if (!canonicalEmail) {
      setMessage(
        "Sign in failed. Check your school email and password."
      );

      setLoading(false);
      return;
    }

    console.log(
      "NAV: Signing in with canonical email:",
      canonicalEmail
    );

    const { error } =
      await supabase.auth.signInWithPassword(
        {
          email: canonicalEmail,
          password: formattedPassword,
        }
      );

    if (error) {
      console.error(
        "Password sign-in failed:",
        error
      );

      setMessage(
        "Sign in failed. Check your school email and password."
      );

      setLoading(false);
      return;
    }

    setEmail("");
    setPassword("");
    setMessage("");
    setSignInOpen(false);

    setLoading(false);
  }

  /* =========================================================
     SIGN OUT
     ========================================================= */

  async function handleLogout() {
    await supabase.auth.signOut();

    setSession(null);
    setProfile(null);
    setProfileError(false);
    setProfileLoading(false);

    setEmail("");
    setPassword("");
    setMessage("");

    setAccountOpen(false);
  }

  /* =========================================================
     DISPLAY HELPERS
     ========================================================= */

  const displayName =
    profileLoading
      ? "Loading..."
      : profile?.name?.trim() ||
        "Verified Student";

  const initials =
    profile?.name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("") || "VG";

  const displayRole =
    profileLoading
      ? "Loading..."
      : profile?.role?.trim() ||
        "Verified Account";

  function isActive(href: string) {
    return href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);
  }

  function closeMenus() {
    setAccountOpen(false);
    setSignInOpen(false);
    setMobileNavOpen(false);
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        {/* BRAND */}

        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          onClick={closeMenus}
        >
          <img
            src="/vidyagyan-logo.png"
            alt="VidyaGyan"
            className="h-9 w-auto object-contain sm:h-10"
          />

          <div className="hidden border-l border-slate-200 pl-3 sm:block">
            <p className="text-sm font-bold leading-tight text-slate-900">
              VidyaGyan
            </p>

            <p className="text-[11px] font-medium leading-tight text-slate-500">
              Student Council Portal
            </p>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}

        <nav className="ml-auto hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenus}
              className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
                isActive(item.href)
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* ACCOUNT AREA */}

        <div
          ref={accountRef}
          className="relative ml-2 border-l border-slate-200 pl-2 sm:ml-3 sm:pl-3"
        >
          {!session ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setSignInOpen(
                    (current) => !current
                  );

                  setAccountOpen(false);
                  setMobileNavOpen(false);
                  setMessage("");
                }}
                className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:px-4"
              >
                Sign In
              </button>

              {signInOpen && (
                <SignInPanel
                  email={email}
                  password={password}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  loading={loading}
                  message={message}
                  handleLogin={handleLogin}
                  closeMenus={closeMenus}
                />
              )}
            </>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAccountOpen(
                    (current) => !current
                  );

                  setSignInOpen(false);
                  setMobileNavOpen(false);
                }}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-1.5 py-1.5 transition hover:border-slate-300 hover:bg-slate-50 sm:px-2"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-950 text-[11px] font-bold text-white">
                  {initials}
                </span>

                <span className="hidden max-w-[135px] text-left sm:block">
                  <span className="block truncate text-xs font-semibold text-slate-800">
                    {displayName}
                  </span>

                  <span className="block truncate text-[9px] text-slate-400">
                    {displayRole}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className={`hidden text-xs text-slate-400 transition-transform sm:inline ${
                    accountOpen
                      ? "rotate-180"
                      : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              {accountOpen && (
                <AccountMenu
                  session={session}
                  profile={profile}
                  profileLoading={profileLoading}
                  profileError={profileError}
                  displayName={displayName}
                  initials={initials}
                  closeMenus={closeMenus}
                  handleLogout={handleLogout}
                />
              )}
            </div>
          )}

          {/* MOBILE NAV TOGGLE */}

          <button
            type="button"
            aria-label={
              mobileNavOpen
                ? "Close navigation"
                : "Open navigation"
            }
            aria-expanded={mobileNavOpen}
            onClick={() => {
              setMobileNavOpen(
                (current) => !current
              );

              setAccountOpen(false);
              setSignInOpen(false);
            }}
            className="ml-1.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
          >
            <span className="sr-only">
              {mobileNavOpen
                ? "Close navigation"
                : "Open navigation"}
            </span>

            {mobileNavOpen ? (
              <span className="text-lg leading-none">
                ×
              </span>
            ) : (
              <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-4 rounded-full bg-current" />
                <span className="block h-0.5 w-4 rounded-full bg-current" />
                <span className="block h-0.5 w-4 rounded-full bg-current" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION */}

      {mobileNavOpen && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <div className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenus}
                  className={`flex min-h-11 items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                    isActive(item.href)
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{item.name}</span>

                  <span
                    aria-hidden="true"
                    className={`text-sm ${
                      isActive(item.href)
                        ? "text-white/70"
                        : "text-slate-300"
                    }`}
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
