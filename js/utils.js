/**
 * Small pure helpers (DOM lookup, escaping, cell addressing).
 */
const $ = (id) => document.getElementById(id);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const num = (s) => (s !== "" && !isNaN(s) ? Number(s) : s);

const colL = (n) => {
  let s = "";
  n++;
  while (n > 0) {
    s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

const addr = (r, c) => colL(c) + (r + 1);

const mx = () => Math.max(0, ...F.map((f) => f.v.length));
