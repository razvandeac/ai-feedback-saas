"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const uuidV4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function Breadcrumb() {
  const pathname = usePathname() || "/";
  const [labels, setLabels] = useState<Record<string, string>>({});

  const rawParts = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);

  const parts = useMemo(() => {
    const out: { seg: string; href: string }[] = [];
    for (let i = 0; i < rawParts.length; i++) {
      const seg = rawParts[i];
      if (seg === "org" && rawParts[i + 1]) {
        const slug = rawParts[i + 1];
        out.push({ seg: slug, href: "/org/" + slug });
        i++;
        continue;
      }
      out.push({ seg, href: "/" + rawParts.slice(0, i + 1).join("/") });
    }
    return out;
  }, [rawParts]);

  // resolve org and project names
  useEffect(() => {
    (async () => {
      for (let i = 0; i < parts.length; i++) {
        const curr = parts[i]?.seg;
        const prev = parts[i - 1]?.seg;
        if (prev === "projects" && uuidV4.test(curr) && !labels[curr]) {
          const r = await fetch(`/api/projects/${curr}/label`, { cache: "no-store" });
          const j = await r.json().catch(() => ({}));
          if (j?.label) setLabels((m) => ({ ...m, [curr]: j.label }));
        }
        if (rawParts[i - 1] === "org" && !labels[curr]) {
          const r = await fetch(`/api/orgs/${curr}/label`, { cache: "no-store" });
          const j = await r.json().catch(() => ({}));
          if (j?.label) setLabels((m) => ({ ...m, [curr]: j.label }));
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts.map((p) => p.seg).join("/")]);

  const human = (s: string) => {
    if (s === "projects") return "Projects";
    if (s === "settings") return "Settings";
    if (labels[s]) return labels[s];
    if (uuidV4.test(s)) return s;
    return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (parts.length === 0) return null;

  return (
    <nav className="text-sm text-neutral-500 truncate">
      {parts.map((p, i) => {
        const last = i === parts.length - 1;
        const label = human(p.seg);
        return (
          <span key={p.href} className="truncate">
            {i > 0 && <span> / </span>}
            {last ? (
              <span className="text-neutral-900">{label}</span>
            ) : (
              <Link href={p.href} className="hover:underline">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

