"use client";

import { useState } from "react";
import { presets } from "./data";
import { EconomicsGraph, StatisticsLab } from "./components";

export default function EconomicsGraphLabPage() {
  const [
    section,
    setSection,
  ] = useState<
    "XI" | "XII" | "Statistics"
  >("XI");

  const [
    selected,
    setSelected,
  ] = useState(
    "demand-supply"
  );

  const preset =
    presets.find(
      (p) => p.id === selected
    ) ?? presets[0];

  const [
    controlValues,
    setControlValues,
  ] = useState<
    Record<string, number>
  >(
    Object.fromEntries(
      preset.controls.map(
        (c) => [
          c.key,
          c.value,
        ]
      )
    )
  );

  const choose = (id: string) => {
    const p = presets.find(
      (x) => x.id === id
    );

    if (!p) return;

    setSelected(id);

    setControlValues(
      Object.fromEntries(
        p.controls.map(
          (c) => [
            c.key,
            c.value,
          ]
        )
      )
    );
  };

  const list = presets.filter(
    (p) =>
      p.className === section
  );

  const switchSection = (
    s: "XI" | "XII" | "Statistics"
  ) => {
    setSection(s);

    if (s !== "Statistics") {
      const p = presets.find(
        (x) =>
          x.className === s
      );

      if (p) choose(p.id);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">
            VGB Tools · Economics
          </div>

          <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Economics Graph Lab
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Interactive CBSE Class XI–XII economics graphs and a full Statistics workspace. Shift curves, change assumptions, enter your own data, inspect intersections and practise the diagrams you actually have to draw in an exam.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  "XI",
                  "XII",
                  "Statistics",
                ] as const
              ).map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    switchSection(
                      s
                    )
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                    section === s
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {s ===
                  "Statistics"
                    ? "Statistics"
                    : `Class ${s}`}
                </button>
              ))}
            </div>
          </div>
        </header>

        {section ===
        "Statistics" ? (
          <StatisticsLab />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <nav className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Class {section} · Graphs
              </div>

              <div className="mt-2 space-y-1">
                {list.map((p) => (
                  <button
                    key={p.id}
                    onClick={() =>
                      choose(
                        p.id
                      )
                    }
                    className={`w-full rounded-xl px-3 py-3 text-left text-sm ${
                      selected ===
                      p.id
                        ? "bg-slate-950 text-white"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold">
                      {p.title}
                    </div>

                    <div
                      className={`mt-1 text-xs ${
                        selected ===
                        p.id
                          ? "text-slate-300"
                          : "text-slate-400"
                      }`}
                    >
                      {p.unit}
                    </div>
                  </button>
                ))}
              </div>
            </nav>

            <section className="min-w-0">
              <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {preset.unit}
                    </div>

                    <h2 className="mt-1 text-xl font-semibold">
                      {preset.title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {
                        preset.description
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                    Interactive · Exam-oriented
                  </div>
                </div>
              </div>

              <EconomicsGraph
                preset={preset}
                controls={
                  controlValues
                }
                setControls={
                  setControlValues
                }
              />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
