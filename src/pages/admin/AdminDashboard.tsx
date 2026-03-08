import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { getAllDivisions } from "../../services/divisions.service";


import AdminSidebar from "./AdminSidebar";

/* ---------------------------------------------
   SAFE LUCIDE ICON RENDERER
--------------------------------------------- */
const RenderIcon = ({
  name,
  size = 16,
  fallback = "Folder",
}: {
  name?: string;
  size?: number;
  fallback?: keyof typeof Icons;
}) => {
  const IconComp = (Icons as any)[name || ""] || (Icons as any)[fallback];
  return IconComp ? <IconComp size={size} /> : null;
};

/* ---------------------------------------------
   TYPE DEFINITIONS
--------------------------------------------- */
interface Category {
  id: string;
  title: string;
  icon?: string;
}

interface Stream {
  id: string;
  title: string;
  icon?: string;
  categories?: Category[];
}

interface Audience {
  id: string;
  title: string;
  icon?: string;
  streams?: Stream[];
}

interface Division {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  audiences?: Audience[];
}

/* ---------------------------------------------
   STAT COMPONENT
--------------------------------------------- */
const Stat = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className="text-center">
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-600 mt-1">{label}</p>
  </div>
);

/* ---------------------------------------------
   MAIN COMPONENT
--------------------------------------------- */
export default function AdminDashboard() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.remove("dark"); // force light mode
    const fetchDivisions = async () => {
      try {
        setLoading(true);
        const data = await getAllDivisions();
        setDivisions(data);
      } catch (err) {
        console.error("Error fetching divisions:", err);
        
      } finally {
        setLoading(false);
      }
    };

    fetchDivisions();
  }, []);

  /* Helper functions for totals */
  const countStreams = (audiences?: Audience[]) =>
    audiences?.reduce((s, a) => s + (a.streams?.length || 0), 0) || 0;

  const countCategories = (audiences?: Audience[]) =>
    audiences?.reduce(
      (s, a) =>
        s +
        (a.streams || []).reduce(
          (x, st) => x + (st.categories?.length || 0),
          0
        ),
      0
    ) || 0;

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <AdminSidebar />

      <div className="flex-1 p-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage divisions, audiences, streams, and categories
          </p>
        </div>

        {/* ADD DIVISION */}
        <div className="mb-8">
          <Link
            to="/admin/division/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow transition"
          >
            <Icons.Plus size={18} />
            Add New Division
          </Link>
        </div>

        {/* DIVISIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : divisions.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded border">
              No divisions found
            </div>
          ) : (
            divisions.map((division) => (
              <div
                key={division.id}
                className="bg-white rounded-lg shadow border hover:shadow-lg transition"
              >
                <div className="p-6">
                  {/* DIVISION HEADER */}
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                    <RenderIcon
                      name={division.icon}
                      size={26}
                      fallback="Building2"
                    />
                    {division.title}
                  </h3>
                  {division.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {division.description}
                    </p>
                  )}

                  {/* STATS */}
                  <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b">
                    <Stat
                      label="Audiences"
                      value={division.audiences?.length || 0}
                      color="text-blue-600"
                    />
                    <Stat
                      label="Streams"
                      value={countStreams(division.audiences)}
                      color="text-purple-600"
                    />
                    <Stat
                      label="Categories"
                      value={countCategories(division.audiences)}
                      color="text-green-600"
                    />
                  </div>

                  {/* AUDIENCES */}
                  {division.audiences?.length > 0 && (
                    <div className="space-y-4 max-h-96 overflow-y-auto bg-gray-50 p-4 rounded border">
                      {division.audiences.map((audience) => (
                        <div
                          key={audience.id}
                          className="border-l-4 border-blue-500 pl-4"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-medium flex items-center gap-2 text-gray-700">
                              <RenderIcon
                                name={audience.icon}
                                size={18}
                                fallback="Users"
                              />
                              {audience.title}
                            </p>
                            <Link
                              to={`/admin/division/${division.id}/audience/${audience.id}`}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Manage
                            </Link>
                          </div>

                          {/* STREAMS */}
                          {audience.streams?.map((stream) => (
                            <div
                              key={stream.id}
                              className="ml-3 mb-2 p-2 rounded border bg-white"
                            >
                              <div className="flex justify-between items-center">
                                <p className="text-xs font-semibold flex items-center gap-2 text-gray-700">
                                  <RenderIcon
                                    name={stream.icon}
                                    size={14}
                                    fallback="Folder"
                                  />
                                  {stream.title}
                                </p>
                                <Link
                                  to={`/admin/division/${division.id}/audience/${audience.id}/stream/${stream.id}`}
                                  className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700"
                                >
                                  Edit
                                </Link>
                              </div>

                              {/* CATEGORIES */}
                              {stream.categories?.map((category) => (
                                <div
                                  key={category.id}
                                  className="ml-4 bg-gray-50 p-2 rounded border mt-1"
                                >
                                  <div className="flex justify-between items-center">
                                    <p className="text-xs flex items-center gap-2 text-gray-700">
                                      <RenderIcon
                                        name={category.icon}
                                        size={14}
                                        fallback="Folder"
                                      />
                                      {category.title}
                                    </p>
                                    <Link
                                      to={`/admin/division/${division.id}/audience/${audience.id}/stream/${stream.id}/category/${category.id}`}
                                      className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700"
                                    >
                                      Edit
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => navigate(`/admin/division/${division.id}`)}
                      className="flex-1 bg-gray-700 text-white py-2 rounded hover:bg-gray-800"
                    >
                      Edit Division
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/admin/division/${division.id}/audience/new`)
                      }
                      className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                      Add Audience
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
