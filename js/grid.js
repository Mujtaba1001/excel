/**
 * Right panel: Excel-like grid, selection, toolbar and formulas placement.
 */
function grid() {
  $("o0").className = orient == 0 ? "on" : "";
  $("o1").className = orient == 1 ? "on" : "";
  const m = M(),
    R = Math.max(m.length + 4, 10),
    C = Math.max(1, ...m.map((r) => r.length)) + 3,
    CC = Math.max(C, 6);
  let h =
    "<table><tr><th></th>" +
    Array.from({ length: CC }, (_, c) => `<th>${colL(c)}</th>`).join("") +
    "</tr>";
  for (let r = 0; r < R; r++) {
    h += `<tr><td class="r">${r + 1}</td>`;
    for (let c = 0; c < CC; c++) {
      const a = addr(r, c),
        f = FX[a];
      let cls = "cell",
        v = m[r] && m[r][c] !== undefined ? m[r][c] : "";
      if (f) {
        cls += " fx";
        v = calc(f.fn, m, f.s);
      } else {
        if (orient == 0 ? r == 0 : c == 0) {
          if (v !== "") cls += " h";
        }
        if (
          flash &&
          (orient == 0 ? flash[0] == c && flash[1] + 1 == r : flash[0] == r && flash[1] + 1 == c)
        )
          cls += " new";
      }
      h += `<td class="${cls}" data-r="${r}" data-c="${c}"${f ? ` title="=${f.fn}(${rng(f.s)})"` : ""}>${esc(v)}</td>`;
    }
    h += "</tr>";
  }
  $("gw").innerHTML = h + "</table>";
  paint();
  toolbar();
}

function paint() {
  document.querySelectorAll("td.cell").forEach((td) => {
    const r = +td.dataset.r,
      c = +td.dataset.c;
    td.classList.toggle("sel", !!sel && r >= sel.r1 && r <= sel.r2 && c >= sel.c1 && c <= sel.c2);
  });
}

function toolbar(warn) {
  const t = $("tb");
  document.body.classList.toggle("pick", !!pick);
  if (pick) {
    t.innerHTML =
      (warn
        ? `<span class="w">${warn}</span>`
        : `<span class="m">Now click the empty cell where you want the <b>${pick}</b> answer</span>`) +
      '<button onclick="cancelPick()">Cancel</button>';
    return;
  }
  if (!sel) {
    t.innerHTML =
      '<span class="m">Select cells (click or drag) to see the functions you can use.</span>';
    return;
  }
  const m = M(),
    a = vals(m, sel),
    n = a.filter((v) => typeof v === "number"),
    nb = a.filter((v) => v !== "").length;
  let h = `<span class="r">${rng(sel)}</span>`;
  const one = sel.r1 == sel.r2 && sel.c1 == sel.c2,
    f = one && FX[addr(sel.r1, sel.c1)];
  if (f) h += `<span class="r">fx = ${f.fn}(${rng(f.s)})</span>`;
  else {
    const fns = n.length
      ? ["SUM", "AVERAGE", "MIN", "MAX", "COUNT", "MEDIAN", "COUNTA"]
      : nb
        ? ["COUNTA"]
        : [];
    h += fns.length
      ? fns
          .map(
            (x) =>
              `<button class="fb" onclick="startPick('${x}')">${x}<i>${calc(x, m, sel)}</i></button>`,
          )
          .join("")
      : '<span class="m">Nothing to calculate in these cells.</span>';
  }
  let can = false;
  for (let r = sel.r1; r <= sel.r2; r++)
    for (let c = sel.c1; c <= sel.c2; c++)
      if (FX[addr(r, c)] || (m[r] && m[r][c] !== undefined && m[r][c] !== "")) can = true;
  if (can)
    h +=
      '<button style="color:var(--dg);border-color:var(--dg);margin-left:auto" onclick="delSel()">🗑 Delete</button>';
  t.innerHTML = h;
}

function delSel() {
  for (let r = sel.r1; r <= sel.r2; r++) for (let c = sel.c1; c <= sel.c2; c++) clearCell(r, c);
  trim();
  cards();
  grid();
}

function startPick(fn) {
  pick = fn;
  toolbar();
}

function cancelPick() {
  pick = null;
  toolbar();
}

function rmFx() {
  delete FX[addr(sel.r1, sel.c1)];
  grid();
}

function place(r, c) {
  if (r >= sel.r1 && r <= sel.r2 && c >= sel.c1 && c <= sel.c2) {
    toolbar("Choose a cell outside the selected cells.");
    return;
  }
  const m = M(),
    v = m[r] && m[r][c],
    a = addr(r, c),
    f = FX[a];
  if (f || (v !== undefined && v !== "")) {
    const cur = f ? `=${f.fn}(${rng(f.s)})` : v;
    ask(
      `Cell <b>${a}</b> already contains <b>${esc(cur)}</b>.<br><br>Do you want to place the ${pick} answer here and replace it?`,
      () => fin(r, c),
      "Yes, place here",
      "No, choose another cell",
    );
    return;
  }
  fin(r, c);
}

function fin(r, c) {
  clearCell(r, c);
  trim();
  FX[addr(r, c)] = { fn: pick, s: { ...sel } };
  pick = null;
  sel = { r1: r, r2: r, c1: c, c2: c };
  anchor = { r, c };
  hl = null;
  cards();
  grid();
}

function setO(o) {
  if (o == orient) return;
  if (Object.keys(FX).length && !confirm("Changing layout will remove your formulas. Continue?"))
    return;
  orient = o;
  FX = {};
  sel = null;
  grid();
}
