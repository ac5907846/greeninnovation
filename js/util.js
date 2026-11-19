/* Shared helpers: number format, colors, SVG and DOM builders, tooltip. */
window.App = (function () {
  const NS = "http://www.w3.org/2000/svg";

  function fmt(v, d) {
    const s = Number(v).toFixed(d === undefined ? 2 : d);
    if (s.startsWith("0.")) return s.slice(1);
    if (s.startsWith("-0.")) return "-" + s.slice(2);
    return s;
  }

  function pct(v) {
    return Math.round(v * 100) + "%";
  }

  const mono = document.documentElement.classList.contains("mono");
  const css = getComputedStyle(document.documentElement);

  function color(name) {
    return css.getPropertyValue("--" + name).trim();
  }

  function famKey(family) {
    return family.indexOf("product") > 0 ? "product" : (family.indexOf("process") > 0 ? "process" : "management");
  }

  /* color of an innovation type (black in the black and white rendering) */
  function fam(family) {
    return color("fam-" + famKey(family));
  }

  /* fill of the small square that marks an innovation type */
  function chip(family) {
    if (!mono) return fam(family);
    const k = famKey(family);
    return k === "product" ? "#fff" : (k === "process" ? "url(#hatch)" : "#000");
  }

  function svg(tag, attrs, parent, text) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  function el(tag, attrs, parent, text) {
    const e = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === "class") e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  function wrap(text, max) {
    const lines = [];
    let cur = "";
    text.split(" ").forEach(function (w) {
      if (cur && (cur + " " + w).length > max) {
        lines.push(cur);
        cur = w;
      } else {
        cur = cur ? cur + " " + w : w;
      }
    });
    if (cur) lines.push(cur);
    return lines;
  }

  const tipEl = function () { return document.getElementById("tip"); };

  function tip(evt, html) {
    const t = tipEl();
    t.innerHTML = html;
    t.hidden = false;
    const pad = 14;
    const r = t.getBoundingClientRect();
    let x = evt.clientX + pad;
    let y = evt.clientY + pad;
    if (x + r.width > window.innerWidth - 6) x = evt.clientX - r.width - pad;
    if (y + r.height > window.innerHeight - 6) y = evt.clientY - r.height - pad;
    t.style.left = Math.max(4, x) + "px";
    t.style.top = Math.max(4, y) + "px";
  }

  function untip() {
    tipEl().hidden = true;
  }

  return { mono: mono, color: color, fam: fam, famKey: famKey, chip: chip, fmt: fmt, pct: pct, svg: svg, el: el, wrap: wrap, tip: tip, untip: untip, data: null };
})();
