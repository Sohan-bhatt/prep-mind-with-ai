import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatWithFile } from "@/lib/gemini";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messages = await prisma.chatMessage.findMany({
      where: { fileId: id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content } = body;

    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const chatHistory = await prisma.chatMessage.findMany({
      where: { fileId: id },
      orderBy: { createdAt: "asc" },
    });

    const userApiKey = req.headers.get("x-gemini-api-key") || undefined;
    const aiResponse = await chatWithFile(
      file.content,
      content,
      chatHistory.map((msg) => ({ role: msg.role, content: msg.content })),
      userApiKey
    );

    await prisma.chatMessage.create({
      data: {
        content,
        role: "user",
        fileId: id,
      },
    });

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        content: aiResponse,
        role: "assistant",
        fileId: id,
      },
    });

    return NextResponse.json(assistantMessage);
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
