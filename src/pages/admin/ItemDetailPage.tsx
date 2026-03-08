import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getDivisionById } from "../../services/divisions.service";
import AdminSidebar from "./AdminSidebar";
import placeholderImage from "../../assets/microchip.jpg";

/* =====================
   Types
===================== */
interface Item {
  _id: string;
  title: string;
  code?: string;
  image?: string;
  shortDescription?: string;
  fullDescription?: string;
  features?: string[];
  path?: string;
}

export default function ItemDetailPage() {
  const { divisionId, audienceId, streamId, categoryId, itemId } = useParams<{
    divisionId: string;
    audienceId: string;
    streamId: string;
    categoryId: string;
    itemId: string;
  }>();

  const navigate = useNavigate();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================
     Fetch Item
  ===================== */
  useEffect(() => {
    if (!divisionId) return;

    setLoading(true);

    getDivisionById(divisionId)
      .then((division) => {
        const audience = division?.audiences?.find(
          (a: any) => String(a._id) === String(audienceId)
        );
        if (!audience) throw new Error("Audience not found");

        const stream = audience.streams?.find(
          (s: any) => String(s._id) === String(streamId)
        );
        if (!stream) throw new Error("Stream not found");

        const category = stream.categories?.find(
          (c: any) => String(c._id) === String(categoryId)
        );
        if (!category) throw new Error("Category not found");

        const foundItem = category.items?.find(
          (i: any) => String(i._id) === String(itemId)
        );
        if (!foundItem) throw new Error("Item not found");

        setItem(foundItem);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load item");
      })
      .finally(() => setLoading(false));
  }, [divisionId, audienceId, streamId, categoryId, itemId]);

  /* =====================
     Loading
  ===================== */
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading item…</p>
          </div>
        </div>
      </div>
    );
  }

  /* =====================
     Error
  ===================== */
  if (error || !item) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || "Item not found"}
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="mt-4 px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* =====================
     UI
  ===================== */
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {item.title || "Unnamed Item"}
            </h1>
            {item.code && (
              <p className="text-gray-600 mt-2">
                Item Code:{" "}
                <span className="font-mono font-semibold">{item.code}</span>
              </p>
            )}
          </div>

          <Link
            to={`/admin/division/${divisionId}/audience/${audienceId}/stream/${streamId}/category/${categoryId}/item/${item._id}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ✏️ Edit Item
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 lg:sticky lg:top-8">
              <h3 className="font-semibold mb-4">Image</h3>
              <img
                src={item.image || placeholderImage}
                alt={item.title}
                className="w-full h-64 object-cover rounded-lg border"
              />
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Short Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-4">Short Description</h3>
              <p className="text-gray-700">
                {item.shortDescription || "No short description"}
              </p>
            </div>

            {/* Full Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-4">Full Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {item.fullDescription || "No full description"}
              </p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-4">Features</h3>
              {item.features?.length ? (
                <ul className="space-y-2">
                  {item.features.map((f, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No features</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/admin")}
                className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
