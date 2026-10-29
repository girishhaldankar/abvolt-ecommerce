import { FormEvent, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import {
  QuoteRequestPayload,
  submitQuoteRequest,
} from "../services/quotes.service";

export interface QuoteItemReference {
  itemSource: QuoteRequestPayload["itemSource"];
  itemId: string;
  itemName: string;
  itemCode?: string;
  itemCategory?: string;
  divisionId?: string;
  audienceId?: string;
  streamId?: string;
  categoryId?: string;
}

interface QuoteRequestModalProps {
  item: QuoteItemReference;
  onClose: () => void;
}

export default function QuoteRequestModal({
  item,
  onClose,
}: QuoteRequestModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [requirements, setRequirements] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submissionLock = useRef(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current || submitted) return;

    submissionLock.current = true;
    setSubmitting(true);
    setError("");
    try {
      await submitQuoteRequest({
        itemSource: item.itemSource,
        itemId: item.itemId,
        customerName,
        phone,
        quantity: Number(quantity),
        requirements,
        divisionId: item.divisionId,
        audienceId: item.audienceId,
        streamId: item.streamId,
        categoryId: item.categoryId,
      });
      setSubmitted(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to submit your quote request. Please try again."
      );
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-700">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-blue-700 dark:text-cyan-400">
              ABVOLT
            </p>
            <h2 id="quote-modal-title" className="mt-1 text-xl font-bold">
              Request a Quote
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              {item.itemCode ? `Product Code: ${item.itemCode}` : item.itemCategory || "Product"}
            </p>
            <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
              {item.itemName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close quote form"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="space-y-4 p-5" role="status">
            <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
              Your quote request has been submitted successfully. Our team will
              contact you.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            {error && (
              <p
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="space-y-1.5">
              <label htmlFor="quote-name" className="text-sm font-medium">
                Your name
              </label>
              <input
                id="quote-name"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                required
                maxLength={120}
                autoComplete="name"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="quote-phone" className="text-sm font-medium">
                Phone number
              </label>
              <input
                id="quote-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
                maxLength={32}
                autoComplete="tel"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="quote-quantity" className="text-sm font-medium">
                Quantity required
              </label>
              <input
                id="quote-quantity"
                type="number"
                min="1"
                max="100000"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="quote-requirements" className="text-sm font-medium">
                Additional requirements (optional)
              </label>
              <textarea
                id="quote-requirements"
                value={requirements}
                onChange={(event) => setRequirements(event.target.value)}
                maxLength={2000}
                rows={3}
                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
            >
              <Send size={16} />
              {submitting ? "Submitting..." : "Submit Quote Request"}
            </button>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Your contact information will be used to respond to this enquiry.
            </p>
          </form>
        )}
      </section>
    </div>
  );
}
