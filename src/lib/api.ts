import { API_BASE_URL } from "@/lib/config";

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Something went wrong");
  }
  
  return response.json();
}

export const api = {
  // Directories
  getDirectories: () => fetchAPI("/api/directories/"),
  getDirectory: (id: string) => fetchAPI(`/api/directories/${id}`),
  createDirectory: (data: { name: string; parent_id?: string }) =>
    fetchAPI("/api/directories/", { method: "POST", body: JSON.stringify(data) }),
  updateDirectory: (id: string, data: { name: string; parent_id?: string }) =>
    fetchAPI(`/api/directories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDirectory: (id: string) =>
    fetchAPI(`/api/directories/${id}`, { method: "DELETE" }),

  // Files
  getFiles: (directoryId?: string) =>
    fetchAPI(`/api/files/${directoryId ? `?directory_id=${directoryId}` : ""}`),
  getFile: (id: string) => fetchAPI(`/api/files/${id}`),
  createFile: (data: { name: string; content: string; directory_id: string }) =>
    fetchAPI("/api/files/", { method: "POST", body: JSON.stringify(data) }),
  updateFile: (id: string, data: { name: string; content: string }) =>
    fetchAPI(`/api/files/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteFile: (id: string) =>
    fetchAPI(`/api/files/${id}`, { method: "DELETE" }),

  // Notes
  getNotes: (fileId: string, noteType?: string) =>
    fetchAPI(`/api/notes/file/${fileId}${noteType ? `?note_type=${noteType}` : ""}`),
  createNote: (data: { content: string; note_type: string; file_id: string }) =>
    fetchAPI("/api/notes/", { method: "POST", body: JSON.stringify(data) }),
  deleteNote: (id: string) =>
    fetchAPI(`/api/notes/${id}`, { method: "DELETE" }),

  // Chat
  getChatMessages: (fileId: string) =>
    fetchAPI(`/api/chat/file/${fileId}`),
  sendChatMessage: (fileId: string, data: { content: string }) =>
    fetchAPI(`/api/chat/file/${fileId}`, { method: "POST", body: JSON.stringify(data) }),

  // Revision Notes
  getRevisionNotes: (fileId: string) =>
    fetchAPI(`/api/revision/file/${fileId}`),
  getTodayRevisionNotes: () =>
    fetchAPI("/api/revision/today"),
  getPendingRevisionNotes: () =>
    fetchAPI("/api/revision/pending"),
  getProgressStats: () =>
    fetchAPI("/api/revision/progress"),
  createRevisionNote: (data: { content: string; file_id: string; error_type?: string }) =>
    fetchAPI("/api/revision/", { method: "POST", body: JSON.stringify(data) }),
  resolveRevisionNote: (id: string) =>
    fetchAPI(`/api/revision/${id}/resolve`, { method: "PUT" }),
  markAsReviewed: (id: string) =>
    fetchAPI(`/api/revision/${id}/review`, { method: "PUT" }),
  deleteRevisionNote: (id: string) =>
    fetchAPI(`/api/revision/${id}`, { method: "DELETE" }),
};
