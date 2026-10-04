"use client";

import { useMemo, useState } from "react";
import { presets } from "./data";
import { EconomicsGraph, StatisticsLab } from "./components";

function Stage() {
  return (
    <div className="econ-stage" aria-hidden="true">
      <div className="econ-plane">
        <span />
        <span />
        <span />
        <i />
        <i />
        <b />
      </div>
      <div className="econ-float econ-float-a">D</div>
      <div className="econ-float econ-float-b">S</div>
      <div className="econ-float econ-float-c">E</div>
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
        <header className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[#071426] text-white shadow-[0_30px_80px_-40px_rgba(7,20,38,.7)]">
          <Stage />
          <div className="relative z-10 flex flex-col justify-between gap-8 p-6 sm:p-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[.22em] text-amber-200">VGB Tools · Economics</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">Graph Lab</h1>
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
