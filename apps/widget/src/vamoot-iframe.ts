export function mountVamootIframe({ selector, project, host, height = 420 }: {
  selector: string;
  project: string;
  host?: string;
  height?: number;
}) {
  const el = document.querySelector(selector);
  if (!el) return;
  const iframe = document.createElement("iframe");
  iframe.src = `${host || window.location.origin}/embed?project=${encodeURIComponent(project)}`;
  iframe.style.border = "0";
  iframe.style.width = "100%";
  iframe.style.height = `${height}px`;
  el.appendChild(iframe);
}

