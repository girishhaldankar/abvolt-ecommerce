import { Division } from "../models/Division";

/* =========================================================
   DIVISION CRUD
========================================================= */
export const createDivision = async (data: {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
}) => {
  if (!data.title) throw new Error("Title is required");

  const newDivision = new Division({
    title: data.title,
    description: data.description || "",
    icon: data.icon || "Box",
    color: data.color || "bg-gradient-to-br from-indigo-500 to-purple-600",
    audiences: [],
  });

  await newDivision.save();
  return { ...newDivision.toObject(), id: newDivision._id.toString() };
};

export const updateDivision = async (
  divisionId: string,
  data: { title?: string; description?: string; icon?: string; color?: string }
) => {
  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  Object.assign(division, data);
  await division.save();
  return { ...division.toObject(), id: division._id.toString() };
};

export const deleteDivision = async (divisionId: string) => {
  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  await Division.deleteOne({ _id: divisionId });
  return { message: "Division deleted successfully" };
};

export const getDivisionsForLanding = async () => {
  const divisions = await Division.find(
    {},
    { title: 1, description: 1, icon: 1, color: 1 }
  ).lean();

  return divisions.map((d) => ({
    id: d._id.toString(),
    title: d.title || "",
    description: d.description || "",
    icon: d.icon || "Box",
    color: d.color || "bg-gradient-to-br from-indigo-500 to-purple-600",
  }));
};

export const getAllDivisions = async () => {
  const divisions = await Division.find({}).lean();

  return divisions.map((division: any) => ({
    ...division,
    id: division._id.toString(),
    audiences: division.audiences?.map((audience: any) => ({
      ...audience,
      id: audience._id.toString(),
      streams: audience.streams?.map((stream: any) => ({
        ...stream,
        id: stream._id.toString(),
        categories: stream.categories?.map((category: any) => ({
          ...category,
          id: category._id.toString(),
          items: category.items?.map((item: any) => ({
            ...item,
            id: item._id.toString(),
          })),
        })),
      })),
    })),
  }));
};

export const getDivisionById = async (divisionId: string) => {
  const division: any = await Division.findById(divisionId).lean();
  if (!division) return null;

  return {
    ...division,
    id: division._id.toString(),
    audiences: division.audiences?.map((audience: any) => ({
      ...audience,
      id: audience._id.toString(),
      streams: audience.streams?.map((stream: any) => ({
        ...stream,
        id: stream._id.toString(),
        categories: stream.categories?.map((category: any) => ({
          ...category,
          id: category._id.toString(),
          items: category.items?.map((item: any) => ({
            ...item,
            id: item._id.toString(),
          })),
        })),
      })),
    })),
  };
};

/* =========================================================
   AUDIENCE CRUD
========================================================= */
export const addAudience = async (
  divisionId: string,
  data: { title: string; description?: string; icon?: string }
) => {
  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  division.audiences.push({ ...data, streams: [] });
  await division.save();

  const audience = division.audiences[division.audiences.length - 1];
  return { ...audience.toObject(), id: audience._id.toString() };
};

export const updateAudience = async (
  divisionId: string,
  audienceId: string,
  data: { title?: string; description?: string; icon?: string }
) => {
  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  const audience = division.audiences.id(audienceId);
  if (!audience) throw new Error("Audience not found");

  Object.assign(audience, data);
  await division.save();

  return { ...audience.toObject(), id: audience._id.toString() };
};

export const deleteAudience = async (
  divisionId: string,
  audienceId: string
) => {
  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  const audience = division.audiences.id(audienceId);
  if (!audience) throw new Error("Audience not found");

  division.audiences.pull(audience._id);
  await division.save();

  return { message: "Audience deleted successfully" };
};

/* =========================================================
   STREAM CRUD
========================================================= */
export const addStream = async (
  divisionId: string,
  audienceId: string,
  data: { title: string; description?: string; icon?: string }
) => {
  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  const audience = division.audiences.id(audienceId);
  if (!audience) throw new Error("Audience not found");

  audience.streams.push({ ...data, categories: [] });
  await division.save();

  const stream = audience.streams[audience.streams.length - 1];
  return { ...stream.toObject(), id: stream._id.toString() };
};

export const updateStream = async (
  divisionId: string,
  audienceId: string,
  streamId: string,
  data: { title?: string; description?: string; icon?: string }
) => {
  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  const stream = division.audiences
    .id(audienceId)
    ?.streams.id(streamId);
  if (!stream) throw new Error("Stream not found");

  Object.assign(stream, data);
  await division.save();

  return { ...stream.toObject(), id: stream._id.toString() };
};

export const deleteStream = async (
  divisionId: string,
  audienceId: string,
  streamId: string
) => {
  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  const audience = division.audiences.id(audienceId);
  if (!audience) throw new Error("Audience not found");

  const stream = audience.streams.id(streamId);
  if (!stream) throw new Error("Stream not found");

  audience.streams.pull(stream._id);
  await division.save();

  return { message: "Stream deleted successfully" };
};

