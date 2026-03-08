import { useParams, Link } from "react-router-dom";

export default function DivisionManager() {
  const { divisionId } = useParams();

  if (!divisionId) return null;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 bg-gray-100">
      <h1 className="text-2xl font-semibold capitalize">
        Manage Division: {divisionId}
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Edit Division */}
        <Link
          to={`/admin/division/${divisionId}`}
          className="p-6 border rounded-lg hover:bg-gray-50"
        >
          ✏️ Edit Division Details
        </Link>

        {/* Add Audience */}
        <Link
          to={`/admin/division/${divisionId}/audience/new`}
          className="p-6 border rounded-lg hover:bg-gray-50"
        >
          👥 Add / Edit Audiences
        </Link>
      </div>

      <p className="text-sm text-gray-500">
        Streams, categories, and items are managed *inside* each audience.
      </p>
    </div>
  );
}
