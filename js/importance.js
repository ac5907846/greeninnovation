/* Importance view: mean rating of each factor for the four firm types, ordered by the chosen group. */
window.Importance = (function () {
  const A = window.App;
  let D, group = "total", isReady = false;
  const W = 1180, left = 318, right = 1000, top = 46, row = 31;
  const x0 = 3.45, x1 = 4.5;

  function sx(v) { return left + (v - x0) / (x1 - x0) * (right - left); }

  function marker(parent, type, x, y, on) {
    const a = { fill: on ? A.color("accent") : "#fff", stroke: on ? A.color("accent") : A.color("ink"), "stroke-width": 1.3 };
    const s = on ? 6.5 : 5.2;
    if (type === "Contractor") return A.svg("circle", Object.assign({ cx: x, cy: y, r: s }, a), parent);
    if (type === "Owner") return A.svg("rect", Object.assign({ x: x - s, y: y - s, width: 2 * s, height: 2 * s }, a), parent);
    if (type === "Consultant") {
      const t = s * 1.25;
      return A.svg("path", Object.assign({ d: "M" + x + " " + (y - t) + "L" + (x + t) + " " + (y + t * 0.8) + "L" + (x - t) + " " + (y + t * 0.8) + "Z" }, a), parent);
    }
    const d = s * 1.3;
    return A.svg("path", Object.assign({ d: "M" + x + " " + (y - d) + "L" + (x + d) + " " + y + "L" + x + " " + (y + d) + "L" + (x - d) + " " + y + "Z" }, a), parent);
  }

  function draw() {
    const host = document.getElementById("i-figure");
    host.innerHTML = "";
    const rows = D.gifs.slice().sort(function (a, b) { return b.mean[group] - a.mean[group]; });
    const H = top + row * rows.length + 44;
    const s = A.svg("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Mean importance ratings by firm type" }, host);
    rows.forEach(function (g, i) {
      A.svg("rect", { x: 0, y: top + row * i, width: W, height: row, fill: i % 2 === 0 ? "#f4f4f4" : "#fff" }, s);
    });
    [3.5, 3.75, 4.0, 4.25, 4.5].forEach(function (v) {
      A.svg("line", { x1: sx(v), y1: top - 6, x2: sx(v), y2: top + row * rows.length, stroke: "#c9c9c9", "stroke-width": 1 }, s);
      A.svg("text", { x: sx(v), y: top + row * rows.length + 17, "text-anchor": "middle", "font-size": 12.5 }, s, v.toFixed(2));
    });
    A.svg("text", { x: (left + right) / 2, y: H - 6, "text-anchor": "middle", "font-size": 12.5, fill: "#3d3d3d" }, s,
      "Mean importance rating (1 = not important, 5 = very important)");
    A.svg("text", { x: right + 34, y: top - 16, "font-size": 12, fill: "#3d3d3d" }, s, "Rank");
    A.svg("text", { x: right + 92, y: top - 16, "font-size": 12, fill: "#3d3d3d" }, s, "ANOVA p");
    let lx = left;
    D.firm_types.forEach(function (t) {
      marker(s, t, lx + 7, top - 26, t === group);
      const tx = A.svg("text", { x: lx + 19, y: top - 21.5, "font-size": 12.5 }, s, t + " (n = " + D.meta.n_by_group[t] + ")");
      lx += 34 + tx.getComputedTextLength();
    });
    A.svg("line", { x1: lx + 4, y1: top - 34, x2: lx + 4, y2: top - 18, stroke: "#000", "stroke-width": 2.6 }, s);
    A.svg("text", { x: lx + 12, y: top - 21.5, "font-size": 12.5 }, s, "All respondents (n = " + D.meta.n + ")");

    rows.forEach(function (g, i) {
      const y = top + row * (i + 0.5);
      const grp = A.svg("g", {}, s);
      A.svg("rect", { x: 0, y: y - row / 2, width: W, height: row, fill: "transparent" }, grp);
      A.svg("text", { x: left - 34, y: y + 4.5, "text-anchor": "end", "font-size": 13.5 }, grp, g.code + "  " + g.short);
      A.svg("rect", { x: left - 24, y: y - 6, width: 12, height: 12, fill: A.chip(g.family), stroke: A.fam(g.family), "stroke-width": 1 }, grp);
      const vals = D.firm_types.map(function (t) { return g.mean[t]; });
      A.svg("line", { x1: sx(Math.min.apply(null, vals)), y1: y, x2: sx(Math.max.apply(null, vals)), y2: y, stroke: "#8f8f8f", "stroke-width": 1.4 }, grp);
      A.svg("line", { x1: sx(g.mean.total), y1: y - 10, x2: sx(g.mean.total), y2: y + 10, stroke: "#000", "stroke-width": group === "total" ? 4 : 2.6 }, grp);
      D.firm_types.filter(function (t) { return t !== group; }).forEach(function (t) { marker(grp, t, sx(g.mean[t]), y, false); });
      if (group !== "total") marker(grp, group, sx(g.mean[group]), y, true);
      A.svg("text", { x: right + 46, y: y + 4.5, "text-anchor": "middle", "font-size": 13.5, "font-weight": 600 }, grp, String(g.rank[group]));
      A.svg("text", { x: right + 92, y: y + 4.5, "font-size": 13.5 }, grp, A.fmt(g.anova_p, 3) + (g.anova_p < 0.05 ? "*" : ""));
      grp.addEventListener("mousemove", function (e) {
        let h = "<b>" + g.code + "</b> " + g.label + "<br>All respondents " + g.mean.total.toFixed(2) + " (rank " + g.rank.total + ")";
        D.firm_types.forEach(function (t) { h += "<br>" + t + " " + g.mean[t].toFixed(2) + " (rank " + g.rank[t] + ")"; });
        A.tip(e, h);
      });
      grp.addEventListener("mouseleave", A.untip);
    });
  }

  function init(data) {
    D = data;
    const seg = document.getElementById("i-group");
    [["total", "All respondents"]].concat(D.firm_types.map(function (t) { return [t, t]; })).forEach(function (o) {
      const b = A.el("button", { type: "button", "data-v": o[0] }, seg, o[1]);
      if (o[0] === group) b.classList.add("on");
      b.addEventListener("click", function () {
        group = o[0];
        seg.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === b); });
        draw();
      });
    });
    document.getElementById("i-note").textContent =
      (A.mono ? "White squares mark green product innovation, hatched squares green process innovation, black squares green " +
      "management innovation." : "Green squares mark green product innovation, blue squares green process innovation, purple squares " +
      "green management innovation.") + " * p < .05 in the one-way ANOVA across the four firm types; no difference remains " +
      "significant after the Holm adjustment for 13 tests. Spearman rank correlations between the groups range from " +
      A.fmt(D.meta.spearman_min, 2) + " to " + A.fmt(D.meta.spearman_max, 2) + ".";
    isReady = true;
  }

  return { init: init, show: draw, ready: function () { return isReady; },
           group: function (g) { group = g; document.querySelectorAll("#i-group button").forEach(function (x) { x.classList.toggle("on", x.getAttribute("data-v") === g); }); draw(); } };
})();
