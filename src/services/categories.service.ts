import { apiFetch } from "./api";

export const addCategory = (
  divisionId: string,
  audienceId: string,
  streamId: string,
  data: {
    title: string;
    description?: string;
    icon?: string;
  }
) => {
  return apiFetch(
    `/divisions/${divisionId}/audiences/${audienceId}/streams/${streamId}/categories`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
};

export const updateCategory = (
  divisionId: string,
  audienceId: string,
  streamId: string,
  categoryId: string,
  data: {
    title?: string;
    description?: string;
    icon?: string;
  }
) => {
  return apiFetch(
    `/divisions/${divisionId}/audiences/${audienceId}/streams/${streamId}/categories/${categoryId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
};

export const deleteCategory = (
  divisionId: string,
  audienceId: string,
  streamId: string,
  categoryId: string
) => {
  return apiFetch(
    `/divisions/${divisionId}/audiences/${audienceId}/streams/${streamId}/categories/${categoryId}`,
    {
      method: "DELETE",
    }
  );
};
