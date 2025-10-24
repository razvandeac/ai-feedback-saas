import { NextResponse } from "next/server";
import { publishWidget } from "@/src/server/widgets/publish";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { orgId } = await req.json();
  
  try {
    await publishWidget(id, orgId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}
