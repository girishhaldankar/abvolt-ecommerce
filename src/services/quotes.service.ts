import { getFirebaseAuth } from "../firebase/firebaseConfig";

const API_BASE = import.meta.env.VITE_API_URL;

export type QuoteItemSource = "division" | "shop";

export interface QuoteRequestPayload {
  itemSource: QuoteItemSource;
  itemId: string;
  customerName: string;
  phone: string;
  quantity: number;
  requirements?: string;
  divisionId?: string;
  audienceId?: string;
  streamId?: string;
  categoryId?: string;
}

export const QUOTE_ENQUIRY_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "closed",
] as const;

export type QuoteEnquiryStatus = (typeof QUOTE_ENQUIRY_STATUSES)[number];

export interface QuoteEnquiry {
  _id: string;
  customerName: string;
  phone: string;
  quantity: number;
  requirements: string;
  itemSource: QuoteItemSource;
  itemId: string;
  itemName: string;
  itemCode?: string;
  itemCategory?: string;
  divisionId?: string;
  audienceId?: string;
  streamId?: string;
  categoryId?: string;
  status: QuoteEnquiryStatus;
  statusUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.error === "string"
        ? data.error
        : "Unable to process quote enquiry.";
    throw new Error(message);
  }

  if (!isRecord(data)) {
    throw new Error("The server returned an invalid quote enquiry response.");
  }
  return data as T;
}

export async function submitQuoteRequest(payload: QuoteRequestPayload) {
  if (!API_BASE) throw new Error("VITE_API_URL is not defined");
  const response = await fetch(`${API_BASE}/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await parseResponse<{
    success: true;
    enquiry: { id: string; status: string };
  }>(response);
  if (
    result.success !== true ||
    typeof result.enquiry?.id !== "string" ||
    !result.enquiry.id
  ) {
    throw new Error("The server did not confirm saving this quote request.");
  }
  return result;
}

async function adminQuoteRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  if (!API_BASE) throw new Error("VITE_API_URL is not defined");

  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Sign in with an administrator account to continue.");

  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${await user.getIdToken()}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  return parseResponse<T>(response);
}

export function getQuoteEnquiries(
  page: number,
  pageSize: number
): Promise<{ items: QuoteEnquiry[]; page: number; pageSize: number; total: number }> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return adminQuoteRequest(`/quotes?${query.toString()}`);
}

export async function getQuoteEnquiry(id: string): Promise<QuoteEnquiry> {
  const result = await adminQuoteRequest<{ enquiry: QuoteEnquiry }>(
    `/quotes/${encodeURIComponent(id)}`
  );
  return result.enquiry;
}

export async function updateQuoteEnquiryStatus(
  id: string,
  status: QuoteEnquiryStatus
): Promise<QuoteEnquiry> {
  const result = await adminQuoteRequest<{ enquiry: QuoteEnquiry }>(
    `/quotes/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
  return result.enquiry;
}
