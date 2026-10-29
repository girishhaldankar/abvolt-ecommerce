import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const returnToDivisionManager =
    location.state?.returnToDivisionManager === true;

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
    if (!divisionId || !audienceId || !streamId || streamId === "new") {
      return;
    }

    setIsLoading(true);

    getDivisionById(divisionId)
      .then((division: any) => {
        const audience = division?.audiences?.find(
          (a: any) => String(a._id) === String(audienceId)
        );

        const stream = audience?.streams?.find(
          (s: any) => String(s._id) === String(streamId)
        );

        if (!stream) {
          throw new Error("Stream not found");
        }

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

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        title: title.trim(),
        description: description.trim(),
        icon: icon || DEFAULT_STREAM_ICON,
      };

      if (streamId && streamId !== "new") {
        await updateStream(
          divisionId!,
          audienceId!,
          streamId,
          payload
        );
      } else {
        await addStream(
          divisionId!,
          audienceId!,
          payload
        );
      }

      navigate(
        returnToDivisionManager
          ? `/admin/division/${divisionId}/manage`
          : `/admin/division/${divisionId}/audience/${audienceId}`
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save stream");
    } finally {
      setIsSaving(false);
    }
  };

  const PreviewIcon =
    (Icons as any)[icon] || Icons[DEFAULT_STREAM_ICON];

  const filteredIcons = icon
    ? LUCIDE_ICON_NAMES.filter((name) =>
        name.toLowerCase().includes(icon.toLowerCase())
      ).slice(0, 20)
    : [];

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-900">
        Loading stream data…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-xl bg-gray-100 p-6 text-gray-900">
      {/* PAGE TITLE */}
      <h2 className="text-2xl font-bold text-gray-900">
        {streamId && streamId !== "new" ? "Edit Stream" : "Add Stream"}
      </h2>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="rounded border border-red-300 bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* TITLE */}
        <div>
          <label className="mb-1 block font-medium text-gray-800">
            Title *
          </label>

          <input
            type="text"
            className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-200"
            placeholder="Enter stream title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSaving}
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="mb-1 block font-medium text-gray-800">
            Description
          </label>

          <textarea
            className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-200"
            placeholder="Enter stream description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSaving}
          />
        </div>

        {/* ICON */}
        <div>
          <label className="mb-1 block font-medium text-gray-800">
            Lucide Icon
          </label>

          <div className="relative">
            <div className="flex gap-3">
              <input
                type="text"
                className="min-w-0 flex-1 rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-200"
                placeholder="Search icon name"
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

              <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-gray-900">
                <PreviewIcon size={26} />
              </div>
            </div>

            {/* ICON SUGGESTIONS */}
            {showIconDropdown && filteredIcons.length > 0 && (
              <div className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded border border-gray-300 bg-white text-gray-900 shadow-lg">
                {filteredIcons.map((name) => {
                  const IconItem = (Icons as any)[name];

                  return (
                    <button
                      key={name}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setIcon(name);
                        setShowIconDropdown(false);
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-gray-900 transition hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      <IconItem size={18} />
                      <span className="text-sm">{name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <p className="mt-1 text-xs text-gray-500">
            Type an icon name, such as Folder, BookOpen, or Code.
          </p>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Stream"}
          </button>
          {returnToDivisionManager && (
            <button
              type="button"
              className="rounded bg-gray-300 px-4 py-2 font-medium hover:bg-gray-400 disabled:opacity-50"
              disabled={isSaving}
              onClick={() =>
                navigate(`/admin/division/${divisionId}/manage`)
              }
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
