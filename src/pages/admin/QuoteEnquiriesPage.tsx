import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import {
  getQuoteEnquiries,
  getQuoteEnquiry,
  QUOTE_ENQUIRY_STATUSES,
  QuoteEnquiry,
  QuoteEnquiryStatus,
  updateQuoteEnquiryStatus,
} from "../../services/quotes.service";

const PAGE_SIZE = 25;

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString();
}

export default function QuoteEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<QuoteEnquiry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<QuoteEnquiry | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const loadPage = async (requestedPage: number) => {
    setLoading(true);
    setError("");
    try {
      const result = await getQuoteEnquiries(requestedPage, PAGE_SIZE);
      setEnquiries(result.items);
      setTotal(result.total);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load quote enquiries."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPage(page);
  }, [page]);

  const handleSelectEnquiry = async (id: string) => {
    setSelectedId(id);
    setSelectedEnquiry(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      setSelectedEnquiry(await getQuoteEnquiry(id));
    } catch (loadError) {
      setDetailError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load enquiry details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: QuoteEnquiryStatus
  ) => {
    setUpdatingId(id);
    setError("");
    setNotice("");
    try {
      const updated = await updateQuoteEnquiryStatus(id, status);
      setEnquiries((current) =>
        current.map((enquiry) => (enquiry._id === id ? updated : enquiry))
      );
      if (selectedId === id) setSelectedEnquiry(updated);
      setNotice("Enquiry status updated.");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update enquiry status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Quote Enquiries</h1>
          <p className="mt-1 text-gray-600">
            Review customer quote requests and track their status.
          </p>
        </header>

        {error && (
          <p className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="mb-4 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-800" role="status">
            {notice}
          </p>
        )}

        <section className="overflow-hidden rounded-lg border bg-white shadow-sm" aria-label="Quote enquiry list">
          {loading ? (
            <div className="p-8 text-center text-gray-600" role="status">
              Loading enquiries…
            </div>
          ) : enquiries.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No quote enquiries found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enquiries.map((enquiry) => (
                    <tr key={enquiry._id} className="align-middle">
                      <td className="px-4 py-3">
                        <div className="font-medium">{enquiry.customerName}</div>
                        <div className="text-xs text-gray-500">{enquiry.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{enquiry.itemName}</div>
                        <div className="text-xs text-gray-500">
                          {enquiry.itemCode || enquiry.itemCategory || enquiry.itemSource}
                        </div>
                      </td>
                      <td className="px-4 py-3">{enquiry.quantity}</td>
                      <td className="px-4 py-3">{formatDate(enquiry.createdAt)}</td>
                      <td className="px-4 py-3">
                        <select
                          aria-label={`Status for enquiry from ${enquiry.customerName}`}
                          value={enquiry.status}
                          disabled={updatingId === enquiry._id}
                          onChange={(event) =>
                            void handleStatusChange(
                              enquiry._id,
                              event.target.value as QuoteEnquiryStatus
                            )
                          }
                          className="rounded border border-gray-300 bg-white px-2 py-1.5 capitalize disabled:opacity-60"
                        >
                          {QUOTE_ENQUIRY_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => void handleSelectEnquiry(enquiry._id)}
                          className="rounded border border-gray-300 px-3 py-1.5 font-medium text-blue-700 hover:bg-blue-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <footer className="flex items-center justify-between border-t bg-gray-50 px-4 py-3 text-sm">
            <span className="text-gray-600">
              {total} {total === 1 ? "enquiry" : "enquiries"}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => current - 1)}
                className="rounded border px-3 py-1.5 disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {pageCount}
              </span>
              <button
                type="button"
                disabled={page >= pageCount || loading}
                onClick={() => setPage((current) => current + 1)}
                className="rounded border px-3 py-1.5 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </footer>
        </section>

        {selectedId && (
          <section className="mt-6 rounded-lg border bg-white p-5 shadow-sm" aria-labelledby="enquiry-detail-heading">
            {detailLoading ? (
              <p role="status">Loading enquiry details…</p>
            ) : detailError ? (
              <p className="text-sm text-red-700" role="alert">{detailError}</p>
            ) : selectedEnquiry ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 id="enquiry-detail-heading" className="text-xl font-semibold">
                      Enquiry details
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {selectedEnquiry.itemName}
                      {selectedEnquiry.itemCode ? ` · ${selectedEnquiry.itemCode}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId("");
                      setSelectedEnquiry(null);
                    }}
                    className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Close details
                  </button>
                </div>
                <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-gray-500">Customer</dt>
                    <dd>{selectedEnquiry.customerName}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Phone</dt>
                    <dd>{selectedEnquiry.phone}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Quantity</dt>
                    <dd>{selectedEnquiry.quantity}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Submitted</dt>
                    <dd>{formatDate(selectedEnquiry.createdAt)}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-gray-500">Requirements</dt>
                    <dd className="mt-1 whitespace-pre-wrap">
                      {selectedEnquiry.requirements || "No additional requirements."}
                    </dd>
                  </div>
                </dl>
              </>
            ) : null}
          </section>
        )}
      </main>
    </div>
  );
}
