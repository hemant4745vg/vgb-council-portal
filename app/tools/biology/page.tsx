"use client";

import { useMemo, useState } from "react";

type LabId =
  | "overview"
  | "molecular"
  | "membrane"
  | "photosynthesis"
  | "plant"
  | "heart"
  | "lungs"
  | "nephron"
  | "microscope"
  | "ecosystem";

const labs: {
  id: LabId;
  icon: string;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "overview",
    icon: "◉",
    title: "Systems Lab",
    subtitle: "Change a variable. Watch biology respond.",
  },
  {
    id: "molecular",
    icon: "🧬",
    title: "Molecular",
    subtitle: "DNA → RNA → protein",
  },
  {
    id: "membrane",
    icon: "◌",
    title: "Membrane",
    subtitle: "Transport across a membrane",
  },
  {
    id: "photosynthesis",
    icon: "☀",
    title: "Photosynthesis",
    subtitle: "Find the limiting factor",
  },
  {
    id: "plant",
    icon: "🌿",
    title: "Plant Transport",
    subtitle: "Water, stomata and xylem",
  },
  {
    id: "heart",
    icon: "♥",
    title: "Circulation",
    subtitle: "Follow blood through the heart",
  },
  {
    id: "lungs",
    icon: "◉",
    title: "Respiration",
    subtitle: "Ventilation mechanics",
  },
  {
    id: "nephron",
    icon: "⌁",
    title: "Nephron",
    subtitle: "Filter, reabsorb, secrete",
  },
  {
    id: "microscope",
    icon: "⌕",
    title: "Microscope",
    subtitle: "Explore biological specimens",
  },
  {
    id: "ecosystem",
    icon: "♧",
    title: "Ecosystem",
    subtitle: "Population dynamics",
  },
];

const card =
  "rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]";

const darkCard =
  "rounded-3xl border border-white/10 bg-slate-950 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-950">
          {value}
          {suffix}
        </span>
      </div>

      <input
        className="w-full accent-slate-900"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>

      <div className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </div>

      {note && <div className="mt-1 text-xs text-slate-500">{note}</div>}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="mb-7 max-w-3xl">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {eyebrow}
      </div>

      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
        {title}
      </h2>

      <p className="mt-3 leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function Flow({ items, active }: { items: string[]; active: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item, i) => (
        <div key={item} className="flex items-center gap-2">
          <div
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              i === active
                ? "bg-slate-950 text-white"
                : i < active
                  ? "bg-slate-200 text-slate-700"
                  : "bg-slate-100 text-slate-400"
            }`}
          >
            {item}
          </div>

          {i < items.length - 1 && (
            <span className="text-slate-400">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

function Overview({ setLab }: { setLab: (id: LabId) => void }) {
  const [oxygen, setOxygen] = useState(75);
  const [water, setWater] = useState(70);
  const [light, setLight] = useState(70);

  const energy = clamp(
    0.45 * oxygen + 0.35 * water + 0.2 * light,
    0,
    100,
  );

  const photosynthesis = clamp(
    (light * 0.7 + water * 0.3) * (0.55 + oxygen / 220),
    0,
    100,
  );

  return (
    <>
      <div className={`${darkCard} overflow-hidden`}>
        <div className="grid gap-8 p-7 md:grid-cols-[1.25fr_.75fr] md:p-10">
          <div>
            <div className="text-sm font-semibold text-slate-400">
              BIOLOGY SYSTEMS LAB
            </div>

            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
              Change the conditions.
              <br />
              Watch biology respond.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Explore biological systems as cause-and-effect models. Adjust a
              variable, observe the response, inspect the mechanism, and connect
              the result to the biology underneath.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {["Molecular", "Cellular", "Plant", "Human", "Ecology"].map(
                (x) => (
                  <span
                    key={x}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300"
                  >
                    {x}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live system preview
            </div>

            <div className="mt-5 space-y-5">
              <Slider
                label="Oxygen availability"
                value={oxygen}
                min={0}
                max={100}
                onChange={setOxygen}
                suffix="%"
              />

              <Slider
                label="Water availability"
                value={water}
                min={0}
                max={100}
                onChange={setWater}
                suffix="%"
              />

              <Slider
                label="Light availability"
                value={light}
                min={0}
                max={100}
                onChange={setLight}
                suffix="%"
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-xs text-slate-400">
                  Cellular energy
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {Math.round(energy)}%
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-xs text-slate-400">
                  Plant carbon gain
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {Math.round(photosynthesis)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <SectionHeading
          eyebrow="Explore"
          title="A laboratory, not a question bank"
          text="Every module below is built around manipulation and observation. The goal is to make an invisible process visible."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {labs
            .filter((x) => x.id !== "overview")
            .map((lab) => (
              <button
                key={lab.id}
                onClick={() => setLab(lab.id)}
                className={`${card} group p-6 text-left transition hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{lab.icon}</span>

                  <span className="text-slate-300 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-950">
                  {lab.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {lab.subtitle}
                </p>
              </button>
            ))}
        </div>
      </div>
    </>
  );
}

