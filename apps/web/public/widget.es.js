function r() {
  class o extends HTMLElement {
    connectedCallback() {
      const n = this.getAttribute("project") || "", i = this.getAttribute("host") || window.location.origin, t = this.getAttribute("height") || "420", e = document.createElement("iframe");
      e.src = `${i}/embed?project=${encodeURIComponent(n)}`, e.style.border = "0", e.style.width = "100%", e.style.height = `${t}px`, this.appendChild(e);
    }
  }
  customElements.get("vamoot-widget") || customElements.define("vamoot-widget", o);
}
function s({ selector: o, project: c, host: n, height: i = 420 }) {
  const t = document.querySelector(o);
  if (!t) return;
  const e = document.createElement("iframe");
  e.src = `${n || window.location.origin}/embed?project=${encodeURIComponent(c)}`, e.style.border = "0", e.style.width = "100%", e.style.height = `${i}px`, t.appendChild(e);
}
export {
  s as mountVamootIframe,
  r as registerVamootElement
};
