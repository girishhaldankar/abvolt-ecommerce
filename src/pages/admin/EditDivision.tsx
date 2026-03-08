import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { getDivisionById, saveDivision } from "../../services/divisionService";

const LUCIDE_ICON_NAMES = Object.keys(Icons).filter(
  (name) => !["default", "createLucideIcon", "icons"].includes(name)
);

export default function EditDivision() {
  const { divisionId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState(""); // gradient color
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showIconDropdown, setShowIconDropdown] = useState(false);

  useEffect(() => {
    if (!divisionId) return;
    getDivisionById(divisionId)
      .then((data: any) => {
        if (!data) return setError("Division not found");
        setTitle(data.title || "");
        setDescription(data.description || "");
        setIcon(data.icon || "");
        setColor(data.color || "");
      })
      .catch(() => setError("Failed to load division"))
      .finally(() => setLoading(false));
  }, [divisionId]);

  const PreviewIcon = (Icons as any)[icon];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");

    try {
      setSaving(true);
      await saveDivision(divisionId!, { title, description, icon, color });
      navigate("/admin");
    } catch {
      setError("Failed to save division");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading division…</div>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 bg-gray-100">
      <h1 className="text-2xl font-bold">Edit Division</h1>
      {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleSave} className="space-y-4">
        {/* TITLE */}
        <div>
          <label className="block mb-1 font-medium">Title *</label>
          <input type="text" className="w-full border px-3 py-2 rounded" value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea className="w-full border px-3 py-2 rounded" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} disabled={saving} />
        </div>

        {/* ICON */}
        <div>
          <label className="block mb-1 font-medium">Lucide Icon</label>
          <div className="relative flex gap-3">
            <input
              type="text"
              placeholder="Type icon name"
              className="flex-1 border px-3 py-2 rounded"
              value={icon}
              onChange={(e) => { setIcon(e.target.value); setShowIconDropdown(true); }}
              onFocus={() => setShowIconDropdown(true)}
              onBlur={() => setTimeout(() => setShowIconDropdown(false), 150)}
              disabled={saving}
            />
            <div className="w-16 h-12 border rounded flex items-center justify-center ">
              {PreviewIcon ? <PreviewIcon size={28} /> : "🏢"}
            </div>
          </div>
        </div>

        {/* COLOR */}
        <div>
          <label className="block mb-1 font-medium">Card Gradient Color</label>
          <input type="text" placeholder="e.g. from-cyan-500 to-blue-500" className="w-full p-2 border rounded" value={color} onChange={(e) => setColor(e.target.value)} disabled={saving} />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
