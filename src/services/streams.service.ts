import { apiFetch } from "./api";

export const addStream = (
  divisionId: string,
  audienceId: string,
  data: {
    title: string;
    description?: string;
    icon?: string;
  }
) => {
  return apiFetch(
    `/divisions/${divisionId}/audiences/${audienceId}/streams`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
};

export const updateStream = (
  divisionId: string,
  audienceId: string,
  streamId: string,
  data: {
    title?: string;
    description?: string;
    icon?: string;
  }
) => {
  return apiFetch(
    `/divisions/${divisionId}/audiences/${audienceId}/streams/${streamId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
};

export const deleteStream = (
  divisionId: string,
  audienceId: string,
  streamId: string
) => {
  return apiFetch(
    `/divisions/${divisionId}/audiences/${audienceId}/streams/${streamId}`,
    {
      method: "DELETE",
    }
  );
};
