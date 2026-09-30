/**
 * Left panel: headings and values entry form.
 */
function cards() {
  $("cards").innerHTML =
    F.map(
      (f, i) => `<div class="card">
  <div class="head"><input id="h${i}" value="${esc(f.name)}" placeholder="Heading (e.g. Name)" oninput="F[${i}].name=this.value;grid()"><button class="x" title="Remove heading" onclick="delField(${i})">✕</button></div>
  <label>Values under this heading</label>
  ${f.v.map((x, j) => `<div class="v"><b>${j + 1}</b><input id="v${i}_${j}" value="${esc(x)}" oninput="F[${i}].v[${j}]=this.value;grid()"><button class="x" onclick="delVal(${i},${j})">✕</button></div>`).join("")}
  <div class="add"><input id="n${i}" placeholder="Type a value, press Enter" onkeydown="if(event.key==='Enter')addVal(${i})"><button class="p" onclick="addVal(${i})">Add</button></div>
 </div>`,
    ).join("") ||
    '<div class="m" style="color:var(--mt);padding:20px;text-align:center">Click "+ Add new heading" to start.</div>';
  if (focus !== null) {
    const e = $("n" + focus);
    e && e.focus();
    focus = null;
  }
  mark();
}

function mark() {
  document.querySelectorAll("input.hl").forEach((e) => e.classList.remove("hl"));
  if (!hl) return;
  const e = $(hl.j == -1 ? "h" + hl.i : "v" + hl.i + "_" + hl.j);
  e && e.classList.add("hl");
}

function sync() {
  hl = null;
  if (sel && sel.r1 == sel.r2 && sel.c1 == sel.c2 && !FX[addr(sel.r1, sel.c1)]) {
    const i = orient == 0 ? sel.c1 : sel.r1,
      j = orient == 0 ? sel.r1 - 1 : sel.c1 - 1,
      f = F[i];
    if (f && j >= -1 && j < f.v.length) {
      hl = { i, j };
      mark();
      const e = $(j == -1 ? "h" + i : "v" + i + "_" + j);
      if (e) {
        e.scrollIntoView({ block: "nearest" });
        e.focus();
        e.select();
      }
      return;
    }
    if (f && j == f.v.length) {
      const e = $("n" + i);
      if (e) {
        e.scrollIntoView({ block: "nearest" });
        e.focus();
      }
    }
  }
  mark();
}

function addField() {
  F.push({ name: "", v: [] });
  cards();
  grid();
  const a = document.querySelectorAll(".head input");
  a[a.length - 1].focus();
  $("cards").scrollTop = 1e6;
}

function delField(i) {
  if (F[i].v.length && !confirm("Remove this heading and its values?")) return;
  F.splice(i, 1);
  cards();
  grid();
}

function addVal(i) {
  const e = $("n" + i);
  if (e.value.trim() === "") return;
  F[i].v.push(e.value.trim());
  flash = [i, F[i].v.length - 1];
  focus = i;
  cards();
  grid();
  setTimeout(() => {
    flash = null;
    grid();
  }, 1200);
}

function delVal(i, j) {
  F[i].v.splice(j, 1);
  cards();
  grid();
}

function clearAll() {
  if (!confirm("Clear everything?")) return;
  F = [];
  FX = {};
  sel = null;
  cards();
  grid();
}
