"use client";

import { useMemo, useState } from "react";
import { presets } from "./data";
import { EconomicsGraph, StatisticsLab } from "./components";

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
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">VGB Tools · Economics</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Economics Graph Lab</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Class XI and XII diagrams on separate scales, with the statistics workspace beside them. Move one assumption at a time and read the equilibrium from the graph.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["XI", "XII", "Statistics"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => switchSection(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${section === item ? "bg-slate-950 text-white" : "border border-slate-200 bg-slate-50 text-slate-700"}`}
                >
                  {item === "Statistics" ? "Statistics" : `Class ${item}`}
                </button>
              ))}
            </div>
          </div>
        </header>

        {section === "Statistics" ? (
          <StatisticsLab />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
            <nav className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-4">
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
                          className={`w-full rounded-2xl px-3 py-3 text-left text-sm ${selected === item.id ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"}`}
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
              <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{preset.unit}</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">{preset.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{preset.description}</p>
                  </div>
                  <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Class {preset.className}</p>
                </div>
              </div>
              <EconomicsGraph preset={preset} controls={controlValues} setControls={setControlValues} />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
