import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();
    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ ok: false, error: "No API key provided." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    await model.generateContent("Say hello in one word.");

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const isAuth = msg.includes("API_KEY") || msg.includes("401") || msg.includes("403");
    return NextResponse.json(
      { ok: false, error: isAuth ? "Invalid API key. Please check and try again." : msg },
      { status: 400 }
    );
  }
}
