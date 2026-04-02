import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "UPSC Learning Hub - Your AI-Powered Study Companion",
  description: "Organize your UPSC preparation with nested directories, AI chat, and curated news from Vision IAS and Drishti IAS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
