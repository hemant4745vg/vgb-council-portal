import React, { useMemo, useState } from 'react';
import { Preset, Point } from '../types';
import { sampleCurve, findCurveIntersection } from '../lib/mathEngine';

interface GraphEngineProps {
  preset: Preset;
  params: Record<string, number>;
}

export const GraphEngine: React.FC<GraphEngineProps> = ({ preset, params }) => {
  const [hoverPos, setHoverPos] = useState<Point | null>(null);

  const svgWidth = 680;
  const svgHeight = preset.dualPanel ? 520 : 420;
  const margin = { top: 35, right: 35, bottom: 55, left: 65 };

  const topPanelHeight = preset.dualPanel ? 195 : svgHeight - margin.top - margin.bottom;
  const bottomPanelHeight = preset.dualPanel ? 195 : 0;
  const panelGap = preset.dualPanel ? 40 : 0;
  const innerWidth = svgWidth - margin.left - margin.right;

  // Scale Functions
  const xScale = (x: number) => {
    const [xMin, xMax] = preset.xDomain;
    return margin.left + ((x - xMin) / (xMax - xMin)) * innerWidth;
  };

  const xUnscale = (px: number) => {
    const [xMin, xMax] = preset.xDomain;
    return xMin + ((px - margin.left) / innerWidth) * (xMax - xMin);
  };

  const yScaleTop = (y: number) => {
    const [yMin, yMax] = preset.yDomain;
    return margin.top + topPanelHeight - ((y - yMin) / (yMax - yMin)) * topPanelHeight;
  };

  const yScaleBottom = (y: number) => {
    if (!preset.dualPanel) return 0;
    const topOffset = margin.top + topPanelHeight + panelGap;
    const [yMin, yMax] = preset.yDomain;
    return topOffset + bottomPanelHeight - ((y - yMin) / (yMax - yMin)) * bottomPanelHeight;
  };

  // Dynamic Equilibrium Extraction
  const equilibrium = useMemo(() => {
    if (preset.curves.length >= 2 && !preset.dualPanel) {
      const c1 = preset.curves[preset.curves.length - 2];
      const c2 = preset.curves[preset.curves.length - 1];
      return findCurveIntersection(c1, c2, params, preset.xDomain[0], preset.xDomain[1]);
    }
    return null;
  }, [preset, params]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    if (mouseX >= margin.left && mouseX <= margin.left + innerWidth) {
      const realX = xUnscale(mouseX);
      setHoverPos({ x: realX, y: 0 });
    } else {
      setHoverPos(null);
    }
  };

  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-inner border border-slate-200 flex flex-col items-center">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto max-w-full overflow-visible select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverPos(null)}
      >
        {/* SHADED REGIONS */}
        {preset.shadedRegions?.map((region) => {
          const pts = region.getPoints(params, preset.xDomain, preset.yDomain);
          if (pts.length < 3) return null;
          const polyStr = pts.map(p => `${xScale(p.x)},${yScaleTop(p.y)}`).join(' ');
          return <polygon key={region.id} points={polyStr} fill={region.color} />;
        })}

        {/* TOP PANEL GRID & AXES */}
        <g className="grid-top">
          {[0, 0.25, 0.5, 0.75, 1].map((r) => {
            const xVal = preset.xDomain[0] + r * (preset.xDomain[1] - preset.xDomain[0]);
            const yVal = preset.yDomain[0] + r * (preset.yDomain[1] - preset.yDomain[0]);
            return (
              <React.Fragment key={r}>
                <line x1={xScale(xVal)} y1={margin.top} x2={xScale(xVal)} y2={margin.top + topPanelHeight} stroke="#f1f5f9" strokeWidth="1" />
                <line x1={margin.left} y1={yScaleTop(yVal)} x2={margin.left + innerWidth} y2={yScaleTop(yVal)} stroke="#f1f5f9" strokeWidth="1" />
              </React.Fragment>
            );
          })}
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + topPanelHeight} stroke="#334155" strokeWidth="2" />
          <line x1={margin.left} y1={margin.top + topPanelHeight} x2={margin.left + innerWidth} y2={margin.top + topPanelHeight} stroke="#334155" strokeWidth="2" />
        </g>

        {/* BOTTOM PANEL GRID & AXES (DUAL PANEL) */}
        {preset.dualPanel && (
          <g className="grid-bottom">
            {[0, 0.5, 1].map((r) => {
              const yVal = preset.yDomain[0] + r * (preset.yDomain[1] - preset.yDomain[0]);
              return (
                <line key={r} x1={margin.left} y1={yScaleBottom(yVal)} x2={margin.left + innerWidth} y2={yScaleBottom(yVal)} stroke="#f1f5f9" strokeWidth="1" />
              );
            })}
            <line x1={margin.left} y1={margin.top + topPanelHeight + panelGap} x2={margin.left} y2={margin.top + topPanelHeight + panelGap + bottomPanelHeight} stroke="#334155" strokeWidth="2" />
            <line x1={margin.left} y1={margin.top + topPanelHeight + panelGap + bottomPanelHeight} x2={margin.left + innerWidth} y2={margin.top + topPanelHeight + panelGap + bottomPanelHeight} stroke="#334155" strokeWidth="2" />
            <text x={margin.left - 48} y={margin.top + topPanelHeight + panelGap + bottomPanelHeight / 2} transform={`rotate(-90, ${margin.left - 48}, ${margin.top + topPanelHeight + panelGap + bottomPanelHeight / 2})`} textAnchor="middle" className="text-xs font-semibold fill-slate-700">
              {preset.bottomYLabel}
            </text>
          </g>
        )}

        {/* AXIS LABELS */}
        <text x={margin.left + innerWidth / 2} y={svgHeight - 12} textAnchor="middle" className="text-xs font-semibold fill-slate-700">
          {preset.xAxisLabel}
        </text>
        <text x={margin.left - 48} y={margin.top + topPanelHeight / 2} transform={`rotate(-90, ${margin.left - 48}, ${margin.top + topPanelHeight / 2})`} textAnchor="middle" className="text-xs font-semibold fill-slate-700">
          {preset.dualPanel ? preset.topYLabel : preset.yAxisLabel}
        </text>

        {/* CURVE RENDERER */}
        {preset.curves.map((curve) => {
          const isBottom = preset.dualPanel && (curve.id === 'muCurve' || curve.id === 'apCurve' || curve.id === 'mpCurve');
          const yMapper = isBottom ? yScaleBottom : yScaleTop;

          const points = sampleCurve(curve, params, preset.xDomain[0], preset.xDomain[1], preset.yDomain[0], preset.yDomain[1]);
          
          let pathStr = '';
          points.forEach((pt, idx) => {
            if (Number.isNaN(pt.x) || Number.isNaN(pt.y)) return;
            const sx = xScale(pt.x);
            const sy = yMapper(pt.y);
            pathStr += (idx === 0 || pathStr === '' ? `M ${sx} ${sy} ` : `L ${sx} ${sy} `);
          });

          return (
            <path key={curve.id} d={pathStr} fill="none" stroke={curve.color} strokeWidth="2.5" strokeDasharray={curve.dash || 'none'} />
          );
        })}

        {/* SYNC LINE FOR DUAL PANEL GRAPHS */}
        {preset.dualPanel && preset.syncXValue && (
          <g className="sync-line">
            {(() => {
              const sxVal = preset.syncXValue(params);
              if (sxVal === null) return null;
              const sx = xScale(sxVal);
              return (
                <>
                  <line x1={sx} y1={margin.top} x2={sx} y2={margin.top + topPanelHeight + panelGap + bottomPanelHeight} stroke="#dc2626" strokeDasharray="4,4" strokeWidth="1.5" />
                  <text x={sx + 6} y={margin.top + 18} className="text-[11px] font-bold fill-red-600">
                    {preset.syncXLabel}
                  </text>
                </>
              );
            })()}
          </g>
        )}

        {/* EQUILIBRIUM INDICATOR */}
        {equilibrium && (
          <g className="equilibrium-indicator">
            <line x1={xScale(equilibrium.x)} y1={margin.top + topPanelHeight} x2={xScale(equilibrium.x)} y2={yScaleTop(equilibrium.y)} stroke="#64748b" strokeDasharray="3,3" />
            <line x1={margin.left} y1={yScaleTop(equilibrium.y)} x2={xScale(equilibrium.x)} y2={yScaleTop(equilibrium.y)} stroke="#64748b" strokeDasharray="3,3" />
            <circle cx={xScale(equilibrium.x)} cy={yScaleTop(equilibrium.y)} r="5" fill="#dc2626" />
            <text x={xScale(equilibrium.x) + 8} y={yScaleTop(equilibrium.y) - 8} className="text-xs font-bold fill-red-600">
              E ({equilibrium.x.toFixed(1)}, ₹{equilibrium.y.toFixed(1)})
            </text>
          </g>
        )}

        {/* INTERACTIVE CROSSHAIR */}
        {hoverPos && (
          <g className="crosshair">
            <line x1={xScale(hoverPos.x)} y1={margin.top} x2={xScale(hoverPos.x)} y2={margin.top + topPanelHeight} stroke="#94a3b8" strokeDasharray="2,2" />
            <rect x={xScale(hoverPos.x) - 25} y={margin.top - 20} width="50" height="18" rx="4" fill="#334155" />
            <text x={xScale(hoverPos.x)} y={margin.top - 7} textAnchor="middle" className="text-[10px] font-bold fill-white">
              Q={hoverPos.x.toFixed(1)}
            </text>
          </g>
        )}
      </svg>

      {/* LEGEND */}
      <div className="flex flex-wrap gap-4 mt-3 justify-center">
        {preset.curves.map((c) => (
          <div key={c.id} className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <span className="w-4 h-1 rounded" style={{ backgroundColor: c.color }}></span>
            <span>{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
