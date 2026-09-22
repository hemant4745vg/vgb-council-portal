"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lllmgmfofwczpqbmigey.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbG1nbWZvZndjenBxYm1pZ2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTIxNzYsImV4cCI6MjEwNTEyODE3Nn0.H_YfM8J3ZOy-B1lH7jgc4JtHu4rhUsigZ72qoI-b1ss"
);

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function initializeRecovery() {
      /*
       * Supabase sends a PASSWORD_RECOVERY event when the
       * recovery link establishes the temporary recovery session.
       */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        setReady(true);
        setLoading(false);
        return;
      }

      /*
       * Listen for the recovery event in case the session is
       * established immediately after the page loads.
       */
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        (event, recoverySession) => {
          if (!mounted) return;

          if (
            event === "PASSWORD_RECOVERY" &&
            recoverySession
          ) {
            setReady(true);
            setLoading(false);
          }
        }
      );

      /*
       * Give Supabase a short opportunity to establish the
       * recovery session from the reset link.
       */
      window.setTimeout(async () => {
        if (!mounted) return;

        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (currentSession) {
          setReady(true);
        } else {
          setMessage(
            "This password reset link is invalid or has expired. Please request a new one."
          );
        }

        setLoading(false);
      }, 1000);

      return () => {
        subscription.unsubscribe();
      };
    }

    initializeRecovery();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (password.length < 8) {
      setMessage(
        "Your password must be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setUpdating(true);

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) {
      console.error(
        "Password update failed:",
        error
      );

      setMessage(
        error.message ||
          "Unable to update your password. Please request a new reset link."
      );

      setUpdating(false);
      return;
    }

    setSuccess(true);
    setMessage(
      "Your password has been updated successfully."
    );

    setPassword("");
    setConfirmPassword("");

    setUpdating(false);

    /*
     * End the temporary recovery session.
     * The user can now sign in normally with the new password.
     */
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-950 text-sm font-bold text-white">
            VG
          </div>

          <h1 className="mt-5 text-xl font-bold text-blue-950">
            Verifying reset link
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Please wait while your secure password recovery
            session is established.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <span aria-hidden="true">←</span>
          Back to portal
        </Link>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-6 sm:px-8">
            <div className="flex items-center gap-3">
              <img
                src="/vidyagyan-logo.png"
                alt="VidyaGyan"
                className="h-10 w-auto object-contain"
              />

              <div className="border-l border-slate-200 pl-3">
                <p className="text-sm font-bold text-slate-900">
                  VidyaGyan
                </p>

                <p className="text-[10px] font-medium text-slate-500">
                  Student Council Portal
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-7 sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Account Recovery
            </p>

            <h1 className="mt-1 text-2xl font-bold text-blue-950">
              Set a new password
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Choose a new password for your Student Council
              Portal account.
            </p>

            {ready ? (
              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-4"
              >
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-1.5 block text-xs font-semibold text-slate-600"
                  >
                    New Password
                  </label>

                  <input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-1.5 block text-xs font-semibold text-slate-600"
                  >
                    Confirm Password
                  </label>

                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter the password again"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full rounded-xl bg-blue-950 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </form>
            ) : (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-xs leading-5 text-red-700">
                {message ||
                  "This password reset session is no longer valid."}
              </div>
            )}

            {message && ready && (
              <div
                className={`mt-4 rounded-xl border p-3 text-center text-xs leading-5 ${
                  success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {success && (
              <div className="mt-5 text-center">
                <Link
                  href="/"
                  className="inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  Return to Sign In
                </Link>
              </div>
            )}

            {!success && !ready && (
              <div className="mt-5 text-center">
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-blue-700 transition hover:text-blue-900 hover:underline"
                >
                  Request a new reset link
                </Link>
              </div>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-[10px] leading-4 text-slate-400">
          Access is restricted to registered Student Council
          Portal accounts.
        </p>
      </div>
    </main>
  );
}
