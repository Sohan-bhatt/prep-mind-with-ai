"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";
import { 
  Brain,
  ArrowLeft,
  Check,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";

interface RevisionNote {
  id: string;
  content: string;
  error_type: string;
  is_resolved: string;
  review_count: string;
  created_at: string;
  last_reviewed: string;
}

export default function RevisionPage() {
  const [todayNotes, setTodayNotes] = useState<RevisionNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayNotes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/revision/today`);
      if (res.ok) {
        const data = await res.json();
        setTodayNotes(data);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayNotes();
  }, []);

  const handleMarkAsReviewed = async (noteId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/revision/${noteId}/review`, { method: "PUT" });
      fetchTodayNotes();
    } catch (error) {
      console.error("Failed to mark as reviewed:", error);
    }
  };

  const handleResolve = async (noteId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/revision/${noteId}/resolve`, { method: "PUT" });
      fetchTodayNotes();
    } catch (error) {
      console.error("Failed to resolve:", error);
    }
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case "CONFUSION":
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case "MISTAKE":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "CONCEPT_MISUNDERSTANDING":
        return <Brain className="w-5 h-5 text-purple-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-[#46B1BD]" />;
    }
  };

  const getErrorColor = (type: string) => {
    switch (type) {
      case "CONFUSION":
        return "border-amber-500/30 bg-amber-500/10";
      case "MISTAKE":
        return "border-red-500/30 bg-red-500/10";
      case "CONCEPT_MISUNDERSTANDING":
        return "border-purple-500/30 bg-purple-500/10";
      default:
        return "border-[#46B1BD]/30 bg-[#46B1BD]/10";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="border-b border-[#2a2a3a] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/" className="p-2 rounded-lg hover:bg-[#1a1a24] transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#94a3b8]" />
          </Link>
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-[#46B1BD]" />
            <h1 className="text-xl font-semibold text-white">Daily Revision</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#46B1BD] animate-spin" />
          </div>
        ) : todayNotes.length === 0 ? (
          <div className="text-center py-20">
            <Check className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-white mb-2">All caught up!</h2>
            <p className="text-[#64748b] mb-6">No new revision notes for today.</p>
            <Link 
              href="/folders"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#46B1BD] hover:bg-[#5ec4ce] rounded-xl text-white font-medium transition-colors"
            >
              Start Learning
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-white">
                {todayNotes.length} items to review today
              </h2>
              <span className="text-sm text-[#64748b]">
                Fresh notes created today
              </span>
            </div>

            <div className="space-y-4">
              {todayNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass rounded-xl p-5 border ${getErrorColor(note.error_type)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getErrorIcon(note.error_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-[#46B1BD] uppercase px-2 py-1 rounded bg-[#46B1BD]/20">
                          {note.error_type?.replace("_", " ")}
                        </span>
                        <span className="text-xs text-[#64748b] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {note.review_count} reviews
                        </span>
                      </div>
                      <p className="text-white text-lg">{note.content}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#2a2a3a]">
                    <button
                      onClick={() => handleMarkAsReviewed(note.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#1a1a24] hover:bg-[#2a2a3a] rounded-lg text-white text-sm transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => handleResolve(note.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 text-sm transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Got It!
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
