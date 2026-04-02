import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const directory = await prisma.directory.findUnique({
      where: { id },
      include: {
        children: true,
        files: true,
        parent: true,
      },
    });
    if (!directory) {
      return NextResponse.json({ error: "Directory not found" }, { status: 404 });
    }
    return NextResponse.json(directory);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch directory" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name } = body;

    const directory = await prisma.directory.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(directory);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update directory" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.directory.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete directory" }, { status: 500 });
  }
}