const codons: Record<string, string> = {
  UUU: "Phe",
  UUC: "Phe",
  UUA: "Leu",
  UUG: "Leu",
  CUU: "Leu",
  CUC: "Leu",
  CUA: "Leu",
  CUG: "Leu",
  AUU: "Ile",
  AUC: "Ile",
  AUA: "Ile",
  AUG: "Met",
  GUU: "Val",
  GUC: "Val",
  GUA: "Val",
  GUG: "Val",
  UCU: "Ser",
  UCC: "Ser",
  UCA: "Ser",
  UCG: "Ser",
  CCU: "Pro",
  CCC: "Pro",
  CCA: "Pro",
  CCG: "Pro",
  ACU: "Thr",
  ACC: "Thr",
  ACA: "Thr",
  ACG: "Thr",
  GCU: "Ala",
  GCC: "Ala",
  GCA: "Ala",
  GCG: "Ala",
  UAU: "Tyr",
  UAC: "Tyr",
  UAA: "STOP",
  UAG: "STOP",
  CAU: "His",
  CAC: "His",
  CAA: "Gln",
  CAG: "Gln",
  AAU: "Asn",
  AAC: "Asn",
  AAA: "Lys",
  AAG: "Lys",
  GAU: "Asp",
  GAC: "Asp",
  GAA: "Glu",
  GAG: "Glu",
  UGU: "Cys",
  UGC: "Cys",
  UGA: "STOP",
  UGG: "Trp",
  CGU: "Arg",
  CGC: "Arg",
  CGA: "Arg",
  CGG: "Arg",
  AGU: "Ser",
  AGC: "Ser",
  AGA: "Arg",
  AGG: "Arg",
  GGU: "Gly",
  GGC: "Gly",
  GGA: "Gly",
  GGG: "Gly",
};

