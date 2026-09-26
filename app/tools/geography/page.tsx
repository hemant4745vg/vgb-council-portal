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
type PracticeMode = "Locate" | "Identify" | "Mark" | "Quiz";
type PracticeLevel = "Class 11" | "Class 12" | "All";

type Coordinates = [number, number];

type Place = {
  name: string;
  type: string;
  coordinates: Coordinates;
  description: string;
  layers: Layer[];
  scope: MapScope;
  syllabus?: string;
};

type PracticeQuestion = {
  id: string;
  prompt: string;
  answer: string;
  coordinates: Coordinates;
  scope: MapScope;
  level: "Class 11" | "Class 12";
  type: string;
  options: string[];
  explanation: string;
};

/* -------------------------------------------------------------------------- */
/* MAP SOURCES                                                                 */
/* -------------------------------------------------------------------------- */

const WORLD_GEO =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const INDIA_GEO =
  "https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson";

/* -------------------------------------------------------------------------- */
/* MAP DATA                                                                    */
/* -------------------------------------------------------------------------- */

const indiaPlaces: Place[] = [
  {
    name: "New Delhi",
    type: "Capital",
    coordinates: [77.21, 28.61],
    description: "National capital of India.",
    layers: ["Political"],
    scope: "India",
    syllabus: "India: Political Geography",
  },
  {
    name: "Mumbai",
    type: "Major city",
    coordinates: [72.88, 19.08],
    description:
      "Major port and commercial centre on the west coast of India.",
    layers: ["Political", "Resources"],
    scope: "India",
    syllabus: "India: Human Geography",
  },
  {
    name: "Kolkata",
    type: "Major city",
    coordinates: [88.36, 22.57],
    description:
      "Major urban centre on the Hooghly River in eastern India.",
    layers: ["Political", "Rivers"],
    scope: "India",
    syllabus: "India: Human Geography",
  },
  {
    name: "Chennai",
    type: "Major city",
    coordinates: [80.27, 13.08],
    description:
      "Major port city on the southeastern coast of India.",
    layers: ["Political", "Resources"],
    scope: "India",
    syllabus: "India: Human Geography",
  },
  {
    name: "Ganga",
    type: "River",
    coordinates: [83.0, 25.3],
    description:
      "One of the major river systems of northern India.",
    layers: ["Rivers"],
    scope: "India",
    syllabus: "India: Drainage",
  },
  {
    name: "Brahmaputra",
    type: "River",
    coordinates: [91.2, 26.1],
    description:
      "Major Himalayan river flowing through Tibet, India and Bangladesh.",
    layers: ["Rivers"],
    scope: "India",
    syllabus: "India: Drainage",
  },
  {
    name: "Narmada",
    type: "River",
    coordinates: [77.8, 22.7],
    description:
      "Major west-flowing peninsular river flowing through a rift valley.",
    layers: ["Rivers"],
    scope: "India",
    syllabus: "India: Drainage",
  },
  {
    name: "Godavari",
    type: "River",
    coordinates: [79.7, 18.7],
    description:
      "Major east-flowing peninsular river and one of India's largest river basins.",
    layers: ["Rivers"],
    scope: "India",
    syllabus: "India: Drainage",
  },
  {
    name: "Deccan Plateau",
    type: "Physical region",
    coordinates: [77.0, 17.8],
    description:
      "Large plateau region occupying much of peninsular India.",
    layers: ["Physical", "Resources"],
    scope: "India",
    syllabus: "India: Physiography",
  },
  {
    name: "Thar Desert",
    type: "Physical region",
    coordinates: [71.0, 27.5],
    description:
      "Arid region in northwestern India, mainly in Rajasthan.",
    layers: ["Physical", "Climate"],
    scope: "India",
    syllabus: "India: Physiography & Climate",
  },
  {
    name: "Himalayas",
    type: "Mountain system",
    coordinates: [79.5, 30.0],
    description:
      "Major mountain system forming India's northern mountain barrier.",
    layers: ["Physical", "Climate"],
    scope: "India",
    syllabus: "India: Physiography",
  },
  {
    name: "Western Ghats",
    type: "Mountain system",
    coordinates: [74.2, 15.3],
    description:
      "Mountain range running parallel to India's western coast.",
    layers: ["Physical", "Climate"],
    scope: "India",
    syllabus: "India: Physiography",
  },
  {
    name: "Bay of Bengal",
    type: "Ocean region",
    coordinates: [87.5, 15.5],
    description:
      "Northeastern part of the Indian Ocean east of peninsular India.",
    layers: ["Climate", "Rivers"],
    scope: "India",
    syllabus: "India: Climate",
  },
  {
    name: "Arabian Sea",
    type: "Ocean region",
    coordinates: [64.5, 15.5],
    description:
      "Part of the Indian Ocean lying west of India.",
    layers: ["Climate"],
    scope: "India",
    syllabus: "India: Climate",
  },
];

