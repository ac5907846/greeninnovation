/* Loads the data, starts the four views and routes between them by the URL hash. */
(function () {
  const A = window.App;
  const VIEWS = ["links", "importance", "tool", "data"];
  let loaded = false;

  function route() {
    const name = (location.hash || "#links").slice(1).split("?")[0];
    const view = VIEWS.indexOf(name) >= 0 ? name : "links";
    VIEWS.forEach(function (v) { document.getElementById("p-" + v).hidden = v !== view; });
    document.querySelectorAll(".tb-tabs a").forEach(function (a) {
      const on = a.getAttribute("data-view") === view;
      a.classList.toggle("on", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    A.untip();
    if (!loaded) return;
    if (view === "importance") window.Importance.show();
    if (view === "data") window.DataTab.show();
  }

  window.addEventListener("hashchange", route);
  route();

  fetch("data/study.json?v=2").then(function (r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }).then(function (d) {
    A.data = d;
    document.getElementById("tb-sub").textContent =
      d.meta.n + " practitioners in construction, engineering and architectural organizations, " + d.meta.country;
    document.getElementById("stamp-right").textContent = "13 factors, 8 indicators, " + d.meta.links + " links";
    window.Links.init(d);
    window.Importance.init(d);
    window.Tool.init(d);
    window.DataTab.init(d);
    loaded = true;
    route();
  }).catch(function (e) {
    document.querySelector("main").innerHTML =
      '<section class="view"><p>The data file could not be loaded (' + e.message + '). Reload the page to try again.</p></section>';
  });
})();