/* =========================================================
   CATEGORY CRUD
========================================================= */
export const addCategory = async (
  divisionId: string,
  audienceId: string,
  streamId: string,
  data: { title: string; description?: string; icon?: string }
) => {
  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  const stream = division.audiences
    .id(audienceId)
    ?.streams.id(streamId);
  if (!stream) throw new Error("Stream not found");

  stream.categories.push({ ...data, items: [] });
  await division.save();

  const category = stream.categories[stream.categories.length - 1];
  return { ...category.toObject(), id: category._id.toString() };
};

export const updateCategory = async (
  divisionId: string,
  audienceId: string,
  streamId: string,
  categoryId: string,
  data: { title?: string; description?: string; icon?: string }
) => {
  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  const stream = division.audiences
    .id(audienceId)
    ?.streams.id(streamId);
  if (!stream) throw new Error("Stream not found");

  const category = stream.categories.id(categoryId);
  if (!category) throw new Error("Category not found");

  Object.assign(category, data);
  await division.save();

  return { ...category.toObject(), id: category._id.toString() };
};

export const deleteCategory = async (
  divisionId: string,
  audienceId: string,
  streamId: string,
  categoryId: string
) => {
  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  const stream = division.audiences
    .id(audienceId)
    ?.streams.id(streamId);
  if (!stream) throw new Error("Stream not found");

  const category = stream.categories.id(categoryId);
  if (!category) throw new Error("Category not found");

  stream.categories.pull(category._id);
  await division.save();

  return { message: "Category deleted successfully" };
};

/* =========================================================
   ITEM CRUD
========================================================= */
export const addItem = async (
  divisionId: string,
  audienceId: string,
  streamId: string,
  categoryId: string,
  data: {
    name: string;
    code: string;
    shortDescription?: string;
    fullDescription?: string;
    image?: string;
    icon?: string;
    features?: string[];
  }
) => {
  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  const category = division.audiences
    .id(audienceId)
    ?.streams.id(streamId)
    ?.categories.id(categoryId);
  if (!category) throw new Error("Category not found");

  category.items.push(data);
  await division.save();

  const item = category.items[category.items.length - 1];
  return { ...item.toObject(), id: item._id.toString() };
};

export const updateItem = async (
  divisionId: string,
  audienceId: string,
  streamId: string,
  categoryId: string,
  itemId: string,
  data: any
) => {
  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  const category = division.audiences
    .id(audienceId)
    ?.streams.id(streamId)
    ?.categories.id(categoryId);
  if (!category) throw new Error("Category not found");

  const item = category.items.id(itemId);
  if (!item) throw new Error("Item not found");

  Object.assign(item, data);
  await division.save();

  return { ...item.toObject(), id: item._id.toString() };
};

export const deleteItem = async (
  divisionId: string,
  audienceId: string,
  streamId: string,
  categoryId: string,
  itemId: string
) => {
  const division = await Division.findById(divisionId);
  if (!division) throw new Error("Division not found");

  const category = division.audiences
    .id(audienceId)
    ?.streams.id(streamId)
    ?.categories.id(categoryId);
  if (!category) throw new Error("Category not found");

  const item = category.items.id(itemId);
  if (!item) throw new Error("Item not found");

  category.items.pull(item._id);
  await division.save();

  return { message: "Item deleted successfully" };
};

/* =========================================================
   PUBLIC VIEW (READ-ONLY) HELPERS
========================================================= */
export const getCategoryViewData = async (
  divisionId: string,
  audienceId: string,
  streamId: string,
  categoryId: string
) => {
  const division: any = await Division.findById(divisionId).lean();
  if (!division) throw new Error("Division not found");

  const audience = division.audiences.find(
    (a: any) => a._id.toString() === audienceId
  );
  if (!audience) throw new Error("Audience not found");

  const stream = audience.streams.find(
    (s: any) => s._id.toString() === streamId
  );
  if (!stream) throw new Error("Stream not found");

  const category = stream.categories.find(
    (c: any) => c._id.toString() === categoryId
  );
  if (!category) throw new Error("Category not found");

  return {
    id: category._id.toString(),
    title: category.title,
    description: category.description,
    icon: category.icon,
    items: category.items.map((item: any) => ({
      ...item,
      id: item._id.toString(),
    })),
  };
};

export const getItemViewData = async (
  divisionId: string,
  audienceId: string,
  streamId: string,
  categoryId: string,
  itemId: string
) => {
  const division: any = await Division.findById(divisionId).lean();
  if (!division) throw new Error("Division not found");

  const audience = division.audiences.find(
    (a: any) => a._id.toString() === audienceId
  );
  if (!audience) throw new Error("Audience not found");

  const stream = audience.streams.find(
    (s: any) => s._id.toString() === streamId
  );
  if (!stream) throw new Error("Stream not found");

  const category = stream.categories.find(
    (c: any) => c._id.toString() === categoryId
  );
  if (!category) throw new Error("Category not found");

  const item = category.items.find(
    (i: any) => i._id.toString() === itemId
  );
  if (!item) throw new Error("Item not found");

  return {
    id: item._id.toString(),
    name: item.name,
    code: item.code,
    shortDescription: item.shortDescription,
    fullDescription: item.fullDescription,
    image: item.image,
    icon: item.icon,
    features: item.features || [],
  };
};