const worldPlaces: Place[] = [
  {
    name: "Equator",
    type: "Latitude",
    coordinates: [0, 0],
    description: "0° latitude, dividing Earth into the Northern and Southern Hemispheres.",
    layers: ["Climate", "Political"],
    scope: "World",
    syllabus: "World: Latitudes",
  },
  {
    name: "Prime Meridian",
    type: "Longitude",
    coordinates: [0, 20],
    description: "0° longitude, used as the reference meridian for longitude.",
    layers: ["Political"],
    scope: "World",
    syllabus: "World: Longitudes",
  },
  {
    name: "London",
    type: "City",
    coordinates: [-0.13, 51.51],
    description: "Major European city located close to the Prime Meridian.",
    layers: ["Political", "Resources"],
    scope: "World",
    syllabus: "World: Human Geography",
  },
  {
    name: "Cairo",
    type: "City",
    coordinates: [31.24, 30.04],
    description: "Major city in northeastern Africa near the Nile Valley.",
    layers: ["Political", "Rivers"],
    scope: "World",
    syllabus: "World: Human Geography",
  },
  {
    name: "Amazon Basin",
    type: "Physical region",
    coordinates: [-60, -4],
    description:
      "Large tropical basin drained principally by the Amazon River.",
    layers: ["Physical", "Climate", "Rivers"],
    scope: "World",
    syllabus: "World: Physical Geography",
  },
  {
    name: "Sahara",
    type: "Physical region",
    coordinates: [13, 24],
    description: "The world's largest hot desert.",
    layers: ["Physical", "Climate"],
    scope: "World",
    syllabus: "World: Climate & Landforms",
  },
  {
    name: "Rocky Mountains",
    type: "Mountain system",
    coordinates: [-112, 43],
    description:
      "Major mountain system in western North America.",
    layers: ["Physical"],
    scope: "World",
    syllabus: "World: Physical Geography",
  },
  {
    name: "Andes",
    type: "Mountain system",
    coordinates: [-70, -20],
    description:
      "Major mountain system running along the western edge of South America.",
    layers: ["Physical", "Climate"],
    scope: "World",
    syllabus: "World: Physical Geography",
  },
  {
    name: "Nile",
    type: "River",
    coordinates: [31.2, 30.0],
    description:
      "Major river system flowing northward through northeastern Africa.",
    layers: ["Rivers"],
    scope: "World",
    syllabus: "World: Drainage",
  },
  {
    name: "Amazon River",
    type: "River",
    coordinates: [-58, -3],
    description:
      "Major river draining a vast portion of tropical South America.",
    layers: ["Rivers"],
    scope: "World",
    syllabus: "World: Drainage",
  },
];

/* -------------------------------------------------------------------------- */
/* PRACTICE DATA                                                               */
/* -------------------------------------------------------------------------- */

