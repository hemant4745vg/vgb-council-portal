"use client";

import { useMemo, useState } from "react";
import { presets } from "./data";
import { EconomicsGraph, StatisticsLab } from "./components";

function Stage() {
  return (
    <div className="econ-stage" aria-hidden="true">
      <div className="econ-glow" />
      <div className="econ-model">
        <svg viewBox="0 0 360 250" className="h-full w-full">
          <defs>
            <linearGradient id="econ-plate" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#1e3a8a" stopOpacity="0.2" />
              <stop offset="1" stopColor="#0f172a" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="econ-demand" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#7dd3fc" />
              <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="econ-supply" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#fb7185" />
              <stop offset="1" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <ellipse cx="180" cy="198" rx="92" ry="16" fill="rgba(15,23,42,0.28)" />
          <g className="econ-plate">
            <path d="M48 168 L176 104 L312 150 L184 214 Z" fill="url(#econ-plate)" stroke="rgba(255,255,255,.35)" />
            <path d="M70 164 L176 116 L292 154" fill="none" stroke="rgba(255,255,255,.18)" />
            <path d="M92 176 L176 128 L270 160" fill="none" stroke="rgba(255,255,255,.12)" />
            <path d="M118 132 L150 188" fill="none" stroke="rgba(255,255,255,.16)" />
            <path d="M176 116 L184 214" fill="none" stroke="rgba(255,255,255,.16)" />
            <path d="M236 128 L214 186" fill="none" stroke="rgba(255,255,255,.16)" />
          </g>
          <path className="econ-curve econ-demand" d="M78 86 C132 98 168 146 292 168" fill="none" stroke="url(#econ-demand)" strokeWidth="4" strokeLinecap="round" />
          <path className="econ-curve econ-supply" d="M74 176 C138 160 188 112 300 92" fill="none" stroke="url(#econ-supply)" strokeWidth="4" strokeLinecap="round" />
          <circle className="econ-eq" cx="186" cy="132" r="6" fill="#fbbf24" />
          <circle className="econ-eq-ring" cx="186" cy="132" r="12" fill="none" stroke="#fde68a" strokeWidth="1.5" />
        </svg>
        <span className="econ-chip econ-chip-d">Demand</span>
        <span className="econ-chip econ-chip-s">Supply</span>
        <span className="econ-chip econ-chip-e">Equilibrium</span>
      </div>
    </div>
  );
}

export default function EconomicsGraphLabPage() {
  const [section, setSection] = useState<"XI" | "XII" | "Statistics">("XI");
  const [selected, setSelected] = useState("demand-supply");
  const preset = presets.find((item) => item.id === selected) ?? presets[0];
  const [controlValues, setControlValues] = useState<Record<string, number>>(
    Object.fromEntries(preset.controls.map((control) => [control.key, control.value]))
  );

  const choose = (id: string) => {
    const next = presets.find((item) => item.id === id);
    if (!next) return;
    setSelected(id);
    setControlValues(Object.fromEntries(next.controls.map((control) => [control.key, control.value])));
  };

  const list = presets.filter((item) => item.className === section);
  const units = useMemo(() => {
    const groups: { unit: string; items: typeof list }[] = [];
    list.forEach((item) => {
      const group = groups.find((entry) => entry.unit === item.unit);
      if (group) group.items.push(item);
      else groups.push({ unit: item.unit, items: [item] });
    });
    return groups;
  }, [list]);

  const switchSection = (next: "XI" | "XII" | "Statistics") => {
    setSection(next);
    if (next === "Statistics") return;
    const first = presets.find((item) => item.className === next);
    if (first) choose(first.id);
  };

  return (
    <main className="min-h-screen bg-[#eef3f8] text-slate-950">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_20%_20%,#1d4ed8,#020617_55%)] text-white shadow-[0_30px_80px_-40px_rgba(7,20,38,.7)]">
          <Stage />
          <div className="relative z-10 flex flex-col justify-between gap-8 p-6 sm:p-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[.22em] text-amber-200">VGB Tools · Economics</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">Economics Graphs Lab</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                Class XI and XII diagrams, drawn on the scales an exam expects. Change one assumption and watch the equilibrium move.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["XI", "XII", "Statistics"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => switchSection(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-300 ${section === item ? "bg-white text-slate-950" : "border border-white/15 bg-white/5 text-white hover:-translate-y-0.5"}`}
                >
                  {item === "Statistics" ? "Statistics" : `Class ${item}`}
                </button>
              ))}
            </div>
          </div>
        </header>

        {section === "Statistics" ? (
          <div className="econ-rise mt-5">
            <StatisticsLab />
          </div>
        ) : (
          <div className="mt-5 grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
            <nav className="h-fit rounded-[1.6rem] border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur lg:sticky lg:top-4">
              <div className="flex items-center justify-between px-2 py-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Class {section}</p>
                <p className="text-xs font-semibold text-slate-400">{list.length} graphs</p>
              </div>
              <div className="mt-1 max-h-[70vh] space-y-4 overflow-auto pr-1">
                {units.map((group) => (
                  <div key={group.unit}>
                    <p className="px-2 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">{group.unit}</p>
                    <div className="mt-1 space-y-1">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => choose(item.id)}
                          className={`w-full rounded-2xl px-3 py-3 text-left text-sm transition duration-300 ${selected === item.id ? "bg-slate-950 text-white shadow-lg" : "text-slate-700 hover:bg-slate-50"}`}
                        >
                          <span className="block font-semibold">{item.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </nav>

            <section className="min-w-0">
              <div key={preset.id} className="econ-rise mb-4 rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700">{preset.unit}</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">{preset.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{preset.description}</p>
                  </div>
                  <p className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">Class {preset.className}</p>
                </div>
              </div>
              <div key={`${preset.id}-graph`} className="econ-rise">
                <EconomicsGraph preset={preset} controls={controlValues} setControls={setControlValues} />
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
