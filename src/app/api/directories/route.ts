import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const directories = await prisma.directory.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                files: true,
              },
            },
            files: true,
          },
        },
        files: true,
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(directories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch directories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, parentId } = body;

    const directory = await prisma.directory.create({
      data: {
        name,
        parentId: parentId || null,
      },
    });

    return NextResponse.json(directory);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create directory" }, { status: 500 });
  }
}
