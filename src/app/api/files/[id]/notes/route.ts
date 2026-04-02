import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const notes = await prisma.note.findMany({
      where: {
        fileId: id,
        type: type as "IMPORTANT" | "QNA" | "ESSAY" | undefined,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content, type } = body;

    const note = await prisma.note.create({
      data: {
        content,
        type: type as "IMPORTANT" | "QNA" | "ESSAY",
        fileId: id,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
