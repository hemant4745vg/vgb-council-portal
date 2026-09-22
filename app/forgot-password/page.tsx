"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lllmgmfofwczpqbmigey.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbG1nbWZvZndjenBxYm1pZ2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTIxNzYsImV4cCI6MjEwNTEyODE3Nn0.H_YfM8J3ZOy-B1lH7jgc4JtHu4rhUsigZ72qoI-b1ss"
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    const formattedEmail = email.trim().toLowerCase();

    if (!formattedEmail.endsWith("@vidyagyan.in")) {
      setMessage(
        "Use your official @vidyagyan.in school email."
      );
      setLoading(false);
      return;
    }

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        formattedEmail,
        {
          redirectTo:
            "https://vgb-student-council-portal.vercel.app/update-password",
        }
      );

    if (error) {
      console.error(
        "Password reset request failed:",
        error
      );

      setMessage(
        "Unable to send the password reset email. Please try again later."
      );
      setLoading(false);
      return;
    }

    /*
     * Supabase deliberately does not reveal whether a particular
     * email exists in Auth, helping prevent account enumeration.
     *
     * Therefore this message is intentionally generic.
     */
    setSuccess(true);
    setMessage(
      "If this school email has a portal account, a password reset link has been sent to its inbox."
    );

    setLoading(false);
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        {/* Back */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <span aria-hidden="true">←</span>
          Back to portal
        </Link>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          {/* Header */}
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

          {/* Content */}
          <div className="px-6 py-7 sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Account Recovery
            </p>

            <h1 className="mt-1 text-2xl font-bold text-blue-950">
              Forgot your password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your registered VidyaGyan school email.
              We&apos;ll send a secure password reset link.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="reset-email"
                  className="mb-1.5 block text-xs font-semibold text-slate-600"
                >
                  School Email
                </label>

                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="username@vidyagyan.in"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-950 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Sending..."
                  : "Send Reset Link"}
              </button>
            </form>

            {message && (
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

            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <Link
                href="/"
                className="text-xs font-semibold text-blue-700 transition hover:text-blue-900 hover:underline"
              >
                Return to Sign In
              </Link>
            </div>
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
