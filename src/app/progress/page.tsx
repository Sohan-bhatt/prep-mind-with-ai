"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Brain,
  BookOpen,
  Target,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Award,
  RefreshCw
} from "lucide-react";
import { EXAMS, getExamById, generateRoadmap } from "@/lib/exams";

function ProgressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('exam') || 'rbi_grade_b';
  
  const [exam, setExam] = useState(getExamById(examId));
  const [roadmap, setRoadmap] = useState(generateRoadmap(examId));
  const [taskStatus, setTaskStatus] = useState<Record<string, string>>({});
  const [selectedMonth, setSelectedMonth] = useState('March 2026');
  const [view, setView] = useState<'roadmap' | 'revision'>('roadmap');

  useEffect(() => {
    const savedProgress = localStorage.getItem(`roadmap_progress_${examId}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setTaskStatus(progress.taskStatus || {});
    }
    setExam(getExamById(examId));
    setRoadmap(generateRoadmap(examId));
  }, [examId]);

  const getTaskCounts = () => {
    const counts = { completed: 0, partial: 0, confused: 0, pending: 0 };
    Object.values(taskStatus).forEach(status => {
      if (status in counts) counts[status as keyof typeof counts]++;
    });
    return counts;
  };

  const totalDays = roadmap.length;
  const currentDay = Math.min(
    Math.floor(Object.keys(taskStatus).filter(k => taskStatus[k] !== 'pending').length / 3) + 1,
    totalDays
  );
  const progressPercentage = Math.round((currentDay / totalDays) * 100);

  const skillProgress = [
    { name: 'Economic & Social Issues', score: 72, previous: 58, trend: 'up' },
    { name: 'Finance & Management', score: 65, previous: 55, trend: 'up' },
    { name: 'Quantitative Aptitude', score: 85, previous: 80, trend: 'up' },
    { name: 'Reasoning', score: 78, previous: 75, trend: 'up' },
    { name: 'General Awareness', score: 60, previous: 45, trend: 'up' },
    { name: 'English', score: 70, previous: 65, trend: 'up' },
  ];

  const weakAreas = [
    { topic: 'International Economic Organizations', score: 45, papers: 3 },
    { topic: 'Social Justice & Welfare Schemes', score: 52, papers: 2 },
    { topic: 'Financial Markets - Derivatives', score: 48, papers: 4 },
  ];

  const strongAreas = [
    { topic: 'Number Series & Quadratic Equations', score: 88, papers: 12 },
    { topic: 'Banking Awareness', score: 82, papers: 8 },
    { topic: 'Indian Constitution', score: 79, papers: 6 },
  ];

  const monthlyActivity = Array.from({ length: 24 }, (_, i) => ({
    day: i + 1,
    tasks: Math.floor(Math.random() * 5)
  }));

  const getMonthName = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June'];
    return months[Math.floor(currentDay / 30) % 6] + ' ' + (2026);
  };

  if (!exam) return null;

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-[#46B1BD] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <div className="h-6 w-px bg-gray-700"></div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{exam.icon}</span>
              <div>
                <h1 className="text-white font-semibold">{exam.name} Progress</h1>
                <p className="text-gray-400 text-xs">Analytics Dashboard</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#1a1a24] rounded-lg p-1">
              <button
                onClick={() => setView('roadmap')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'roadmap' ? 'bg-[#46B1BD] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Roadmap
              </button>
              <button
                onClick={() => setView('revision')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'revision' ? 'bg-[#46B1BD] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Revision
              </button>
            </div>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-2 text-white text-sm"
            >
              <option>March 2026</option>
              <option>February 2026</option>
              <option>January 2026</option>
            </select>
            <Link
              href={`/roadmap?exam=${examId}`}
              className="px-4 py-2 bg-[#46B1BD] hover:bg-[#5ec4ce] rounded-lg text-white text-sm font-medium transition-colors"
            >
              Continue Prep →
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {view === 'roadmap' ? (
            <>
              {/* Month Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-serif text-white mb-2">Monthly Progress Report</h1>
                <p className="text-gray-400">{getMonthName()} • Day {currentDay} of {totalDays}</p>
              </div>

              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-[#46B1BD]/20 rounded-lg">
                      <Target className="w-6 h-6 text-[#46B1BD]" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-gray-400 text-sm mb-1">Overall Progress</p>
                  <p className="text-3xl font-bold text-white">{progressPercentage}%</p>
                  <p className="text-emerald-400 text-sm mt-2">↑ 12% from last month</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-400/20 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="text-gray-500 text-sm">This month</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">Tasks Completed</p>
                  <p className="text-3xl font-bold text-white">{getTaskCounts().completed}</p>
                  <p className="text-gray-500 text-sm mt-2">+{Math.max(0, getTaskCounts().completed - 20)} from last month</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-400/20 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="text-gray-500 text-sm">Needs attention</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">Areas to Improve</p>
                  <p className="text-3xl font-bold text-white">{weakAreas.length}</p>
                  <p className="text-amber-400 text-sm mt-2">↓ 2 from last month</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-400/20 rounded-lg">
                      <Clock className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-gray-500 text-sm">Study hours</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">Total Hours</p>
                  <p className="text-3xl font-bold text-white">127h</p>
                  <p className="text-purple-400 text-sm mt-2">↑ 18h more than target</p>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Skill Progress */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-[#46B1BD]" />
                        <h2 className="text-xl font-semibold text-white">Skill Progress</h2>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {skillProgress.map((skill, index) => (
                        <motion.div
                          key={skill.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-sm">{skill.name}</span>
                            <div className="flex items-center gap-2">
                              {skill.trend === 'up' ? (
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                              )}
                              <span className="text-white font-medium">{skill.score}%</span>
                            </div>
                          </div>
                          <div className="h-2 bg-[#1a1a24] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.score}%` }}
                              transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                              className="h-full bg-gradient-to-r from-[#46B1BD] to-[#7C3AED]"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Chart */}
                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Activity className="w-6 h-6 text-[#46B1BD]" />
                        <h2 className="text-xl font-semibold text-white">Daily Activity</h2>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-gray-400">
                          <div className="w-3 h-3 bg-emerald-400 rounded"></div>
                          Completed
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <div className="w-3 h-3 bg-amber-400 rounded"></div>
                          Partial
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end gap-1 h-32">
                      {monthlyActivity.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(day.tasks / 5) * 100}%` }}
                            transition={{ delay: i * 0.02 }}
                            className={`w-full rounded-t ${
                              day.tasks >= 4 ? 'bg-emerald-400' : day.tasks >= 2 ? 'bg-amber-400' : 'bg-gray-600'
                            }`}
                          />
                          <span className="text-gray-500 text-xs">{day.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weak & Strong Areas */}
                <div className="space-y-6">
                  {/* Weak Areas */}
                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                      <h2 className="text-lg font-semibold text-white">Areas Needing Attention</h2>
                    </div>
                    <div className="space-y-3">
                      {weakAreas.map((area, i) => (
                        <div key={i} className="p-3 bg-[#1a1a24] rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-sm">{area.topic}</span>
                            <span className="text-amber-400 text-sm font-medium">{area.score}%</span>
                          </div>
                          <div className="h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-400" 
                              style={{ width: `${area.score}%` }}
                            />
                          </div>
                          <p className="text-gray-500 text-xs mt-2">{area.papers} related topics</p>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 py-2 text-[#46B1BD] text-sm hover:underline">
                      View all weak areas →
                    </button>
                  </div>

                  {/* Strong Areas */}
                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="w-5 h-5 text-emerald-400" />
                      <h2 className="text-lg font-semibold text-white">Strong Areas</h2>
                    </div>
                    <div className="space-y-3">
                      {strongAreas.map((area, i) => (
                        <div key={i} className="p-3 bg-[#1a1a24] rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-sm">{area.topic}</span>
                            <span className="text-emerald-400 text-sm font-medium">{area.score}%</span>
                          </div>
                          <div className="h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-400" 
                              style={{ width: `${area.score}%` }}
                            />
                          </div>
                          <p className="text-gray-500 text-xs mt-2">{area.papers} topics mastered</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-5 h-5 text-[#46B1BD]" />
                      <h2 className="text-lg font-semibold text-white">AI Recommendations</h2>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-[#46B1BD]/10 border border-[#46B1BD]/20 rounded-lg">
                        <p className="text-white text-sm mb-1">📚 Focus on International Economic Organizations</p>
                        <p className="text-gray-400 text-xs">High weightage in ESI paper</p>
                      </div>
                      <div className="p-3 bg-[#46B1BD]/10 border border-[#46B1BD]/20 rounded-lg">
                        <p className="text-white text-sm mb-1">✍️ Practice descriptive writing daily</p>
                        <p className="text-gray-400 text-xs">Key for Phase II</p>
                      </div>
                      <div className="p-3 bg-[#46B1BD]/10 border border-[#46B1BD]/20 rounded-lg">
                        <p className="text-white text-sm mb-1">📰 Read Economic Survey 2025-26</p>
                        <p className="text-gray-400 text-xs">Essential for ESI paper</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Revision View - Original content */
            <div className="glass rounded-xl p-8 text-center">
              <RefreshCw className="w-16 h-16 text-[#46B1BD] mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">Revision System</h2>
              <p className="text-gray-400 mb-6">
                Your revision notes from study sessions will appear here. Keep adding confusion points and mistakes during your preparation!
              </p>
              <Link
                href={`/roadmap?exam=${examId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#46B1BD] hover:bg-[#5ec4ce] rounded-lg text-white font-medium transition-colors"
              >
                Start Learning <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProgressPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#46B1BD]"></div>
      </div>
    }>
      <ProgressContent />
    </Suspense>
  );
}
