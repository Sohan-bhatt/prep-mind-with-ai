"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";
import { 
  Folder, 
  FolderPlus, 
  FileText, 
  FilePlus, 
  ChevronRight,
  Home,
  X,
  Loader2,
  HardDrive,
  Trash2,
  Brain,
  AlertCircle
} from "lucide-react";

interface Directory {
  id: string;
  name: string;
  parent_id: string | null;
  children?: Directory[];
  files?: File[];
}

interface File {
  id: string;
  name: string;
  content: string;
  directory_id: string;
}

export default function FoldersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#46B1BD] animate-spin" />
      </div>
    }>
      <FoldersContent />
    </Suspense>
  );
}

function FoldersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDirId = searchParams.get("dir");

  const [allDirectories, setAllDirectories] = useState<Directory[]>([]);
  const [currentItems, setCurrentItems] = useState<{ folders: Directory[]; files: File[] }>({ folders: [], files: [] });
  const [loading, setLoading] = useState(true);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchAllDirectories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/directories/`);
      if (res.ok) {
        const data = await res.json();
        setAllDirectories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch directories:", error);
      setAllDirectories([]);
    }
  };

  const fetchCurrentContent = async (dirId: string | null) => {
    try {
      if (!dirId) {
        const res = await fetch(`${API_BASE_URL}/api/directories/`);
        const data = await res.json();
        setCurrentItems({ folders: Array.isArray(data) ? data : [], files: [] });
        return;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/directories/${dirId}`);
      const data = await res.json();
      
      setCurrentItems({ 
        folders: Array.isArray(data.children) ? data.children : [], 
        files: Array.isArray(data.files) ? data.files : [] 
      });
    } catch (error) {
      console.error("Failed to fetch content:", error);
      setCurrentItems({ folders: [], files: [] });
    }
  };

  useEffect(() => {
    fetchAllDirectories().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCurrentContent(currentDirId);
  }, [currentDirId, allDirectories]);

  const handleCreateFolder = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/directories/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, parent_id: currentDirId || null }),
      });
      
      if (res.ok) {
        setNewName("");
        setShowNewFolderModal(false);
        fetchAllDirectories();
      }
    } catch (error) {
      console.error("Failed to create folder:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateFile = async () => {
    if (!newName.trim()) return;
    if (!currentDirId) {
      alert("Please select or create a folder first");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/files/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, content: "", directory_id: currentDirId }),
      });
      
      if (res.ok) {
        const file = await res.json();
        setNewName("");
        setShowNewFileModal(false);
        fetchAllDirectories();
        router.push(`/file/${file.id}`);
      }
    } catch (error) {
      console.error("Failed to create file:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (type: "folder" | "file", id: string) => {
    if (!confirm(`Delete this ${type}?`)) return;
    
    try {
      const endpoint = type === "folder" 
        ? `${API_BASE_URL}/api/directories/${id}` 
        : `${API_BASE_URL}/api/files/${id}`;
      
      await fetch(endpoint, { method: "DELETE" });
      fetchAllDirectories();
      if (currentDirId) fetchCurrentContent(currentDirId);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const getBreadcrumb = () => {
    if (!currentDirId) return [{ id: null, name: "My Materials" }];
    
    const path: { id: string | null; name: string }[] = [{ id: null, name: "My Materials" }];
    
    const findPath = (dirs: Directory[], targetId: string): boolean => {
      for (const dir of dirs) {
        if (dir.id === targetId) {
          path.push({ id: dir.id, name: dir.name });
          return true;
        }
        if (dir.children && findPath(dir.children, targetId)) {
          path.push({ id: dir.id, name: dir.name });
          return true;
        }
      }
      return false;
    };
    
    findPath(allDirectories, currentDirId);
    return path.reverse();
  };

  const breadcrumb = getBreadcrumb();

  const renderSidebarTree = (dirs: Directory[], level: number = 0) => {
    return dirs.map((dir) => (
      <div key={dir.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            currentDirId === dir.id 
              ? "bg-[#46B1BD] text-white" 
              : "hover:bg-[#1a1a24] text-[#94a3b8]"
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => router.push(`/folders?dir=${dir.id}`)}
        >
          <Folder className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate">{dir.name}</span>
        </div>
        {dir.children && dir.children.length > 0 && currentDirId === dir.id && (
          <div>{renderSidebarTree(dir.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#46B1BD] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <aside className="w-64 border-r border-[#2a2a3a] flex flex-col">
        <div className="p-4 border-b border-[#2a2a3a]">
          <Link href="/" className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#46B1BD] to-[#3a949c] flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif text-lg text-white">UPSC Path</span>
          </Link>
          
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="w-full px-4 py-2 bg-[#46B1BD] hover:bg-[#5ec4ce] rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              !currentDirId 
                ? "bg-[#46B1BD] text-white" 
                : "hover:bg-[#1a1a24] text-[#94a3b8]"
            }`}
            onClick={() => router.push("/folders")}
          >
            <HardDrive className="w-4 h-4" />
            <span className="text-sm">My Materials</span>
          </div>
          
          {renderSidebarTree(allDirectories)}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="border-b border-[#2a2a3a] px-6 py-3 flex items-center gap-2">
          {breadcrumb.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <ChevronRight className="w-4 h-4 text-[#64748b]" />}
              <button
                onClick={() => item.id ? router.push(`/folders?dir=${item.id}`) : router.push("/folders")}
                className={`text-sm hover:text-[#46B1BD] transition-colors ${
                  idx === breadcrumb.length - 1 ? "text-white font-medium" : "text-[#94a3b8]"
                }`}
              >
                {item.name}
              </button>
            </div>
          ))}
          
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="p-2 hover:bg-[#1a1a24] rounded-lg transition-colors"
              title="New Folder"
            >
              <FolderPlus className="w-5 h-5 text-[#94a3b8]" />
            </button>
            <button
              onClick={() => currentDirId ? setShowNewFileModal(true) : alert("Please select a folder first")}
              className="p-2 hover:bg-[#1a1a24] rounded-lg transition-colors"
              title="New File"
            >
              <FilePlus className="w-5 h-5 text-[#94a3b8]" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          {currentItems.folders.length === 0 && currentItems.files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Folder className="w-20 h-20 text-[#2a2a3a] mb-4" />
              <h3 className="text-xl font-medium text-[#64748b] mb-2">This folder is empty</h3>
              <p className="text-[#475569] mb-6">Create folders or notes to organize your studies</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewFolderModal(true)}
                  className="px-4 py-2 bg-[#46B1BD] hover:bg-[#5ec4ce] rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  New Folder
                </button>
                {currentDirId && (
                  <button
                    onClick={() => setShowNewFileModal(true)}
                    className="px-4 py-2 bg-[#1a1a24] hover:bg-[#2a2a3a] rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <FilePlus className="w-4 h-4" />
                    New Note
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              {currentItems.folders.map((folder) => (
                <motion.div
                  key={folder.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group flex flex-col items-center p-4 rounded-xl hover:bg-[#1a1a24] cursor-pointer transition-colors"
                  onClick={() => router.push(`/folders?dir=${folder.id}`)}
                >
                  <div className="relative">
                    <Folder className="w-16 h-16 text-amber-400" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete("folder", folder.id);
                      }}
                      className="absolute -top-2 -right-2 p-1.5 bg-[#ef4444] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <span className="mt-2 text-sm text-[#94a3b8] text-center truncate w-full">
                    {folder.name}
                  </span>
                </motion.div>
              ))}

              {currentItems.files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group flex flex-col items-center p-4 rounded-xl hover:bg-[#1a1a24] cursor-pointer transition-colors"
                  onClick={() => router.push(`/file/${file.id}`)}
                >
                  <div className="relative">
                    <FileText className="w-16 h-16 text-[#46B1BD]" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete("file", file.id);
                      }}
                      className="absolute -top-2 -right-2 p-1.5 bg-[#ef4444] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <span className="mt-2 text-sm text-[#94a3b8] text-center truncate w-full">
                    {file.name}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showNewFolderModal && (
          <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowNewFolderModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Create New Folder</h3>
                <button onClick={() => setShowNewFolderModal(false)} className="p-1 rounded-lg hover:bg-[#1a1a24]">
                  <X className="w-5 h-5 text-[#64748b]" />
                </button>
              </div>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Folder name"
                className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl text-white placeholder-[#64748b] focus:outline-none focus:border-[#46B1BD]"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 text-[#94a3b8] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={creating || !newName.trim()}
                  className="px-4 py-2 bg-[#46B1BD] hover:bg-[#5ec4ce] rounded-lg text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewFileModal && (
          <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowNewFileModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Create New Note</h3>
                <button onClick={() => setShowNewFileModal(false)} className="p-1 rounded-lg hover:bg-[#1a1a24]">
                  <X className="w-5 h-5 text-[#64748b]" />
                </button>
              </div>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Note title"
                className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl text-white placeholder-[#64748b] focus:outline-none focus:border-[#46B1BD]"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateFile()}
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewFileModal(false)}
                  className="px-4 py-2 text-[#94a3b8] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFile}
                  disabled={creating || !newName.trim()}
                  className="px-4 py-2 bg-[#46B1BD] hover:bg-[#5ec4ce] rounded-lg text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
