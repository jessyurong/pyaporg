export const todayStr = () => new Date().toISOString().slice(0, 10);

export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const csvCell = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function downloadCSV(filename, headers, rows) {
  const lines = [headers, ...rows].map((r) => r.map(csvCell).join(","));
  downloadBlob(filename, new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" }));
}

export const fmtBirthday = (d) => (d ? new Date(String(d).slice(0, 10) + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—");
