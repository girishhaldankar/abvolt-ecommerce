import { apiFetch } from "./api";

/* =====================
   DIVISIONS
===================== */

export const getAllDivisions = () =>
  apiFetch("/divisions");

export const getDivisionById = (id: string) =>
  apiFetch(`/divisions/${id}`);

export const createDivision = (data: {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
}) =>
  apiFetch("/divisions", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateDivision = (
  id: string,
  data: Partial<{
    title: string;
    description: string;
    icon: string;
    color: string;
  }>
) =>
  apiFetch(`/divisions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteDivision = (id: string) =>
  apiFetch(`/divisions/${id}`, {
    method: "DELETE",
  });
