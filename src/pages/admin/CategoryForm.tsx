import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";

import { getDivisionById } from "../../services/divisions.service";
import {
  addCategory,
  updateCategory,
} from "../../services/categories.service";

const DEFAULT_ICON = "Folder";

const LUCIDE_ICON_NAMES = Object.keys(Icons).filter(
  (name) => !["default", "createLucideIcon", "icons"].includes(name)
);

export default function CategoryForm() {
  const { divisionId, audienceId, streamId, categoryId } = useParams();
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [icon, setIcon] = useState(DEFAULT_ICON);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showIconDropdown, setShowIconDropdown] = useState(false);

  /* ---------------------------------------------
     LOAD CATEGORY (EDIT MODE)
  --------------------------------------------- */
  useEffect(() => {
    const loadCategory = async () => {
      if (
        !divisionId ||
        !audienceId ||
        !streamId ||
        !categoryId ||
        categoryId === "new"
      ) {
        setIsLoading(false);
        return;
      }

      try {
        const division = await getDivisionById(divisionId);
        const audience = division?.audiences?.find(
          (a: any) => a.id === audienceId
        );
        const stream = audience?.streams?.find(
          (s: any) => s.id === streamId
        );
        const category = stream?.categories?.find(
          (c: any) => c.id === categoryId
        );

        if (!category) {
          setError("Category not found");
          return;
        }

        setTitle(category.title || "");
        setDescription(category.description || "");

        setIcon(category.icon || DEFAULT_ICON);
      } catch {
        setError("Failed to load category data");
      } finally {
        setIsLoading(false);
      }
    };

    loadCategory();
  }, [divisionId, audienceId, streamId, categoryId]);

  /* ---------------- ICON PREVIEW ---------------- */
  const PreviewIcon =
    (Icons as any)[icon] || (Icons as any)[DEFAULT_ICON];

  const filteredIcons = icon
    ? LUCIDE_ICON_NAMES.filter((name) =>
        name.toLowerCase().includes(icon.toLowerCase())
      ).slice(0, 20)
    : [];

  /* ---------------------------------------------
     SAVE CATEGORY
  --------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    if (!divisionId || !audienceId || !streamId) return;

    try {
      setIsSaving(true);
      setError("");

      const payload = {
  title: title.trim(),
  description: description.trim(), // 👈 IMPORTANT
  icon: icon || DEFAULT_ICON,
};


      if (categoryId && categoryId !== "new") {
        await updateCategory(
          divisionId,
          audienceId,
          streamId,
          categoryId,
          payload
        );
      } else {
        await addCategory(
          divisionId,
          audienceId,
          streamId,
          payload
        );
      }

      navigate(
        `/admin/division/${divisionId}/audience/${audienceId}/stream/${streamId}?t=${Date.now()}`
      );
    } catch (err: any) {
      setError(err?.message || "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-gray-500 text-center">
        Loading category data…
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 bg-gray-100">
      <h2 className="text-2xl font-bold">
        {categoryId && categoryId !== "new"
          ? "Edit Category"
          : "Add Category"}
      </h2>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* TITLE */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSaving}
          />
        </div>

        {/* CATEGORY DESCRIPTION */}
        <div>
          <label className="block mb-1 font-medium">
            Category Description
            <span className="ml-1 text-xs text-gray-500">
              (shown on category page)
            </span>
          </label>
         <textarea
          className="w-full p-2 border rounded"
            rows={3}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>

        </div>

        {/* ICON */}
        <div>
          <label className="block mb-1 font-medium">Lucide Icon</label>

          <div className="relative">
            <div className="flex gap-3">
              <input
                className="flex-1 p-2 border rounded"
                value={icon}
                onChange={(e) => {
                  setIcon(e.target.value);
                  setShowIconDropdown(true);
                }}
                onFocus={() => setShowIconDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowIconDropdown(false), 150)
                }
                disabled={isSaving}
              />

              <div className="w-16 h-12 border rounded flex items-center justify-center">
                <PreviewIcon size={28} />
              </div>
            </div>

            {showIconDropdown && (
              <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded border bg-white shadow-lg">
                {filteredIcons.length ? (
                  filteredIcons.map((name) => {
                    const IconItem = (Icons as any)[name];
                    return (
                      <div
                        key={name}
                        onClick={() => {
                          setIcon(name);
                          setShowIconDropdown(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        <IconItem size={18} />
                        <span className="text-sm">{name}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No icons found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Category"}
        </button>
      </form>
    </div>
  );
}
