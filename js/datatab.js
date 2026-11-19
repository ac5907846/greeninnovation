/* Data and method view: respondent profile, the five case-study firms, method and robustness facts. */
window.DataTab = (function () {
  const A = window.App;
  let D, variable = "Firm type", isReady = false;

  function profile() {
    const host = document.getElementById("d-profile");
    host.innerHTML = "";
    const v = D.profile.find(function (p) { return p.variable === variable; });
    const W = 560, row = 30, left = 150, H = v.categories.length * row + 8;
    const s = A.svg("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": variable + " of the respondents" }, host);
    const max = Math.max.apply(null, v.categories.map(function (c) { return c.percent; }));
    v.categories.forEach(function (c, i) {
      const y = i * row + 6;
      A.svg("text", { x: left - 10, y: y + 15, "text-anchor": "end", "font-size": 13 }, s, c.name);
      const w = c.percent / max * (W - left - 110);
      A.svg("rect", { x: left, y: y + 3, width: w, height: 17, fill: A.mono ? "url(#hatch-wide)" : A.color("accent-soft"), stroke: A.color("accent"), "stroke-width": 1.1 }, s);
      A.svg("text", { x: left + w + 8, y: y + 15, "font-size": 13 }, s, c.n + " (" + c.percent.toFixed(1) + "%)");
    });
    host.parentNode.querySelector(".svg-wrap");
  }

  function cases() {
    const host = document.getElementById("d-cases");
    host.innerHTML = "";
    const W = 480, H = 300, l = 52, r = 20, t = 14, b = 44;
    const s = A.svg("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Practice against performance for five firms" }, host);
    function x(v) { return l + (v - 3) / 2 * (W - l - r); }
    function y(v) { return H - b - (v - 3) / 2 * (H - t - b); }
    [3, 3.5, 4, 4.5, 5].forEach(function (v) {
      A.svg("line", { x1: x(v), y1: y(3), x2: x(v), y2: y(5), stroke: "#c9c9c9" }, s);
      A.svg("line", { x1: x(3), y1: y(v), x2: x(5), y2: y(v), stroke: "#c9c9c9" }, s);
      A.svg("text", { x: x(v), y: y(3) + 16, "text-anchor": "middle", "font-size": 12 }, s, v.toFixed(1));
      A.svg("text", { x: x(3) - 8, y: y(v) + 4, "text-anchor": "end", "font-size": 12 }, s, v.toFixed(1));
    });
    A.svg("line", { x1: x(3), y1: y(3), x2: x(5), y2: y(5), stroke: "#8f8f8f", "stroke-dasharray": "5 4" }, s);
    A.svg("line", { x1: x(3), y1: y(3), x2: x(5), y2: y(3), stroke: "#000", "stroke-width": 1.2 }, s);
    A.svg("line", { x1: x(3), y1: y(3), x2: x(3), y2: y(5), stroke: "#000", "stroke-width": 1.2 }, s);
    A.svg("text", { x: (x(3) + x(5)) / 2, y: H - 6, "text-anchor": "middle", "font-size": 12, fill: "#3d3d3d" }, s, "Practice of the six key factors");
    A.svg("text", { x: 13, y: (y(3) + y(5)) / 2, "text-anchor": "middle", "font-size": 12, fill: "#3d3d3d",
      transform: "rotate(-90 13 " + (y(3) + y(5)) / 2 + ")" }, s, "Performance on the eight indicators");
    const off = { "Firm 1": [12, -8, "start"], "Firm 2": [0, 26, "middle"], "Firm 3": [14, 16, "start"], "Firm 4": [14, 0, "start"], "Firm 5": [-6, -16, "start"] };
    D.cases.firms.forEach(function (f) {
      const g = A.svg("g", {}, s);
      const rad = 5 + 0.9 * f.green_projects;
      A.svg("circle", { cx: x(f.practice), cy: y(f.performance), r: rad, fill: f.green_projects >= 6 ? A.color("accent") : (f.green_projects > 0 ? A.color("accent-soft") : "#fff"),
        stroke: A.color("accent"), "stroke-width": 1.3 }, g);
      const o = off[f.firm] || [12, 0, "start"];
      const label = f.firm + ": " + f.green_projects + " green project" + (f.green_projects === 1 ? "" : "s");
      const tx = A.svg("text", { x: x(f.practice) + o[0], y: y(f.performance) + o[1] + 4, "text-anchor": o[2], "font-size": 12 }, g, label);
      const bb = tx.getBBox();
      const bg = A.svg("rect", { x: bb.x - 4, y: bb.y - 1, width: bb.width + 8, height: bb.height + 2, rx: 5, fill: "#fff" });
      g.insertBefore(bg, tx);
      g.addEventListener("mousemove", function (e) {
        A.tip(e, "<b>" + f.firm + "</b> " + f.type + "<br>Practice " + f.practice.toFixed(2) + ", performance " + f.performance.toFixed(2));
      });
      g.addEventListener("mouseleave", A.untip);
    });
  }

  function facts() {
    const m = D.meta, host = document.getElementById("d-facts");
    host.innerHTML = "";
    const items = [
      ["Questionnaires", m.n + "", "valid responses of " + m.distributed + " distributed (" + m.response_rate.toFixed(1) + "%), " + m.country],
      ["Scale reliability", A.fmt(m.alpha_gif, 3), "Cronbach’s alpha of the 13 factors; " + A.fmt(m.alpha_ssi, 3) + " for the 8 indicators"],
      ["Regression", m.links + "", "factor-indicator links retained by eight stepwise models (entry p < .05, removal p > .10)"],
      ["Bootstrap", m.links_boot_50 + " of " + m.links, "links retained in at least half of " + m.n_boot.toLocaleString("en-US") + " resamples"],
      ["Robust standard errors", m.links_hc3 + " of " + m.links, "links significant at .05 with HC3 standard errors"],
      ["Uniform response patterns", m.links_kept_without_uniform + " of " + m.links, "links retained without the " + m.n_uniform + " respondents who gave one rating to all 21 items"],
      ["Single-factor test", Math.round(m.harman * 1000) / 10 + "%", "of the variance on the first unrotated component, so common method variance cannot be ruled out"],
      ["Case study", A.fmt(D.cases.spearman, 2), "Spearman correlation of practice and performance across five firms, an illustration and not a test"],
    ];
    items.forEach(function (it) {
      const d = A.el("div", {}, host);
      A.el("dt", {}, d, it[0]);
      const dd = A.el("dd", {}, d);
      A.el("b", {}, dd, it[1]);
      dd.appendChild(document.createTextNode(it[2]));
    });
  }

  function init(data) {
    D = data;
    const seg = document.getElementById("d-profile-var");
    D.profile.forEach(function (p) {
      const b = A.el("button", { type: "button" }, seg, p.variable);
      if (p.variable === variable) b.classList.add("on");
      b.addEventListener("click", function () {
        variable = p.variable;
        seg.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === b); });
        profile();
      });
    });
    facts();
    isReady = true;
  }

  return { init: init, show: function () { profile(); cases(); }, ready: function () { return isReady; } };
})();
