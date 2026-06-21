import { toast } from "react-hot-toast";

/**
 * Computes the effective display status of an invoice.
 * An invoice is "effectively overdue" if its stored status is "sent" AND its dueDate is in the past.
 */
export function getComputedInvoiceStatus(status: string, dueDate: string | Date): "draft" | "sent" | "paid" | "overdue" {
  if (status === "sent") {
    const due = new Date(dueDate);
    const now = new Date();
    if (due < now) {
      return "overdue";
    }
  }
  return status as "draft" | "sent" | "paid" | "overdue";
}

/**
 * Renders a lightweight, non-blocking toast overlay on the client browser using react-hot-toast.
 */
export function showToast(message: string) {
  const lowerMsg = message.toLowerCase();
  const isError = lowerMsg.includes("error") || lowerMsg.includes("fail") || lowerMsg.includes("unauthorized") || lowerMsg.includes("invalid") || lowerMsg.includes("cannot");
  
  if (isError) {
    toast.error(message);
  } else {
    toast.success(message);
  }
}

