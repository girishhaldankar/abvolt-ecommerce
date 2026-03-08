// src/components/admin/AudienceForm.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as Icons from "lucide-react";
import { getDivisionById } from "../../services/divisions.service";
import { addAudience, updateAudience } from "../../services/audiences.service";


type Props = {
  divisionId?: string;
  audienceId?: string;
  onSave?: (audience: any) => void;
};

/* ---------------------------------------------
   LUCIDE ICON LIST
--------------------------------------------- */
const LUCIDE_ICON_NAMES = Object.keys(Icons).filter(
  (name) => !["default", "createLucideIcon", "icons"].includes(name)
);

export default function AudienceForm({
  divisionId: propDivisionId,
  audienceId: propAudienceId,
  onSave,
}: Props) {
  const { divisionId: paramDivisionId, audienceId: paramAudienceId } = useParams();

  const divisionId = propDivisionId || paramDivisionId;
  const audienceId = propAudienceId || paramAudienceId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showIconDropdown, setShowIconDropdown] = useState(false);

  /* ---------------------------------------------
     LOAD AUDIENCE IF EDIT
  --------------------------------------------- */
  useEffect(() => {
    if (!divisionId || !audienceId || audienceId === "new") return;

    setIsLoading(true);
    getDivisionById(divisionId)
      .then((division) => {
        const audience = division?.audiences?.find(
          (a: any) => a.id === audienceId
        );
        if (!audience) {
          setError("Audience not found");
          return;
        }
        setTitle(audience.title || "");
        setDescription(audience.description || "");
        setIcon(audience.icon || "");
      })
      .catch(() => setError("Failed to load audience data"))
      .finally(() => setIsLoading(false));
  }, [divisionId, audienceId]);

  const PreviewIcon = (Icons as any)[icon];

  /* ---------------------------------------------
     SAVE AUDIENCE
  --------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");
    if (!divisionId) return alert("Division ID missing");

    try {
      setIsSaving(true);
      setError("");

      const data = { title, description, icon };

      if (!audienceId || audienceId === "new") {
        // Add new audience
        const newAudience = await addAudience(divisionId, data);
        if (onSave) onSave(newAudience);
      } else {
        // Update existing audience
        const updatedAudience = await updateAudience(divisionId, audienceId, data);
        if (onSave) onSave(updatedAudience);
      }

      if (!onSave) {
        // Reload page if no callback
        window.location.href = `/admin/division/${divisionId}?t=${Date.now()}`;
      }
    } catch (err: any) {
      setError(err.message || "Failed to save audience");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading audience data…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-gray-100">
      <h2 className="text-2xl font-bold">
        {audienceId && audienceId !== "new" ? "Edit Audience" : "Add Audience"}
      </h2>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* TITLE */}
        <div>
          <label className="block mb-1 font-medium">Title *</label>
          <input
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSaving}
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSaving}
          />
        </div>

        {/* ICON */}
        <div>
          <label className="block mb-1 font-medium">Lucide Icon</label>
          <div className="relative">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type icon name (Users, BookOpen…) "
                className="flex-1 p-2 border rounded"
                value={icon}
                onChange={(e) => {
                  setIcon(e.target.value);
                  setShowIconDropdown(true);
                }}
                onFocus={() => setShowIconDropdown(true)}
                onBlur={() => setTimeout(() => setShowIconDropdown(false), 150)}
                disabled={isSaving}
              />
              <div className="w-16 h-12 border rounded flex items-center justify-center">
                {PreviewIcon ? <PreviewIcon size={28} /> : "👥"}
              </div>
            </div>

            {showIconDropdown && icon && (
              <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded border bg-white shadow-lg">
                {LUCIDE_ICON_NAMES.filter((name) =>
                  name.toLowerCase().includes(icon.toLowerCase())
                )
                  .slice(0, 20)
                  .map((name) => {
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
                  })}

                {LUCIDE_ICON_NAMES.filter((name) =>
                  name.toLowerCase().includes(icon.toLowerCase())
                ).length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">No icons found</div>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Start typing to search Lucide icons (Users, GraduationCap, Layers…)
          </p>
        </div>

        {/* SAVE BUTTON */}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Audience"}
        </button>
      </form>
    </div>
  );
}
