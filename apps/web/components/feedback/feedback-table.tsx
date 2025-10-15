"use client";
import { useEffect, useState } from "react";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Row = { id: string; project_id: string; rating: number | null; comment: string | null; created_at: string };
type Project = { id: string; name: string };

export default function FeedbackTable({
  initial, total, page, pageSize, projects
}: { initial: Row[]; total: number; page: number; pageSize: number; projects: Project[]; orgSlug: string }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [meta, setMeta] = useState({ total, page, pageSize });
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // React to URL param changes by letting server re-render page; keep client table for UX
  useEffect(() => {
    setRows(initial);
    setMeta({ total, page, pageSize });
  }, [initial, total, page, pageSize]);

  function go(toPage: number) {
    const sp = new URLSearchParams(Array.from(params.entries()));
    sp.set("page", String(toPage));
    router.replace(`${pathname}?${sp.toString()}`);
  }

  const pages = Math.max(1, Math.ceil(meta.total / meta.pageSize));

  const chip = (r?: number | null) => {
    const base = "inline-block text-xs px-2 py-0.5 rounded-full";
    if (r == null) return <span className={`${base} bg-neutral-100 text-neutral-600`}>No rating</span>;
    if (r >= 4) return <span className={`${base} bg-green-100 text-green-700`}>{r} / 5</span>;
    if (r >= 3) return <span className={`${base} bg-yellow-100 text-yellow-700`}>{r} / 5</span>;
    return <span className={`${base} bg-red-100 text-red-700`}>{r} / 5</span>;
  };

  const projectName = (id: string) => projects.find(p=>p.id===id)?.name || "—";

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border bg-white">
        <Table>
          <THead>
            <TR>
              <TH>Project</TH>
              <TH>Rating</TH>
              <TH>Comment</TH>
              <TH>Received</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map(r => (
              <TR key={r.id}>
                <TD className="text-neutral-600">{projectName(r.project_id)}</TD>
                <TD className="w-[120px]">{chip(r.rating)}</TD>
                <TD className="max-w-[700px] truncate">{r.comment ?? <span className="text-neutral-400">—</span>}</TD>
                <TD className="text-neutral-600">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</TD>
              </TR>
            ))}
            {rows.length === 0 && (
              <TR><TD colSpan={4} className="p-6 text-center text-sm text-neutral-500">No feedback matches these filters.</TD></TR>
            )}
          </TBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          Page {meta.page} of {pages} • {meta.total} item{meta.total===1 ? "" : "s"}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={meta.page<=1} onClick={()=>go(meta.page-1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={meta.page>=pages} onClick={()=>go(meta.page+1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}

