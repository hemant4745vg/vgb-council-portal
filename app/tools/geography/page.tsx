"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
  Sphere,
  ZoomableGroup,
} from "react-simple-maps";

type MapScope = "India" | "World";
type Layer =
  | "Political"
  | "Physical"
  | "Rivers"
  | "Climate"
  | "Resources";
type Mode = "Explore" | "Practice";

type Place = {
  name: string;
  type: string;
  coordinates: [number, number];
  description: string;
};

const WORLD_GEO = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const INDIA_GEO =
  "https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson";

const indiaPlaces: Place[] = [
  { name: "New Delhi", type: "Capital", coordinates: [77.21, 28.61], description: "National capital of India." },
  { name: "Mumbai", type: "Major city", coordinates: [72.88, 19.08], description: "Major port and commercial centre on the west coast." },
  { name: "Kolkata", type: "Major city", coordinates: [88.36, 22.57], description: "Major urban centre on the Hooghly River in eastern India." },
  { name: "Chennai", type: "Major city", coordinates: [80.27, 13.08], description: "Major port city on the southeast coast." },
  { name: "Ganga", type: "River", coordinates: [83.0, 25.3], description: "One of the major river systems of northern India." },
  { name: "Deccan Plateau", type: "Physical region", coordinates: [77.0, 17.8], description: "Large plateau region of peninsular India." },
  { name: "Thar Desert", type: "Physical region", coordinates: [71.0, 27.5], description: "Arid region in northwestern India." },
  { name: "Himalayas", type: "Mountain system", coordinates: [79.5, 30.0], description: "Major mountain system along India's northern frontier." },
];

const worldPlaces: Place[] = [
  { name: "Equator", type: "Latitude", coordinates: [0, 0], description: "0° latitude." },
  { name: "Prime Meridian", type: "Longitude", coordinates: [0, 20], description: "0° longitude." },
  { name: "London", type: "City", coordinates: [-0.13, 51.51], description: "Major city near the Prime Meridian." },
  { name: "Cairo", type: "City", coordinates: [31.24, 30.04], description: "Major city in northeastern Africa." },
  { name: "Amazon Basin", type: "Physical region", coordinates: [-60, -4], description: "Large tropical basin drained principally by the Amazon River." },
  { name: "Sahara", type: "Physical region", coordinates: [13, 24], description: "The world's largest hot desert." },
];

const practice = {
  India: [
    { prompt: "Locate the capital of India.", answer: "New Delhi", coordinates: [77.21, 28.61] as [number, number] },
    { prompt: "Locate the Thar Desert.", answer: "Thar Desert", coordinates: [71, 27.5] as [number, number] },
    { prompt: "Locate the Himalayan region.", answer: "Himalayas", coordinates: [79.5, 30] as [number, number] },
    { prompt: "Locate the Deccan Plateau.", answer: "Deccan Plateau", coordinates: [77, 17.8] as [number, number] },
  ],
  World: [
    { prompt: "Locate the Sahara.", answer: "Sahara", coordinates: [13, 24] as [number, number] },
    { prompt: "Locate the Equator.", answer: "Equator", coordinates: [0, 0] as [number, number] },
    { prompt: "Locate the Amazon Basin.", answer: "Amazon Basin", coordinates: [-60, -4] as [number, number] },
    { prompt: "Locate the Prime Meridian.", answer: "Prime Meridian", coordinates: [0, 20] as [number, number] },
  ],
};

