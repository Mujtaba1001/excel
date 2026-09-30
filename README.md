# Excel Builder

A browser-based tool that lets people who don't know Excel build a spreadsheet
through a simple form, while watching a live Excel-style preview. Formulas
(SUM, AVERAGE, MIN, MAX, COUNT, MEDIAN, COUNTA) can be added by selecting cells,
and the result is exported as a real `.xlsx` file with working formulas.

No installation, no server, no internet required.

## Run

1. Unzip the folder.
2. Double-click `index.html` (opens in Chrome, Edge or Firefox).

## How to use

0. **Open existing file:** click "📂 Open Excel file" and choose an `.xlsx`, `.xls` or `.csv`.
   Row 1 becomes the headings and the rows below fill the "Your data" panel, ready to edit.
1. **Left panel:** click "+ Add new heading", name it, then type values one by one (Enter adds).
2. **Right panel:** the sheet updates live. Toggle "Headings across / down" for the layout.
3. **Formulas:** select cells (click, drag, or Shift+click), choose a function
   (its answer is previewed on the button), then click an empty cell for the result.
   If the cell is occupied, a dialog asks whether to replace it.
4. **Delete:** select cells and press the Delete button (or the Delete key) to clear them.
5. **Edit:** clicking one cell highlights and focuses its value in the left panel.
6. **Save as Excel:** downloads an `.xlsx` file. Work is not auto-saved, so save before closing the tab.

## Project structure

```
excel-builder/
├── index.html            Page markup and script loading order
├── css/
│   └── styles.css        All styling (light/dark theme via CSS variables)
├── js/
│   ├── state.js          Application state (F = data, FX = formulas, selection, mode)
│   ├── utils.js          Helpers: DOM lookup, escaping, cell addresses (A1 style)
│   ├── model.js          Sheet matrix builder, ranges, formula evaluation, cell clearing
│   ├── dialog.js         Reusable confirmation dialog
│   ├── panel.js          Left panel: headings/values form, highlight sync
│   ├── grid.js           Right panel: grid render, selection, toolbar, formula placement
│   ├── events.js         Mouse and keyboard wiring for the grid
│   ├── export.js         .xlsx export (values + real Excel formulas)
│   ├── import.js         Open an existing .xlsx/.xls/.csv into the data panel
│   └── app.js            Entry point (first render)
├── vendor/
│   ├── xlsx.full.min.js  SheetJS 0.18.5 (bundled for offline use)
│   └── SHEETJS-LICENSE.txt
└── README.md
```

Scripts are plain (non-module) files loaded in order, so the app works when opened
directly from disk (`file://`); ES modules would be blocked by the browser there.

## Data model

- `F`: array of fields `{ name, v: [values...] }`, the source of truth for entered data.
- `FX`: map of cell address to formula `{ fn, s: {r1,c1,r2,c2} }`, e.g. `"B6": { fn: "SUM", ... }`.
- `M()` builds the 2-D sheet matrix from `F` for the chosen orientation; the grid,
  formula evaluation and export all read from it.

## Known limitations

- One sheet only; no auto-save.
- Opening a file reads the first sheet only (row 1 = headings), converts formulas to their values,
  keeps dates as text (yyyy-mm-dd), and loads at most 1000 rows and 50 columns.
- Formulas apply to a selected rectangular range and cannot reference other formula cells.
- Changing layout (across/down) removes formulas because cell addresses change.

## Ideas for next steps

Auto-save (localStorage), sheet picker on import, undo/redo, multiple sheets,
per-column types (number, date, dropdown), unit tests for `model.js`.

## Third-party

SheetJS Community Edition (Apache-2.0), see `vendor/SHEETJS-LICENSE.txt`.
