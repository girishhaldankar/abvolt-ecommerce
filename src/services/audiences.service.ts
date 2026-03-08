import { apiFetch } from "./api";

export const addAudience = (
  divisionId: string,
  data: { title: string; description?: string; icon?: string }
) =>
  apiFetch(`/divisions/${divisionId}/audiences`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateAudience = (
  divisionId: string,
  audienceId: string,
  data: any
) =>
  apiFetch(`/divisions/${divisionId}/audiences/${audienceId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteAudience = (
  divisionId: string,
  audienceId: string
) =>
  apiFetch(`/divisions/${divisionId}/audiences/${audienceId}`, {
    method: "DELETE",
  });
