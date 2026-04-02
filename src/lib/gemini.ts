import { GoogleGenerativeAI } from "@google/generative-ai";

function getClient(userApiKey?: string) {
  const key = userApiKey?.trim() || process.env.GEMINI_API_KEY || "";
  return new GoogleGenerativeAI(key);
}

export async function generateContent(prompt: string, userApiKey?: string): Promise<string> {
  try {
    const model = getClient(userApiKey).getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Sorry, I couldn't process your request. Please check your API key.";
  }
}

export async function getNewsSummary(newsData: string, userApiKey?: string): Promise<string> {
  const prompt = `You are a UPSC exam expert. Analyze and summarize the following news for UPSC preparation. Categorize it as Current Affairs, Editorial, or Analysis. Provide a brief summary suitable for UPSC prelims and mains:\n\n${newsData}`;
  return generateContent(prompt, userApiKey);
}

export async function chatWithFile(
  fileContent: string,
  userMessage: string,
  chatHistory: { role: string; content: string }[],
  userApiKey?: string
): Promise<string> {
  const context = `You are a helpful UPSC exam tutor. The user is studying the following content:\n\n${fileContent}\n\nProvide helpful explanations and answer questions related to this content.`;

  const historyText = chatHistory
    .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n");

  const prompt = `${context}\n\nConversation:\n${historyText}\nUser: ${userMessage}\nAssistant:`;

  return generateContent(prompt, userApiKey);
}
