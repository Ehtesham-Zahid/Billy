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
 * Renders a lightweight, non-blocking toast overlay on the client browser.
 */
export function showToast(message: string) {
  if (typeof window === "undefined") return;

  let container = document.getElementById("billy-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "billy-toast-container";
    container.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; pointer-events: none;";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.style.cssText = "background-color: #18181b; color: #fafafa; border: 1px solid #27272a; padding: 10px 16px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); font-size: 13px; font-weight: 500; font-family: sans-serif; pointer-events: auto; min-width: 200px; transform: translateY(20px); opacity: 0; transition: all 0.25s ease-out;";
  toast.innerText = message;

  container.appendChild(toast);

  // Trigger entrance transition
  requestAnimationFrame(() => {
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";
  });

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.transform = "translateY(20px)";
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.remove();
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 250);
  }, 3000);
}

