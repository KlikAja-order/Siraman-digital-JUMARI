/**
 * General Utilities & Helper Functions - Siraman Digital
 */

// Format Tanggal Indonesia
export const formatDate = (timestamp) => {
  if (!timestamp) return "-";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
};

// Sanitasi String untuk Mencegah XSS (Cross Site Scripting)
export const sanitizeInput = (str) => {
  if (!str) return "";
  const div = document.createElement("div");
  div.innerText = str;
  return div.innerHTML;
};

// Pemotong Teks Panjang (Excerpt)
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
};

// Toast Notification
export const showToast = (message, type = "success") => {
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = `toast-notification toast-${type} fade-in`;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 12px 24px;
    border-radius: 8px;
    background: ${type === "success" ? "#10B981" : "#EF4444"};
    color: #FFFFFF;
    font-weight: 500;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
    z-index: 9999;
  `;
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
};
