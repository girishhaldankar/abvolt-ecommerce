import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";

import {
  getDivisionById,
  createDivision,
  updateDivision,
} from "../../services/divisions.service";

import { GRADIENT_MAP, COLOR_NAMES, DEFAULT_GRADIENT } from "../../context/gradients";

/* ---------------- ICON LIST ---------------- */
const LUCIDE_ICON_NAMES = Object.keys(Icons).filter(
  (name) => !["default", "createLucideIcon", "icons"].includes(name)
);

export default function DivisionForm({ onSave }: { onSave?: () => void }) {
  const { divisionId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState(COLOR_NAMES[0] || "green");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showIconDropdown, setShowIconDropdown] = useState(false);

  /* ---------------- LOAD DIVISION (EDIT) ---------------- */
  useEffect(() => {
    if (!divisionId) return;

    getDivisionById(divisionId)
      .then((division: any) => {
        if (!division) return setError("Division not found");
        setTitle(division.title || "");
        setDescription(division.description || "");
        setIcon(division.icon || "");
        setColor(division.color || COLOR_NAMES[0] || "green");
      })
      .catch(() => setError("Failed to load division data"));
  }, [divisionId]);

  const PreviewIcon = (Icons as any)[icon] || Icons.Box;

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: title.trim(),
        description: description.trim(),
        icon,
        color,
      };

      if (divisionId) {
        await updateDivision(divisionId, payload);
      } else {
        await createDivision(payload);
      }

      if (onSave) onSave();
      else navigate("/admin?t=" + Date.now());
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save division");
    } finally {
      setSaving(false);
    }
  };

  return (
    
    
    <div className="max-w-xl mx-auto p-6 space-y-6 bg-gray-100 text-black">
      <h2 className="text-2xl font-bold">
        {divisionId ? "Edit Division" : "Add Division"}
      </h2>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TITLE */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
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
            disabled={saving}
          />
        </div>

        {/* ICON */}
        <div>
          <label className="block mb-1 font-medium">Lucide Icon</label>
          <div className="relative">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type icon name"
                className="flex-1 p-2 border rounded"
                value={icon}
                onChange={(e) => {
                  setIcon(e.target.value);
                  setShowIconDropdown(true);
                }}
                onFocus={() => setShowIconDropdown(true)}
                onBlur={() => setTimeout(() => setShowIconDropdown(false), 150)}
                disabled={saving}
              />

              <div
                className={`w-16 h-12 border rounded flex items-center justify-center bg-gradient-to-br ${
                  GRADIENT_MAP[color] || DEFAULT_GRADIENT
                } transition-all`}
              >
                <PreviewIcon size={28} />
              </div>
            </div>

            {showIconDropdown && icon && (
              <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded border bg-gray-100 shadow-lg">
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
              </div>
            )}
          </div>
        </div>

        {/* COLOR */}
        <div>
          <label className="block mb-1 font-medium">Card Gradient Color</label>
          <select
            className="w-full p-2 border rounded"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={saving}
          >
            {COLOR_NAMES.map((key) => (
              <option key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Division"}
        </button>
      </form>
    </div>
  );
}