const practiceQuestions: PracticeQuestion[] = [
  {
    id: "india-new-delhi",
    prompt: "Locate the capital of India.",
    answer: "New Delhi",
    coordinates: [77.21, 28.61],
    scope: "India",
    level: "Class 11",
    type: "Political",
    options: ["New Delhi", "Mumbai", "Kolkata", "Chennai"],
    explanation: "New Delhi is the national capital of India.",
  },
  {
    id: "india-thar",
    prompt: "Locate the Thar Desert.",
    answer: "Thar Desert",
    coordinates: [71.0, 27.5],
    scope: "India",
    level: "Class 11",
    type: "Physical Geography",
    options: [
      "Thar Desert",
      "Deccan Plateau",
      "Western Ghats",
      "Himalayas",
    ],
    explanation:
      "The Thar Desert occupies much of northwestern India, especially Rajasthan.",
  },
  {
    id: "india-himalayas",
    prompt: "Locate the Himalayan region.",
    answer: "Himalayas",
    coordinates: [79.5, 30.0],
    scope: "India",
    level: "Class 11",
    type: "Physiography",
    options: [
      "Himalayas",
      "Western Ghats",
      "Deccan Plateau",
      "Thar Desert",
    ],
    explanation:
      "The Himalayas form the major mountain system along India's northern boundary.",
  },
  {
    id: "india-deccan",
    prompt: "Locate the Deccan Plateau.",
    answer: "Deccan Plateau",
    coordinates: [77.0, 17.8],
    scope: "India",
    level: "Class 11",
    type: "Physiography",
    options: [
      "Deccan Plateau",
      "Himalayas",
      "Thar Desert",
      "Ganga Plain",
    ],
    explanation:
      "The Deccan Plateau occupies a large part of peninsular India.",
  },
  {
    id: "india-ganga",
    prompt: "Locate the Ganga river system.",
    answer: "Ganga",
    coordinates: [83.0, 25.3],
    scope: "India",
    level: "Class 11",
    type: "Drainage",
    options: ["Ganga", "Narmada", "Godavari", "Brahmaputra"],
    explanation:
      "The Ganga is one of the major Himalayan river systems of northern India.",
  },
  {
    id: "india-western-ghats",
    prompt: "Locate the Western Ghats.",
    answer: "Western Ghats",
    coordinates: [74.2, 15.3],
    scope: "India",
    level: "Class 11",
    type: "Physiography",
    options: [
      "Western Ghats",
      "Himalayas",
      "Aravallis",
      "Deccan Plateau",
    ],
    explanation:
      "The Western Ghats run roughly parallel to India's western coast.",
  },
  {
    id: "world-sahara",
    prompt: "Locate the Sahara Desert.",
    answer: "Sahara",
    coordinates: [13, 24],
    scope: "World",
    level: "Class 11",
    type: "Physical Geography",
    options: ["Sahara", "Gobi", "Kalahari", "Atacama"],
    explanation:
      "The Sahara stretches across much of northern Africa.",
  },
  {
    id: "world-equator",
    prompt: "Locate the Equator.",
    answer: "Equator",
    coordinates: [0, 0],
    scope: "World",
    level: "Class 11",
    type: "Latitudes",
    options: ["Equator", "Tropic of Cancer", "Prime Meridian", "Arctic Circle"],
    explanation: "The Equator represents 0° latitude.",
  },
  {
    id: "world-amazon",
    prompt: "Locate the Amazon Basin.",
    answer: "Amazon Basin",
    coordinates: [-60, -4],
    scope: "World",
    level: "Class 11",
    type: "Physical Geography",
    options: ["Amazon Basin", "Congo Basin", "Sahara", "Great Plains"],
    explanation:
      "The Amazon Basin occupies a large part of tropical South America.",
  },
  {
    id: "world-prime-meridian",
    prompt: "Locate the Prime Meridian.",
    answer: "Prime Meridian",
    coordinates: [0, 20],
    scope: "World",
    level: "Class 11",
    type: "Longitudes",
    options: [
      "Prime Meridian",
      "Equator",
      "Tropic of Capricorn",
      "International Date Line",
    ],
    explanation: "The Prime Meridian represents 0° longitude.",
  },
  {
    id: "world-andes",
    prompt: "Locate the Andes mountain system.",
    answer: "Andes",
    coordinates: [-70, -20],
    scope: "World",
    level: "Class 11",
    type: "Physical Geography",
    options: ["Andes", "Rocky Mountains", "Alps", "Himalayas"],
    explanation:
      "The Andes extend along the western margin of South America.",
  },
];

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                     */
/* -------------------------------------------------------------------------- */

