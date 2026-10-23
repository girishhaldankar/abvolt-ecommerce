import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { getAllDivisions } from "../../services/divisions.service";

import { deleteDivision } from "../../services/divisions.service";
import { deleteAudience } from "../../services/audiences.service";
import { deleteStream } from "../../services/streams.service";
import { deleteCategory } from "../../services/categories.service";
import { deleteItem } from "../../services/items.service";
import { useAuth } from "../../context/AuthContext";


/* ---------------------------------------------
   ICON RENDER HELPER
--------------------------------------------- */
const renderIcon = (iconName?: string, size = 16) => {
  if (!iconName) return null;
  const IconComponent = (Icons as any)[iconName];
  if (!IconComponent) return null;
  return <IconComponent size={size} />;
};

export default function AdminSidebar() {
  const [divisions, setDivisions] = useState<any[]>([]);
  const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [signOutError, setSignOutError] = useState("");

  useEffect(() => {
    getAllDivisions().then((data) => setDivisions(data || []));
  }, []);

  const toggleDivision = (divisionId: string) => {
    const set = new Set(expandedDivisions);
    set.has(divisionId) ? set.delete(divisionId) : set.add(divisionId);
    setExpandedDivisions(set);
  };

  const toggleCategory = (categoryId: string) => {
    const set = new Set(expandedCategories);
    set.has(categoryId) ? set.delete(categoryId) : set.add(categoryId);
    setExpandedCategories(set);
  };

  return (
    <div className="w-84 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen overflow-y-auto shadow-xl">
      {/* HEADER */}
      <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icons.Settings size={18} />
          Admin Panel
        </h2>
        <p className="text-xs text-gray-400 mt-1">Manage your content</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="truncate text-xs text-gray-300" title={user?.email || undefined}>
            {user?.email}
          </span>
          <button
            type="button"
            onClick={async () => {
              setSignOutError("");
              try {
                await signOut();
                navigate("/admin/login", { replace: true });
              } catch {
                setSignOutError("Unable to sign out. Please try again.");
              }
            }}
            className="shrink-0 rounded border border-gray-600 px-2 py-1 text-xs text-gray-200 hover:bg-gray-700"
          >
            Sign out
          </button>
        </div>
        {signOutError && (
          <p className="mt-2 text-xs text-red-300" role="alert">
            {signOutError}
          </p>
        )}
      </div>

      {/* ADD DIVISION */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={() => navigate("/admin/division/new")}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
        >
          <Icons.Plus size={16} />
          Add Division
        </button>
      </div>

      {/* DIVISION LIST */}
      <ul className="p-4 space-y-2">
        {divisions.map((division) => {
          const expanded = expandedDivisions.has(division.id);

          return (
            <li key={division.id} className="bg-gray-700 rounded overflow-hidden">
              {/* DIVISION HEADER */}
              <div className="flex items-center justify-between p-3">
                <button
                  onClick={() => toggleDivision(division.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <span className={`transition-transform ${expanded ? "rotate-90" : ""}`}>
                    ▶
                  </span>
                  <span className="text-green-400">{renderIcon(division.icon, 18)}</span>
                  <div className="truncate">
                    <p className="font-semibold">{division.title}</p>
                    <p className="text-xs text-gray-400">
                      {division.audiences?.length || 0} audiences
                    </p>
                  </div>
                </button>

                {/* ADD */}
                <Link
                  to={`/admin/division/${division.id}/audience/new`}
                  className="p-1 text-green-400 hover:bg-gray-600 rounded"
                  title="Add Audience"
                >
                  <Icons.Plus size={14} />
                </Link>

                {/* DELETE DIVISION */}
                <button
                  onClick={async () => {
                    if (!window.confirm(`Delete division "${division.title}"?`)) return;
                    try {
                      await deleteDivision(division.id);
                      setDivisions(divisions.filter((d) => d.id !== division.id));
                    } catch (err) {
                      console.error("Failed to delete division:", err);
                    }
                  }}
                  className="p-1 text-red-400 hover:bg-gray-600 rounded"
                  title="Delete Division"
                >
                  <Icons.Trash2 size={14} />
                </button>
              </div>

              {/* AUDIENCES */}
              {expanded && division.audiences?.length > 0 && (
                <ul className="bg-gray-800 border-t border-gray-600 p-2 space-y-1">
                  {division.audiences.map((audience: any) => (
                    <li key={audience.id}>
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/admin/division/${division.id}/audience/${audience.id}`}
                          className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-700 rounded flex-1"
                        >
                          {renderIcon(audience.icon, 14)}
                          <span className="truncate">{audience.title}</span>
                        </Link>

                        {/* ADD STREAM */}
                        <Link
                          to={`/admin/division/${division.id}/audience/${audience.id}/stream/new`}
                          className="p-1 text-green-400 hover:bg-gray-700 rounded"
                          title="Add Stream"
                        >
                          <Icons.Plus size={12} />
                        </Link>

                        {/* DELETE AUDIENCE */}
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Delete audience "${audience.title}"?`)) return;
                            try {
                              await deleteAudience(division.id, audience.id);
                              setDivisions(divisions.map(d => {
                                if(d.id !== division.id) return d;
                                return {
                                  ...d,
                                  audiences: d.audiences.filter((a:any) => a.id !== audience.id)
                                };
                              }));
                            } catch (err) {
                              console.error("Failed to delete audience:", err);
                            }
                          }}
                          className="p-1 text-red-400 hover:bg-gray-700 rounded"
                          title="Delete Audience"
                        >
                          <Icons.Trash2 size={12} />
                        </button>
                      </div>

                      {/* STREAMS */}
                      {audience.streams?.length > 0 && (
                        <ul className="ml-4 border-l border-gray-600 pl-2 space-y-1">
                          {audience.streams.map((stream: any) => (
                            <li key={stream.id}>
                              <div className="flex items-center justify-between">
                                <Link
                                  to={`/admin/division/${division.id}/audience/${audience.id}/stream/${stream.id}`}
                                  className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-gray-700 rounded flex-1"
                                >
                                  {renderIcon(stream.icon, 12)}
                                  <span className="truncate">{stream.title}</span>
                                </Link>

                                {/* ADD CATEGORY */}
                                <Link
                                  to={`/admin/division/${division.id}/audience/${audience.id}/stream/${stream.id}/category/new`}
                                  className="p-1 text-green-400 hover:bg-gray-700 rounded"
                                  title="Add Category"
                                >
                                  <Icons.Plus size={10} />
                                </Link>

                                {/* DELETE STREAM */}
                                <button
                                  onClick={async () => {
                                    if (!window.confirm(`Delete stream "${stream.title}"?`)) return;
                                    try {
                                      await deleteStream(division.id, audience.id, stream.id);
                                      setDivisions(divisions.map(d => {
                                        if(d.id !== division.id) return d;
                                        return {
                                          ...d,
                                          audiences: d.audiences.map((a:any) => {
                                            if(a.id !== audience.id) return a;
                                            return {
                                              ...a,
                                              streams: a.streams.filter((s:any) => s.id !== stream.id)
                                            };
                                          })
                                        };
                                      }));
                                    } catch (err) {
                                      console.error("Failed to delete stream:", err);
                                    }
                                  }}
                                  className="p-1 text-red-400 hover:bg-gray-700 rounded"
                                  title="Delete Stream"
                                >
                                  <Icons.Trash2 size={10} />
                                </button>
                              </div>

                              {/* CATEGORIES */}
                              {stream.categories?.length > 0 && (
                                <ul className="ml-4 border-l border-gray-600 pl-2 space-y-1">
                                  {stream.categories.map((category: any) => {
                                    const open = expandedCategories.has(category.id);
                                    return (
                                      <li key={category.id}>
                                        <div className="flex items-center justify-between">
                                          <button
                                            onClick={() => toggleCategory(category.id)}
                                            className="flex items-center gap-1 text-xs px-2 py-1 hover:bg-gray-700 rounded flex-1 text-left"
                                          >
                                            <span className={`transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
                                            {renderIcon(category.icon, 12)}
                                            <span className="truncate">{category.title}</span>
                                          </button>

                                          {/* ADD ITEM */}
                                          <Link
                                            to={`/admin/division/${division.id}/audience/${audience.id}/stream/${stream.id}/category/${category.id}/item/new`}
                                            className="p-1 text-green-400 hover:bg-gray-700 rounded"
                                            title="Add Item"
                                          >
                                            <Icons.Plus size={10} />
                                          </Link>

                                          {/* DELETE CATEGORY */}
                                          <button
                                            onClick={async () => {
                                              if (!window.confirm(`Delete category "${category.title}"?`)) return;
                                              try {
                                                await deleteCategory(division.id, audience.id, stream.id, category.id);
                                                setDivisions(divisions.map(d => {
                                                  if(d.id !== division.id) return d;
                                                  return {
                                                    ...d,
                                                    audiences: d.audiences.map((a:any) => {
                                                      if(a.id !== audience.id) return a;
                                                      return {
                                                        ...a,
                                                        streams: a.streams.map((s:any) => {
                                                          if(s.id !== stream.id) return s;
                                                          return {
                                                            ...s,
                                                            categories: s.categories.filter((c:any) => c.id !== category.id)
                                                          };
                                                        })
                                                      };
                                                    })
                                                  };
                                                }));
                                              } catch (err) {
                                                console.error("Failed to delete category:", err);
                                              }
                                            }}
                                            className="p-1 text-red-400 hover:bg-gray-700 rounded"
                                            title="Delete Category"
                                          >
                                            <Icons.Trash2 size={10} />
                                          </button>
                                        </div>

                                        {/* ITEMS */}
                                        {open && category.items?.length > 0 && (
                                          <ul className="ml-4 border-l border-gray-600 pl-2">
                                            {category.items.map((item: any) => (
                                              <li key={item._id}>
                                                <div className="flex items-center justify-between">
                                                  <Link
                                                    to={`/admin/division/${division.id}/audience/${audience.id}/stream/${stream.id}/category/${category.id}/item/${item._id}/detail`}
                                                    className="flex items-center gap-2 text-xs px-2 py-1 hover:bg-gray-700 rounded flex-1"
                                                  >
                                                    {renderIcon(item.icon, 10)}
                                                    <span className="truncate">{item.title}</span>
                                                  </Link>

                                                  {/* DELETE ITEM */}
                                                  <button
                                                    onClick={async () => {
                                                      if (!window.confirm(`Delete item "${item.title}"?`)) return;
                                                      try {
                                                        await deleteItem(division.id, audience.id, stream.id, category.id, item._id);
                                                        setDivisions(divisions.map(d => {
                                                          if(d.id !== division.id) return d;
                                                          return {
                                                            ...d,
                                                            audiences: d.audiences.map((a:any) => {
                                                              if(a.id !== audience.id) return a;
                                                              return {
                                                                ...a,
                                                                streams: a.streams.map((s:any) => {
                                                                  if(s.id !== stream.id) return s;
                                                                  return {
                                                                    ...s,
                                                                    categories: s.categories.map((c:any) => {
                                                                      if(c.id !== category.id) return c;
                                                                      return {
                                                                        ...c,
                                                                        items: c.items.filter((i:any) => i._id !== item._id)
                                                                      };
                                                                    })
                                                                  };
                                                                })
                                                              };
                                                            })
                                                          };
                                                        }));
                                                      } catch (err) {
                                                        console.error("Failed to delete item:", err);
                                                      }
                                                    }}
                                                    className="p-1 text-red-400 hover:bg-gray-700 rounded"
                                                    title="Delete Item"
                                                  >
                                                    <Icons.Trash2 size={10} />
                                                  </button>
                                                </div>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
