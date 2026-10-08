"use client";

export default function ToolsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-lg px-6 py-16 text-slate-950">
      <h1 className="text-2xl font-semibold">This tool could not load.</h1>
      <p className="mt-2 text-sm text-slate-600">{error.message || "Try the tool again."}</p>
      <button onClick={reset} className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Try again</button>
    </main>
  );
}
