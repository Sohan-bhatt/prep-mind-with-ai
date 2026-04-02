"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";
import { useSettingsStore } from "@/store/settings";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Star, 
  MessageCircle, 
  FileText,
  Send,
  Loader2,
  Plus,
  Trash2,
  Brain,
  AlertCircle,
  Check,
  Bold,
  Italic,
  Underline,
  Palette
} from "lucide-react";

interface File {
  id: string;
  name: string;
  content: string;
  directory_id: string;
}

interface RevisionNote {
  id: string;
  content: string;
  error_type: string;
  is_resolved: string;
  review_count: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

const TEXT_COLORS = [
  "#ffffff", "#94a3b8", "#ef4444", "#f59e0b", "#10b981", 
  "#3b82f6", "#8b5cf6", "#ec4899"
];

const FONT_SIZES = ["14px", "16px", "18px", "20px", "24px", "32px"];

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatInlineMarkdown = (line: string) =>
  line
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

const renderAssistantMessage = (content: string) => {
  const lines = content.replaceAll("\r\n", "\n").split("\n");
  const html: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      closeList();
      continue;
    }

    if (/^-{3,}$/.test(trimmed)) {
      closeList();
      html.push("<hr />");
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      const text = formatInlineMarkdown(escapeHtml(headingMatch[2]));
      html.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      if (listType !== "ul") {
        closeList();
        listType = "ul";
        html.push("<ul>");
      }
      html.push(`<li>${formatInlineMarkdown(escapeHtml(unorderedMatch[1]))}</li>`);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (listType !== "ol") {
        closeList();
        listType = "ol";
        html.push("<ol>");
      }
      html.push(`<li>${formatInlineMarkdown(escapeHtml(orderedMatch[1]))}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${formatInlineMarkdown(escapeHtml(trimmed))}</p>`);
  }

  closeList();
  return html.join("");
};

