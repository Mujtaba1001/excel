/**
 * Excel (.xlsx) export using SheetJS, including real formulas.
 */
function save() {
  const m = M(),
    C = Math.max(1, ...m.map((r) => r.length));
  const ws = XLSX.utils.aoa_to_sheet(
    m.map((r) => Array.from({ length: C }, (_, c) => (r[c] === undefined ? "" : r[c]))),
  );
  let R = m.length,
    CW = C;
  for (const a in FX) {
    const f = FX[a],
      p = XLSX.utils.decode_cell(a),
      v = calc(f.fn, m, f.s);
    ws[a] = {
      t: typeof v === "number" ? "n" : "e",
      v: typeof v === "number" ? v : 15,
      f: `${f.fn}(${rng(f.s)})`,
    };
    R = Math.max(R, p.r + 1);
    CW = Math.max(CW, p.c + 1);
  }
  ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: R - 1, c: CW - 1 } });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const name = (prompt("File name:", fileName) || "").trim();
  if (!name) return;
  const filename = name.replace(/\.xlsx$/i, "") + ".xlsx";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([buf]));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
