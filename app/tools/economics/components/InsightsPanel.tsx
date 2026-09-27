import React from 'react';
import { Preset } from '../types';

interface InsightsPanelProps {
  preset: Preset;
  params: Record<string, number>;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ preset, params }) => {
  return (
    <div className="bg-blue-50/60 border border-blue-200/80 p-5 rounded-xl flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 10-2 0v1a1 1 0 102 0zM12 14a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
          CBSE Board Exam Insights
        </h3>
        <ul className="space-y-2">
          {preset.takeaways(params).map((point, i) => (
            <li key={i} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
              <span className="font-bold text-blue-600 select-none">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 pt-3 border-t border-blue-200/60 flex justify-between items-center text-[11px] text-blue-800/80">
        <span className="font-medium">Module: {preset.category}</span>
        <span className="font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">CBSE Aligned</span>
      </div>
    </div>
  );
};
