import { NextRequest, NextResponse } from "next/server";
import { getNewsSummary } from "@/lib/gemini";

function getSourceUrl(source: string, category: string) {
  const isVision = source.toLowerCase().includes("vision");
  const isDrishti = source.toLowerCase().includes("drishti");
  const isEditorial = category.toLowerCase().includes("editorial");

  if (isVision) {
    return isEditorial
      ? "https://visionias.in/resources/all_programs.php?c=editorials"
      : "https://visionias.in/resources/daily-current-affairs.php";
  }

  if (isDrishti) {
    return isEditorial
      ? "https://www.drishtiias.com/daily-updates/daily-news-editorials"
      : "https://www.drishtiias.com/daily-updates";
  }

  return "https://www.drishtiias.com/daily-updates";
}

const SAMPLE_NEWS = [
  {
    title: "Supreme Court's Landmark Ruling on Digital Privacy",
    source: "Vision IAS",
    date: new Date().toISOString(),
    url: getSourceUrl("Vision IAS", "Current Affairs"),
    summary: "The Supreme Court has issued a significant judgment regarding digital privacy rights, establishing new precedents for data protection in the digital era.",
    category: "Current Affairs",
  },
  {
    title: "Economic Survey 2025-26: Key Highlights",
    source: "Drishti IAS",
    date: new Date().toISOString(),
    url: getSourceUrl("Drishti IAS", "Analysis"),
    summary: "The Economic Survey presents a comprehensive analysis of India's economic performance with focus on growth, inflation, and fiscal management.",
    category: "Analysis",
  },
  {
    title: "India's Foreign Policy: New Directions",
    source: "Vision IAS",
    date: new Date().toISOString(),
    url: getSourceUrl("Vision IAS", "Editorial"),
    summary: "Editorial analysis on India's evolving foreign policy priorities and strategic partnerships in the changing global landscape.",
    category: "Editorial",
  },
  {
    title: "Climate Change Impact on Agriculture",
    source: "Drishti IAS",
    date: new Date().toISOString(),
    url: getSourceUrl("Drishti IAS", "Current Affairs"),
    summary: "Examining the effects of climate change on Indian agriculture and suggested adaptation strategies for farmers.",
    category: "Current Affairs",
  },
  {
    title: "UPSC Civil Services 2025: Important Updates",
    source: "Vision IAS",
    date: new Date().toISOString(),
    url: getSourceUrl("Vision IAS", "Current Affairs"),
    summary: "Latest updates on UPSC Civil Services Examination 2025 including schedule changes and new examination patterns.",
    category: "Current Affairs",
  },
  {
    title: "Indian Constitution: Emerging Challenges",
    source: "Drishti IAS",
    date: new Date().toISOString(),
    url: getSourceUrl("Drishti IAS", "Analysis"),
    summary: "Analysis of contemporary challenges facing the Indian Constitution and ways to address them for democratic strengthening.",
    category: "Analysis",
  },
];

export async function GET(req: NextRequest) {
  try {
    const userApiKey = req.headers.get("x-gemini-api-key") || undefined;
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        news: SAMPLE_NEWS,
        message: "Using sample news. Add your Gemini API key in Settings to enable AI summaries.",
      });
    }

    const newsWithSummaries = await Promise.all(
      SAMPLE_NEWS.map(async (news) => {
        try {
          const summary = await getNewsSummary(`${news.title}. ${news.summary}`, userApiKey);
          return { ...news, aiSummary: summary };
        } catch {
          return { ...news, aiSummary: news.summary };
        }
      })
    );

    return NextResponse.json({ news: newsWithSummaries });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json({ news: SAMPLE_NEWS });
  }
}
