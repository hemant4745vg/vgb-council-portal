"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PasswordFlow = "invite" | "recovery";

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState("");
  const [flow, setFlow] = useState<PasswordFlow | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeout: number | null = null;

    /*
     * Determine whether this page was reached through an
     * invitation or password-recovery callback.
     *
     * Supabase may place the auth information in either:
     * - the query string
     * - the URL hash
     *
     * Invitation and recovery are deliberately handled as
     * separate flows, even though both eventually call
     * supabase.auth.updateUser({ password }).
     */
    function detectFlow(): PasswordFlow | null {
      const url = new URL(window.location.href);

      const query = url.searchParams;

      const hashString = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;

      const hash = new URLSearchParams(hashString);

      const type =
        query.get("type") ||
        hash.get("type") ||
        "";

      if (type === "invite") {
        return "invite";
      }

      if (type === "recovery") {
        return "recovery";
      }

      /*
       * A PKCE recovery callback contains a `code`.
       * Invitation links do not use PKCE.
       */
      if (query.has("code")) {
        return "recovery";
      }

      /*
       * Older/implicit auth callbacks can contain access and
       * refresh tokens in the hash.
       */
      if (
        hash.has("access_token") &&
        hash.has("refresh_token")
      ) {
        return "recovery";
      }

      return null;
    }

    async function initializePasswordFlow() {
      const detectedFlow = detectFlow();

      if (mounted && detectedFlow) {
        setFlow(detectedFlow);
      }

      /*
       * Listen before doing any session checks so we do not miss
       * the authentication event while Supabase processes the
       * callback URL.
       */
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) return;

          /*
           * PASSWORD_RECOVERY is emitted for password-reset links.
           */
          if (
            event === "PASSWORD_RECOVERY" &&
            session
          ) {
            setFlow("recovery");
            setReady(true);
            setLoading(false);

            return;
          }

          /*
           * Invitations establish an authenticated session after
           * the invitation link is accepted. Depending on the
           * Supabase auth flow/version, this can arrive as SIGNED_IN.
           */
          if (
            event === "SIGNED_IN" &&
            session
          ) {
            setFlow((currentFlow) => currentFlow ?? detectedFlow ?? "invite");
            setReady(true);
            setLoading(false);

            return;
          }

          /*
           * INITIAL_SESSION can contain the session created by
           * Supabase while processing the callback URL.
           *
           * We only accept it as the password-setting session when
           * this page was actually reached through an auth callback.
           */
          if (
            event === "INITIAL_SESSION" &&
            session &&
            detectedFlow
          ) {
            setFlow(detectedFlow);
            setReady(true);
            setLoading(false);
          }
        }
      );

      try {
        /*
         * Password recovery may use PKCE and therefore arrive with
         * a `code` that needs to be exchanged for a session.
         *
         * Invitations do NOT use PKCE, so we deliberately do not
         * attempt this exchange for invitation links.
         */
        const params = new URLSearchParams(
          window.location.search
        );

        const code = params.get("code");

        if (code && detectedFlow === "recovery") {
          const {
            error: exchangeError,
          } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error(
              "Password recovery code exchange failed:",
              exchangeError
            );

            if (mounted) {
              setMessage(
                "This password reset link is invalid or has expired. Please request a new one."
              );
              setLoading(false);
            }

            subscription.unsubscribe();
            return;
          }

          /*
           * The PKCE code is one-time use. Remove it from the
           * address bar after successful exchange.
           */
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }

        /*
         * Give Supabase a moment to finish processing an invitation
         * or implicit recovery callback.
         */
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session && detectedFlow) {
          setReady(true);
          setLoading(false);
          return;
        }

        /*
         * If an auth event is still being processed, wait briefly
         * before declaring the link invalid.
         */
        timeout = window.setTimeout(async () => {
          if (!mounted) return;

          const {
            data: { session: currentSession },
          } = await supabase.auth.getSession();

          if (!mounted) return;

          if (currentSession && detectedFlow) {
            setReady(true);
            setLoading(false);
            return;
          }

          if (detectedFlow === "invite") {
            setMessage(
              "This invitation link is invalid or has expired. Please ask a portal administrator to send a new invitation."
            );
          } else if (detectedFlow === "recovery") {
            setMessage(
              "This password reset link is invalid or has expired. Please request a new one."
            );
          } else {
            setMessage(
              "This password setup link is no longer valid. Please use a fresh invitation or password reset link."
            );
          }

          setLoading(false);
        }, 2500);
      } catch (error) {
        console.error(
          "Password setup initialization failed:",
          error
        );

        if (!mounted) return;

        setMessage(
          detectedFlow === "invite"
            ? "Unable to verify this invitation. Please ask a portal administrator to send a new invitation."
            : "Unable to verify this password reset link. Please request a new one."
        );

        setLoading(false);
      }

      return () => {
        subscription.unsubscribe();

        if (timeout !== null) {
          window.clearTimeout(timeout);
        }
      };
    }

    initializePasswordFlow();

    return () => {
      mounted = false;

      if (timeout !== null) {
        window.clearTimeout(timeout);
      }
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

    try {
      /*
       * The user must have an authenticated invitation/recovery
       * session at this point.
       *
       * Because "Require current password when changing password"
       * has been disabled, a newly invited user can create their
       * first password here.
       */
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error(
          "Password update failed:",
          error
        );

        setMessage(
          error.message ||
            "Unable to update your password. Please try again."
        );

        setUpdating(false);
        return;
      }

      setSuccess(true);

      setMessage(
        flow === "invite"
          ? "Your account password has been created successfully."
          : "Your password has been updated successfully."
      );

      setPassword("");
      setConfirmPassword("");
      setUpdating(false);

      /*
       * End the temporary authenticated session.
       * The user can now sign in normally using their new password.
       */
      await supabase.auth.signOut();
    } catch (error) {
      console.error(
        "Unexpected password update error:",
        error
      );

      setMessage(
        "Something went wrong while updating your password. Please try again."
      );

      setUpdating(false);
    }
  }

  const isInvitation = flow === "invite";

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-950 text-sm font-bold text-white">
            VG
          </div>

          <h1 className="mt-5 text-xl font-bold text-blue-950">
            {isInvitation
              ? "Verifying invitation"
              : "Verifying password link"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isInvitation
              ? "Please wait while your secure invitation session is established."
              : "Please wait while your secure password recovery session is established."}
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
              {isInvitation
                ? "Account Setup"
                : "Account Recovery"}
            </p>

            <h1 className="mt-1 text-2xl font-bold text-blue-950">
              {isInvitation
                ? "Create your password"
                : "Set a new password"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isInvitation
                ? "Your invitation has been verified. Create a password to activate your Student Council Portal account."
                : "Choose a new password for your Student Council Portal account."}
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
                    ? isInvitation
                      ? "Creating Password..."
                      : "Updating..."
                    : isInvitation
                      ? "Create Password"
                      : "Update Password"}
                </button>
              </form>
            ) : (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-xs leading-5 text-red-700">
                {message ||
                  "This password setup session is no longer valid."}
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
