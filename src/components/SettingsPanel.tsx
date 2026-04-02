"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Home,
  Map,
  TrendingUp,
  Folder,
  BookOpen,
  Newspaper,
  Brain,
  ExternalLink,
  ChevronRight,
  Settings,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useSettingsStore } from "@/store/settings";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/progress", label: "Analytics", icon: TrendingUp },
  { href: "/folders", label: "Study Materials", icon: Folder },
  { href: "/revision", label: "Revision", icon: BookOpen },
];

export default function SettingsPanel() {
  const pathname = usePathname();
  const { geminiApiKey, settingsPanelOpen, setGeminiApiKey, setSettingsPanelOpen } =
    useSettingsStore();

  const [draftKey, setDraftKey] = useState(geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync draft key when store changes (e.g. initial hydration)
  useEffect(() => {
    setDraftKey(geminiApiKey);
  }, [geminiApiKey]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setSettingsPanelOpen(false);
      }
    };
    if (settingsPanelOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [settingsPanelOpen, setSettingsPanelOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSettingsPanelOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setSettingsPanelOpen]);

  const handleSave = () => {
    setGeminiApiKey(draftKey.trim());
    setSaved(true);
    setTestStatus("idle");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    const key = draftKey.trim();
    if (!key) {
      setTestStatus("error");
      setTestMessage("Please enter an API key first.");
      return;
    }
    setTestStatus("loading");
    setTestMessage("");
    try {
      const res = await fetch("/api/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTestStatus("success");
        setTestMessage("API key is valid!");
      } else {
        setTestStatus("error");
        setTestMessage(data.error || "Invalid API key.");
      }
    } catch {
      setTestStatus("error");
      setTestMessage("Network error. Could not test key.");
    }
  };

  return (
    <>
      {/* Hamburger toggle button */}
      <button
        onClick={() => setSettingsPanelOpen(!settingsPanelOpen)}
        className="fixed top-4 left-4 z-[60] p-2.5 rounded-xl glass hover:bg-[#1a1a2e] transition-colors"
        aria-label="Toggle menu"
      >
        {settingsPanelOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Menu className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {settingsPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Slide-in panel */}
      <AnimatePresence>
        {settingsPanelOpen && (
          <motion.div
            ref={panelRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 z-[58] h-full w-80 flex flex-col"
            style={{
              background: "linear-gradient(180deg, #0d0d1a 0%, #111122 100%)",
              borderRight: "1px solid rgba(70,177,189,0.15)",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-[#2a2a3a]">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#46B1BD] to-[#3a949c] flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">UPSC Learning Hub</p>
                <p className="text-[#64748b] text-xs">AI-powered exam prep</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {/* Navigation */}
              <div>
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2 px-2">
                  Navigation
                </p>
                <nav className="space-y-1">
                  {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setSettingsPanelOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${
                          active
                            ? "bg-[#46B1BD]/20 text-[#46B1BD]"
                            : "text-[#94a3b8] hover:bg-[#1a1a2e] hover:text-white"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${active ? "text-[#46B1BD]" : "text-[#64748b] group-hover:text-white"}`}
                        />
                        {label}
                        {active && <ChevronRight className="w-3 h-3 ml-auto" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Divider */}
              <div className="border-t border-[#2a2a3a]" />

              {/* API Key Section */}
              <div>
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Settings className="w-3.5 h-3.5 text-[#64748b]" />
                  <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                    AI Configuration
                  </p>
                </div>

                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{ background: "rgba(70,177,189,0.05)", border: "1px solid rgba(70,177,189,0.15)" }}
                >
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#46B1BD]" />
                    <p className="text-sm font-medium text-white">Gemini API Key</p>
                    {geminiApiKey && (
                      <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle className="w-3 h-3" /> Set
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#64748b]">
                    Enter your Google Gemini API key to enable AI-powered news summaries and chat.
                    Your key stays in your browser.
                  </p>

                  {/* Key input */}
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={draftKey}
                      onChange={(e) => {
                        setDraftKey(e.target.value);
                        setTestStatus("idle");
                      }}
                      placeholder="AIzaSy..."
                      className="w-full bg-[#0d0d1a] border border-[#2a2a3a] rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-[#3a3a4a] focus:outline-none focus:border-[#46B1BD] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Test status */}
                  {testStatus !== "idle" && (
                    <div
                      className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${
                        testStatus === "success"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : testStatus === "error"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-[#1a1a2e] text-[#94a3b8]"
                      }`}
                    >
                      {testStatus === "loading" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : testStatus === "success" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {testStatus === "loading" ? "Testing key..." : testMessage}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleTest}
                      disabled={testStatus === "loading"}
                      className="flex-1 px-3 py-2 rounded-lg border border-[#2a2a3a] text-xs text-[#94a3b8] hover:text-white hover:border-[#46B1BD] transition-all disabled:opacity-50"
                    >
                      Test Key
                    </button>
                    <button
                      onClick={handleSave}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        saved
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-[#46B1BD] hover:bg-[#5ec4ce] text-white"
                      }`}
                    >
                      {saved ? "Saved!" : "Save Key"}
                    </button>
                  </div>

                  {/* Get API key link */}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#46B1BD] hover:text-[#5ec4ce] transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    Get a free Gemini API key
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#2a2a3a]" />

              {/* About */}
              <div className="px-2">
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3">
                  About
                </p>
                <div className="space-y-2 text-xs text-[#64748b]">
                  <p>UPSC Learning Hub — AI-powered study companion for competitive exams.</p>
                  <p>Supports UPSC CSE, RBI Grade B, SSC CGL, and Bank PO preparation.</p>
                  <div className="flex items-center gap-1 pt-1">
                    <Newspaper className="w-3 h-3" />
                    <span>Powered by Google Gemini</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[#2a2a3a]">
              <p className="text-xs text-[#3a3a4a] text-center">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
