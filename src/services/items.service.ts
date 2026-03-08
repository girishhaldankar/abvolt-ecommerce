import { apiFetch } from "./api";

export const addItem = (
  divisionId: string,
  audienceId: string,
  streamId: string,
  categoryId: string,
  data: {
    title: string;
    code?: string;
    shortDescription?: string;
    fullDescription?: string;
    image?: string;
    icon?: string;
    features?: string[];
  }
) => {
  return apiFetch(
    `/divisions/${divisionId}/audiences/${audienceId}/streams/${streamId}/categories/${categoryId}/items`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
};

export const updateItem = (
  divisionId: string,
  audienceId: string,
  streamId: string,
  categoryId: string,
  itemId: string,
  data: Partial<{
    title: string;
    code: string;
    shortDescription: string;
    fullDescription: string;
    image: string;
    icon: string;
    features: string[];
  }>
) => {
  return apiFetch(
    `/divisions/${divisionId}/audiences/${audienceId}/streams/${streamId}/categories/${categoryId}/items/${itemId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
};

export const deleteItem = (
  divisionId: string,
  audienceId: string,
  streamId: string,
  categoryId: string,
  itemId: string
) => {
  return apiFetch(
    `/divisions/${divisionId}/audiences/${audienceId}/streams/${streamId}/categories/${categoryId}/items/${itemId}`,
    {
      method: "DELETE",
    }
  );
};
