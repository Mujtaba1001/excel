/**
 * Application state: the single source of truth.
 */
let F = [
  { name: "Item", v: ["Rice", "Oil", "Sugar"] },
  { name: "Price", v: ["120", "450", "90"] },
  { name: "Qty", v: ["2", "1", "3"] },
];

let orient = 0,
  flash = null,
  focus = null,
  sel = null,
  anchor = null,
  drag = false,
  pick = null,
  FX = {};

let hl = null;

// Default file name offered when saving (updated when a file is opened).
let fileName = "my-data";
