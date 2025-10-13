export function registerVamootElement() {
  class VamootWidget extends HTMLElement {
    connectedCallback() {
      const project = this.getAttribute("project") || "";
      const host = this.getAttribute("host") || window.location.origin;
      const height = this.getAttribute("height") || "420";

      const iframe = document.createElement("iframe");
      iframe.src = `${host}/embed?project=${encodeURIComponent(project)}`;
      iframe.style.border = "0";
      iframe.style.width = "100%";
      iframe.style.height = `${height}px`;
      this.appendChild(iframe);
    }
  }
  if (!customElements.get("vamoot-widget")) {
    customElements.define("vamoot-widget", VamootWidget);
  }
}