export default function FilePage() {
  const params = useParams();
  const fileId = params.id as string;
  const { geminiApiKey } = useSettingsStore();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState<RevisionNote[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [noteType, setNoteType] = useState("AUTO_DETECT");
  
  // Rich text editor state
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [selectedSize, setSelectedSize] = useState("16px");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectionToolbar, setSelectionToolbar] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);

  const fetchFile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/files/${fileId}`);
      if (res.ok) {
        const data = await res.json();
        setFile(data);
        setContent(data.content || "");
        if (editorRef.current) {
          editorRef.current.innerHTML = data.content || "";
        }
      }
    } catch (error) {
      console.error("Failed to fetch file:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChat = async () => {
    try {
      const res = await fetch(`/api/files/${fileId}/chat`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch chat:", error);
    }
  };

  const fetchRevisionNotes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/revision/file/${fileId}`);
      if (res.ok) {
        const data = await res.json();
        setRevisionNotes(data);
      }
    } catch (error) {
      console.error("Failed to fetch revision notes:", error);
    }
  };

  useEffect(() => {
    fetchFile();
    fetchChat();
    fetchRevisionNotes();
  }, [fileId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const updateSelectionToolbar = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !editorRef.current) {
        setSelectionToolbar((prev) => ({ ...prev, visible: false }));
        setShowColorPicker(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const isInsideEditor = editorRef.current.contains(range.commonAncestorContainer);
      if (!isInsideEditor || selection.isCollapsed) {
        setSelectionToolbar((prev) => ({ ...prev, visible: false }));
        setShowColorPicker(false);
        return;
      }

      selectionRef.current = range.cloneRange();
      const rect = range.getBoundingClientRect();
      setSelectionToolbar({
        visible: true,
        x: rect.left + rect.width / 2,
        y: Math.max(10, rect.top - 8),
      });
    };

    document.addEventListener("selectionchange", updateSelectionToolbar);
    window.addEventListener("scroll", updateSelectionToolbar);
    window.addEventListener("resize", updateSelectionToolbar);
    return () => {
      document.removeEventListener("selectionchange", updateSelectionToolbar);
      window.removeEventListener("scroll", updateSelectionToolbar);
      window.removeEventListener("resize", updateSelectionToolbar);
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const editorContent = editorRef.current?.innerHTML || "";
      await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file?.name, content: editorContent }),
      });
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (geminiApiKey) headers["x-gemini-api-key"] = geminiApiKey;
      const res = await fetch(`/api/files/${fileId}/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({ content: newMessage }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchChat();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleAddRevisionNote = async () => {
    if (!newNoteContent.trim()) return;
    try {
      await fetch(`${API_BASE_URL}/api/revision/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNoteContent, file_id: fileId, error_type: noteType }),
      });
      setNewNoteContent("");
      setShowNoteModal(false);
      fetchRevisionNotes();
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleMarkAsReviewed = async (noteId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/revision/${noteId}/review`, { method: "PUT" });
      fetchRevisionNotes();
    } catch (error) {
      console.error("Failed to mark as reviewed:", error);
    }
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;
    const range = selection.getRangeAt(0);
    if (editorRef.current.contains(range.commonAncestorContainer)) {
      selectionRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !selectionRef.current) return;
    selection.removeAllRanges();
    selection.addRange(selectionRef.current);
  };

  const execCommand = (command: string, value?: string) => {
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      setSelectionToolbar((prev) => ({
        ...prev,
        x: rect.left + rect.width / 2,
        y: Math.max(10, rect.top - 8),
      }));
    }
    editorRef.current?.focus();
  };

  const applyFontSize = (fontSizePx: string) => {
    const fontSizeMap: Record<string, string> = {
      "14px": "2",
      "16px": "3",
      "18px": "4",
      "20px": "5",
      "24px": "6",
      "32px": "7",
    };

    restoreSelection();
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand("fontSize", false, fontSizeMap[fontSizePx] || "3");
    setSelectedSize(fontSizePx);
    saveSelection();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      setSelectionToolbar((prev) => ({
        ...prev,
        x: rect.left + rect.width / 2,
        y: Math.max(10, rect.top - 8),
      }));
    }
    editorRef.current?.focus();
  };

  const getNotesByType = (type: string) => revisionNotes.filter((n) => n.error_type === type);

  const getIconStyle = (type: string) => {
    switch (type) {
      case "CONFUSION":
        return { bg: "bg-amber-500", bottom: "bottom-32", icon: AlertCircle };
      case "MISTAKE":
        return { bg: "bg-red-500", bottom: "bottom-44", icon: AlertCircle };
      case "CONCEPT_MISUNDERSTANDING":
        return { bg: "bg-purple-500", bottom: "bottom-56", icon: Brain };
      default:
        return { bg: "bg-[#46B1BD]", bottom: "bottom-32", icon: AlertCircle };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#46B1BD] animate-spin" />
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">File not found</h2>
          <Link href="/folders" className="text-[#46B1BD] hover:underline">
            Go back to folders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-[#2a2a3a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/folders"
            className="p-2 rounded-lg hover:bg-[#1a1a24] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#94a3b8]" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-white">{file.name}</h1>
            <p className="text-sm text-[#64748b]">Select text to format</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#46B1BD] hover:bg-[#5ec4ce] rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </header>

      <main className="p-6 pb-32">
        <div className="max-w-4xl mx-auto">
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[60vh] px-6 py-4 bg-[#12121a] border border-[#2a2a3a] rounded-xl text-white text-base leading-relaxed focus:outline-none focus:border-[#46B1BD] prose prose-invert max-w-none"
            style={{ fontSize: "16px" }}
            onMouseUp={saveSelection}
            onKeyUp={saveSelection}
            onInput={saveSelection}
            onClick={(e) => {
              saveSelection();
              const target = e.target as HTMLElement;
              if (target.style.color) {
                setSelectedColor(target.style.color);
              }
            }}
          />
        </div>
      </main>

      {selectionToolbar.visible && (
        <div
          className="fixed z-[70] -translate-x-1/2 -translate-y-full"
          style={{ left: selectionToolbar.x, top: selectionToolbar.y }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="editor-toolbar shadow-2xl border border-[#2a2a3a] bg-[#12121a]">
            <button onClick={() => execCommand("bold")} title="Bold (Ctrl+B)">
              <Bold className="w-4 h-4" />
            </button>
            <button onClick={() => execCommand("italic")} title="Italic (Ctrl+I)">
              <Italic className="w-4 h-4" />
            </button>
            <button onClick={() => execCommand("underline")} title="Underline (Ctrl+U)">
              <Underline className="w-4 h-4" />
            </button>
            <button onClick={() => execCommand("formatBlock", "<h2>")} className="font-bold" title="Heading">
              H
            </button>

            <div className="h-6 w-px bg-[#2a2a3a] mx-1" />

            {FONT_SIZES.map((size) => (
              <button
                key={size}
                className={selectedSize === size ? "active" : ""}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFontSize(size);
                }}
                title={`Font ${size}`}
              >
                {size.replace("px", "")}
              </button>
            ))}

            <div className="h-6 w-px bg-[#2a2a3a] mx-1" />

            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="editor-toolbar flex items-center gap-1"
                title="Text Color"
              >
                <Palette className="w-4 h-4" />
                <div
                  className="w-4 h-4 rounded-full border border-[#2a2a3a]"
                  style={{ backgroundColor: selectedColor }}
                />
              </button>

              {showColorPicker && (
                <div className="absolute bottom-full left-0 mb-2 p-3 glass rounded-xl flex gap-2 z-[80]">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`color-option ${selectedColor === color ? "active ring-2 ring-white" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        execCommand("foreColor", color);
                        setSelectedColor(color);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Icons for Revision Notes */}
      {[
        { type: "CONFUSION", label: "Confusion" },
        { type: "MISTAKE", label: "Mistake" },
        { type: "CONCEPT_MISUNDERSTANDING", label: "Concept" }
      ].map(({ type, label }) => {
        const style = getIconStyle(type);
        const IconComponent = style.icon;
        const iconNotes = getNotesByType(type);
        
        return (
          <div
            key={type}
            className={`floating-icon ${style.bg} ${style.bottom} ${
              activeIcon === type ? "ring-4 ring-white/20 animate-pulse-glow" : ""
            }`}
            onClick={() => setActiveIcon(activeIcon === type ? null : type)}
            title={label}
          >
            <IconComponent className="w-6 h-6 text-white" />

            {iconNotes.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {iconNotes.length}
              </span>
            )}

            <AnimatePresence>
              {activeIcon === type && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute right-full mr-4 top-0 w-80 glass rounded-xl p-4 max-h-96 overflow-y-auto scrollbar-thin"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">{label} Notes</h3>
                    <button
                      onClick={() => {
                        setNoteType(type);
                        setShowNoteModal(true);
                      }}
                      className="p-1 rounded hover:bg-[#1a1a24]"
                    >
                      <Plus className="w-4 h-4 text-[#46B1BD]" />
                    </button>
                  </div>

                  {iconNotes.length === 0 ? (
                    <p className="text-[#64748b] text-sm text-center py-4">
                      No {label.toLowerCase()} notes yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {iconNotes.map((note) => (
                        <div key={note.id} className="p-3 bg-[#1a1a24] rounded-lg group">
                          <p className="text-sm text-white whitespace-pre-wrap">{note.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-[#64748b]">
                              {note.review_count} reviews
                            </span>
                            <button
                              onClick={() => handleMarkAsReviewed(note.id)}
                              className="flex items-center gap-1 text-xs text-[#46B1BD] hover:text-[#5ec4ce]"
                            >
                              <Check className="w-3 h-3" />
                              Mark reviewed
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* AI Chat Button */}
      <button
        className="floating-icon bg-[#46B1BD] bottom-20"
        onClick={() => setShowChat(true)}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* AI Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowChat(false)} />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md glass border-l border-[#2a2a3a] z-50 flex flex-col"
            >
              <div className="p-4 border-b border-[#2a2a3a] flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#46B1BD]" />
                  AI Study Partner
                </h3>
                <button onClick={() => setShowChat(false)} className="p-1 rounded-lg hover:bg-[#1a1a24]">
                  <X className="w-5 h-5 text-[#64748b]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-[#2a2a3a] mx-auto mb-4" />
                    <p className="text-[#64748b]">
                      Ask me anything about your notes!
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                          msg.role === "user"
                            ? "bg-[#46B1BD] text-white"
                            : "bg-[#1a1a24] text-[#94a3b8]"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div
                            className="chat-markdown text-sm"
                            dangerouslySetInnerHTML={{ __html: renderAssistantMessage(msg.content) }}
                          />
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-[#2a2a3a]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    placeholder="Ask about your notes..."
                    className="flex-1 px-4 py-2 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl text-white placeholder-[#64748b] text-sm focus:outline-none focus:border-[#46B1BD]"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="p-2 bg-[#46B1BD] hover:bg-[#5ec4ce] rounded-xl text-white transition-colors disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Revision Note Modal */}
      <AnimatePresence>
        {showNoteModal && (
          <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowNoteModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass rounded-2xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Add Revision Note</h3>
                <button onClick={() => setShowNoteModal(false)} className="p-1 rounded-lg hover:bg-[#1a1a24]">
                  <X className="w-5 h-5 text-[#64748b]" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="text-sm text-[#94a3b8] mb-2 block">Error Type</label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl text-white focus:outline-none focus:border-[#46B1BD]"
                >
                  <option value="AUTO_DETECT">Auto Detect</option>
                  <option value="CONFUSION">Confusion</option>
                  <option value="MISTAKE">Mistake</option>
                  <option value="CONCEPT_MISUNDERSTANDING">Concept Misunderstanding</option>
                </select>
              </div>

              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="What did you find confusing or made a mistake on?"
                className="w-full h-32 px-4 py-3 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl text-white placeholder-[#64748b] focus:outline-none focus:border-[#46B1BD] resize-none"
                autoFocus
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 text-[#94a3b8] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRevisionNote}
                  className="px-4 py-2 bg-[#46B1BD] hover:bg-[#5ec4ce] rounded-lg text-white transition-colors"
                >
                  Add Note
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
