/**
 * Global mouse and keyboard event wiring for the grid.
 */
$("gw").addEventListener("mousedown", (e) => {
  const td = e.target.closest("td.cell");
  if (!td) return;
  const r = +td.dataset.r,
    c = +td.dataset.c;
  if (pick) {
    place(r, c);
    return;
  }
  if (e.shiftKey && anchor) sel = norm(anchor, { r, c });
  else {
    anchor = { r, c };
    sel = norm(anchor, anchor);
  }
  drag = true;
  paint();
  toolbar();
  e.preventDefault();
});

$("gw").addEventListener("mouseover", (e) => {
  if (!drag) return;
  const td = e.target.closest("td.cell");
  if (!td) return;
  sel = norm(anchor, { r: +td.dataset.r, c: +td.dataset.c });
  paint();
});

document.addEventListener("mouseup", () => {
  if (drag) {
    drag = false;
    toolbar();
    sync();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key == "Escape") {
    if ($("md").style.display == "flex") $("md").style.display = "none";
    else if (pick) cancelPick();
  }
  if (
    (e.key == "Delete" || e.key == "Backspace") &&
    !pick &&
    sel &&
    !/INPUT/.test(document.activeElement.tagName)
  ) {
    e.preventDefault();
    delSel();
  }
});
