/**
 * Data model: builds the sheet matrix, ranges and formula evaluation.
 */
function M() {
  return orient == 0
    ? [F.map((f) => f.name)].concat(
        Array.from({ length: mx() }, (_, r) =>
          F.map((f) => (f.v[r] === undefined ? "" : num(f.v[r]))),
        ),
      )
    : F.map((f) => [f.name, ...f.v.map(num)]);
}

const rng = (s) =>
  s.r1 == s.r2 && s.c1 == s.c2 ? addr(s.r1, s.c1) : addr(s.r1, s.c1) + ":" + addr(s.r2, s.c2);

const norm = (a, b) => ({
  r1: Math.min(a.r, b.r),
  r2: Math.max(a.r, b.r),
  c1: Math.min(a.c, b.c),
  c2: Math.max(a.c, b.c),
});

function vals(m, s) {
  const o = [];
  for (let r = s.r1; r <= s.r2; r++)
    for (let c = s.c1; c <= s.c2; c++) {
      const v = m[r] && m[r][c];
      o.push(v === undefined ? "" : v);
    }
  return o;
}

function calc(fn, m, s) {
  const a = vals(m, s),
    n = a.filter((v) => typeof v === "number"),
    nb = a.filter((v) => v !== "").length;
  if (fn == "COUNTA") return nb;
  if (fn == "COUNT") return n.length;
  if (!n.length) return "#VALUE!";
  const sum = n.reduce((x, y) => x + y, 0);
  let r;
  if (fn == "SUM") r = sum;
  else if (fn == "AVERAGE") r = sum / n.length;
  else if (fn == "MIN") r = Math.min(...n);
  else if (fn == "MAX") r = Math.max(...n);
  else {
    const t = [...n].sort((x, y) => x - y),
      h = t.length >> 1;
    r = t.length % 2 ? t[h] : (t[h - 1] + t[h]) / 2;
  }
  return Math.round(r * 1e10) / 1e10;
}

function clearCell(r, c) {
  const a = addr(r, c);
  if (FX[a]) {
    delete FX[a];
    return;
  }
  const i = orient == 0 ? c : r,
    j = orient == 0 ? r - 1 : c - 1,
    f = F[i];
  if (!f) return;
  if (j == -1) f.name = "";
  else if (j >= 0 && j < f.v.length) f.v[j] = "";
}

const trim = () =>
  F.forEach((f) => {
    while (f.v.length && f.v[f.v.length - 1] === "") f.v.pop();
  });
