import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDivisionById } from "../../services/divisions.service";
import { addItem, updateItem } from "../../services/items.service";
import placeholderImage from "../../assets/microchip.jpg";

/* =====================
   Cloudinary config
===================== */
const CLOUDINARY_UPLOAD_PRESET = "unsigned_items_upload";
const CLOUDINARY_CLOUD_NAME = "dnlh51hmc";

export default function ItemForm() {
  const { divisionId, audienceId, streamId, categoryId, itemId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescriptions, setFullDescriptions] = useState<string[]>([""]);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [icon, setIcon] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================
     Load item (edit mode)
  ===================== */
  useEffect(() => {
    if (!itemId) return;

    setLoading(true);

    getDivisionById(divisionId!)
      .then((division) => {
        const audience = division.audiences?.find((a: any) => a.id === audienceId);
        const stream = audience?.streams?.find((s: any) => s.id === streamId);
        const category = stream?.categories?.find((c: any) => c.id === categoryId);
        const item = category?.items?.find((i: any) => i.id === itemId);

        if (!item) throw new Error("Item not found");

        setTitle(item.title || "");
        setCode(item.code || "");
        setShortDescription(item.shortDescription || "");
        // Split existing string into paragraphs
        setFullDescriptions(
          item.fullDescription
            ? item.fullDescription.split("\n\n")
            : [""]
        );
        setFeatures(item.features || []);
        setIcon(item.icon || "");
        setImageUrl(item.image || "");
      })
      .catch(() => setError("Failed to load item"))
      .finally(() => setLoading(false));
  }, [divisionId, audienceId, streamId, categoryId, itemId]);

  /* =====================
     Features handlers
  ===================== */
  const addFeature = () => {
    if (!featureInput.trim()) return;
    setFeatures([...features, featureInput.trim()]);
    setFeatureInput("");
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  /* =====================
     Full Description handlers
  ===================== */
  const updateParagraph = (index: number, value: string) => {
    const updated = [...fullDescriptions];
    updated[index] = value;
    setFullDescriptions(updated);
  };

  const addParagraph = () => {
    setFullDescriptions([...fullDescriptions, ""]);
  };

  const removeParagraph = (index: number) => {
    if (fullDescriptions.length === 1) return; // always keep at least one
    setFullDescriptions(fullDescriptions.filter((_, i) => i !== index));
  };

  /* =====================
     Cloudinary upload
  ===================== */
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return data.secure_url;
  };

  /* =====================
     Submit
  ===================== */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");

    try {
      setLoading(true);

      let uploadedImage = imageUrl;
      if (image) uploadedImage = await uploadToCloudinary(image);

      const payload = {
        title: title.trim(),
        code: code.trim(),
        shortDescription: shortDescription.trim(),
        // join paragraphs with double newline for backend
        fullDescription: fullDescriptions
          .map(fd => fd.trim())
          .filter(fd => fd !== "")
          .join("\n\n"),
        features,
        icon: icon.trim(),
        image: uploadedImage,
      };

      if (itemId) {
        await updateItem(
          divisionId!,
          audienceId!,
          streamId!,
          categoryId!,
          itemId,
          payload
        );
      } else {
        await addItem(
          divisionId!,
          audienceId!,
          streamId!,
          categoryId!,
          payload
        );
      }

      navigate(
        `/admin/division/${divisionId}/audience/${audienceId}/stream/${streamId}`
      );
    } catch (err: any) {
      setError(err.message || "Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     UI
  ===================== */
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-100">
      <h2 className="text-3xl font-bold">
        {itemId ? "Edit Item" : "Add Item"}
      </h2>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BASIC INFO */}
        <div className="p-6 rounded border space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Item Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Item title"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Item Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Item code"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Icon (emoji / lucide name)
            </label>
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="⚡ or Cpu"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* DESCRIPTIONS */}
        <div className="p-6 rounded border space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Short Description
            </label>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Short description"
              rows={2}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Description</label>

            {fullDescriptions.map((para, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <textarea
                  value={para}
                  onChange={(e) => updateParagraph(i, e.target.value)}
                  placeholder={`Paragraph ${i + 1}`}
                  rows={3}
                  className="w-full p-2 border rounded"
                />
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => addParagraph()}
                    className="px-2 py-1 border rounded"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeParagraph(i)}
                    className="px-2 py-1 border rounded"
                  >
                    -
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <div className="p-6 rounded border space-y-4">
          <label className="block text-sm font-medium">Features</label>

          <div className="flex gap-2">
            <input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="Add feature"
              className="flex-1 p-2 border rounded"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 bg-green-600 text-black rounded"
            >
              Add
            </button>
          </div>

          <ul className="space-y-2">
            {features.map((f, i) => (
              <li
                key={i}
                className="flex justify-between items-center p-2 border rounded"
              >
                <span>{f}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(i)}
                  className=" text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* IMAGE */}
        <div className="p-6 rounded border space-y-4">
          <label className="block text-sm font-medium">Item Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />

          <img
            src={image ? URL.createObjectURL(image) : imageUrl || placeholderImage}
            className="w-48 h-48 object-cover rounded border"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-black rounded"
          >
            {loading ? "Saving..." : itemId ? "Update Item" : "Create Item"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-300 rounded"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
