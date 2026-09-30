/**
 * Import an existing Excel/CSV file into the "Your data" panel.
 * Reads the first sheet: row 1 = headings, the rows below = values.
 */
const IMPORT_LIMITS = { rows: 1000, cols: 50 };

function cellToString(v) {
  if (v instanceof Date) return isNaN(v) ? "" : v.toISOString().slice(0, 10);
  return v === null || v === undefined ? "" : String(v).trim();
}

/** Parse a workbook buffer into raw rows plus a few facts for user messages. */
function parseWorkbook(buf) {
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: true });
  const formulas = Object.keys(ws).filter((k) => k[0] !== "!" && ws[k].f).length;
  return { rows, formulas, sheets: wb.SheetNames.length, sheetName: wb.SheetNames[0] };
}

/** Convert raw rows (first row = headings) into the app's field structure. */
function rowsToFields(rows) {
  const fields = [];
  if (!rows.length) return { fields, truncated: false };
  const fullWidth = Math.max(0, ...rows.map((r) => r.length));
  const width = Math.min(fullWidth, IMPORT_LIMITS.cols);
  const body = rows.slice(1, 1 + IMPORT_LIMITS.rows);
  for (let c = 0; c < width; c++) {
    const name = cellToString(rows[0][c]);
    const v = body.map((r) => cellToString(r[c]));
    while (v.length && v[v.length - 1] === "") v.pop();
    if (name === "" && !v.length) continue; // fully empty column
    fields.push({ name, v });
  }
  const truncated = rows.length - 1 > IMPORT_LIMITS.rows || fullWidth > IMPORT_LIMITS.cols;
  return { fields, truncated };
}

/** Replace the app state with imported fields and redraw everything. */
function loadFields(fields) {
  F = fields;
  orient = 0;
  FX = {};
  sel = anchor = hl = flash = pick = null;
  cards();
  grid();
}

const notice = (msg) => ask(msg, () => {}, "OK", "");
const hasData = () => F.some((f) => f.name || f.v.length);

async function openFile(file) {
  let parsed, result;
  try {
    parsed = parseWorkbook(await file.arrayBuffer());
    result = rowsToFields(parsed.rows);
  } catch (err) {
    notice("Sorry, this file could not be read. Please choose a valid Excel (.xlsx) file.");
    return;
  }
  if (!result.fields.length) {
    notice("This file has no data in its first sheet.");
    return;
  }
  const apply = () => {
    loadFields(result.fields);
    fileName = file.name.replace(/\.[^.]+$/, "");
    const notes = [];
    if (parsed.sheets > 1)
      notes.push(`Only the first sheet (<b>${esc(parsed.sheetName)}</b>) was opened.`);
    if (parsed.formulas)
      notes.push(
        `${parsed.formulas} formula(s) were converted to their values. You can add formulas again.`,
      );
    if (result.truncated)
      notes.push(
        `Very large file: only the first ${IMPORT_LIMITS.rows} rows and ${IMPORT_LIMITS.cols} columns were loaded.`,
      );
    if (notes.length) notice(notes.join("<br><br>"));
  };
  if (hasData()) {
    ask(
      `Open <b>${esc(file.name)}</b>?<br><br>This will replace the data you have now.`,
      apply,
      "Yes, open it",
      "Cancel",
    );
  } else {
    apply();
  }
}

$("file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  e.target.value = ""; // allow choosing the same file again
  if (file) openFile(file);
});
