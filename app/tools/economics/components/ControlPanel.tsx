import React from 'react';
import { Preset } from '../types';

interface ControlPanelProps {
  presets: Preset[];
  activePreset: Preset;
  sliderParams: Record<string, number>;
  onSelectPreset: (id: string) => void;
  onSliderChange: (id: string, value: number) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  presets,
  activePreset,
  sliderParams,
  onSelectPreset,
  onSliderChange
}) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="preset-select" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Curriculum Topic:
        </label>
        <select
          id="preset-select"
          value={activePreset.id}
          onChange={(e) => onSelectPreset(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Determinants & Controls</h3>
        {activePreset.controls.map((ctrl) => {
          const val = sliderParams[ctrl.id] ?? ctrl.defaultValue;
          return (
            <div key={ctrl.id} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor={`slider-${ctrl.id}`} className="font-semibold text-slate-700">{ctrl.label}</label>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">
                  {ctrl.discreteValues
                    ? ctrl.discreteValues.find((v) => v.value === val)?.label || val
                    : `${val}${ctrl.unit || ''}`}
                </span>
              </div>

              {ctrl.discreteValues ? (
                <div className="grid grid-cols-1 gap-1">
                  {ctrl.discreteValues.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onSliderChange(ctrl.id, opt.value)}
                      className={`text-left text-xs px-2.5 py-1.5 rounded transition-colors ${
                        val === opt.value
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  id={`slider-${ctrl.id}`}
                  type="range"
                  min={ctrl.min}
                  max={ctrl.max}
                  step={ctrl.step}
                  value={val}
                  onChange={(e) => onSliderChange(ctrl.id, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
