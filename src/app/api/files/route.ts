import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const directoryId = searchParams.get("directoryId");

    const files = await prisma.file.findMany({
      where: directoryId ? { directoryId } : undefined,
      include: {
        directory: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, content, directoryId } = body;

    const file = await prisma.file.create({
      data: {
        name,
        content: content || "",
        directoryId,
      },
    });

    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create file" }, { status: 500 });
  }
}
