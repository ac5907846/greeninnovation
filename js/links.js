/* Links view: the 13 by 8 grid drawn as a structural grid plan. A circle at an intersection is a
   factor retained in the stepwise model of that indicator. */
window.Links = (function () {
  const A = window.App;
  const G = { left: 276, top: 104, col: 66, row: 26.5, gap: 21, width: 862 };
  const HEAD = {
    Y1: ["Employee", "health and", "safety"], Y2: ["Human", "resources", "quality"],
    Y3: ["Environ-", "mental", "awareness"], Y4: ["User", "comfort and", "satisfaction"],
    Y5: ["Stake-", "holder", "welfare"], Y6: ["Firm and", "community", "welfare"],
    Y7: ["Green", "corporate", "image"], Y8: ["Firm", "value and", "reputation"],
  };
  let D, state = { sel: { kind: "gif", code: "X7" }, encode: "beta" };
  let nodes = {}, rowY = {}, built = false, isReady = false;

  function link(x, y) {
    const m = D.ssis.find(function (s) { return s.code === y; }).model;
    return m.predictors.find(function (p) { return p.gif === x; }) || null;
  }

  function fillFor(boot, family) {
    if (boot >= 0.7) return A.fam(family);
    if (boot >= 0.5) return A.mono ? "url(#hatch)" : "url(#hatch-" + A.famKey(family) + ")";
    return "#fff";
  }

  function radius(p, x, y) {
    if (state.encode === "boot") return 4 + 10.5 * p.boot;
    if (state.encode === "r") return 5 + 22 * (D.pearson[x][y] - 0.3);
    return 5.5 + 25 * p.beta;
  }

  function build() {
    const host = document.getElementById("l-figure");
    host.innerHTML = "";
    let y = G.top;
    const famStart = {};
    D.families.forEach(function (f) {
      y += G.gap;
      famStart[f] = y;
      D.gifs.filter(function (g) { return g.family === f; }).forEach(function (g) {
        rowY[g.code] = y + G.row / 2;
        y += G.row;
      });
    });
    const height = y + 20;
    const right = G.left + G.col * D.ssis.length;
    const s = A.svg("svg", { viewBox: "0 0 " + G.width + " " + height, role: "img",
      "aria-label": "Grid of 13 green innovating factors by 8 social sustainability indicators" }, host);
    nodes = { col: {}, row: {}, cell: {}, tone: {} };

    D.ssis.forEach(function (sx, j) {
      const cx = G.left + G.col * (j + 0.5);
      const g = A.svg("g", { class: "colhead", tabindex: "0", role: "button", "aria-label": sx.code + " " + sx.short,
        style: "cursor:pointer" }, s);
      A.svg("line", { x1: cx, y1: G.top - 8, x2: cx, y2: height - 14, stroke: "#8f8f8f", "stroke-width": 0.8,
        "stroke-dasharray": "9 3 1.5 3" }, g);
      const lines = HEAD[sx.code] || A.wrap(sx.short, 11);
      lines.forEach(function (ln, k) {
        A.svg("text", { x: cx, y: G.top - 42 - (lines.length - 1 - k) * 12.5, "text-anchor": "middle",
          "font-size": 11, fill: "#000" }, g, ln);
      });
      const b = A.svg("circle", { cx: cx, cy: G.top - 22, r: 12.5, fill: "#fff", stroke: "#000", "stroke-width": 1.3 }, g);
      const t = A.svg("text", { x: cx, y: G.top - 18, "text-anchor": "middle", "font-size": 11.5, "font-weight": 600 }, g, sx.code);
      nodes.col[sx.code] = { g: g, bubble: b, text: t, line: g.querySelector("line") };
      g.addEventListener("click", function () { select("ssi", sx.code); });
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select("ssi", sx.code); } });
    });

    D.families.forEach(function (f) {
      const yy = famStart[f] - 7;
      A.svg("rect", { x: 8, y: yy - 9.5, width: 11, height: 11, fill: A.chip(f), stroke: A.fam(f), "stroke-width": 1 }, s);
      A.svg("text", { x: 26, y: yy, "font-size": 12, "font-weight": 600, fill: A.fam(f) }, s, f);
    });

    D.gifs.forEach(function (gx) {
      const cy = rowY[gx.code];
      const g = A.svg("g", { class: "rowhead", tabindex: "0", role: "button", "aria-label": gx.code + " " + gx.short,
        style: "cursor:pointer" }, s);
      A.svg("line", { x1: G.left - 8, y1: cy, x2: right + 10, y2: cy, stroke: "#8f8f8f", "stroke-width": 0.8,
        "stroke-dasharray": "9 3 1.5 3" }, g);
      A.svg("rect", { x: 0, y: cy - G.row / 2, width: G.left - 8, height: G.row, fill: "transparent" }, g);
      A.svg("text", { x: G.left - 44, y: cy + 4, "text-anchor": "end", "font-size": 12.5 }, g, gx.short);
      const b = A.svg("circle", { cx: G.left - 24, cy: cy, r: 12.5, fill: "#fff", stroke: "#000", "stroke-width": 1.3 }, g);
      const t = A.svg("text", { x: G.left - 24, y: cy + 4, "text-anchor": "middle", "font-size": gx.code.length > 2 ? 10.5 : 11.5,
        "font-weight": 600 }, g, gx.code);
      const n = D.ssis.filter(function (sx) { return link(gx.code, sx.code); }).length;
      const cnt = A.svg("text", { x: right + 20, y: cy + 4, "font-size": 12.5 }, g, String(n));
      nodes.row[gx.code] = { g: g, bubble: b, text: t, line: g.querySelector("line"), count: cnt };
      g.addEventListener("click", function () { select("gif", gx.code); });
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select("gif", gx.code); } });
    });
    A.svg("text", { x: right + 20, y: G.top - 18, "font-size": 11.5, fill: "#3d3d3d" }, s, "of 8");

    const layerTone = A.svg("g", {}, s);
    const layerCell = A.svg("g", {}, s);
    D.gifs.forEach(function (gx) {
      D.ssis.forEach(function (sx, j) {
        const cx = G.left + G.col * (j + 0.5), cy = rowY[gx.code];
        const key = gx.code + "-" + sx.code;
        const p = link(gx.code, sx.code);
        const tone = A.svg("rect", { x: cx - 9, y: cy - 9, width: 18, height: 18, fill: "#000", opacity: 0, "pointer-events": "none" }, layerTone);
        nodes.tone[key] = tone;
        const hit = A.svg("g", { style: "cursor:pointer" }, layerCell);
        A.svg("rect", { x: cx - G.col / 2, y: cy - G.row / 2, width: G.col, height: G.row, fill: "transparent" }, hit);
        let c = null, lab = null;
        if (p) {
          c = A.svg("circle", { cx: cx, cy: cy, r: 8, fill: fillFor(p.boot, gx.family), stroke: A.fam(gx.family), "stroke-width": 1.4 }, hit);
          lab = A.svg("text", { x: cx, y: cy + 3.6, "text-anchor": "middle", "font-size": 10, "font-weight": 600,
            "pointer-events": "none", opacity: 0 }, hit, A.fmt(p.beta, 2));
        } else {
          A.svg("path", { d: "M" + (cx - 3) + " " + cy + "H" + (cx + 3) + "M" + cx + " " + (cy - 3) + "V" + (cy + 3),
            stroke: "#8f8f8f", "stroke-width": 0.9 }, hit);
        }
        nodes.cell[key] = { c: c, lab: lab, p: p, x: gx.code, y: sx.code, fam: gx.family };
        hit.addEventListener("mousemove", function (e) {
          let h = "<b>" + gx.code + " and " + sx.code + "</b><br>Pearson r " + A.fmt(D.pearson[gx.code][sx.code], 2);
          if (p) {
            h += "<br>Standardized coefficient " + A.fmt(p.beta, 2) + "<br>Retained in " + A.pct(p.boot) + " of " +
              D.meta.n_boot.toLocaleString("en-US") + " resamples";
          } else {
            h += "<br>Not retained in the model (" + A.pct(D.boot[gx.code][sx.code]) + " of resamples)";
          }
          A.tip(e, h);
        });
        hit.addEventListener("mouseleave", A.untip);
        hit.addEventListener("click", function () { select("ssi", sx.code); });
      });
    });
    built = true;
  }

  function paint() {
    if (!built) return;
    const sel = state.sel;
    D.ssis.forEach(function (sx) {
      const n = nodes.col[sx.code], on = sel.kind === "ssi" && sel.code === sx.code;
      n.bubble.setAttribute("fill", on ? A.color("accent") : "#fff");
      n.bubble.setAttribute("stroke", on ? A.color("accent") : A.color("ink"));
      n.text.setAttribute("fill", on ? "#fff" : A.color("ink"));
      n.line.setAttribute("stroke", on ? A.color("accent") : "#8f8f8f");
      n.line.setAttribute("stroke-width", on ? 1.5 : 0.8);
    });
    D.gifs.forEach(function (gx) {
      const n = nodes.row[gx.code], on = sel.kind === "gif" && sel.code === gx.code;
      n.bubble.setAttribute("fill", on ? A.color("accent") : "#fff");
      n.bubble.setAttribute("stroke", on ? A.color("accent") : A.color("ink"));
      n.text.setAttribute("fill", on ? "#fff" : A.color("ink"));
      n.line.setAttribute("stroke", on ? A.color("accent") : "#8f8f8f");
      n.line.setAttribute("stroke-width", on ? 1.5 : 0.8);
    });
    Object.keys(nodes.cell).forEach(function (key) {
      const n = nodes.cell[key];
      const active = (sel.kind === "ssi" && n.y === sel.code) || (sel.kind === "gif" && n.x === sel.code);
      nodes.tone[key].setAttribute("opacity", state.encode === "r" ? Math.max(0, (D.pearson[n.x][n.y] - 0.36) * 1.5) : 0);
      if (!n.c) return;
      const r = radius(n.p, n.x, n.y) * (active ? 1.12 : 1);
      n.c.setAttribute("r", r.toFixed(1));
      n.c.setAttribute("opacity", active ? 1 : 0.42);
      const dark = n.p.boot >= 0.7;
      const show = active && r >= 10.5 && n.p.boot >= 0.7 || active && r >= 10.5 && n.p.boot < 0.5;
      n.lab.setAttribute("opacity", show ? 1 : 0);
      n.lab.setAttribute("fill", dark ? "#fff" : A.fam(n.fam));
    });
    readout();
  }

  function readout() {
    const host = document.getElementById("l-readout");
    const sel = state.sel;
    if (!host._built) {
      host.innerHTML = "";
      const head = A.el("div", { class: "ro-head" }, host);
      const body = A.el("div", { class: "ro-body" }, host);
      host._code = A.el("div", { class: "code" }, head);
      host._name = A.el("h3", {}, head);
      host._full = A.el("p", { class: "full" }, head);
      const big = A.el("div", { class: "big" }, head);
      host._num = A.el("b", {}, big);
      host._cap = A.el("span", {}, big);
      host._table = A.el("table", {}, body);
      host._foot = A.el("p", { class: "foot" }, body);
      host._built = true;
    }
    host._table.innerHTML = "";
    const head = A.el("tr", {}, A.el("thead", {}, host._table));
    const body = A.el("tbody", {}, host._table);
    if (sel.kind === "ssi") {
      const sx = D.ssis.find(function (s) { return s.code === sel.code; });
      host._code.textContent = "Social sustainability indicator " + sx.code;
      host._name.textContent = sx.short;
      host._full.textContent = sx.label + ". Mean rating " + sx.mean.total.toFixed(2) + " of 5.";
      host._num.style.color = "";
      host._num.textContent = A.fmt(sx.model.adjR2, 2);
      host._cap.textContent = "adjusted R² of the model with " + sx.model.predictors.length + " factors";
      ["Factor retained", "β", "Stability"].forEach(function (h, k) { A.el("th", { class: k ? "num" : "" }, head, h); });
      const maxB = 0.4;
      sx.model.predictors.slice().sort(function (a, b) { return b.beta - a.beta; }).forEach(function (p) {
        const gx = D.gifs.find(function (g) { return g.code === p.gif; });
        const tr = A.el("tr", {}, body);
        const td = A.el("td", { class: "nm" }, tr);
        td.appendChild(document.createTextNode(p.gif + "  " + gx.short + (p.kept_without_uniform ? "" : " †")));
        const bar = A.el("span", { class: "bar" }, td);
        bar.style.width = Math.round(p.beta / maxB * 100) + "%";
        bar.style.background = A.fam(gx.family);
        A.el("td", { class: "num" }, tr, A.fmt(p.beta, 2));
        A.el("td", { class: "num" }, tr, A.pct(p.boot));
      });
      const dropped = sx.model.predictors.some(function (p) { return !p.kept_without_uniform; });
      host._foot.textContent = "Stability is the share of " + D.meta.n_boot.toLocaleString("en-US") +
        " bootstrap resamples in which the factor is retained." +
        (dropped ? " † Not retained when the " + D.meta.n_uniform + " uniform respondents are left out." : "");
    } else {
      const gx = D.gifs.find(function (g) { return g.code === sel.code; });
      const hits = D.ssis.filter(function (sx) { return link(gx.code, sx.code); });
      host._code.textContent = gx.family + ", factor " + gx.code;
      host._name.textContent = gx.short;
      host._full.textContent = gx.label + ". Mean rating " + gx.mean.total.toFixed(2) + " of 5, rank " + gx.rank.total + " of 13.";
      host._num.textContent = String(hits.length);
      host._num.style.color = A.fam(gx.family);
      host._cap.textContent = "of 8 indicators retain this factor";
      ["Indicator", "β", "Stability"].forEach(function (h, k) { A.el("th", { class: k ? "num" : "" }, head, h); });
      hits.forEach(function (sx) {
        const p = link(gx.code, sx.code);
        const tr = A.el("tr", {}, body);
        const td = A.el("td", { class: "nm" }, tr);
        td.appendChild(document.createTextNode(sx.code + "  " + sx.short));
        const bar = A.el("span", { class: "bar" }, td);
        bar.style.width = Math.round(p.beta / 0.4 * 100) + "%";
        bar.style.background = A.fam(gx.family);
        A.el("td", { class: "num" }, tr, A.fmt(p.beta, 2));
        A.el("td", { class: "num" }, tr, A.pct(p.boot));
      });
      const rs = D.ssis.map(function (sx) { return D.pearson[gx.code][sx.code]; });
      host._foot.textContent = hits.length ? "" :
        "Correlated with all eight indicators (r " + A.fmt(Math.min.apply(null, rs), 2) + " to " +
        A.fmt(Math.max.apply(null, rs), 2) + "), but it adds little once the other factors are in the models.";
    }
  }

  function key() {
    const host = document.getElementById("l-key");
    host.innerHTML = "";
    function item(draw, text) {
      const sp = A.el("span", {}, host);
      const s = A.svg("svg", { width: 20, height: 20, viewBox: "0 0 20 20" }, sp);
      draw(s);
      sp.appendChild(document.createTextNode(text));
    }
    item(function (s) { A.svg("circle", { cx: 10, cy: 10, r: 7.5, fill: "#000", stroke: "#000" }, s); }, "retained in 70% or more of resamples");
    item(function (s) { A.svg("circle", { cx: 10, cy: 10, r: 7.5, fill: "url(#hatch)", stroke: "#000", "stroke-width": 1.2 }, s); }, "50% to 69%");
    item(function (s) { A.svg("circle", { cx: 10, cy: 10, r: 7.5, fill: "#fff", stroke: "#000", "stroke-width": 1.2 }, s); }, "below 50%");
    item(function (s) { A.svg("path", { d: "M6 10H14M10 6V14", stroke: "#8f8f8f", "stroke-width": 1 }, s); }, "not retained");
    const size = { beta: "Circle size: standardized coefficient", boot: "Circle size: stability",
      r: "Circle size and square shade: Pearson correlation" }[state.encode];
    A.el("span", {}, host, size);
  }

  function select(kind, code) {
    state.sel = { kind: kind, code: code };
    paint();
  }

  function init(data) {
    D = data;
    build();
    key();
    document.querySelectorAll("#l-encode button").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll("#l-encode button").forEach(function (o) { o.classList.toggle("on", o === b); });
        state.encode = b.getAttribute("data-v");
        key();
        paint();
      });
    });
    paint();
    isReady = true;
  }

  return { init: init, ready: function () { return isReady; }, select: select,
           encode: function (v) { state.encode = v; key(); paint(); } };
})();