function MolecularLab() {
  const [dna, setDna] = useState("TACACCTTGGACTGA");
  const [mutation, setMutation] = useState<
    "none" | "substitution" | "insertion" | "deletion"
  >("none");
  const [position, setPosition] = useState(4);
  const [base, setBase] = useState("G");

  const mutated = useMemo(() => {
    const chars = dna
      .replace(/[^ATCG]/gi, "")
      .toUpperCase()
      .split("");

    const p = clamp(
      position - 1,
      0,
      Math.max(0, chars.length - 1),
    );

    if (mutation === "substitution" && chars.length) {
      chars[p] = base;
    }

    if (mutation === "insertion") {
      chars.splice(p, 0, base);
    }

    if (mutation === "deletion" && chars.length) {
      chars.splice(p, 1);
    }

    return chars.join("");
  }, [dna, mutation, position, base]);

  const mrna = mutated
    .split("")
    .map(
      (b) =>
        ({
          A: "U",
          T: "A",
          C: "G",
          G: "C",
        })[b] ?? "",
    )
    .join("");

  const amino: string[] = [];

  for (let i = 0; i + 2 < mrna.length; i += 3) {
    const aa = codons[mrna.slice(i, i + 3)] ?? "?";
    amino.push(aa);

    if (aa === "STOP") {
      break;
    }
  }

  const frameShift =
    mutation === "insertion" || mutation === "deletion";

  const hasStop = amino.includes("STOP");

  return (
    <div>
      <SectionHeading
        eyebrow="Molecular biology"
        title="DNA → RNA → protein"
        text="Edit the genetic sequence and follow information through transcription and translation. Mutations become visible as changes in the downstream sequence."
      />

      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className={`${card} p-6`}>
          <h3 className="text-lg font-bold">Sequence controls</h3>

          <label className="mt-5 block text-sm font-medium text-slate-700">
            Template DNA

            <input
              value={dna}
              onChange={(e) =>
                setDna(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^ATCG]/g, ""),
                )
              }
              maxLength={30}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-mono tracking-[0.18em] outline-none focus:border-slate-500"
            />
          </label>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {(
              ["none", "substitution", "insertion", "deletion"] as const
            ).map((m) => (
              <button
                key={m}
                onClick={() => setMutation(m)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                  mutation === m
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {m[0].toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {mutation !== "none" && (
            <div className="mt-5 space-y-4">
              <Slider
                label="Position"
                value={position}
                min={1}
                max={Math.max(1, dna.length)}
                onChange={setPosition}
              />

              <div>
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Inserted / replacement base
                </div>

                <div className="flex gap-2">
                  {["A", "T", "C", "G"].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBase(b)}
                      className={`h-10 w-10 rounded-xl font-bold ${
                        base === b
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {frameShift
              ? "Insertion/deletion changes the reading frame when the number of bases changed is not a multiple of three."
              : mutation === "substitution"
                ? "A substitution changes one base. Its effect depends on whether the resulting codon changes the amino acid or creates a stop signal."
                : "Start with the original sequence, then introduce one change and observe the downstream effect."}
          </div>
        </div>

        <div className={`${card} p-6`}>
          <Flow
            items={["DNA", "mRNA", "Codons", "Protein"]}
            active={3}
          />

          <div className="mt-7 space-y-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                DNA template
              </div>

              <div className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-sm tracking-[0.2em] text-white">
                {mutated || "—"}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                mRNA
              </div>

              <div className="mt-2 overflow-x-auto rounded-xl bg-slate-100 p-4 font-mono text-sm tracking-[0.2em] text-slate-900">
                {mrna || "—"}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Translation
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {amino.map((aa, i) => (
                  <span
                    key={`${aa}-${i}`}
                    className={`rounded-xl px-3 py-2 text-sm font-bold ${
                      aa === "STOP"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {aa}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Metric
                label="DNA bases"
                value={String(mutated.length)}
              />
              <Metric
                label="Codons read"
                value={String(amino.length)}
              />
              <Metric
                label="Frame shift"
                value={frameShift ? "Yes" : "No"}
              />
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {hasStop
                ? "A stop codon terminates translation in this model."
                : frameShift
                  ? "The altered reading frame changes how bases are grouped into codons."
                  : "The sequence is being read in groups of three bases, with each codon specifying an amino acid or stop signal."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MembraneLab() {
  const [inside, setInside] = useState(25);
  const [outside, setOutside] = useState(75);
  const [permeability, setPermeability] = useState(70);
  const [energy, setEnergy] = useState(50);
  const [mode, setMode] = useState<
    "diffusion" | "osmosis" | "active"
  >("diffusion");

  const gradient = outside - inside;

  const movement =
    mode === "active"
      ? clamp(energy * 0.9, 0, 100)
      : clamp(
          Math.abs(gradient) * (permeability / 100),
          0,
          100,
        );

  const direction =
    mode === "active"
      ? "Against the concentration gradient"
      : gradient > 3
        ? "Outside → Inside"
        : gradient < -3
          ? "Inside → Outside"
          : "No net movement";

  return (
    <div>
      <SectionHeading
        eyebrow="Cellular transport"
        title="Membrane laboratory"
        text="Change the concentration gradient and membrane conditions. The model shows the direction and relative rate of transport."
      />

      <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
        <div className={`${card} p-6`}>
          <div className="grid grid-cols-3 gap-2">
            {(["diffusion", "osmosis", "active"] as const).map(
              (m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-xl px-2 py-3 text-xs font-bold ${
                    mode === m
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {m === "active"
                    ? "Active"
                    : m[0].toUpperCase() + m.slice(1)}
                </button>
              ),
            )}
          </div>

          <div className="mt-6 space-y-5">
            <Slider
              label="Inside concentration"
              value={inside}
              min={0}
              max={100}
              onChange={setInside}
              suffix="%"
            />

            <Slider
              label="Outside concentration"
              value={outside}
              min={0}
              max={100}
              onChange={setOutside}
              suffix="%"
            />

            <Slider
              label="Membrane permeability"
              value={permeability}
              min={0}
              max={100}
              onChange={setPermeability}
              suffix="%"
            />

            {mode === "active" && (
              <Slider
                label="Available ATP"
                value={energy}
                min={0}
                max={100}
                onChange={setEnergy}
                suffix="%"
              />
            )}
          </div>
        </div>

        <div className={`${card} p-6`}>
          <div className="grid gap-5 md:grid-cols-[1fr_160px_1fr] md:items-center">
            <div className="rounded-2xl bg-slate-50 p-5 text-center">
              <div className="text-xs font-bold uppercase text-slate-500">
                Outside
              </div>

              <div className="mt-2 text-3xl font-black">
                {outside}%
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-1">
                {Array.from({
                  length: Math.round(outside / 8),
                }).map((_, i) => (
                  <span
                    key={i}
                    className="h-3 w-3 rounded-full bg-slate-700"
                  />
                ))}
              </div>
            </div>

            <div className="relative flex h-56 items-center justify-center rounded-2xl bg-slate-100">
              <div className="h-full w-5 rounded-full bg-slate-950/80" />

              <div className="absolute rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase text-slate-500 shadow">
                membrane
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 text-center">
              <div className="text-xs font-bold uppercase text-slate-500">
                Inside
              </div>

              <div className="mt-2 text-3xl font-black">
                {inside}%
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-1">
                {Array.from({
                  length: Math.round(inside / 8),
                }).map((_, i) => (
                  <span
                    key={i}
                    className="h-3 w-3 rounded-full bg-slate-400"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric
              label="Gradient"
              value={`${Math.abs(gradient)}%`}
            />

            <Metric label="Direction" value={direction} />

            <Metric
              label="Relative movement"
              value={`${Math.round(movement)}%`}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-300">
            {mode === "osmosis"
              ? "Osmosis concerns water movement across a selectively permeable membrane. The direction depends on the relative water concentration / solute conditions."
              : mode === "active"
                ? "Active transport requires energy and can move substances against a concentration gradient."
                : "Diffusion is net movement down a concentration gradient. As the gradient approaches zero, net movement approaches zero."}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotosynthesisLab() {
  const [light, setLight] = useState(70);
  const [co2, setCo2] = useState(60);
  const [temp, setTemp] = useState(25);
  const [water, setWater] = useState(80);

  const tempFactor =
    temp <= 35
      ? clamp(1 - Math.abs(temp - 28) / 40, 0.2, 1)
      : clamp(1 - (temp - 35) / 30, 0.15, 1);

  const rate = clamp(
    light * 0.42 +
      co2 * 0.32 +
      water * 0.16 +
      tempFactor * 10,
    0,
    100,
  );

  const limiting = (
    [
      ["Light", light],
      ["CO₂", co2],
      ["Water", water],
      ["Temperature", tempFactor * 100],
    ] as [string, number][]
  ).sort((a, b) => a[1] - b[1])[0][0];

  return (
    <div>
      <SectionHeading
        eyebrow="Plant physiology"
        title="Photosynthesis control room"
        text="Manipulate light, carbon dioxide, water and temperature. The model estimates relative photosynthetic rate and identifies the strongest current limitation."
      />

      <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <div className={`${card} space-y-5 p-6`}>
          <Slider
            label="Light intensity"
            value={light}
            min={0}
            max={100}
            onChange={setLight}
            suffix="%"
          />

          <Slider
            label="CO₂ availability"
            value={co2}
            min={0}
            max={100}
            onChange={setCo2}
            suffix="%"
          />

          <Slider
            label="Temperature"
            value={temp}
            min={5}
            max={50}
            onChange={setTemp}
            suffix="°C"
          />

          <Slider
            label="Water availability"
            value={water}
            min={0}
            max={100}
            onChange={setWater}
            suffix="%"
          />

          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            This is a conceptual model, not a physiological prediction. Its
            purpose is to make limiting-factor reasoning visible.
          </div>
        </div>

        <div className={`${card} p-6`}>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Relative photosynthetic rate
              </div>

              <div className="mt-1 text-5xl font-black">
                {Math.round(rate)}
              </div>
            </div>

            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
              Limiting: {limiting}
            </div>
          </div>

          <div className="mt-8 flex h-52 items-end gap-1 rounded-2xl bg-slate-50 p-4">
            {Array.from({ length: 24 }).map((_, i) => {
              const x = i / 23;

              const response = clamp(
                rate * (0.3 + Math.sin(x * Math.PI) * 0.7),
                5,
                100,
              );

              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-md bg-slate-800"
                  style={{
                    height: `${response}%`,
                    opacity: 0.25 + x * 0.65,
                  }}
                />
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Metric label="Light" value={`${light}%`} />
            <Metric label="CO₂" value={`${co2}%`} />
            <Metric
              label="Temperature"
              value={`${temp}°C`}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-300">
            If the limiting variable rises while another factor becomes lower,
            the rate may stop increasing. That is the practical meaning of a
            limiting factor: one resource can constrain the response even when
            other resources are abundant.
          </div>
        </div>
      </div>
    </div>
  );
}

function PlantTransportLab() {
  const [soil, setSoil] = useState(75);
  const [humidity, setHumidity] = useState(45);
  const [temp, setTemp] = useState(28);
  const [wind, setWind] = useState(40);
  const [stomata, setStomata] = useState(70);

  const transpiration = clamp(
    stomata * 0.45 +
      wind * 0.25 +
      (100 - humidity) * 0.2 +
      temp * 0.15 -
      8,
    0,
    100,
  );

  const uptake = clamp(
    soil * 0.8 - transpiration * 0.35 + 25,
    0,
    100,
  );

  const stress = clamp(transpiration - uptake, 0, 100);

  const xylemFlow = clamp(
    (uptake + transpiration) / 2,
    0,
    100,
  );

  return (
    <div>
      <SectionHeading
        eyebrow="Plant transport"
        title="Water moves through a living plant"
        text="Adjust soil water, humidity, temperature, wind and stomatal opening. Watch the balance between water uptake, transpiration and xylem flow."
      />

      <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
        <div className={`${card} space-y-5 p-6`}>
          <Slider
            label="Soil water"
            value={soil}
            min={0}
            max={100}
            onChange={setSoil}
            suffix="%"
          />

          <Slider
            label="Humidity"
            value={humidity}
            min={0}
            max={100}
            onChange={setHumidity}
            suffix="%"
          />

          <Slider
            label="Temperature"
            value={temp}
            min={10}
            max={45}
            onChange={setTemp}
            suffix="°C"
          />

          <Slider
            label="Wind"
            value={wind}
            min={0}
            max={100}
            onChange={setWind}
            suffix="%"
          />

          <Slider
            label="Stomatal opening"
            value={stomata}
            min={0}
            max={100}
            onChange={setStomata}
            suffix="%"
          />
        </div>

        <div className={`${card} overflow-hidden p-6`}>
          <div className="relative mx-auto h-80 max-w-md">
            <div className="absolute bottom-0 left-1/2 h-52 w-8 -translate-x-1/2 rounded-full bg-slate-700" />

            <div className="absolute bottom-0 left-1/2 h-20 w-44 -translate-x-1/2 rounded-[50%] bg-slate-300" />

            <div className="absolute left-[38%] top-16 h-24 w-24 -rotate-[25deg] rounded-[70%_30%_70%_30%] bg-slate-800" />

            <div className="absolute right-[38%] top-10 h-28 w-28 rotate-[20deg] rounded-[30%_70%_30%_70%] bg-slate-600" />

            <div className="absolute left-[46%] top-28 h-16 w-16 -rotate-12 rounded-[30%_70%_30%_70%] bg-slate-500" />

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-white">
              xylem ↑
            </div>

            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow"
                style={{
                  bottom: `${18 + i * 28}px`,
                  opacity: 0.25 + xylemFlow / 130,
                }}
              />
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Metric
              label="Water uptake"
              value={`${Math.round(uptake)}%`}
            />

            <Metric
              label="Transpiration"
              value={`${Math.round(transpiration)}%`}
            />

            <Metric
              label="Water stress"
              value={`${Math.round(stress)}%`}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Higher transpiration demand can increase the pull through the xylem,
            but if water loss exceeds supply, the plant experiences water
            stress. Stomata link gas exchange to water loss.
          </div>
        </div>
      </div>
    </div>
  );
}

function HeartLab() {
  const [hr, setHr] = useState(72);
  const [sv, setSv] = useState(70);

  const output = hr * sv;

  const path = [
    "Vena cava",
    "Right atrium",
    "Right ventricle",
    "Pulmonary artery",
    "Lungs",
    "Pulmonary vein",
    "Left atrium",
    "Left ventricle",
    "Aorta",
  ];

  return (
    <div>
      <SectionHeading
        eyebrow="Human physiology"
        title="Circulation: follow the blood"
        text="Trace the route through pulmonary and systemic circulation while changing heart rate and stroke volume."
      />

      <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <div className={`${card} space-y-6 p-6`}>
          <Slider
            label="Heart rate"
            value={hr}
            min={30}
            max={180}
            onChange={setHr}
            suffix=" bpm"
          />

          <Slider
            label="Stroke volume"
            value={sv}
            min={30}
            max={120}
            onChange={setSv}
            suffix=" mL"
          />

          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <div className="text-xs uppercase tracking-wider text-slate-400">
              Cardiac output
            </div>

            <div className="mt-2 text-4xl font-black">
              {(output / 1000).toFixed(2)} L/min
            </div>

            <div className="mt-2 text-sm text-slate-400">
              CO = heart rate × stroke volume
            </div>
          </div>
        </div>

        <div className={`${card} p-6`}>
          <div className="grid gap-3 sm:grid-cols-3">
            {path.map((item, i) => (
              <div
                key={item}
                className={`relative rounded-2xl p-4 ${
                  item === "Lungs"
                    ? "bg-slate-950 text-white"
                    : "bg-slate-50 text-slate-800"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-50">
                  {String(i + 1).padStart(2, "0")}
                </div>

                <div className="mt-1 font-semibold">{item}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            The right side sends deoxygenated blood to the lungs. The left side
            sends oxygenated blood to the body. The pulmonary circuit and
            systemic circuit therefore form a continuous loop.
          </div>
        </div>
      </div>
    </div>
  );
}

function LungLab() {
  const [rr, setRr] = useState(14);
  const [tv, setTv] = useState(500);
  const [dead, setDead] = useState(150);

  const minute = rr * tv;
  const alveolar = rr * Math.max(0, tv - dead);
  const ratio = minute ? (alveolar / minute) * 100 : 0;

  return (
    <div>
      <SectionHeading
        eyebrow="Respiratory physiology"
        title="Breathing mechanics"
        text="See why respiratory rate alone does not determine effective gas exchange. Change tidal volume and dead space and watch the two ventilation measures diverge."
      />

      <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <div className={`${card} space-y-5 p-6`}>
          <Slider
            label="Respiratory rate"
            value={rr}
            min={4}
            max={40}
            onChange={setRr}
            suffix=" breaths/min"
          />

          <Slider
            label="Tidal volume"
            value={tv}
            min={200}
            max={1200}
            step={10}
            onChange={setTv}
            suffix=" mL"
          />

          <Slider
            label="Dead space"
            value={dead}
            min={50}
            max={400}
            step={10}
            onChange={setDead}
            suffix=" mL"
          />
        </div>

        <div className={`${card} p-6`}>
          <div className="flex items-center justify-center py-6">
            <div
              className="relative h-44 w-40 rounded-[45%] border-4 border-slate-700 bg-slate-100 transition-transform"
              style={{
                transform: `scale(${0.82 + (tv / 1200) * 0.35})`,
              }}
            >
              <div className="absolute left-1/2 top-0 h-10 w-3 -translate-x-1/2 rounded-full bg-slate-700" />

              <div className="absolute left-5 top-12 h-28 w-14 rounded-[50%] bg-slate-400" />

              <div className="absolute right-5 top-12 h-28 w-14 rounded-[50%] bg-slate-400" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Metric
              label="Minute ventilation"
              value={`${(minute / 1000).toFixed(2)} L/min`}
              note="RR × tidal volume"
            />

            <Metric
              label="Alveolar ventilation"
              value={`${(alveolar / 1000).toFixed(2)} L/min`}
              note="RR × (TV − dead space)"
            />

            <Metric
              label="Effective fraction"
              value={`${Math.round(ratio)}%`}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-300">
            Increasing breathing frequency does not automatically produce a
            proportional increase in effective ventilation because each breath
            contains a portion that occupies dead space.
          </div>
        </div>
      </div>
    </div>
  );
}

const nephronStages = [
  {
    name: "Glomerulus",
    process: "Filtration",
    water: 100,
    glucose: 100,
    urea: 100,
  },
  {
    name: "PCT",
    process: "Major reabsorption",
    water: 70,
    glucose: 0,
    urea: 80,
  },
  {
    name: "Loop of Henle",
    process: "Water / ion handling",
    water: 45,
    glucose: 0,
    urea: 70,
  },
  {
    name: "DCT",
    process: "Selective adjustment",
    water: 25,
    glucose: 0,
    urea: 55,
  },
  {
    name: "Collecting duct",
    process: "Final water adjustment",
    water: 12,
    glucose: 0,
    urea: 45,
  },
];

function NephronLab() {
  const [stage, setStage] = useState(0);

  const [substance, setSubstance] = useState<
    "water" | "glucose" | "urea"
  >("water");

  const current = nephronStages[stage];
  const remaining = current[substance];

  return (
    <div>
      <SectionHeading
        eyebrow="Excretion"
        title="Nephron simulator"
        text="Follow a simplified filtrate through the nephron and see how the proportion remaining changes as filtration and reabsorption occur."
      />

      <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <div className={`${card} p-6`}>
          <div className="space-y-2">
            {nephronStages.map((x, i) => (
              <button
                key={x.name}
                onClick={() => setStage(i)}
                className={`w-full rounded-2xl p-4 text-left ${
                  stage === i
                    ? "bg-slate-950 text-white"
                    : "bg-slate-50 text-slate-700"
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider opacity-50">
                  Stage {i + 1}
                </div>

                <div className="mt-1 font-bold">{x.name}</div>

                <div className="mt-1 text-xs opacity-60">
                  {x.process}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`${card} p-6`}>
          <div className="flex flex-wrap gap-2">
            {(["water", "glucose", "urea"] as const).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setSubstance(s)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold ${
                    substance === s
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {s[0].toUpperCase() + s.slice(1)}
                </button>
              ),
            )}
          </div>

          <div className="mt-8">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Current location
            </div>

            <div className="mt-2 text-3xl font-black">
              {current.name}
            </div>

            <div className="mt-2 text-slate-500">
              {current.process}
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-2 flex justify-between text-sm font-semibold">
              <span>Relative amount remaining</span>
              <span>{remaining}%</span>
            </div>

            <div className="h-5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900 transition-all"
                style={{ width: `${remaining}%` }}
              />
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            This simplified model separates the major ideas: filtration moves
            small substances into the nephron, while selective reabsorption
            returns useful materials and water to the blood. Real nephron
            handling is continuous and regulated.
          </div>
        </div>
      </div>
    </div>
  );
}

const specimens = [
  {
    name: "Onion epidermis",
    type: "Plant cell",
    detail:
      "Regular rectangular cells with prominent cell walls.",
  },
  {
    name: "Cheek epithelium",
    type: "Animal cell",
    detail:
      "Irregularly shaped animal cells without a rigid cell wall.",
  },
  {
    name: "Stoma",
    type: "Plant structure",
    detail:
      "Guard cells regulate the opening through which gases move.",
  },
  {
    name: "Blood smear",
    type: "Tissue",
    detail:
      "A field containing many erythrocytes and occasional larger cells.",
  },
];

function MicroscopeLab() {
  const [specimen, setSpecimen] = useState(0);
  const [zoom, setZoom] = useState(10);
  const [focus, setFocus] = useState(65);

  const current = specimens[specimen];

  return (
    <div>
      <SectionHeading
        eyebrow="Microscopy"
        title="Virtual microscope"
        text="Change magnification and focus while exploring a simulated specimen. The goal is to build the visual habit of observation before interpretation."
      />

      <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
        <div className={`${card} space-y-5 p-6`}>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">
              Specimen
            </div>

            <select
              value={specimen}
              onChange={(e) =>
                setSpecimen(Number(e.target.value))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3"
            >
              {specimens.map((s, i) => (
                <option key={s.name} value={i}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <Slider
            label="Magnification"
            value={zoom}
            min={10}
            max={400}
            step={10}
            onChange={setZoom}
            suffix="×"
          />

          <Slider
            label="Focus"
            value={focus}
            min={0}
            max={100}
            onChange={setFocus}
            suffix="%"
          />

          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Use lower magnification to find the specimen, then increase
            magnification for structural detail.
          </div>
        </div>

        <div className={`${card} p-6`}>
          <div className="relative mx-auto flex aspect-[4/3] max-w-2xl items-center justify-center overflow-hidden rounded-[2rem] bg-slate-950">
            <div
              className="absolute inset-8 rounded-full border-4 border-slate-500/50 bg-slate-100 transition-all"
              style={{
                filter: `blur(${Math.abs(focus - 65) / 18}px)`,
                transform: `scale(${0.65 + zoom / 500})`,
              }}
            >
              {specimen === 0 && (
                <div className="grid h-full grid-cols-6 gap-1 p-4 opacity-80">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-sm border-2 border-slate-600 bg-slate-200"
                    />
                  ))}
                </div>
              )}

              {specimen === 1 && (
                <div className="flex h-full flex-wrap items-center justify-center gap-4 p-10">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-14 w-20 rounded-[50%] border-2 border-slate-600 bg-slate-200"
                    />
                  ))}
                </div>
              )}

              {specimen === 2 && (
                <div className="flex h-full items-center justify-center gap-2">
                  <div className="h-40 w-24 rounded-[50%] border-4 border-slate-700 bg-slate-300" />

                  <div className="h-40 w-24 rounded-[50%] border-4 border-slate-700 bg-slate-300" />

                  <div className="h-24 w-5 rounded-full bg-slate-900" />
                </div>
              )}

              {specimen === 3 && (
                <div className="flex h-full flex-wrap content-center justify-center gap-2 p-10">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-4 w-4 rounded-full bg-slate-500"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="absolute left-5 top-5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur">
              {zoom}×
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Metric label="Specimen" value={current.name} />
            <Metric label="Category" value={current.type} />
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {current.detail}
          </div>
        </div>
      </div>
    </div>
  );
}

function EcosystemLab() {
  const [plants, setPlants] = useState(70);
  const [herbivores, setHerbivores] = useState(45);
  const [predators, setPredators] = useState(20);
  const [rain, setRain] = useState(60);

  const plantGrowth = clamp(
    rain * 0.7 + 25 - herbivores * 0.35,
    0,
    100,
  );

  const herbivoreGrowth = clamp(
    plants * 0.55 + rain * 0.15 - predators * 0.6,
    0,
    100,
  );

  const predatorGrowth = clamp(
    herbivores * 0.55 - predators * 0.25,
    0,
    100,
  );

  const populations: [string, number, number][] = [
    ["Plants", plants, plantGrowth],
    ["Herbivores", herbivores, herbivoreGrowth],
    ["Predators", predators, predatorGrowth],
  ];

  return (
    <div>
      <SectionHeading
        eyebrow="Ecology"
        title="A miniature ecosystem"
        text="Change rainfall, plant abundance, herbivore pressure and predator pressure. The model illustrates feedback between trophic levels."
      />

      <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <div className={`${card} space-y-5 p-6`}>
          <Slider
            label="Plant population"
            value={plants}
            min={0}
            max={100}
            onChange={setPlants}
            suffix="%"
          />

          <Slider
            label="Herbivore population"
            value={herbivores}
            min={0}
            max={100}
            onChange={setHerbivores}
            suffix="%"
          />

          <Slider
            label="Predator population"
            value={predators}
            min={0}
            max={100}
            onChange={setPredators}
            suffix="%"
          />

          <Slider
            label="Rainfall"
            value={rain}
            min={0}
            max={100}
            onChange={setRain}
            suffix="%"
          />
        </div>

        <div className={`${card} p-6`}>
          <div className="grid gap-4 md:grid-cols-3">
            {populations.map(([name, current, response]) => (
              <div
                key={name}
                className="rounded-2xl bg-slate-50 p-5"
              >
                <div className="text-sm font-bold text-slate-800">
                  {name}
                </div>

                <div className="mt-4 h-32 rounded-xl bg-white p-3">
                  <div className="flex h-full items-end">
                    <div
                      className="w-full rounded-t-xl bg-slate-800"
                      style={{
                        height: `${response}%`,
                        opacity:
                          0.35 + (current / 100) * 0.65,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Current: {current}%
                </div>

                <div className="mt-1 font-bold text-slate-900">
                  Response: {Math.round(response)}%
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-300">
            Ecosystems contain feedback loops. More predators can reduce
            herbivores; fewer herbivores can allow plant populations to recover;
            rainfall changes the resource base that supports the whole chain.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BiologyPage() {
  const [active, setActive] = useState<LabId>("overview");

  const content = {
    overview: <Overview setLab={setActive} />,
    molecular: <MolecularLab />,
    membrane: <MembraneLab />,
    photosynthesis: <PhotosynthesisLab />,
    plant: <PlantTransportLab />,
    heart: <HeartLab />,
    lungs: <LungLab />,
    nephron: <NephronLab />,
    microscope: <MicroscopeLab />,
    ecosystem: <EcosystemLab />,
  }[active];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-3 z-30 mb-8 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-lg backdrop-blur">
          <div className="flex min-w-max gap-1">
            {labs.map((lab) => (
              <button
                key={lab.id}
                onClick={() => setActive(lab.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active === lab.id
                    ? "bg-slate-950 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{lab.icon}</span>
                <span>{lab.title}</span>
              </button>
            ))}
          </div>
        </header>

        {content}

        <footer className="mt-16 border-t border-slate-200 py-8 text-sm text-slate-500">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>VGB Biology Systems Lab · Class XI</span>

            <span>
              Interactive models are conceptual learning tools, not clinical or
              laboratory predictions.
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
