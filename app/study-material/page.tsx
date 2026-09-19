"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.lllmgmfofwczpqbmigey!;
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbG1nbWZvZndjenBxYm1pZ2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTIxNzYsImV4cCI6MjEwNTEyODE3Nn0.H_YfM8J3ZOy-B1lH7jgc4JtHu4rhUsigZ72qoI-b1ss!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type MaterialType =
  | "Notes"
  | "Revision Sheet"
  | "HOTS"
  | "Previous Paper";

type ExamType = "PT1" | "Mid-Term" | "PT2" | "Annual";

interface StudyMaterial {
  id: number;
  title: string;
  class_level: string;
  subject: string;
  chapter?: string | null;
  material_type: MaterialType;
  exam_type?: ExamType | null;
  description?: string | null;
  file_path?: string | null;
  external_url?: string | null;
  uploaded_by?: string | null;
  created_at: string;
  updated_at: string;
}

const CLASSES = ["All", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

const MATERIAL_TYPES: {
  value: MaterialType;
  label: string;
  description: string;
}[] = [
  {
    value: "Notes",
    label: "Notes",
    description: "Detailed chapter-wise study material",
  },
  {
    value: "Revision Sheet",
    label: "Revision Sheets",
    description: "Compact material for quick revision",
  },
  {
    value: "HOTS",
    label: "HOTS",
    description: "Higher-order thinking and application questions",
  },
  {
    value: "Previous Paper",
    label: "Previous Papers",
    description: "Actual VidyaGyan examination papers",
  },
];

const EXAM_TYPES: ExamType[] = [
  "PT1",
  "Mid-Term",
  "PT2",
  "Annual",
];

const TYPE_STYLES: Record<
  MaterialType,
  {
    icon: string;
    badge: string;
    accent: string;
  }
> = {
  Notes: {
    icon: "📘",
    badge: "bg-blue-50 text-blue-700",
    accent: "border-blue-200",
  },
  "Revision Sheet": {
    icon: "⚡",
    badge: "bg-amber-50 text-amber-700",
    accent: "border-amber-200",
  },
  HOTS: {
    icon: "🧠",
    badge: "bg-purple-50 text-purple-700",
    accent: "border-purple-200",
  },
  "Previous Paper": {
    icon: "📝",
    badge: "bg-emerald-50 text-emerald-700",
    accent: "border-emerald-200",
  },
};

export default function StudyMaterialPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedType, setSelectedType] = useState<
    MaterialType | "All"
  >("All");
  const [selectedExam, setSelectedExam] = useState<ExamType | "All">(
    "All"
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("study_materials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Study material fetch failed:", error);
      setError(
        "We couldn't load the study material right now. Please try again."
      );
      setMaterials([]);
    } else {
      setMaterials((data || []) as StudyMaterial[]);
    }

    setLoading(false);
  }

  const subjects = useMemo(() => {
    const uniqueSubjects = Array.from(
      new Set(
        materials
          .map((material) => material.subject)
          .filter(Boolean)
      )
    );

    return ["All", ...uniqueSubjects.sort()];
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    const query = search.trim().toLowerCase();

    return materials.filter((material) => {
      const matchesClass =
        selectedClass === "All" ||
        material.class_level === selectedClass;

      const matchesSubject =
        selectedSubject === "All" ||
        material.subject === selectedSubject;

      const matchesType =
        selectedType === "All" ||
        material.material_type === selectedType;

      const matchesExam =
        selectedExam === "All" ||
        material.exam_type === selectedExam;

      const matchesSearch =
        !query ||
        [
          material.title,
          material.subject,
          material.chapter,
          material.description,
          material.class_level,
          material.exam_type,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          );

      return (
        matchesClass &&
        matchesSubject &&
        matchesType &&
        matchesExam &&
        matchesSearch
      );
    });
  }, [
    materials,
    selectedClass,
    selectedSubject,
    selectedType,
    selectedExam,
    search,
  ]);

  const groupedMaterials = useMemo(() => {
    const groups: Record<string, StudyMaterial[]> = {};

    for (const material of filteredMaterials) {
      const key = material.subject || "Other";

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(material);
    }

    return Object.entries(groups).sort(([a], [b]) =>
      a.localeCompare(b)
    );
  }, [filteredMaterials]);

  const resetFilters = () => {
    setSelectedClass("All");
    setSelectedSubject("All");
    setSelectedType("All");
    setSelectedExam("All");
    setSearch("");
  };

  const hasActiveFilters =
    selectedClass !== "All" ||
    selectedSubject !== "All" ||
    selectedType !== "All" ||
    selectedExam !== "All" ||
    search.trim() !== "";

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              VidyaGyan Academic Resources
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Study Material
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Everything you need to prepare, practise, and revise.
              Find chapter-wise notes, revision sheets, HOTS questions,
              and previous VidyaGyan examination papers in one place.
            </p>
          </div>

          {/* QUICK STATS */}
          <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              value={materials.length}
              label="Resources"
            />
            <StatCard
              value={
                new Set(materials.map((material) => material.subject))
                  .size
              }
              label="Subjects"
            />
            <StatCard
              value={
                new Set(materials.map((material) => material.class_level))
                  .size
              }
              label="Classes"
            />
            <StatCard
              value={
                materials.filter(
                  (material) =>
                    material.material_type === "Previous Paper"
                ).length
              }
              label="Papers"
            />
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* FILTER PANEL */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          {/* SEARCH */}
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes, chapters, subjects, papers..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          {/* CLASS FILTER */}
          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Class
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {CLASSES.map((className) => {
                const active = selectedClass === className;

                return (
                  <button
                    key={className}
                    type="button"
                    onClick={() => setSelectedClass(className)}
                    className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {className === "All"
                      ? "All Classes"
                      : `Class ${className}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECONDARY FILTERS */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Subject"
              value={selectedSubject}
              options={subjects}
              onChange={setSelectedSubject}
            />

            <FilterSelect
              label="Material Type"
              value={selectedType}
              options={["All", ...MATERIAL_TYPES.map((item) => item.value)]}
              onChange={(value) =>
                setSelectedType(value as MaterialType | "All")
              }
            />

            <FilterSelect
              label="Exam"
              value={selectedExam}
              options={["All", ...EXAM_TYPES]}
              onChange={(value) =>
                setSelectedExam(value as ExamType | "All")
              }
            />

            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* MATERIAL TYPE GUIDE */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MATERIAL_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() =>
                setSelectedType(
                  selectedType === type.value ? "All" : type.value
                )
              }
              className={`rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                selectedType === type.value
                  ? "border-slate-900 shadow-sm"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${TYPE_STYLES[type.value].badge}`}
                >
                  {TYPE_STYLES[type.value].icon}
                </div>

                {selectedType === type.value && (
                  <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Selected
                  </span>
                )}
              </div>

              <h2 className="mt-3 text-sm font-bold text-slate-900">
                {type.label}
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {type.description}
              </p>
            </button>
          ))}
        </div>

        {/* RESULTS HEADER */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Library
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              {selectedClass === "All"
                ? "All Study Material"
                : `Class ${selectedClass} Material`}
            </h2>
          </div>

          <p className="text-sm text-slate-500">
            {loading
              ? "Loading resources..."
              : `${filteredMaterials.length} ${
                  filteredMaterials.length === 1
                    ? "resource"
                    : "resources"
                } found`}
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-200" />
                <div className="mt-5 h-4 w-3/4 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
                <div className="mt-6 h-3 w-full rounded bg-slate-100" />
                <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
            <h3 className="font-bold text-red-900">
              Unable to load study material
            </h3>

            <p className="mt-1 text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={fetchMaterials}
              className="mt-4 rounded-xl bg-red-900 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* RESULTS */}
        {!loading && !error && filteredMaterials.length > 0 && (
          <div className="mt-6 space-y-10">
            {groupedMaterials.map(([subject, subjectMaterials]) => (
              <section key={subject}>
                <div className="mb-4 flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    {subject}
                  </h3>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                    {subjectMaterials.length}
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {subjectMaterials.map((material) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading &&
          !error &&
          filteredMaterials.length === 0 && (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📚
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No study material found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                There is no material matching the current filters.
                Try another class, subject, material type, or search
                term.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTS                                                                 */
/* -------------------------------------------------------------------------- */

function StatCard({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-2xl font-bold text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-500">
        {label}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "All" ? `All ${label}s` : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function MaterialCard({
  material,
}: {
  material: StudyMaterial;
}) {
  const style = TYPE_STYLES[material.material_type];

  const resourceUrl =
    material.external_url || material.file_path || null;

  return (
    <article
      className={`group flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${style.accent}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${style.badge}`}
        >
          {style.icon}
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${style.badge}`}
        >
          {material.material_type}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
          <span>Class {material.class_level}</span>

          <span>•</span>

          <span>{material.subject}</span>

          {material.exam_type && (
            <>
              <span>•</span>
              <span>{material.exam_type}</span>
            </>
          )}
        </div>

        <h3 className="mt-2 text-base font-bold leading-6 text-slate-900">
          {material.title}
        </h3>

        {material.chapter && (
          <p className="mt-1 text-xs font-semibold text-blue-600">
            {material.chapter}
          </p>
        )}

        {material.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
            {material.description}
          </p>
        )}
      </div>

      <div className="mt-auto pt-6">
        {resourceUrl ? (
          <a
            href={resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Open Material
            <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <div className="rounded-xl bg-slate-100 px-4 py-2.5 text-center text-sm font-semibold text-slate-400">
            Material coming soon
          </div>
        )}
      </div>
    </article>
  );
}