function getGeoName(geo: any) {
  return (
    geo?.properties?.ST_NM ||
    geo?.properties?.NAME_1 ||
    geo?.properties?.name ||
    geo?.properties?.NAME ||
    "Mapped region"
  );
}

function distance(a: Coordinates, b: Coordinates) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                        */
/* -------------------------------------------------------------------------- */

export default function GeographyLabPage() {
  const [scope, setScope] = useState<MapScope>("India");
  const [layer, setLayer] = useState<Layer>("Political");
  const [mode, setMode] = useState<Mode>("Explore");

  const [selected, setSelected] = useState<Place | null>(null);
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(1);

  const [practiceMode, setPracticeMode] =
    useState<PracticeMode>("Locate");
  const [practiceLevel, setPracticeLevel] =
    useState<PracticeLevel>("All");

  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceResult, setPracticeResult] =
    useState<"idle" | "correct" | "wrong">("idle");

  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const places = scope === "India" ? indiaPlaces : worldPlaces;

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchesLayer = place.layers.includes(layer);
      const matchesSearch =
        search.trim() === "" ||
        place.name.toLowerCase().includes(search.toLowerCase()) ||
        place.type.toLowerCase().includes(search.toLowerCase());

      return matchesLayer && matchesSearch;
    });
  }, [places, layer, search]);

  const questions = useMemo(() => {
    return practiceQuestions.filter((question) => {
      const matchesScope = question.scope === scope;
      const matchesLevel =
        practiceLevel === "All" || question.level === practiceLevel;

      return matchesScope && matchesLevel;
    });
  }, [scope, practiceLevel]);

  const question =
    questions.length > 0
      ? questions[practiceIndex % questions.length]
      : null;

  useEffect(() => {
    setSelected(null);
    setZoom(1);
    setPracticeIndex(0);
    setPracticeResult("idle");
  }, [scope, layer]);

  useEffect(() => {
    setPracticeIndex(0);
    setPracticeResult("idle");
  }, [practiceLevel, practiceMode]);

  function resetMap() {
    setZoom(1);
    setSelected(null);
  }

  function answerQuestion(answer: string) {
    if (!question || practiceResult !== "idle") return;

    const isCorrect = answer === question.answer;

    setAttempts((a) => a + 1);

    if (isCorrect) {
      setScore((s) => s + 1);
      setPracticeResult("correct");
    } else {
      setPracticeResult("wrong");
    }
  }

  function answerByCoordinates(coordinates: Coordinates) {
    if (!question || practiceResult !== "idle") return;

    const d = distance(coordinates, question.coordinates);

    /*
     * Approximate tolerance rather than requiring students
     * to click the exact mathematical coordinate.
     */
    const tolerance =
      scope === "India"
        ? 4.5
        : 8;

    const isCorrect = d <= tolerance;

    setAttempts((a) => a + 1);

    if (isCorrect) {
      setScore((s) => s + 1);
      setPracticeResult("correct");
    } else {
      setPracticeResult("wrong");
    }
  }

  function nextQuestion() {
    if (!questions.length) return;

    setPracticeIndex((i) => (i + 1) % questions.length);
    setPracticeResult("idle");
    setSelected(null);
  }

  function randomQuestion() {
    if (!questions.length) return;

    let next = Math.floor(Math.random() * questions.length);

    if (questions.length > 1 && next === practiceIndex) {
      next = (next + 1) % questions.length;
    }

    setPracticeIndex(next);
    setPracticeResult("idle");
  }

  const accuracy =
    attempts === 0 ? 0 : Math.round((score / attempts) * 100);

  const projectionConfig =
    scope === "India"
      ? {
          center: [79, 22] as Coordinates,
          scale: 900,
        }
      : {
          center: [0, 10] as Coordinates,
          scale: 145,
        };

  const layerDescription: Record<Layer, string> = {
    Political: "Boundaries, capitals and major cities.",
    Physical: "Mountains, plateaus, deserts and major relief features.",
    Rivers: "Major rivers and drainage systems.",
    Climate: "Climate zones, latitudes and climate-related locations.",
    Resources: "Resources, cities, ports and economic geography.",
  };

  const layerDotClass: Record<Layer, string> = {
    Political: "bg-blue-500",
    Physical: "bg-amber-500",
    Rivers: "bg-cyan-500",
    Climate: "bg-emerald-500",
    Resources: "bg-violet-500",
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <div className="mx-auto max-w-[1550px] px-4 py-6 sm:px-6 lg:px-8">

        {/* ---------------------------------------------------------------- */}
        {/* HEADER                                                           */}
        {/* ---------------------------------------------------------------- */}

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
                Explore spatial patterns, study important geographical
                features and practise CBSE-style map skills through
                interaction rather than memorisation alone.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["India", "World"] as MapScope[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setScope(item)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    scope === item
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item}
                </button>
              ))}

              <button
                onClick={() =>
                  setMode(mode === "Explore" ? "Practice" : "Explore")
                }
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  mode === "Practice"
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {mode === "Practice" ? "Map Explorer" : "Map Practice"}
              </button>
            </div>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* PRACTICE MODE                                                    */}
        {/* ---------------------------------------------------------------- */}

        {mode === "Practice" ? (
          <section className="space-y-5">

            {/* Practice controls */}
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[.18em] text-emerald-600">
                    CBSE Map Practice
                  </div>

                  <h2 className="mt-1 text-xl font-semibold">
                    Build spatial recall
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(
                    ["Locate", "Identify", "Mark", "Quiz"] as PracticeMode[]
                  ).map((item) => (
                    <button
                      key={item}
                      onClick={() => setPracticeMode(item)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                        practiceMode === item
                          ? "bg-slate-950 text-white"
                          : "border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(["All", "Class 11", "Class 12"] as PracticeLevel[]).map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() => setPracticeLevel(item)}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                          practiceLevel === item
                            ? "bg-emerald-600 text-white"
                            : "border border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {question ? (
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">

                {/* Practice map */}
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                          {question.level} · {question.type}
                        </p>

                        <h2 className="mt-1 text-xl font-semibold">
                          {question.prompt}
                        </h2>
                      </div>

                      <div className="text-right text-xs text-slate-500">
                        Question {practiceIndex + 1} / {questions.length}
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {practiceMode === "Locate" &&
                        "Choose the correct geographical feature."}

                      {practiceMode === "Identify" &&
                        "A location is marked on the map. Identify it."}

                      {practiceMode === "Mark" &&
                        "Choose the location on the map where the feature belongs."}

                      {practiceMode === "Quiz" &&
                        "Answer the question using the choices."}
                    </p>
                  </div>

                  <div className="relative min-h-[600px] bg-slate-50">
                    <ComposableMap
                      projection={
                        scope === "India"
                          ? "geoMercator"
                          : "geoEqualEarth"
                      }
                      projectionConfig={projectionConfig}
                      className="h-[600px] w-full"
                    >
                      <Sphere
                        stroke="#cbd5e1"
                        strokeWidth={0.7}
                        fill="#f8fafc"
                      />

                      <Graticule
                        stroke="#e2e8f0"
                        strokeWidth={0.35}
                      />

                      <Geographies geography={
                        scope === "India"
                          ? INDIA_GEO
                          : WORLD_GEO
                      }>
                        {({ geographies }) =>
                          geographies.map((geo) => (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill="#e5e7eb"
                              stroke="#94a3b8"
                              strokeWidth={0.5}
                              style={{
                                default: {
                                  outline: "none",
                                },
                                hover: {
                                  outline: "none",
                                  fill: "#cbd5e1",
                                },
                                pressed: {
                                  outline: "none",
                                },
                              }}
                            />
                          ))
                        }
                      </Geographies>

                      {/* Identify mode deliberately reveals a location */}
                      {practiceMode === "Identify" && (
                        <Marker coordinates={question.coordinates}>
                          <circle
                            r={9}
                            fill="#ef4444"
                            stroke="#ffffff"
                            strokeWidth={3}
                          />
                          <circle
                            r={15}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth={1.5}
                            opacity={0.45}
                          />
                        </Marker>
                      )}

                      {/* Mark mode gives several possible locations */}
                      {practiceMode === "Mark" &&
                        question.options.map((option, index) => {
                          const place = places.find(
                            (p) => p.name === option
                          );

                          if (!place) return null;

                          return (
                            <Marker
                              key={option}
                              coordinates={place.coordinates}
                              onClick={() =>
                                answerByCoordinates(place.coordinates)
                              }
                            >
                              <circle
                                r={13}
                                fill={
                                  practiceResult === "idle"
                                    ? "#ffffff"
                                    : place.name === question.answer
                                      ? "#10b981"
                                      : "#ef4444"
                                }
                                stroke="#0f172a"
                                strokeWidth={1.5}
                                className="cursor-pointer"
                              />

                              <text
                                textAnchor="middle"
                                y={4}
                                style={{
                                  fontFamily: "system-ui",
                                  fontSize: 8,
                                  fontWeight: 800,
                                  fill: "#0f172a",
                                  pointerEvents: "none",
                                }}
                              >
                                {index + 1}
                              </text>
                            </Marker>
                          );
                        })}

                      {/* Reveal correct answer after submission */}
                      {practiceResult !== "idle" &&
                        practiceMode !== "Identify" &&
                        practiceMode !== "Mark" && (
                          <Marker coordinates={question.coordinates}>
                            <circle
                              r={8}
                              fill={
                                practiceResult === "correct"
                                  ? "#10b981"
                                  : "#ef4444"
                              }
                              stroke="#ffffff"
                              strokeWidth={3}
                            />
                          </Marker>
                        )}
                    </ComposableMap>

                    <div className="absolute bottom-4 left-4 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-500 shadow-sm">
                      {practiceMode === "Identify"
                        ? "Identify the marked location."
                        : practiceMode === "Mark"
                          ? "Select a numbered location."
                          : "The answer location remains hidden until submission."}
                    </div>
                  </div>
                </div>

                {/* Practice sidebar */}
                <aside className="space-y-4">

                  {/* Score */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Score
                        </div>
                        <div className="mt-1 text-2xl font-semibold">
                          {score}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Attempts
                        </div>
                        <div className="mt-1 text-2xl font-semibold">
                          {attempts}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Accuracy
                        </div>
                        <div className="mt-1 text-2xl font-semibold">
                          {accuracy}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Answer */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                      Answer
                    </p>

                    {(practiceMode === "Locate" ||
                      practiceMode === "Quiz") && (
                      <div className="mt-4 space-y-2">
                        {question.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => answerQuestion(option)}
                            disabled={practiceResult !== "idle"}
                            className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                              practiceResult !== "idle"
                                ? option === question.answer
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                  : "border-slate-200 text-slate-400"
                                : "border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}

                    {practiceMode === "Identify" && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {question.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => answerQuestion(option)}
                            disabled={practiceResult !== "idle"}
                            className="rounded-xl border border-slate-200 px-3 py-3 text-left text-xs font-semibold hover:border-slate-400"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}

                    {practiceMode === "Mark" && (
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        Select one of the numbered locations on the map.
                      </p>
                    )}

                    {practiceResult !== "idle" && (
                      <div
                        className={`mt-4 rounded-2xl p-4 text-sm leading-6 ${
                          practiceResult === "correct"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-rose-50 text-rose-800"
                        }`}
                      >
                        <div className="font-semibold">
                          {practiceResult === "correct"
                            ? "Correct."
                            : `The answer is ${question.answer}.`}
                        </div>

                        <div className="mt-1">
                          {question.explanation}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={nextQuestion}
                        className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                      >
                        Next
                      </button>

                      <button
                        onClick={randomQuestion}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                      >
                        Random
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
                <h2 className="text-xl font-semibold">
                  No questions available
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  This combination of scope and class level does not have
                  questions yet.
                </p>
              </div>
            )}
          </section>
        ) : (

          /* ---------------------------------------------------------------- */
          /* EXPLORER MODE                                                    */
          /* ---------------------------------------------------------------- */

          <section className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)_320px]">

            {/* Layer sidebar */}
            <aside className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="px-2 py-2">
                <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                  Map Explorer
                </div>

                <div className="mt-1 text-sm font-semibold">
                  Layers
                </div>
              </div>

              <div className="mt-2 space-y-1">
                {(
                  [
                    "Political",
                    "Physical",
                    "Rivers",
                    "Climate",
                    "Resources",
                  ] as Layer[]
                ).map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setLayer(item);
                      setSearch("");
                    }}
                    className={`w-full rounded-xl px-3 py-3 text-left transition ${
                      layer === item
                        ? "bg-slate-950 text-white"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          layerDotClass[item]
                        }`}
                      />

                      <span className="text-sm font-semibold">
                        {item}
                      </span>
                    </div>

                    <div
                      className={`mt-1 pl-4 text-xs ${
                        layer === item
                          ? "text-slate-300"
                          : "text-slate-400"
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
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                <span className="font-semibold text-slate-700">
                  Current layer
                </span>

                <div className="mt-1">
                  {layerDescription[layer]}
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="px-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                  Quick tools
                </div>

                <button
                  onClick={resetMap}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Reset map
                </button>
              </div>
            </aside>

            {/* Main map */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                      {scope} · {layer}
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                      Interactive map
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search feature..."
                        className="w-48 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      />
                    </div>

                    <button
                      onClick={() =>
                        setZoom((z) => Math.max(1, z - 0.25))
                      }
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                      aria-label="Zoom out"
                    >
                      −
                    </button>

                    <button
                      onClick={() =>
                        setZoom((z) => Math.min(4, z + 0.25))
                      }
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                      aria-label="Zoom in"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative bg-slate-50">
                <ComposableMap
                  projection={
                    scope === "India"
                      ? "geoMercator"
                      : "geoEqualEarth"
                  }
                  projectionConfig={projectionConfig}
                  className="h-[650px] w-full"
                >
                  <ZoomableGroup
                    zoom={zoom}
                    onMoveEnd={({ zoom: newZoom }) =>
                      setZoom(newZoom)
                    }
                  >
                    <Sphere
                      stroke="#cbd5e1"
                      strokeWidth={0.7}
                      fill="#f8fafc"
                    />

                    <Graticule
                      stroke="#e2e8f0"
                      strokeWidth={0.35}
                    />

                    <Geographies
                      geography={
                        scope === "India"
                          ? INDIA_GEO
                          : WORLD_GEO
                      }
                    >
                      {({ geographies }) =>
                        geographies.map((geo) => {
                          const geoName = getGeoName(geo);

                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              onClick={() =>
                                setSelected({
                                  name: geoName,
                                  type:
                                    scope === "India"
                                      ? "Indian region"
                                      : "Country / region",
                                  coordinates: [0, 0],
                                  description:
                                    scope === "India"
                                      ? `${geoName} is a mapped administrative region of India.`
                                      : `${geoName} is a mapped geographical region.`,
                                  layers: ["Political"],
                                  scope,
                                })
                              }
                              fill={
                                scope === "India"
                                  ? "#e7edf3"
                                  : "#e2e8f0"
                              }
                              stroke="#94a3b8"
                              strokeWidth={0.5}
                              style={{
                                default: {
                                  outline: "none",
                                },
                                hover: {
                                  outline: "none",
                                  fill: "#cbd5e1",
                                  cursor: "pointer",
                                },
                                pressed: {
                                  outline: "none",
                                },
                              }}
                            />
                          );
                        })
                      }
                    </Geographies>

                    {filteredPlaces.map((place) => (
                      <Marker
                        key={place.name}
                        coordinates={place.coordinates}
                        onClick={() => setSelected(place)}
                      >
                        <circle
                          r={
                            selected?.name === place.name
                              ? 7
                              : 4.5
                          }
                          fill={
                            selected?.name === place.name
                              ? "#0f172a"
                              : "#2563eb"
                          }
                          stroke="#ffffff"
                          strokeWidth={1.5}
                          className="cursor-pointer"
                        />

                        <text
                          textAnchor="middle"
                          y={-9}
                          style={{
                            fontFamily: "system-ui",
                            fontSize: 7,
                            fontWeight: 600,
                            fill: "#334155",
                            pointerEvents: "none",
                          }}
                        >
                          {place.name}
                        </text>
                      </Marker>
                    ))}
                  </ZoomableGroup>
                </ComposableMap>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
                  <div className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">
                    Legend
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    Mapped feature
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-950" />
                    Selected
                  </div>
                </div>

                {/* Search result count */}
                <div className="absolute bottom-4 right-4 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-500 shadow-sm">
                  {filteredPlaces.length} feature
                  {filteredPlaces.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            {/* Information sidebar */}
            <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                Feature information
              </div>

              {selected ? (
                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    {selected.type}
                  </div>

                  <h2 className="mt-1 text-2xl font-semibold">
                    {selected.name}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {selected.description}
                  </p>

                  {selected.syllabus && (
                    <div className="mt-4 rounded-xl bg-blue-50 p-3 text-xs font-medium leading-5 text-blue-800">
                      <span className="font-bold">
                        Syllabus connection:
                      </span>{" "}
                      {selected.syllabus}
                    </div>
                  )}

                  <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    Coordinates:{" "}
                    {selected.coordinates[1].toFixed(2)}°,{" "}
                    {selected.coordinates[0].toFixed(2)}°
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm leading-6 text-slate-500">
                    Click a mapped feature or region to inspect it.
                    Search above to find a specific feature.
                  </p>
                </div>
              )}

              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                  Visible features
                </div>

                <div className="mt-3 max-h-64 space-y-1 overflow-auto">
                  {filteredPlaces.map((place) => (
                    <button
                      key={place.name}
                      onClick={() => setSelected(place)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-xs transition ${
                        selected?.name === place.name
                          ? "bg-slate-950 text-white"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-semibold">
                        {place.name}
                      </div>

                      <div
                        className={`mt-0.5 ${
                          selected?.name === place.name
                            ? "text-slate-300"
                            : "text-slate-400"
                        }`}
                      >
                        {place.type}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="text-xs font-semibold text-slate-700">
                  Coming into the lab
                </div>

                <div className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
                  <div>• India physiographic divisions</div>
                  <div>• Major river systems</div>
                  <div>• Monsoon and pressure systems</div>
                  <div>• Climate zones</div>
                  <div>• Resources and industries</div>
                  <div>• Population and migration</div>
                </div>
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
