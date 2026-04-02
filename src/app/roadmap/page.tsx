"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Brain,
  TrendingUp,
  MessageCircle,
  Eye,
  EyeOff,
  Zap,
  FileText,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import { EXAMS, DailyTask, TaskItem, generateRoadmap, getTodayTask, getExamById } from "@/lib/exams";

function RoadmapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('exam') || 'rbi_grade_b';
  
  const [roadmap, setRoadmap] = useState<DailyTask[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [viewMode, setViewMode] = useState<'full' | 'today'>('today');
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));
  const [taskStatus, setTaskStatus] = useState<Record<string, string>>({});
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);

  const exam = getExamById(examId);

  useEffect(() => {
    const savedProgress = localStorage.getItem(`roadmap_progress_${examId}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCurrentDay(progress.currentDay || 1);
      setTaskStatus(progress.taskStatus || {});
    }
    
    const generatedRoadmap = generateRoadmap(examId);
    setRoadmap(generatedRoadmap);
    setLoading(false);
  }, [examId]);

  const saveProgress = (newDay: number, newStatus: Record<string, string>) => {
    const progress = { currentDay: newDay, taskStatus: newStatus };
    localStorage.setItem(`roadmap_progress_${examId}`, JSON.stringify(progress));
    setCurrentDay(newDay);
    setTaskStatus(newStatus);
  };

  const handleTaskStatusChange = (taskId: string, status: 'completed' | 'partial' | 'confused') => {
    const newStatus = { ...taskStatus, [taskId]: status };
    saveProgress(currentDay, newStatus);
  };

  const handleDayComplete = () => {
    const todayTasks = roadmap.find(t => t.day === currentDay);
    if (!todayTasks) return;

    const allPending = todayTasks.tasks.every(t => !taskStatus[t.id] || taskStatus[t.id] === 'pending');
    if (!allPending) {
      const nextDay = currentDay + 1;
      if (nextDay <= roadmap.length) {
        saveProgress(nextDay, {});
      }
    }
  };

  const toggleDayExpand = (day: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const todayTask = roadmap.find(t => t.day === currentDay);
  const completedDays = Object.keys(taskStatus).length > 0 
    ? Math.max(...Object.values(taskStatus).filter(s => s !== 'pending').map((_, i) => Math.ceil((i + 1) / 4)))
    : 0;
  const progressPercentage = Math.round((currentDay / roadmap.length) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400';
      case 'partial': return 'text-amber-400';
      case 'confused': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-400/20';
      case 'partial': return 'bg-amber-400/20';
      case 'confused': return 'bg-red-400/20';
      default: return 'bg-gray-400/20';
    }
  };

  const getTaskStatusCounts = () => {
    const counts = { completed: 0, partial: 0, confused: 0, pending: 0 };
    Object.values(taskStatus).forEach(status => {
      if (status in counts) counts[status as keyof typeof counts]++;
    });
    return counts;
  };

  if (loading || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#46B1BD]"></div>
      </div>
    );
  }

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
                <h1 className="text-white font-semibold">{exam.name}</h1>
                <p className="text-gray-400 text-xs">{exam.fullName}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#1a1a24] rounded-lg p-1">
              <button
                onClick={() => setViewMode('today')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'today' ? 'bg-[#46B1BD] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Today's Task
              </button>
              <button
                onClick={() => setViewMode('full')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'full' ? 'bg-[#46B1BD] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Full Roadmap
              </button>
            </div>
            <button
              onClick={() => setShowChat(!showChat)}
              className="p-2 bg-[#46B1BD] hover:bg-[#5ec4ce] rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#46B1BD]" />
                <span className="text-white font-medium">Day {currentDay} of {roadmap.length}</span>
              </div>
              <span className="text-[#46B1BD] font-semibold">{progressPercentage}% Complete</span>
            </div>
            <div className="h-3 bg-[#1a1a24] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                className="h-full bg-gradient-to-r from-[#46B1BD] to-[#7C3AED]"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-gray-400 text-sm">Completed</span>
              </div>
              <p className="text-2xl font-bold text-white">{getTaskStatusCounts().completed}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-gray-400 text-sm">Partial</span>
              </div>
              <p className="text-2xl font-bold text-white">{getTaskStatusCounts().partial}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-red-400" />
                <span className="text-gray-400 text-sm">Confused</span>
              </div>
              <p className="text-2xl font-bold text-white">{getTaskStatusCounts().confused}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[#46B1BD]" />
                <span className="text-gray-400 text-sm">Est. Hours Today</span>
              </div>
              <p className="text-2xl font-bold text-white">{todayTask?.estimatedHours.toFixed(1) || 0}h</p>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Main Content */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {viewMode === 'today' ? (
                  <motion.div
                    key="today"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {todayTask && (
                      <div className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <span className="px-3 py-1 bg-[#46B1BD]/20 text-[#46B1BD] rounded-full text-sm font-medium">
                              {todayTask.phase}
                            </span>
                            <h2 className="text-2xl font-serif text-white mt-2">{todayTask.topic}</h2>
                            <p className="text-gray-400 mt-1">{todayTask.subject}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">Day {todayTask.day}</p>
                            <p className="text-[#46B1BD] font-semibold">{todayTask.estimatedHours.toFixed(1)} hours</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {todayTask.tasks.map((task) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`glass rounded-xl p-4 border-l-4 ${
                                taskStatus[task.id] === 'completed' ? 'border-l-emerald-400' :
                                taskStatus[task.id] === 'partial' ? 'border-l-amber-400' :
                                taskStatus[task.id] === 'confused' ? 'border-l-red-400' :
                                'border-l-gray-500'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className={`mt-1 p-1 rounded ${getStatusBg(taskStatus[task.id] || 'pending')}`}>
                                    {task.type === 'reading' && <BookOpen className="w-4 h-4" />}
                                    {task.type === 'practice' && <FileText className="w-4 h-4" />}
                                    {task.type === 'revision' && <RefreshCw className="w-4 h-4" />}
                                    {task.type === 'mock' && <Target className="w-4 h-4" />}
                                    {task.type === 'current_affairs' && <Zap className="w-4 h-4" />}
                                  </div>
                                  <div>
                                    <h3 className="text-white font-medium">{task.title}</h3>
                                    <p className="text-gray-400 text-sm">{task.description}</p>
                                    {task.resource && (
                                      <p className="text-[#46B1BD] text-xs mt-1">📚 {task.resource}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleTaskStatusChange(task.id, 'completed')}
                                    className={`p-2 rounded-lg transition-colors ${
                                      taskStatus[task.id] === 'completed' 
                                        ? 'bg-emerald-400/20 text-emerald-400' 
                                        : 'hover:bg-emerald-400/20 text-gray-400 hover:text-emerald-400'
                                    }`}
                                    title="Completed"
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleTaskStatusChange(task.id, 'partial')}
                                    className={`p-2 rounded-lg transition-colors ${
                                      taskStatus[task.id] === 'partial' 
                                        ? 'bg-amber-400/20 text-amber-400' 
                                        : 'hover:bg-amber-400/20 text-gray-400 hover:text-amber-400'
                                    }`}
                                    title="Partial"
                                  >
                                    <AlertCircle className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleTaskStatusChange(task.id, 'confused')}
                                    className={`p-2 rounded-lg transition-colors ${
                                      taskStatus[task.id] === 'confused' 
                                        ? 'bg-red-400/20 text-red-400' 
                                        : 'hover:bg-red-400/20 text-gray-400 hover:text-red-400'
                                    }`}
                                    title="Need Help"
                                  >
                                    <Brain className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                              {taskStatus[task.id] && taskStatus[task.id] !== 'pending' && (
                                <div className={`mt-3 text-sm ${getStatusColor(taskStatus[task.id])}`}>
                                  Status: {taskStatus[task.id].charAt(0).toUpperCase() + taskStatus[task.id].slice(1)}
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                          <button
                            onClick={() => currentDay > 1 && setCurrentDay(currentDay - 1)}
                            disabled={currentDay === 1}
                            className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ← Previous Day
                          </button>
                          <button
                            onClick={handleDayComplete}
                            className="px-6 py-3 bg-[#46B1BD] hover:bg-[#5ec4ce] text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Complete Day {currentDay}
                          </button>
                          <button
                            onClick={() => currentDay < roadmap.length && setCurrentDay(currentDay + 1)}
                            disabled={currentDay === roadmap.length}
                            className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next Day →
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3"
                  >
                    {roadmap.slice(0, 60).map((task) => (
                      <div
                        key={task.id}
                        className={`glass rounded-xl overflow-hidden transition-colors ${
                          task.day === currentDay ? 'ring-2 ring-[#46B1BD]' : ''
                        }`}
                      >
                        <div
                          onClick={() => toggleDayExpand(task.day)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1a1a24]/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              task.day === currentDay ? 'bg-[#46B1BD]' :
                              task.day < currentDay ? 'bg-emerald-400' : 'bg-[#2a2a3a]'
                            }`}>
                              {task.day < currentDay ? (
                                <CheckCircle className="w-5 h-5 text-white" />
                              ) : (
                                <span className="text-white font-medium">{task.day}</span>
                              )}
                            </div>
                            <div>
                              <h3 className="text-white font-medium">{task.topic}</h3>
                              <p className="text-gray-400 text-sm">{task.phase} • {task.subject}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                              <Clock className="w-4 h-4" />
                              <span>{task.estimatedHours.toFixed(1)}h</span>
                            </div>
                            {expandedDays.has(task.day) ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedDays.has(task.day) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-[#2a2a3a]"
                            >
                              <div className="p-4 pt-0 space-y-2">
                                {task.tasks.map((t) => (
                                  <div key={t.id} className="flex items-center gap-3 text-sm">
                                    {taskStatus[t.id] === 'completed' ? (
                                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    ) : taskStatus[t.id] === 'partial' ? (
                                      <AlertCircle className="w-4 h-4 text-amber-400" />
                                    ) : taskStatus[t.id] === 'confused' ? (
                                      <Brain className="w-4 h-4 text-red-400" />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full border border-gray-500" />
                                    )}
                                    <span className="text-gray-300">{t.title}</span>
                                    <span className="text-gray-500 text-xs">({t.type})</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    
                    {roadmap.length > 60 && (
                      <div className="text-center py-4">
                        <p className="text-gray-400">Showing 60 of {roadmap.length} days</p>
                        <button
                          onClick={() => setViewMode('today')}
                          className="mt-2 text-[#46B1BD] hover:underline"
                        >
                          Go to Today's Task →
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="w-80 space-y-4">
              {/* Exam Info */}
              <div className="glass rounded-xl p-4">
                <h3 className="text-white font-medium mb-3">Exam Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white">{exam.duration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phases</span>
                    <span className="text-white">{exam.phases.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subjects</span>
                    <span className="text-white">{exam.syllabus.length}</span>
                  </div>
                </div>
              </div>

              {/* Phase Progress */}
              <div className="glass rounded-xl p-4">
                <h3 className="text-white font-medium mb-3">Phase Progress</h3>
                <div className="space-y-3">
                  {exam.phases.map((phase, index) => {
                    const phaseDays = Math.floor(roadmap.length / exam.phases.length);
                    const phaseStart = index * phaseDays + 1;
                    const phaseEnd = Math.min((index + 1) * phaseDays, roadmap.length);
                    const isActive = currentDay >= phaseStart && currentDay <= phaseEnd;
                    const isCompleted = currentDay > phaseEnd;
                    
                    return (
                      <div key={phase.name} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          isCompleted ? 'bg-emerald-400 text-white' :
                          isActive ? 'bg-[#46B1BD] text-white' : 'bg-[#2a2a3a] text-gray-400'
                        }`}>
                          {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>
                            {phase.name}
                          </p>
                          <p className="text-xs text-gray-500">{phase.papers.length} papers</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="glass rounded-xl p-4">
                <h3 className="text-white font-medium mb-3">This Week</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-[#1a1a24] rounded-lg">
                    <p className="text-2xl font-bold text-white">5</p>
                    <p className="text-xs text-gray-400">Tasks Done</p>
                  </div>
                  <div className="text-center p-3 bg-[#1a1a24] rounded-lg">
                    <p className="text-2xl font-bold text-white">2</p>
                    <p className="text-xs text-gray-400">Confused</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Chat Sidebar */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed top-0 right-0 h-full w-96 glass border-l border-[#2a2a3a] z-50 flex flex-col"
          >
            <div className="p-4 border-b border-[#2a2a3a] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#46B1BD]" />
                <span className="text-white font-medium">AI Tutor</span>
              </div>
              <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Ask me anything about your preparation!</p>
                  <p className="text-gray-500 text-xs mt-2">I can help with:</p>
                  <ul className="text-gray-500 text-xs mt-1 space-y-1">
                    <li>• Explain difficult concepts</li>
                    <li>• Suggest study resources</li>
                    <li>• Answer your doubts</li>
                    <li>• Help with answer writing</li>
                  </ul>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className={`${msg.role === 'user' ? 'ml-8' : 'mr-8'}`}>
                    <div className={`p-3 rounded-lg ${
                      msg.role === 'user' ? 'bg-[#46B1BD] text-white' : 'bg-[#1a1a24] text-gray-300'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-[#2a2a3a]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask your doubt..."
                  className="flex-1 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#46B1BD]"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-[#46B1BD] hover:bg-[#5ec4ce] rounded-lg transition-colors"
                >
                  <Zap className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  function handleSendMessage() {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatMessages([...chatMessages, { role: 'user', content: userMessage }]);
    setChatInput('');
    
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage);
      setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    }, 500);
  }

  function generateAIResponse(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('confused') || lowerQuery.includes('doubt')) {
      return "I'd be happy to help clarify your doubt! Could you please share more details about what specifically you're confused about? This will help me give you a better explanation.";
    }
    
    if (lowerQuery.includes('schedule') || lowerQuery.includes('plan')) {
      return `Based on your current progress (Day ${currentDay}), you're in the ${todayTask?.phase || 'Foundation'} phase. Keep following the daily roadmap - consistency is key for ${exam?.name || 'your exam'}!`;
    }
    
    if (lowerQuery.includes('topic') || lowerQuery.includes('what to study')) {
      return `Today's topic is "${todayTask?.topic}". Here's what you should focus on:\n\n1. Read the concept thoroughly\n2. Practice related questions\n3. Revise key points\n\nWould you like me to explain any part of this topic?`;
    }
    
    if (lowerQuery.includes('answer writing') || lowerQuery.includes('essay')) {
      return "For answer writing in " + (exam?.name || 'your exam') + ":\n\n1. **Visualize first** - Think of 2-3 key points\n2. **Structure** - Introduction, Body, Conclusion\n3. **Word count** - 250 words for GS, 150 for CSAT\n4. **Practice** - Write daily and get feedback\n\nWould you like me to evaluate a sample answer?";
    }
    
    return `Great question! For ${exam?.name || 'your exam'} preparation, focus on:\n\n1. **Consistency** - Follow the daily roadmap\n2. **Current Affairs** - Read daily news\n3. **Practice** - Solve questions daily\n4. **Revision** - Revise weekly\n\nYou're currently on Day ${currentDay}. Keep going! 🚀`;
  }
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#46B1BD]"></div>
      </div>
    }>
      <RoadmapContent />
    </Suspense>
  );
}
