'use client';

import React, { useState, useMemo } from 'react';
import { PRESETS } from './lib/presetsData';
import { GraphEngine } from './components/GraphEngine';
import { ControlPanel } from './components/ControlPanel';
import { InsightsPanel } from './components/InsightsPanel';

export default function EconomicsPage() {
  const [activePresetId, setActivePresetId] = useState<string>('market-equilibrium');

  const activePreset = useMemo(
    () => PRESETS.find((p) => p.id === activePresetId) || PRESETS[0],
    [activePresetId]
  );

  const [sliderParams, setSliderParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    activePreset.controls.forEach((c) => { initial[c.id] = c.defaultValue; });
    return initial;
  });

  const handleSelectPreset = (id: string) => {
    setActivePresetId(id);
    const target = PRESETS.find((p) => p.id === id);
    if (target) {
      const initial: Record<string, number> = {};
      target.controls.forEach((c) => { initial[c.id] = c.defaultValue; });
      setSliderParams(initial);
    }
  };

  const handleSliderChange = (id: string, value: number) => {
    setSliderParams((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 font-sans bg-slate-50 text-slate-900 rounded-xl shadow-lg border border-slate-200">
      
      {/* HEADER */}
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">CBSE Economics Graph Engine</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Interactive Microeconomics (Class 11) & Macroeconomics (Class 12) Graphic Models
        </p>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GRAPH ENGINE DISPLAY */}
        <div className="lg:col-span-7">
          <GraphEngine preset={activePreset} params={sliderParams} />
        </div>

        {/* CONTROLS & PEDAGOGY */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <ControlPanel
            presets={PRESETS}
            activePreset={activePreset}
            sliderParams={sliderParams}
            onSelectPreset={handleSelectPreset}
            onSliderChange={handleSliderChange}
          />
          <InsightsPanel preset={activePreset} params={sliderParams} />
        </div>
      </div>

    </div>
  );
}