export default function GeographyLabPage() {
  const [scope, setScope] = useState<MapScope>("India");
  const [layer, setLayer] = useState<Layer>("Political");
  const [mode, setMode] = useState<Mode>("Explore");
  const [selected, setSelected] = useState<Place | null>(null);
  const [zoom, setZoom] = useState(1);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceResult, setPracticeResult] = useState<"idle" | "correct" | "wrong">("idle");

  const places = scope === "India" ? indiaPlaces : worldPlaces;
  const questions = practice[scope];
  const question = questions[practiceIndex];

  useEffect(() => {
    setSelected(null);
    setZoom(1);
    setPracticeIndex(0);
    setPracticeResult("idle");
  }, [scope]);

  const geography = scope === "India" ? INDIA_GEO : WORLD_GEO;

  const layerDescription = useMemo(() => {
    const descriptions: Record<Layer, string> = {
      Political: "Countries, states, capitals and major cities.",
      Physical: "Major relief regions, mountains, plateaus and deserts.",
      Rivers: "Major river systems and drainage features.",
      Climate: "Climate-oriented locations and broad spatial patterns.",
      Resources: "Resource and economic geography locations.",
    };
    return descriptions[layer];
  }, [layer]);

  const markerPlaces = places.filter((p) => {
    if (layer === "Political") return ["Capital", "Major city", "City", "Latitude", "Longitude"].includes(p.type);
    if (layer === "Physical") return ["Physical region", "Mountain system"].includes(p.type);
    if (layer === "Rivers") return p.type === "River";
    return false;
  });

  function checkAnswer(name: string) {
    if (name === question.answer) {
      setPracticeResult("correct");
    } else {
      setPracticeResult("wrong");
    }
  }

  function nextQuestion() {
    setPracticeIndex((i) => (i + 1) % questions.length);
    setPracticeResult("idle");
    setSelected(null);
  }

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">
            VGB Tools · Geography
          </div>
          <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Geography Lab
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Interactive maps, spatial layers and CBSE Class XI–XII map practice.
                Built around geography as a visual subject rather than a collection of
                things to memorise five minutes before the exam.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["India", "World"] as MapScope[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setScope(item)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                    scope === item
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {item}
                </button>
              ))}
              <button
                onClick={() => setMode(mode === "Explore" ? "Practice" : "Explore")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  mode === "Practice"
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {mode === "Practice" ? "Practice mode" : "Map practice"}
              </button>
            </div>
          </div>
        </header>

        {mode === "Practice" ? (
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-emerald-600">
                  CBSE-style map practice
                </p>
                <h2 className="mt-1 text-xl font-semibold">{question.prompt}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Click a marked location on the map to submit your answer.
                </p>
              </div>

              <div className="relative min-h-[560px] bg-slate-50">
                <ComposableMap
                  projection={scope === "India" ? "geoMercator" : "geoEqualEarth"}
                  projectionConfig={
                    scope === "India"
                      ? { center: [79, 22], scale: 900 }
                      : { scale: 145 }
                  }
                  className="h-[560px] w-full"
                >
                  <Sphere stroke="#cbd5e1" strokeWidth={0.7} fill="#f8fafc" />
                  <Graticule stroke="#e2e8f0" strokeWidth={0.35} />
                  <Geographies geography={geography}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#e2e8f0"
                          stroke="#94a3b8"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { outline: "none", fill: "#cbd5e1" },
                            pressed: { outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>
                  <Marker coordinates={question.coordinates}>
                    <circle r={7} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                  </Marker>
                </ComposableMap>

                <div className="absolute bottom-4 left-4 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-500 shadow-sm">
                  Target area is shown only for the current exercise.
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                Answer
              </p>
              <div className="mt-4 space-y-2">
                {questions.map((q) => (
                  <button
                    key={q.answer}
                    onClick={() => checkAnswer(q.answer)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium transition hover:border-slate-400"
                  >
                    {q.answer}
                  </button>
                ))}
              </div>

              {practiceResult !== "idle" && (
                <div
                  className={`mt-4 rounded-xl p-4 text-sm ${
                    practiceResult === "correct"
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-rose-50 text-rose-800"
                  }`}
                >
                  {practiceResult === "correct"
                    ? "Correct. Spatial memory wins this round."
                    : `Not quite. The answer is ${question.answer}.`}
                </div>
              )}

              <button
                onClick={nextQuestion}
                className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
              >
                Next question
              </button>
            </aside>
          </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)_300px]">
            <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Map layers
              </div>
              <div className="mt-2 space-y-1">
                {(["Political", "Physical", "Rivers", "Climate", "Resources"] as Layer[]).map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() => setLayer(item)}
                      className={`w-full rounded-xl px-3 py-3 text-left text-sm ${
                        layer === item
                          ? "bg-slate-950 text-white"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-semibold">{item}</div>
                      <div
                        className={`mt-1 text-xs ${
                          layer === item ? "text-slate-300" : "text-slate-400"
                        }`}
                      >
                        {item === "Political"
                          ? "Boundaries & places"
                          : item === "Physical"
                            ? "Relief & landforms"
                            : item === "Rivers"
                              ? "Drainage systems"
                              : item === "Climate"
                                ? "Climate patterns"
                                : "Economic geography"}
                      </div>
                    </button>
                  )
                )}
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                <span className="font-semibold text-slate-700">Current layer:</span>{" "}
                {layerDescription}
              </div>
            </aside>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                    {scope} · {layer}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">Interactive map</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    −
                  </button>
                  <button
                    onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-slate-50">
                <ComposableMap
                  projection={scope === "India" ? "geoMercator" : "geoEqualEarth"}
                  projectionConfig={
                    scope === "India"
                      ? { center: [79, 22], scale: 900 }
                      : { scale: 145 }
                  }
                  className="h-[620px] w-full"
                >
                  <ZoomableGroup zoom={zoom}>
                    <Sphere stroke="#cbd5e1" strokeWidth={0.7} fill="#f8fafc" />
                    <Graticule stroke="#e2e8f0" strokeWidth={0.35} />
                    <Geographies geography={geography}>
                      {({ geographies }) =>
                        geographies.map((geo) => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={scope === "India" ? "#e7edf3" : "#e2e8f0"}
                            stroke="#94a3b8"
                            strokeWidth={0.5}
                            style={{
                              default: { outline: "none" },
                              hover: { outline: "none", fill: "#cbd5e1" },
                              pressed: { outline: "none" },
                            }}
                          />
                        ))
                      }
                    </Geographies>

                    {markerPlaces.map((place) => (
                      <Marker
                        key={place.name}
                        coordinates={place.coordinates}
                        onClick={() => setSelected(place)}
                      >
                        <circle
                          r={selected?.name === place.name ? 7 : 4.5}
                          fill={selected?.name === place.name ? "#0f172a" : "#2563eb"}
                          stroke="#fff"
                          strokeWidth={1.5}
                        />
                        <text
                          textAnchor="middle"
                          y={-9}
                          style={{
                            fontFamily: "system-ui",
                            fontSize: 7,
                            fontWeight: 600,
                            fill: "#334155",
                          }}
                        >
                          {place.name}
                        </text>
                      </Marker>
                    ))}
                  </ZoomableGroup>
                </ComposableMap>
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                Selected feature
              </p>

              {selected ? (
                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    {selected.type}
                  </div>
                  <h2 className="mt-1 text-2xl font-semibold">{selected.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {selected.description}
                  </p>
                  <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    Coordinates: {selected.coordinates[1].toFixed(2)}°,{" "}
                    {selected.coordinates[0].toFixed(2)}°
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Click a mapped feature to inspect it. The map is interactive,
                  because apparently geography finally escaped the textbook.
                </p>
              )}

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-xs font-semibold text-slate-700">Planned CBSE modules</p>
                <div className="mt-3 space-y-2 text-xs text-slate-500">
                  <div>• Physical Geography: relief, landforms, atmosphere</div>
                  <div>• India: physiography, drainage, climate and resources</div>
                  <div>• Human Geography: population and settlements</div>
                  <div>• Economic Geography: agriculture, industries and transport</div>
                  <div>• Map Practice: locate, identify and mark</div>
                </div>
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
