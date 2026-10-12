
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";

import { getDivisionById } from "../../services/divisions.service";
import {
  addCategory,
  updateCategory,
} from "../../services/categories.service";

const DEFAULT_ICON = "Folder";

// Use the same Cloudinary settings as your existing ItemForm.
const CLOUDINARY_UPLOAD_PRESET = "unsigned_items_upload";
const CLOUDINARY_CLOUD_NAME = "dnlh51hmc";

const LUCIDE_ICON_NAMES = Object.keys(Icons).filter(
  (name) => !["default", "createLucideIcon", "icons"].includes(name)
);

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Category image upload failed. Please try again.");
  }

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error("Cloudinary did not return an image URL.");
  }

  return data.secure_url;
}

export default function CategoryForm() {
  const { divisionId, audienceId, streamId, categoryId } = useParams();
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(DEFAULT_ICON);

  // Category hero image
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [localPreview, setLocalPreview] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showIconDropdown, setShowIconDropdown] = useState(false);

  const isEditing = Boolean(categoryId && categoryId !== "new");

  /* ---------------- LOCAL IMAGE PREVIEW ---------------- */
  useEffect(() => {
    if (!image) {
      setLocalPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setLocalPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [image]);

  /* ---------------- LOAD CATEGORY ---------------- */
  useEffect(() => {
    let cancelled = false;

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

        if (cancelled) return;

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
        setImageUrl(category.image || "");
        setImage(null);
        setRemoveImage(false);
      } catch {
        if (!cancelled) {
          setError("Failed to load category data");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadCategory();

    return () => {
      cancelled = true;
    };
  }, [divisionId, audienceId, streamId, categoryId]);

  /* ---------------- ICON PREVIEW ---------------- */
  const PreviewIcon =
    (Icons as any)[icon] || (Icons as any)[DEFAULT_ICON];

  const filteredIcons = icon
    ? LUCIDE_ICON_NAMES.filter((name) =>
        name.toLowerCase().includes(icon.toLowerCase())
      ).slice(0, 20)
    : [];

  /* ---------------- SELECT CATEGORY IMAGE ---------------- */
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    setError("");
    setImage(file);
    setRemoveImage(false);

    // Allow selecting the same file again later.
    e.target.value = "";
  };

  /* ---------------- REMOVE CATEGORY IMAGE ---------------- */
  const handleRemoveImage = () => {
    setImage(null);
    setImageUrl("");
    setRemoveImage(true);
    setLocalPreview("");
  };

  /* ---------------- SAVE CATEGORY ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!divisionId || !audienceId || !streamId) {
      setError("Missing division, audience, or stream information.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      let finalImageUrl = removeImage ? "" : imageUrl;

      // Upload a new image only when the user selects one.
      if (image) {
        finalImageUrl = await uploadToCloudinary(image);
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        icon: icon || DEFAULT_ICON,
        image: finalImageUrl,
      };

      if (isEditing && categoryId) {
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

  const displayedImage = localPreview || (!removeImage ? imageUrl : "");

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 bg-gray-100 text-black rounded-lg">
      <h2 className="text-2xl font-bold">
        {isEditing ? "Edit Category" : "Add Category"}
      </h2>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* TITLE */}
        <div>
          <label className="block mb-1 font-medium">
            Category Title
          </label>
          <input
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSaving}
            required
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
            disabled={isSaving}
          />
        </div>

        {/* CATEGORY HERO IMAGE */}
        <div>
          <label className="block mb-1 font-medium">
            Category Hero Image
          </label>

          <p className="text-sm text-gray-600 mb-2">
            This image is displayed at the top of the category page.
            It does not replace individual product images.
          </p>

          {displayedImage && (
            <div className="mb-3">
              <img
                src={displayedImage}
                alt="Category hero preview"
                className="w-full h-48 object-cover rounded-lg border bg-white"
              />

              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={isSaving}
                className="mt-2 px-3 py-1.5 text-sm text-red-700 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50"
              >
                Remove Image
              </button>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isSaving}
            className="block w-full text-sm text-gray-700
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />

          {image && (
            <p className="mt-1 text-xs text-gray-500">
              Selected: {image.name}. The image will upload when you save.
            </p>
          )}
        </div>

        {/* LUCIDE ICON */}
        <div>
          <label className="block mb-1 font-medium">
            Lucide Icon
          </label>

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

              <div className="w-16 h-12 border rounded flex items-center justify-center bg-white">
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
                        onMouseDown={(e) => e.preventDefault()}
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

        {/* SAVE */}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          disabled={isSaving}
        >
          {isSaving
            ? image
              ? "Uploading Image & Saving..."
              : "Saving..."
            : isEditing
              ? "Update Category"
              : "Save Category"}
        </button>
      </form>
    </div>
  );
}
