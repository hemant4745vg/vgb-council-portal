import { CurveSpec, Point } from '../types';

/**
 * Samples mathematical curves accurately, handling vertical lines, 
 * horizontal lines, parametric equations, and asymptotic breaks (y = 1/x).
 */
export function sampleCurve(
  curve: CurveSpec,
  params: Record<string, number>,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  steps = 800
): Point[] {
  const points: Point[] = [];
  const curveType = curve.type || 'explicit';

  // 1. Vertical Line Handler (x = c)
  if (curveType === 'vertical') {
    const val = typeof curve.constantValue === 'function' ? curve.constantValue(params) : (curve.constantValue ?? 50);
    const dy = (yMax - yMin) / steps;
    for (let i = 0; i <= steps; i++) {
      points.push({ x: val, y: yMin + i * dy });
    }
    return points;
  }

  // 2. Horizontal Line Handler (y = c)
  if (curveType === 'horizontal') {
    const val = typeof curve.constantValue === 'function' ? curve.constantValue(params) : (curve.constantValue ?? 50);
    const dx = (xMax - xMin) / steps;
    for (let i = 0; i <= steps; i++) {
      points.push({ x: xMin + i * dx, y: val });
    }
    return points;
  }

  // 3. Parametric Handler (x(t), y(t))
  if (curveType === 'parametric' && curve.parametric) {
    const dt = 1.0 / steps;
    for (let i = 0; i <= steps; i++) {
      const pt = curve.parametric(i * dt, params);
      if (Number.isFinite(pt.x) && Number.isFinite(pt.y)) {
        points.push(pt);
      } else {
        points.push({ x: NaN, y: NaN });
      }
    }
    return points;
  }

  // 4. Explicit Function Handler y = f(x)
  if (curve.equation) {
    const dx = (xMax - xMin) / steps;
    let prevY: number | null = null;
    const ySpan = yMax - yMin;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const y = curve.equation(x, params);

      // Detect out-of-bounds or asymptote jumps
      if (!Number.isFinite(y) || y < yMin - ySpan * 0.2 || y > yMax + ySpan * 0.2) {
        points.push({ x: NaN, y: NaN });
        prevY = null;
        continue;
      }

      if (prevY !== null && Math.abs(y - prevY) > ySpan * 0.5) {
        points.push({ x: NaN, y: NaN }); // Break continuous SVG path across asymptote
      }

      points.push({ x, y });
      prevY = y;
    }
  }

  return points;
}

/**
 * Hybrid Bisection solver for finding curve intersections cleanly.
 */
export function findCurveIntersection(
  c1: CurveSpec,
  c2: CurveSpec,
  params: Record<string, number>,
  xMin: number,
  xMax: number
): Point | null {
  const evaluate = (c: CurveSpec, x: number): number => {
    if (c.type === 'horizontal') return typeof c.constantValue === 'function' ? c.constantValue(params) : (c.constantValue ?? 0);
    if (c.equation) return c.equation(x, params);
    return NaN;
  };

  // Vertical line intersection check
  if (c1.type === 'vertical' || c2.type === 'vertical') {
    const vertCurve = c1.type === 'vertical' ? c1 : c2;
    const otherCurve = c1.type === 'vertical' ? c2 : c1;
    const xVal = typeof vertCurve.constantValue === 'function' ? vertCurve.constantValue(params) : (vertCurve.constantValue ?? 50);
    const yVal = evaluate(otherCurve, xVal);
    if (Number.isFinite(yVal)) return { x: xVal, y: yVal };
  }

  const diff = (x: number) => evaluate(c1, x) - evaluate(c2, x);
  const steps = 300;
  const dx = (xMax - xMin) / steps;

  for (let i = 0; i < steps; i++) {
    const xL = xMin + i * dx;
    const xR = xL + dx;
    const dL = diff(xL);
    const dR = diff(xR);

    if (Number.isFinite(dL) && Number.isFinite(dR) && dL * dR <= 0) {
      let low = xL;
      let high = xR;
      for (let j = 0; j < 16; j++) {
        const mid = (low + high) / 2;
        if (diff(low) * diff(mid) <= 0) high = mid;
        else low = mid;
      }
      const xInt = (low + high) / 2;
      return { x: xInt, y: evaluate(c1, xInt) };
    }
  }

  return null;
}
