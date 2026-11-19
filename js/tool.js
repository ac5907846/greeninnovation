/* Priority tool: rank the 13 factors for a firm from its objectives and its current practice.
   score of a factor = sum over the indicators of weight x standardized coefficient x (5 - practice). */
window.Tool = (function () {
  const A = window.App;
  let D, weights = {}, practice = {}, stableOnly = false, isReady = false;

  function defaults() {
    D.ssis.forEach(function (s) { weights[s.code] = 1; });
    D.gifs.forEach(function (g) { practice[g.code] = Math.round(g.mean.total * 2) / 2; });
  }

  function score(code) {
    let total = 0;
    D.ssis.forEach(function (s) {
      const p = s.model.predictors.find(function (q) { return q.gif === code; });
      if (!p) return;
      if (stableOnly && p.boot < 0.5) return;
      total += weights[s.code] * p.beta * (5 - practice[code]);
    });
    return total;
  }

  function ranking() {
    const host = document.getElementById("t-ranking");
    host.innerHTML = "";
    const rows = D.gifs.map(function (g) { return { g: g, s: score(g.code) }; })
      .sort(function (a, b) { return b.s - a.s || a.g.code.localeCompare(b.g.code, undefined, { numeric: true }); });
    const max = Math.max(rows[0].s, 0.0001);
    let rank = 0;
    rows.forEach(function (r) {
      const zero = r.s < 0.0005;
      const row = A.el("div", { class: "rrow" + (zero ? " zero" : "") }, host);
      A.el("span", { class: "rk" }, row, zero ? "" : String(++rank));
      A.el("span", { class: "cd" }, row, r.g.code);
      A.el("span", { class: "lb", title: r.g.label }, row, r.g.short);
      A.el("span", { class: "sc" }, row, zero ? "0" : A.fmt(r.s, 2));
      const tr = A.el("span", { class: "track" }, row);
      const fillBar = A.el("i", {}, tr);
      fillBar.style.width = (zero ? 0 : Math.max(2, r.s / max * 100)) + "%";
      fillBar.style.background = A.fam(r.g.family);
    });
  }

  function build() {
    const obj = document.getElementById("t-objectives");
    obj.innerHTML = "";
    D.ssis.forEach(function (s) {
      const row = A.el("div", { class: "orow" }, obj);
      A.el("span", { class: "cd" }, row, s.code);
      A.el("span", { class: "lb", title: s.label }, row, s.short);
      const seg = A.el("div", { class: "seg small", role: "group", "aria-label": "Weight of " + s.short }, row);
      [0, 1, 2, 3].forEach(function (w) {
        const b = A.el("button", { type: "button" }, seg, String(w));
        if (weights[s.code] === w) b.classList.add("on");
        b.addEventListener("click", function () {
          weights[s.code] = w;
          seg.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === b); });
          ranking();
        });
      });
    });
    const pr = document.getElementById("t-practice");
    pr.innerHTML = "";
    D.gifs.forEach(function (g) {
      const row = A.el("div", { class: "prow" }, pr);
      A.el("span", { class: "cd" }, row, g.code);
      A.el("span", { class: "lb", title: g.label }, row, g.short);
      const input = A.el("input", { type: "range", min: 1, max: 5, step: 0.5, value: practice[g.code],
        "aria-label": "Current practice of " + g.short }, row);
      const out = A.el("output", {}, row, practice[g.code].toFixed(1));
      input.addEventListener("input", function () {
        practice[g.code] = Number(input.value);
        out.textContent = practice[g.code].toFixed(1);
        ranking();
      });
    });
    ranking();
  }

  function init(data) {
    D = data;
    defaults();
    build();
    document.getElementById("t-stable").addEventListener("change", function (e) { stableOnly = e.target.checked; ranking(); });
    document.getElementById("t-reset").addEventListener("click", function () {
      defaults();
      stableOnly = false;
      document.getElementById("t-stable").checked = false;
      build();
    });
    document.getElementById("t-note").textContent =
      "Score = sum over the indicators of weight × standardized coefficient × (5 - current practice). The sliders " +
      "start at the survey means. The coefficients are associations in a cross-sectional survey, so the ranking is a " +
      "guide for discussion and not a forecast. Stable links are those retained in at least half of the bootstrap resamples.";
    isReady = true;
  }

  return { init: init, ready: function () { return isReady; },
           set: function (w, p) { Object.assign(weights, w || {}); Object.assign(practice, p || {}); build(); } };
})();
