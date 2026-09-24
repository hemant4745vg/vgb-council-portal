"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

type MaterialType =
  | "Notes/Reading Material"
  | "Revision Sheets"
  | "HOTS"
  | "Question Paper"
  | "Previous Year Paper"
  | "Book"
  | "Other";

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
  file_size_bytes?: number | null;
  uploaded_by?: string | null;
  created_at: string;
  updated_at: string;
}

const CLASSES = [
  "All",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

const SUBJECTS = [
  "English",
  "Hindi",
  "Mathematics",
  "Applied Mathematics",
  "Science",
  "Social Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Political Science",
  "History",
  "Geography",
  "Accountancy",
  "Business Studies",
  "Informatics Practices",
  "Information Technology",
  "Artificial Intelligence",
  "Sanskrit",
  "Psychology",
  "Sociology",
  "Physical Education",
  "Painting",
];

const MATERIAL_TYPES: {
  value: MaterialType;
  label: string;
  description: string;
}[] = [
  {
    value: "Notes/Reading Material",
    label: "Notes/Reading Material",
    description:
      "Detailed chapter-wise study and reading material",
  },
  {
    value: "Revision Sheets",
    label: "Revision Sheets",
    description:
      "Compact material for quick revision",
  },
  {
    value: "HOTS",
    label: "HOTS",
    description:
      "Higher-order thinking and application questions",
  },
  {
    value: "Question Paper",
    label: "Question Paper",
    description:
      "Practice papers and assessment material",
  },
  {
    value: "Previous Year Paper",
    label: "Previous Year Paper",
    description:
      "Previous examination papers",
  },
  {
    value: "Book",
    label: "Book",
    description:
      "Books and longer reference resources",
  },
  {
    value: "Other",
    label: "Other",
    description:
      "Other useful academic resources",
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
  "Notes/Reading Material": {
    icon: "📘",
    badge: "bg-blue-50 text-blue-700",
    accent: "border-blue-200",
  },
  "Revision Sheets": {
    icon: "⚡",
    badge: "bg-amber-50 text-amber-700",
    accent: "border-amber-200",
  },
  HOTS: {
    icon: "🧠",
    badge: "bg-purple-50 text-purple-700",
    accent: "border-purple-200",
  },
  "Question Paper": {
    icon: "📝",
    badge: "bg-emerald-50 text-emerald-700",
    accent: "border-emerald-200",
  },
  "Previous Year Paper": {
    icon: "📚",
    badge: "bg-indigo-50 text-indigo-700",
    accent: "border-indigo-200",
  },
  Book: {
    icon: "📖",
    badge: "bg-rose-50 text-rose-700",
    accent: "border-rose-200",
  },
  Other: {
    icon: "📎",
    badge: "bg-slate-100 text-slate-700",
    accent: "border-slate-200",
  },
};

function getTypeStyle(materialType: string) {
  return (
    TYPE_STYLES[materialType as MaterialType] ??
    TYPE_STYLES.Other
  );
}

function normalizeMaterialType(value: unknown): MaterialType {
  const normalized = String(value ?? "").trim();

  switch (normalized) {
    case "Notes":
    case "Reading Material":
    case "Notes/Reading Material":
      return "Notes/Reading Material";

    case "Revision Sheet":
    case "Revision Sheets":
      return "Revision Sheets";

    case "HOTS":
      return "HOTS";

    case "Question Paper":
      return "Question Paper";

    case "Previous Paper":
    case "Previous Year Paper":
      return "Previous Year Paper";

    case "Book":
      return "Book";

    case "Other":
      return "Other";

    default:
      return "Other";
  }
}

function normalizeExamType(
  value: unknown
): ExamType | null {
  const normalized = String(value ?? "").trim();

  if (
    normalized === "PT1" ||
    normalized === "Mid-Term" ||
    normalized === "PT2" ||
    normalized === "Annual"
  ) {
    return normalized;
  }

  return null;
}

function normalizeMaterial(
  value: Record<string, unknown>
): StudyMaterial {
  return {
    id: Number(value.id),
    title: String(value.title ?? "").trim(),
    class_level: String(
      value.class_level ?? ""
    ).trim(),
    subject: String(value.subject ?? "").trim(),

    chapter:
      value.chapter === null ||
      value.chapter === undefined
        ? null
        : String(value.chapter).trim() || null,

    material_type: normalizeMaterialType(
      value.material_type
    ),

    exam_type: normalizeExamType(value.exam_type),

    description:
      value.description === null ||
      value.description === undefined
        ? null
        : String(value.description).trim() || null,

    file_path:
      value.file_path === null ||
      value.file_path === undefined
        ? null
        : String(value.file_path).trim() || null,

    external_url:
      value.external_url === null ||
      value.external_url === undefined
        ? null
        : String(value.external_url).trim() || null,

    file_size_bytes:
      value.file_size_bytes === null ||
      value.file_size_bytes === undefined
        ? null
        : Number(value.file_size_bytes),

    uploaded_by:
      value.uploaded_by === null ||
      value.uploaded_by === undefined
        ? null
        : String(value.uploaded_by).trim() || null,

    created_at: String(
      value.created_at ?? ""
    ),

    updated_at: String(
      value.updated_at ?? ""
    ),
  };
}

function getExternalProvider(
  value: string
): "OneDrive" | "Google Drive" | "External Link" {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();

    if (
      host === "shivnadarfoundation-my.sharepoint.com" ||
      host === "sharepoint.com" ||
      host.endsWith(".sharepoint.com") ||
      host === "1drv.ms" ||
      host === "onedrive.live.com"
    ) {
      return "OneDrive";
    }

    if (
      host === "drive.google.com" ||
      host.endsWith(".drive.google.com") ||
      host === "docs.google.com" ||
      host.endsWith(".docs.google.com")
    ) {
      return "Google Drive";
    }

    return "External Link";
  } catch {
    return "External Link";
  }
}

function isPdfUrl(
  value: string | null | undefined
) {
  if (!value) return false;

  try {
    const url = new URL(value);

    return url.pathname
      .toLowerCase()
      .endsWith(".pdf");
  } catch {
    return value
      .split("?")[0]
      .split("#")[0]
      .toLowerCase()
      .endsWith(".pdf");
  }
}

function appendDownloadParameter(value: string) {
  if (!value) return value;

  try {
    const url = new URL(value);

    if (!url.searchParams.has("download")) {
      url.searchParams.set("download", "");
    }

    return url.toString();
  } catch {
    return value.includes("?")
      ? `${value}&download`
      : `${value}?download`;
  }
}

export default function StudyMaterialPage() {
  const [materials, setMaterials] = useState<
    StudyMaterial[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedClass, setSelectedClass] =
    useState("All");

  const [selectedSubject, setSelectedSubject] =
    useState("All");

  const [selectedType, setSelectedType] = useState<
    MaterialType | "All"
  >("All");

  const [selectedExam, setSelectedExam] = useState<
    ExamType | "All"
  >("All");

  const [search, setSearch] = useState("");

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("study_materials")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (fetchError) {
      console.error(
        "Study material fetch failed:",
        fetchError
      );

      setError(
        "We couldn't load the study material right now. Please try again."
      );

      setMaterials([]);
      setLoading(false);
      return;
    }

    const normalizedMaterials = (
      (data || []) as Record<string, unknown>[]
    )
      .map(normalizeMaterial)
      .filter(
        (material) =>
          Number.isFinite(material.id) &&
          material.title.length > 0
      );

    setMaterials(normalizedMaterials);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchMaterials();
  }, [fetchMaterials]);

  const subjects = useMemo(() => {
    return ["All", ...SUBJECTS];
  }, []);

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

      const searchableValues = [
        material.title,
        material.subject,
        material.chapter,
        material.description,
        material.class_level,
        material.exam_type,
        material.material_type,
      ];

      const matchesSearch =
        !query ||
        searchableValues
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query)
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
    const groups: Record<
      string,
      StudyMaterial[]
    > = {};

    for (const material of filteredMaterials) {
      const key =
        material.subject || "Other";

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(material);
    }

    return Object.entries(groups).sort(
      ([a], [b]) => a.localeCompare(b)
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
              Everything you need to prepare, practise,
              and revise. Find chapter-wise notes,
              revision sheets, HOTS questions, and
              previous VidyaGyan examination papers in
              one place.
            </p>
          </div>

          {/* STATS */}
          <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              value={materials.length}
              label="Resources"
            />

            <StatCard
              value={
                new Set(
                  materials
                    .map(
                      (material) =>
                        material.subject.trim()
                    )
                    .filter(Boolean)
                ).size
              }
              label="Subjects"
            />

            <StatCard
              value={
                new Set(
                  materials
                    .map(
                      (material) =>
                        material.class_level.trim()
                    )
                    .filter(Boolean)
                ).size
              }
              label="Classes"
            />

            <StatCard
              value={
                materials.filter(
                  (material) =>
                    material.material_type ===
                    "Previous Year Paper"
                ).length
              }
              label="Papers"
            />
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
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
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search notes, chapters, subjects, papers..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              aria-label="Search study material"
            />
          </div>

          {/* CLASS */}
          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Class
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {CLASSES.map((className) => {
                const active =
                  selectedClass === className;

                return (
                  <button
                    key={className}
                    type="button"
                    onClick={() =>
                      setSelectedClass(className)
                    }
                    aria-pressed={active}
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
              options={[
                "All",
                ...MATERIAL_TYPES.map(
                  (item) => item.value
                ),
              ]}
              onChange={(value) =>
                setSelectedType(
                  value as MaterialType | "All"
                )
              }
            />

            <FilterSelect
              label="Exam"
              value={selectedExam}
              options={["All", ...EXAM_TYPES]}
              onChange={(value) =>
                setSelectedExam(
                  value as ExamType | "All"
                )
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

        {/* MATERIAL TYPE CARDS */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MATERIAL_TYPES.map((type) => {
            const typeStyle =
              TYPE_STYLES[type.value];

            const selected =
              selectedType === type.value;

            return (
              <button
                key={type.value}
                type="button"
                onClick={() =>
                  setSelectedType(
                    selected ? "All" : type.value
                  )
                }
                aria-pressed={selected}
                className={`rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                  selected
                    ? "border-slate-900 shadow-sm"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${typeStyle.badge}`}
                  >
                    {typeStyle.icon}
                  </div>

                  {selected && (
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
            );
          })}
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
            {Array.from({ length: 6 }).map(
              (_, index) => (
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
              )
            )}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
            <h3 className="font-bold text-red-900">
              Unable to load study material
            </h3>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void fetchMaterials()}
              className="mt-4 rounded-xl bg-red-900 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* RESULTS */}
        {!loading &&
          !error &&
          filteredMaterials.length > 0 && (
            <div className="mt-6 space-y-10">
              {groupedMaterials.map(
                ([subject, subjectMaterials]) => (
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
                      {subjectMaterials.map(
                        (material) => (
                          <MaterialCard
                            key={material.id}
                            material={material}
                          />
                        )
                      )}
                    </div>
                  </section>
                )
              )}
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
                There is no material matching the
                current filters. Try another class,
                subject, material type, or search term.
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
      <div className="text-2xl font-bold text-slate-950">
        {value}
      </div>

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
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "All"
              ? `All ${
                  label === "Exam"
                    ? "Exams"
                    : label === "Material Type"
                    ? "Material Types"
                    : `${label}s`
                }`
              : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatFileSize(
  bytes?: number | null
) {
  if (
    !Number.isFinite(bytes) ||
    bytes === null ||
    bytes === undefined ||
    bytes <= 0
  ) {
    return null;
  }

  const units = ["B", "KB", "MB", "GB"];

  let size = bytes;
  let unitIndex = 0;

  while (
    size >= 1024 &&
    unitIndex < units.length - 1
  ) {
    size /= 1024;
    unitIndex++;
  }

  const decimals =
    unitIndex === 0
      ? 0
      : size >= 10
      ? 1
      : 2;

  return `${size.toFixed(decimals)} ${units[unitIndex]}`;
}

function MaterialCard({
  material,
}: {
  material: StudyMaterial;
}) {
  const style = getTypeStyle(
    material.material_type
  );

  const resourceUrl =
    material.external_url ||
    material.file_path ||
    null;

  const [previewOpen, setPreviewOpen] =
    useState(false);

  const fileName =
    material.file_path
      ?.split("/")
      .pop() ||
    material.title;

  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase() || "";

  const isPdf =
    extension === "pdf" ||
    isPdfUrl(material.external_url);

  const formattedFileSize =
    formatFileSize(
      material.file_size_bytes
    );

  const fileType =
    extension &&
    extension !== fileName.toLowerCase()
      ? extension.toUpperCase()
      : null;

  /*
   * IMPORTANT:
   *
   * A Supabase-uploaded file has a file_path.
   * Its external_url is simply the public Supabase
   * Storage URL generated for that file.
   *
   * Therefore, external_url alone must NOT be used
   * to decide whether the resource is external.
   */
  const isSupabaseFile =
    Boolean(material.file_path);

  const externalProvider =
    !isSupabaseFile &&
    material.external_url
      ? getExternalProvider(
          material.external_url
        )
      : null;

  const officePreviewUrl = resourceUrl
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        resourceUrl
      )}`
    : null;

  const downloadUrl = resourceUrl
    ? appendDownloadParameter(resourceUrl)
    : null;

  return (
    <>
      <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
        <div className="flex gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl ${style.accent}`}
            aria-hidden="true"
          >
            {style.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${style.badge}`}
              >
                {material.material_type}
              </span>

              {material.class_level && (
                <span className="text-xs font-semibold text-slate-400">
                  Class {material.class_level}
                </span>
              )}

              {material.exam_type && (
                <span className="text-xs font-semibold text-slate-400">
                  · {material.exam_type}
                </span>
              )}
            </div>

            <h3 className="mt-2 text-base font-bold text-slate-950">
              {material.title}
            </h3>

            {material.subject && (
              <p className="mt-1 text-xs font-semibold text-blue-600">
                {material.subject}
                {material.chapter
                  ? ` · ${material.chapter}`
                  : ""}
              </p>
            )}

            {/* FILE / RESOURCE METADATA */}
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-slate-400">
              {isSupabaseFile ? (
                <>
                  {fileType && (
                    <span>{fileType}</span>
                  )}

                  {fileType &&
                    formattedFileSize && (
                      <span>·</span>
                    )}

                  {formattedFileSize && (
                    <span>
                      {formattedFileSize}
                    </span>
                  )}
                </>
              ) : externalProvider ? (
                <span>
                  {externalProvider}
                </span>
              ) : (
                <>
                  {fileType && (
                    <span>{fileType}</span>
                  )}

                  {fileType &&
                    formattedFileSize && (
                      <span>·</span>
                    )}

                  {formattedFileSize && (
                    <span>
                      {formattedFileSize}
                    </span>
                  )}
                </>
              )}
            </div>

            {material.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
                {material.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {resourceUrl ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewOpen(true)
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-600"
                  >
                    <span aria-hidden="true">
                      👁
                    </span>
                    Preview
                  </button>

                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <span aria-hidden="true">
                        ↓
                      </span>
                      Download
                    </a>
                  )}
                </>
              ) : (
                <span className="text-xs font-medium text-slate-400">
                  Material coming soon
                </span>
              )}
            </div>
          </div>
        </div>
      </article>

      {previewOpen && resourceUrl && (
        <PreviewModal
          title={material.title}
          resourceUrl={resourceUrl}
          officePreviewUrl={
            officePreviewUrl
          }
          isPdf={isPdf}
          downloadUrl={downloadUrl}
          onClose={() =>
            setPreviewOpen(false)
          }
        />
      )}
    </>
  );
}

function PreviewModal({
  title,
  resourceUrl,
  officePreviewUrl,
  isPdf,
  downloadUrl,
  onClose,
}: {
  title: string;
  resourceUrl: string;
  officePreviewUrl: string | null;
  isPdf: boolean;
  downloadUrl: string | null;
  onClose: () => void;
}) {
  const previewUrl = isPdf
    ? resourceUrl
    : officePreviewUrl;

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${title}`}
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-950 sm:text-base">
              {title}
            </h2>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Preview
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
              >
                ↓ Download
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              ×
            </button>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="min-h-0 flex-1 bg-slate-100">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              title={`Preview of ${title}`}
              className="h-full w-full border-0"
              allow="fullscreen"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center">
              <div>
                <div
                  className="text-4xl"
                  aria-hidden="true"
                >
                  📄
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  Preview unavailable
                </h3>

                <p className="mt-2 max-w-md text-sm text-slate-500">
                  This file cannot be previewed in
                  the browser. You can download it
                  instead.
                </p>

                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Download file
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MOBILE FOOTER */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:hidden">
          <span className="text-xs text-slate-400">
            Preview only
          </span>

          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            >
              ↓ Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
