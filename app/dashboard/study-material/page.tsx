"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  chapter: string | null;
  material_type: MaterialType;
  exam_type: ExamType | null;
  description: string | null;
  file_path: string | null;
  external_url: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

interface PortalProfile {
  email?: string;
  name?: string;
  role?: string;
  admin_status?: string;
}

const CLASSES = [
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
] as const;

const MATERIAL_TYPES: MaterialType[] = [
  "Notes",
  "Revision Sheet",
  "HOTS",
  "Previous Paper",
];

const EXAM_TYPES: ExamType[] = [
  "PT1",
  "Mid-Term",
  "PT2",
  "Annual",
];

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const TYPE_STYLES: Record<
  MaterialType,
  {
    icon: string;
    badge: string;
  }
> = {
  Notes: {
    icon: "📘",
    badge: "bg-blue-50 text-blue-700",
  },
  "Revision Sheet": {
    icon: "⚡",
    badge: "bg-amber-50 text-amber-700",
  },
  HOTS: {
    icon: "🧠",
    badge: "bg-purple-50 text-purple-700",
  },
  "Previous Paper": {
    icon: "📝",
    badge: "bg-emerald-50 text-emerald-700",
  },
};

export default function DashboardStudyMaterialPage() {
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterType, setFilterType] = useState<
    MaterialType | "All"
  >("All");

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(
    null
  );
  const [editingId, setEditingId] = useState<number | null>(
    null
  );
  const [savingEdit, setSavingEdit] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    classLevel: "XI",
    subject: "",
    chapter: "",
    materialType: "Notes" as MaterialType,
    examType: "" as ExamType | "",
    description: "",
  });

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [editForm, setEditForm] = useState({
    fileName: "",
    title: "",
    classLevel: "XI",
    subject: "",
    chapter: "",
    materialType: "Notes" as MaterialType,
    examType: "" as ExamType | "",
    description: "",
  });

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    setCheckingAccess(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfile(null);
      setCheckingAccess(false);
      return;
    }

    const { data, error } = await supabase.rpc(
      "get_my_portal_profile"
    );

    if (error) {
      console.error("Profile check failed:", error);

      setErrorMessage(
        "We couldn't verify your dashboard permissions."
      );

      setCheckingAccess(false);
      return;
    }

    const portalProfile = Array.isArray(data)
      ? data[0]
      : data;

    setProfile(portalProfile || null);
    setCheckingAccess(false);

    if (
      portalProfile?.admin_status?.toLowerCase() === "yes"
    ) {
      await fetchMaterials();
    }
  }

  async function fetchMaterials() {
    setLoadingMaterials(true);

    const { data, error } = await supabase
      .from("study_materials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Study material fetch failed:", error);

      setErrorMessage(
        "Unable to load the study material library."
      );

      setMaterials([]);
    } else {
      setMaterials((data || []) as StudyMaterial[]);
    }

    setLoadingMaterials(false);
  }

  const filteredMaterials = useMemo(() => {
    const query = search.trim().toLowerCase();

    return materials.filter((material) => {
      const matchesClass =
        filterClass === "All" ||
        material.class_level === filterClass;

      const matchesType =
        filterType === "All" ||
        material.material_type === filterType;

      const matchesSearch =
        !query ||
        [
          material.title,
          material.subject,
          material.chapter,
          material.description,
          material.class_level,
          material.exam_type,
          material.material_type,
          material.file_path,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          );

      return (
        matchesClass &&
        matchesType &&
        matchesSearch
      );
    });
  }, [materials, search, filterClass, filterType]);

  function updateForm(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateEditForm(
    field: keyof typeof editForm,
    value: string
  ) {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setErrorMessage("");
    setSuccessMessage("");

    const file = event.target.files?.[0] || null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension = `.${file.name
      .split(".")
      .pop()
      ?.toLowerCase()}`;

    const validType =
      ALLOWED_FILE_TYPES.includes(file.type) ||
      ALLOWED_EXTENSIONS.includes(extension);

    if (!validType) {
      setSelectedFile(null);
      event.target.value = "";

      setErrorMessage(
        "Unsupported file type. Please upload PDF, DOC, DOCX, PPT, PPTX, XLS, or XLSX."
      );

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      event.target.value = "";

      setErrorMessage(
        "The file is larger than 20 MB. Please upload a smaller file."
      );

      return;
    }

    setSelectedFile(file);
  }

  function getFileExtension(fileName: string) {
    const parts = fileName.split(".");

    if (parts.length < 2) {
      return "";
    }

    return `.${parts.pop()!.toLowerCase()}`;
  }

  function getBaseFileName(fileName: string) {
    const extension = getFileExtension(fileName);

    if (!extension) {
      return fileName;
    }

    return fileName.slice(
      0,
      fileName.length - extension.length
    );
  }

  function sanitizeFileName(fileName: string) {
    return fileName
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^\.+/, "")
      .slice(0, 120);
  }

  async function verifyAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    const { data: profileData, error: profileError } =
      await supabase.rpc("get_my_portal_profile");

    if (profileError) {
      throw new Error(
        "Unable to verify your administrator permissions."
      );
    }

    const currentProfile = Array.isArray(profileData)
      ? profileData[0]
      : profileData;

    if (
      currentProfile?.admin_status?.toLowerCase() !== "yes"
    ) {
      throw new Error(
        "You do not have permission to modify study material."
      );
    }

    return {
      user,
      profile: currentProfile as PortalProfile,
    };
  }

  async function handleUpload(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!form.title.trim()) {
      setErrorMessage("Please enter a title.");
      return;
    }

    if (!form.subject.trim()) {
      setErrorMessage("Please select a subject.");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("Please choose a file to upload.");
      return;
    }

    setUploading(true);

    try {
      const { user, profile: currentProfile } =
        await verifyAdmin();

      const extension =
        selectedFile.name.split(".").pop()?.toLowerCase() ||
        "file";

      const safeTitle = form.title
        .trim()
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 80);

      const uniqueId = crypto.randomUUID();

      const storagePath = [
        form.classLevel,
        form.subject
          .trim()
          .replace(/[^a-zA-Z0-9-_ ]/g, "")
          .replace(/\s+/g, "-"),
        `${uniqueId}-${safeTitle}.${extension}`,
      ].join("/");

      const { error: uploadError } =
        await supabase.storage
          .from("study-materials")
          .upload(storagePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
            contentType:
              selectedFile.type || undefined,
          });

      if (uploadError) {
        console.error(
          "Storage upload failed:",
          uploadError
        );

        throw new Error(
          uploadError.message ||
            "The file could not be uploaded."
        );
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("study-materials")
        .getPublicUrl(storagePath);

      const publicUrl =
        publicUrlData?.publicUrl || null;

      const { error: insertError } = await supabase
        .from("study_materials")
        .insert({
          title: form.title.trim(),
          class_level: form.classLevel,
          subject: form.subject.trim(),
          chapter: form.chapter.trim() || null,
          material_type: form.materialType,
          exam_type: form.examType || null,
          description:
            form.description.trim() || null,
          file_path: storagePath,
          external_url: publicUrl,
          uploaded_by:
            currentProfile?.email ||
            user.email ||
            null,
        });

      if (insertError) {
        await supabase.storage
          .from("study-materials")
          .remove([storagePath]);

        console.error(
          "Study material insert failed:",
          insertError
        );

        throw new Error(
          insertError.message ||
            "The material metadata could not be saved."
        );
      }

      setSuccessMessage(
        "Study material uploaded successfully."
      );

      resetForm();

      await fetchMaterials();
    } catch (error) {
      console.error("Upload failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading."
      );
    } finally {
      setUploading(false);
    }
  }

  function startEditing(material: StudyMaterial) {
    setErrorMessage("");
    setSuccessMessage("");

    const fileName = material.file_path
      ? material.file_path.split("/").pop() || ""
      : "";

    setEditForm({
      fileName,
      title: material.title,
      classLevel: material.class_level,
      subject: material.subject,
      chapter: material.chapter || "",
      materialType: material.material_type,
      examType: material.exam_type || "",
      description: material.description || "",
    });

    setEditingId(material.id);

    window.setTimeout(() => {
      document
        .getElementById(`edit-material-${material.id}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 50);
  }

  function cancelEditing() {
    if (savingEdit) {
      return;
    }

    setEditingId(null);
    setEditForm({
      fileName: "",
      title: "",
      classLevel: "XI",
      subject: "",
      chapter: "",
      materialType: "Notes",
      examType: "",
      description: "",
    });
  }

  async function handleEditSave(
    material: StudyMaterial
  ) {
    setErrorMessage("");
    setSuccessMessage("");

    if (!editForm.title.trim()) {
      setErrorMessage("Please enter a title.");
      return;
    }

    if (!editForm.subject.trim()) {
      setErrorMessage("Please select a subject.");
      return;
    }

    if (!editForm.fileName.trim()) {
      setErrorMessage("Please enter a file name.");
      return;
    }

    setSavingEdit(true);

    try {
      await verifyAdmin();

      const oldStoragePath = material.file_path;

      if (!oldStoragePath) {
        throw new Error(
          "This material does not have an associated Storage file."
        );
      }

      const oldFileName =
        oldStoragePath.split("/").pop() || "";

      const oldExtension =
        getFileExtension(oldFileName);

      const requestedExtension =
        getFileExtension(editForm.fileName);

      let cleanFileName = sanitizeFileName(
        editForm.fileName
      );

      if (!cleanFileName) {
        throw new Error(
          "Please enter a valid file name."
        );
      }

      if (!requestedExtension && oldExtension) {
        cleanFileName += oldExtension;
      }

      const finalExtension =
        getFileExtension(cleanFileName);

      if (
        !ALLOWED_EXTENSIONS.includes(finalExtension)
      ) {
        throw new Error(
          "Unsupported file extension. Please use PDF, DOC, DOCX, PPT, PPTX, XLS, or XLSX."
        );
      }

      const subjectFolder = editForm.subject
        .trim()
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .replace(/\s+/g, "-");

      const newStoragePath = [
        editForm.classLevel,
        subjectFolder,
        cleanFileName,
      ].join("/");

      const storagePathChanged =
        oldStoragePath !== newStoragePath;

      if (storagePathChanged) {
        const { error: moveError } =
          await supabase.storage
            .from("study-materials")
            .move(
              oldStoragePath,
              newStoragePath
            );

        if (moveError) {
          console.error(
            "Storage move failed:",
            moveError
          );

          throw new Error(
            moveError.message ||
              "The file could not be renamed or moved."
          );
        }
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("study-materials")
        .getPublicUrl(newStoragePath);

      const publicUrl =
        publicUrlData?.publicUrl || null;

      const { error: updateError } =
        await supabase
          .from("study_materials")
          .update({
            title: editForm.title.trim(),
            class_level: editForm.classLevel,
            subject: editForm.subject.trim(),
            chapter:
              editForm.chapter.trim() || null,
            material_type: editForm.materialType,
            exam_type: editForm.examType || null,
            description:
              editForm.description.trim() || null,
            file_path: newStoragePath,
            external_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", material.id);

      if (updateError) {
        console.error(
          "Study material update failed:",
          updateError
        );

        /*
         * If metadata update fails after a successful Storage
         * move, attempt to move the file back so the database
         * and Storage do not drift apart.
         */
        if (storagePathChanged) {
          const { error: rollbackError } =
            await supabase.storage
              .from("study-materials")
              .move(
                newStoragePath,
                oldStoragePath
              );

          if (rollbackError) {
            console.error(
              "Storage rollback failed:",
              rollbackError
            );
          }
        }

        throw new Error(
          updateError.message ||
            "The material details could not be updated."
        );
      }

      setMaterials((current) =>
        current.map((item) =>
          item.id === material.id
            ? {
                ...item,
                title: editForm.title.trim(),
                class_level: editForm.classLevel,
                subject: editForm.subject.trim(),
                chapter:
                  editForm.chapter.trim() || null,
                material_type:
                  editForm.materialType,
                exam_type:
                  editForm.examType || null,
                description:
                  editForm.description.trim() || null,
                file_path: newStoragePath,
                external_url: publicUrl,
                updated_at:
                  new Date().toISOString(),
              }
            : item
        )
      );

      setSuccessMessage(
        "Study material updated successfully."
      );

      cancelEditing();
    } catch (error) {
      console.error("Edit failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the material."
      );

      await fetchMaterials();
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(
    material: StudyMaterial
  ) {
    const confirmed = window.confirm(
      `Delete "${material.title}"?\n\nThis will remove both the database entry and the uploaded file.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(material.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await verifyAdmin();

      if (material.file_path) {
        const { error: storageError } =
          await supabase.storage
            .from("study-materials")
            .remove([material.file_path]);

        if (storageError) {
          console.error(
            "Storage deletion failed:",
            storageError
          );

          throw new Error(
            "The uploaded file could not be deleted, so the database record was left untouched."
          );
        }
      }

      const { error: deleteError } =
        await supabase
          .from("study_materials")
          .delete()
          .eq("id", material.id);

      if (deleteError) {
        console.error(
          "Database deletion failed:",
          deleteError
        );

        throw new Error(
          "The file was removed, but the database record could not be deleted."
        );
      }

      setMaterials((current) =>
        current.filter(
          (item) => item.id !== material.id
        )
      );

      setSuccessMessage(
        "Study material deleted successfully."
      );
    } catch (error) {
      console.error("Delete failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting."
      );

      await fetchMaterials();
    } finally {
      setDeletingId(null);
    }
  }

  function resetForm() {
    setForm({
      title: "",
      classLevel: "XI",
      subject: "",
      chapter: "",
      materialType: "Notes",
      examType: "",
      description: "",
    });

    setSelectedFile(null);

    const fileInput =
      document.getElementById(
        "study-material-file"
      ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  }

  if (checkingAccess) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="mt-4 h-10 w-80 rounded bg-slate-200" />
            <div className="mt-3 h-5 w-[28rem] max-w-full rounded bg-slate-100" />
            <div className="mt-10 h-80 rounded-3xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl">
            🔒
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Sign in required
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            You need to be signed in to access this dashboard.
          </p>
        </div>
      </main>
    );
  }

  if (profile.admin_status?.toLowerCase() !== "yes") {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
            🛡️
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Admin access required
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This section is restricted to authorised Student
            Council administrators.
          </p>

          <a
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Back to Dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Dashboard · Administration
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Study Material Manager
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Upload, organise, edit, and maintain the academic
                resources available to students through the
                Study Material library.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-lg font-bold text-slate-950">
                  {materials.length}
                </div>

                <div className="text-xs font-medium text-slate-500">
                  Total resources
                </div>
              </div>

              <a
                href="/study-material"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View Library ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {successMessage && (
          <div
            role="status"
            className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          >
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                ⬆️
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Upload Study Material
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Add a new resource to the student library.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleUpload}
            className="p-5 sm:p-7"
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <FormField label="Title" required>
                <input
                  value={form.title}
                  onChange={(e) =>
                    updateForm("title", e.target.value)
                  }
                  placeholder="e.g. Sets & Relations Notes"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Subject" required>
                <select
                  value={form.subject}
                  onChange={(e) =>
                    updateForm("subject", e.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">
                    Select subject
                  </option>

                  {SUBJECTS.map((subject) => (
                    <option
                      key={subject}
                      value={subject}
                    >
                      {subject}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Class" required>
                <select
                  value={form.classLevel}
                  onChange={(e) =>
                    updateForm(
                      "classLevel",
                      e.target.value
                    )
                  }
                  className={inputClass}
                >
                  {CLASSES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      Class {item}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Chapter">
                <input
                  value={form.chapter}
                  onChange={(e) =>
                    updateForm(
                      "chapter",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Sets"
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Material Type"
                required
              >
                <select
                  value={form.materialType}
                  onChange={(e) =>
                    updateForm(
                      "materialType",
                      e.target.value
                    )
                  }
                  className={inputClass}
                >
                  {MATERIAL_TYPES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Exam">
                <select
                  value={form.examType}
                  onChange={(e) =>
                    updateForm(
                      "examType",
                      e.target.value
                    )
                  }
                  className={inputClass}
                >
                  <option value="">
                    Not tied to a specific exam
                  </option>

                  {EXAM_TYPES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="lg:col-span-2">
                <FormField label="Description">
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      updateForm(
                        "description",
                        e.target.value
                      )
                    }
                    rows={3}
                    placeholder="Briefly describe what this resource contains..."
                    className={`${inputClass} resize-none`}
                  />
                </FormField>
              </div>

              <div className="lg:col-span-2">
                <FormField label="File" required>
                  <label
                    htmlFor="study-material-file"
                    className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center transition hover:border-blue-300 hover:bg-blue-50/40"
                  >
                    <span className="text-2xl">
                      {selectedFile
                        ? "📄"
                        : "📁"}
                    </span>

                    <span className="mt-2 text-sm font-semibold text-slate-700">
                      {selectedFile
                        ? selectedFile.name
                        : "Choose a study material file"}
                    </span>

                    <span className="mt-1 text-xs text-slate-400">
                      PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX · Max 20 MB
                    </span>

                    <input
                      id="study-material-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </FormField>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                disabled={uploading}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Clear
              </button>

              <button
                type="submit"
                disabled={uploading}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading
                  ? "Uploading..."
                  : "Upload Material"}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Library
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                Existing Material
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              {filteredMaterials.length} of{" "}
              {materials.length} resources
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[1fr_180px_190px]">
              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search title, subject, chapter, file name..."
                className={inputClass}
              />

              <select
                value={filterClass}
                onChange={(e) =>
                  setFilterClass(e.target.value)
                }
                className={inputClass}
              >
                <option value="All">
                  All Classes
                </option>

                {CLASSES.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    Class {item}
                  </option>
                ))}
              </select>

              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(
                    e.target.value as
                      | MaterialType
                      | "All"
                  )
                }
                className={inputClass}
              >
                <option value="All">
                  All Material Types
                </option>

                {MATERIAL_TYPES.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingMaterials ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 4 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-200" />

                    <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />

                    <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />

                    <div className="mt-6 h-10 rounded-xl bg-slate-100" />
                  </div>
                )
              )}
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📚
              </div>

              <h3 className="mt-5 font-bold text-slate-900">
                No resources found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {materials.length === 0
                  ? "Your study-material library is empty. Upload the first resource above."
                  : "No resources match the current search or filters."}
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {filteredMaterials.map(
                (material) => (
                  <MaterialAdminCard
                    key={material.id}
                    material={material}
                    deleting={
                      deletingId === material.id
                    }
                    editing={
                      editingId === material.id
                    }
                    savingEdit={
                      savingEdit &&
                      editingId === material.id
                    }
                    editForm={editForm}
                    onStartEdit={() =>
                      startEditing(material)
                    }
                    onCancelEdit={
                      cancelEditing
                    }
                    onEditFormChange={
                      updateEditForm
                    }
                    onSaveEdit={() =>
                      handleEditSave(material)
                    }
                    onDelete={() =>
                      handleDelete(material)
                    }
                  />
                )
              )}
            </div>
          )}
        </section>

        <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-xs leading-5 text-blue-800 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Files are stored securely in the{" "}
            <strong>study-materials</strong> Storage bucket.
          </span>

          <span>
            {SUBJECTS.length} subjects ·{" "}
            {materials.length} resources
          </span>
        </div>
      </section>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50";

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

function MaterialAdminCard({
  material,
  deleting,
  editing,
  savingEdit,
  editForm,
  onStartEdit,
  onCancelEdit,
  onEditFormChange,
  onSaveEdit,
  onDelete,
}: {
  material: StudyMaterial;
  deleting: boolean;
  editing: boolean;
  savingEdit: boolean;
  editForm: {
    fileName: string;
    title: string;
    classLevel: string;
    subject: string;
    chapter: string;
    materialType: MaterialType;
    examType: ExamType | "";
    description: string;
  };
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onEditFormChange: (
    field:
      | "fileName"
      | "title"
      | "classLevel"
      | "subject"
      | "chapter"
      | "materialType"
      | "examType"
      | "description",
    value: string
  ) => void;
  onSaveEdit: () => void;
  onDelete: () => void;
}) {
  const style =
    TYPE_STYLES[material.material_type];

  const currentFileName = material.file_path
    ? material.file_path.split("/").pop()
    : null;

  return (
    <article
      id={`edit-material-${material.id}`}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${style.badge}`}
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

            <span className="text-xs font-semibold text-slate-400">
              Class {material.class_level}
            </span>

            {material.exam_type && (
              <span className="text-xs font-semibold text-slate-400">
                · {material.exam_type}
              </span>
            )}
          </div>

          <h3 className="mt-2 truncate font-bold text-slate-900">
            {material.title}
          </h3>

          <p className="mt-1 text-xs font-semibold text-blue-600">
            {material.subject}
            {material.chapter
              ? ` · ${material.chapter}`
              : ""}
          </p>

          {material.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
              {material.description}
            </p>
          )}

          {editing ? (
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Edit Material
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Changes are saved to both the database and Storage.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <EditField
                  label="File Name"
                  required
                  className="sm:col-span-2"
                >
                  <input
                    value={editForm.fileName}
                    onChange={(e) =>
                      onEditFormChange(
                        "fileName",
                        e.target.value
                      )
                    }
                    placeholder="e.g. Sets-and-Relations-Notes.pdf"
                    className={inputClass}
                    disabled={savingEdit}
                  />

                  <p className="mt-1.5 text-[11px] text-slate-400">
                    The extension is preserved automatically if omitted.
                  </p>
                </EditField>

                <EditField
                  label="Title"
                  required
                >
                  <input
                    value={editForm.title}
                    onChange={(e) =>
                      onEditFormChange(
                        "title",
                        e.target.value
                      )
                    }
                    className={inputClass}
                    disabled={savingEdit}
                  />
                </EditField>

                <EditField
                  label="Class"
                  required
                >
                  <select
                    value={editForm.classLevel}
                    onChange={(e) =>
                      onEditFormChange(
                        "classLevel",
                        e.target.value
                      )
                    }
                    className={inputClass}
                    disabled={savingEdit}
                  >
                    {CLASSES.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        Class {item}
                      </option>
                    ))}
                  </select>
                </EditField>

                <EditField
                  label="Subject"
                  required
                >
                  <select
                    value={editForm.subject}
                    onChange={(e) =>
                      onEditFormChange(
                        "subject",
                        e.target.value
                      )
                    }
                    className={inputClass}
                    disabled={savingEdit}
                  >
                    <option value="">
                      Select subject
                    </option>

                    {SUBJECTS.map((subject) => (
                      <option
                        key={subject}
                        value={subject}
                      >
                        {subject}
                      </option>
                    ))}
                  </select>
                </EditField>

                <EditField label="Chapter">
                  <input
                    value={editForm.chapter}
                    onChange={(e) =>
                      onEditFormChange(
                        "chapter",
                        e.target.value
                      )
                    }
                    className={inputClass}
                    disabled={savingEdit}
                  />
                </EditField>

                <EditField
                  label="Material Type"
                  required
                >
                  <select
                    value={editForm.materialType}
                    onChange={(e) =>
                      onEditFormChange(
                        "materialType",
                        e.target.value
                      )
                    }
                    className={inputClass}
                    disabled={savingEdit}
                  >
                    {MATERIAL_TYPES.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </EditField>

                <EditField label="Exam">
                  <select
                    value={editForm.examType}
                    onChange={(e) =>
                      onEditFormChange(
                        "examType",
                        e.target.value
                      )
                    }
                    className={inputClass}
                    disabled={savingEdit}
                  >
                    <option value="">
                      Not tied to a specific exam
                    </option>

                    {EXAM_TYPES.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </EditField>

                <EditField
                  label="Description"
                  className="sm:col-span-2"
                >
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      onEditFormChange(
                        "description",
                        e.target.value
                      )
                    }
                    rows={3}
                    className={`${inputClass} resize-none`}
                    disabled={savingEdit}
                  />
                </EditField>
              </div>

              <div className="mt-4 flex flex-col-reverse gap-2 border-t border-blue-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onCancelEdit}
                  disabled={savingEdit}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onSaveEdit}
                  disabled={savingEdit}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingEdit
                    ? "Saving Changes..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentFileName && (
                <p className="mt-2 truncate text-[11px] text-slate-400">
                  📄 {currentFileName}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {material.external_url && (
                  <a
                    href={material.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
                  >
                    Open File ↗
                  </a>
                )}

                <button
                  type="button"
                  onClick={onStartEdit}
                  disabled={deleting}
                  className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleting}
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function EditField({
  label,
  required = false,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}
