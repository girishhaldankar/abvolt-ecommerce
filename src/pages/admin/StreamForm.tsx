import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { getDivisionById } from "../../services/divisions.service";
import { addStream, updateStream } from "../../services/streams.service";

const DEFAULT_STREAM_ICON = "Folder";

const LUCIDE_ICON_NAMES = Object.keys(Icons).filter(
  (name) => !["default", "createLucideIcon", "icons"].includes(name)
);

export default function StreamForm() {
  const { divisionId, audienceId, streamId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(DEFAULT_STREAM_ICON);
  const [showIconDropdown, setShowIconDropdown] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  /* =====================
     LOAD STREAM (EDIT)
  ===================== */
  useEffect(() => {
    if (!divisionId || !audienceId || !streamId || streamId === "new") return;

    setIsLoading(true);
    getDivisionById(divisionId)
      .then((division: any) => {
        const audience = division?.audiences?.find(
          (a: any) => String(a._id) === String(audienceId)
        );
        const stream = audience?.streams?.find(
          (s: any) => String(s._id) === String(streamId)
        );

        if (!stream) throw new Error("Stream not found");

        setTitle(stream.title || "");
        setDescription(stream.description || "");
        setIcon(stream.icon || DEFAULT_STREAM_ICON);
      })
      .catch(() => setError("Failed to load stream data"))
      .finally(() => setIsLoading(false));
  }, [divisionId, audienceId, streamId]);

  /* =====================
     SAVE STREAM
  ===================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        title: title.trim(),
        description: description.trim(),
        icon: icon || DEFAULT_STREAM_ICON,
      };

      if (streamId && streamId !== "new") {
        // ✅ UPDATE
        await updateStream(
          divisionId!,
          audienceId!,
          streamId,
          payload
        );
      } else {
        // ✅ ADD
        await addStream(
          divisionId!,
          audienceId!,
          payload
        );
      }

      navigate(`/admin/division/${divisionId}/audience/${audienceId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save stream");
    } finally {
      setIsSaving(false);
    }
  };

  const PreviewIcon = (Icons as any)[icon] || Icons[DEFAULT_STREAM_ICON];

  const filteredIcons = icon
    ? LUCIDE_ICON_NAMES.filter((name) =>
        name.toLowerCase().includes(icon.toLowerCase())
      ).slice(0, 20)
    : [];

  if (isLoading) {
    return <div className="p-6 text-center">Loading stream data…</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 bg-gray-100">
      <h2 className="text-2xl font-bold">
        {streamId && streamId !== "new" ? "Edit Stream" : "Add Stream"}
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
                <PreviewIcon size={26} />
              </div>
            </div>

            {showIconDropdown && filteredIcons.length > 0 && (
              <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded border shadow-lg bg-white">
                {filteredIcons.map((name) => {
                  const IconItem = (Icons as any)[name];
                  return (
                    <div
                      key={name}
                      onClick={() => {
                        setIcon(name);
                        setShowIconDropdown(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-200"
                    >
                      <IconItem size={18} />
                      <span className="text-sm">{name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Stream"}
        </button>
      </form>
    </div>
  );
}
