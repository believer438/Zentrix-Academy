import { buildApiUrl } from "./env";
import type { CatalogueCourse, BackendChapter } from "./backend-types";
export type { CatalogueCourse, BackendChapter } from "./backend-types";

const TOKEN_KEY = "zentrix-token";
const SESSION_KEY = "zentrix-academy_session";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}
export function isAuthenticated(): boolean {
  return !!getToken();
}
function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ApiError {
  detail: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erreur réseau" }));
    if (res.status === 401) clearAuth();
    throw new Error((err as ApiError).detail ?? "Erreur inconnue");
  }
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function apiRegister(email: string, fullName: string, password: string): Promise<{ message: string }> {
  const res = await fetch(buildApiUrl("/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, full_name: fullName, password }),
  });
  return handleResponse(res);
}

export async function apiLogin(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
  const res = await fetch(buildApiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
}

export async function apiGetMe(): Promise<UserProfile> {
  const res = await fetch(buildApiUrl("/auth/me"), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiUpdateMe(payload: { full_name?: string; password?: string }): Promise<UserProfile> {
  const res = await fetch(buildApiUrl("/auth/me"), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function apiGetUsers(): Promise<{ id: number; email: string; full_name: string; role: string }[]> {
  const res = await fetch(buildApiUrl("/auth/users"), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiUpdateUserRole(userId: number, role: string): Promise<{ id: number; email: string; role: string }> {
  const res = await fetch(buildApiUrl(`/auth/users/${userId}/role`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ role }),
  });
  return handleResponse(res);
}

export function getGoogleLoginUrl(): string {
  return buildApiUrl("/auth/google/login");
}

// ── Cours (personal documents for AI) ─────────────────────────────────────────

export interface BackendCours {
  id: number;
  titre: string;
  fichier_chemin: string;
  user_id: number;
  created_at?: string;
}

export async function apiGetMyCours(): Promise<BackendCours[]> {
  const res = await fetch(buildApiUrl("/cours/my_cours/"), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiGetCours(id: number): Promise<BackendCours> {
  const res = await fetch(buildApiUrl(`/cours/${id}`), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiUploadCours(titre: string, file: File): Promise<{ message: string; cours: BackendCours }> {
  const form = new FormData();
  form.append("titre", titre);
  form.append("file", file);
  const res = await fetch(buildApiUrl("/cours/upload_cours/"), {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  return handleResponse(res);
}

export async function apiDeleteCours(id: number): Promise<{ message: string }> {
  const res = await fetch(buildApiUrl(`/cours/${id}`), {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiUpdateCours(id: number, titre: string): Promise<{ message: string; cours: BackendCours }> {
  const form = new FormData();
  form.append("titre", titre);
  const res = await fetch(buildApiUrl(`/cours/${id}`), {
    method: "PUT",
    headers: { ...authHeaders() },
    body: form,
  });
  return handleResponse(res);
}

export async function apiGetProgress(coursId: number): Promise<{ cours_id: number; percent_complete: number }> {
  const res = await fetch(buildApiUrl(`/cours/${coursId}/progress`), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiUpdateProgress(coursId: number, percent: number): Promise<{ percent_complete: number }> {
  const res = await fetch(buildApiUrl(`/cours/${coursId}/progress`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ percent_complete: percent }),
  });
  return handleResponse(res);
}

export interface SummarizeResult {
  summary: string;
  status: string;
}

export async function apiSummarizeCours(id: number, customInstruction?: string): Promise<SummarizeResult> {
  const res = await fetch(buildApiUrl(`/cours/summarize_cours/${id}`), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ custom_instruction: customInstruction ?? null }),
  });
  return handleResponse(res);
}

export interface QuestionsResult {
  questions: unknown;
  structured: boolean;
  status: string;
}

export async function apiGenerateQuestions(id: number, options?: { customInstruction?: string; structured?: boolean }): Promise<QuestionsResult> {
  const res = await fetch(buildApiUrl(`/cours/generate_questions/${id}`), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      custom_instruction: options?.customInstruction ?? null,
      structured: options?.structured ?? false,
    }),
  });
  return handleResponse(res);
}

// ── Catalogue ─────────────────────────────────────────────────────────────────

export async function apiGetCatalogue(params?: { category?: string; search?: string }): Promise<CatalogueCourse[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.search) qs.set("search", params.search);
  const url = buildApiUrl(`/courses/?${qs.toString()}`);
  const res = await fetch(url, { headers: { ...authHeaders() } });
  return handleResponse(res);
}

export async function apiGetCatalogueCategories(): Promise<string[]> {
  const res = await fetch(buildApiUrl("/courses/categories"), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiGetCatalogueAllAdmin(): Promise<CatalogueCourse[]> {
  const res = await fetch(buildApiUrl("/courses/all"), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiGetCatalogueCourse(id: number): Promise<CatalogueCourse> {
  const res = await fetch(buildApiUrl(`/courses/${id}`), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiGetCourseChapters(courseId: number): Promise<BackendChapter[]> {
  const res = await fetch(buildApiUrl(`/courses/${courseId}/chapters`), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiEnrollCourse(id: number): Promise<{ message: string; enrolled: boolean }> {
  const res = await fetch(buildApiUrl(`/courses/${id}/enroll`), {
    method: "POST",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiUnenrollCourse(id: number): Promise<{ message: string; enrolled: boolean }> {
  const res = await fetch(buildApiUrl(`/courses/${id}/enroll`), {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiGetMyEnrollments(): Promise<CatalogueCourse[]> {
  const res = await fetch(buildApiUrl("/courses/my-enrollments"), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiCreateCourse(payload: {
  title: string; description: string; category: string; cover_image: string;
  level: string; duration_hours: number; instructor_name: string;
  is_published: boolean; tags: string;
}): Promise<CatalogueCourse> {
  const res = await fetch(buildApiUrl("/courses/"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function apiUpdateCourse(id: number, payload: Partial<{
  title: string; description: string; category: string; cover_image: string;
  level: string; duration_hours: number; instructor_name: string;
  is_published: boolean; tags: string;
}>): Promise<CatalogueCourse> {
  const res = await fetch(buildApiUrl(`/courses/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function apiDeleteCourse(id: number): Promise<{ message: string }> {
  const res = await fetch(buildApiUrl(`/courses/${id}`), {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiCreateChapter(courseId: number, payload: {
  title: string; description: string; content: string;
  order_index: number; video_url: string; duration_min: number;
}): Promise<BackendChapter> {
  const res = await fetch(buildApiUrl(`/courses/${courseId}/chapters`), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function apiUpdateChapter(courseId: number, chapterId: number, payload: Partial<{
  title: string; description: string; content: string;
  order_index: number; video_url: string; duration_min: number;
}>): Promise<BackendChapter> {
  const res = await fetch(buildApiUrl(`/courses/${courseId}/chapters/${chapterId}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function apiDeleteChapter(courseId: number, chapterId: number): Promise<{ message: string }> {
  const res = await fetch(buildApiUrl(`/courses/${courseId}/chapters/${chapterId}`), {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export interface BackendNote {
  id: number;
  titre: string;
  contenu: string;
  cours_id: number | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export async function apiGetNotes(): Promise<BackendNote[]> {
  const res = await fetch(buildApiUrl("/notes/"), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiCreateNote(payload: { titre: string; contenu: string; cours_id?: number }): Promise<BackendNote> {
  const res = await fetch(buildApiUrl("/notes/"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function apiUpdateNote(id: number, payload: { titre?: string; contenu?: string }): Promise<BackendNote> {
  const res = await fetch(buildApiUrl(`/notes/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function apiDeleteNote(id: number): Promise<{ message: string }> {
  const res = await fetch(buildApiUrl(`/notes/${id}`), {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface BackendNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  notif_type: string;
  created_at: string;
}

export async function apiGetNotifications(): Promise<BackendNotification[]> {
  const res = await fetch(buildApiUrl("/notifications/"), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiMarkNotificationRead(id: number): Promise<BackendNotification> {
  const res = await fetch(buildApiUrl(`/notifications/${id}/read`), {
    method: "PATCH",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiMarkAllNotificationsRead(): Promise<{ message: string }> {
  const res = await fetch(buildApiUrl("/notifications/read-all"), {
    method: "PATCH",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiDeleteNotification(id: number): Promise<{ message: string }> {
  const res = await fetch(buildApiUrl(`/notifications/${id}`), {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// ── AI Chat ───────────────────────────────────────────────────────────────────

export interface AIChatResponse {
  reply: string;
  status: string;
}

export async function apiAIChat(
  message: string,
  coursId?: number,
  history?: { role: string; content: string }[],
  mode?: "document" | "assistant" | "course",
): Promise<AIChatResponse> {
  const res = await fetch(buildApiUrl("/ai/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      message,
      cours_id: coursId ?? null,
      history: history ?? [],
      mode: mode ?? "assistant",
    }),
  });
  return handleResponse(res);
}

/**
 * Streaming AI chat — yields text deltas in real time.
 * Usage:
 *   for await (const delta of apiAIChatStream(...)) {
 *     setContent(prev => prev + delta);
 *   }
 */
export async function* apiAIChatStream(
  message: string,
  options?: {
    coursId?:         number;
    courseId?:        number;
    chapterId?:       number;
    history?:         { role: string; content: string }[];
    mode?:            "document" | "assistant" | "course";
    conversationId?:  number;
    onConversationId?: (id: number) => void;
  },
): AsyncGenerator<string> {
  const res = await fetch(buildApiUrl("/ai/chat/stream"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      message,
      cours_id:        options?.coursId         ?? null,
      course_id:       options?.courseId        ?? null,
      chapter_id:      options?.chapterId       ?? null,
      history:         options?.history         ?? [],
      mode:            options?.mode            ?? "course",
      conversation_id: options?.conversationId  ?? null,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erreur réseau" }));
    if (res.status === 401) clearAuth();
    throw new Error((err as ApiError).detail ?? "Erreur IA");
  }

  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return;
      try {
        const parsed = JSON.parse(payload) as { delta?: string; conversation_id?: number; type?: string };
        // Capture conversation_id from meta event
        if (parsed.type === "meta" && parsed.conversation_id && options?.onConversationId) {
          options.onConversationId(parsed.conversation_id);
        }
        if (parsed.delta) yield parsed.delta;
      } catch {
        // skip malformed chunk
      }
    }
  }
}

/** Update the AI's knowledge of where the student currently is. */
export async function apiUpdateAIContext(payload: {
  course_id?: number;
  chapter_id?: number;
  cours_id?: number;
  course_title?: string;
  chapter_title?: string;
}): Promise<{ status: string }> {
  const res = await fetch(buildApiUrl("/ai/context"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// ── Catalogue Progress ────────────────────────────────────────────────────────

export interface CatalogueProgressResult {
  course_id: number;
  percent_complete: number;
}

export async function apiGetCatalogueProgress(courseId: number): Promise<CatalogueProgressResult> {
  const res = await fetch(buildApiUrl(`/courses/${courseId}/progress`), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiUpdateCatalogueProgress(courseId: number, percent: number): Promise<CatalogueProgressResult> {
  const res = await fetch(buildApiUrl(`/courses/${courseId}/progress`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ percent_complete: percent }),
  });
  return handleResponse(res);
}

export async function apiGetAllProgress(): Promise<CatalogueProgressResult[]> {
  const res = await fetch(buildApiUrl("/courses/progress/all"), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// ── Analytics & Activity Tracking ────────────────────────────────────────────

export interface ActivityEventPayload {
  event_type: string;
  course_id?:  number;
  chapter_id?: number;
  metadata?:   Record<string, unknown>;
}

/** Log a student activity event (silently — never throws). */
export async function apiLogActivity(payload: ActivityEventPayload): Promise<void> {
  try {
    await fetch(buildApiUrl("/analytics/event"), {
      method:  "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body:    JSON.stringify(payload),
    });
  } catch {
    // silencieux — le tracking ne bloque jamais l'UI
  }
}

export interface AnalyticsProfile {
  profile:          Record<string, unknown>;
  weaknesses:       { topic: string; score: number; course_id?: number }[];
  activity_summary: { total_events: number; event_counts: Record<string, number>; estimated_time_min: number; active_days: number };
}

export async function apiGetAnalyticsProfile(): Promise<AnalyticsProfile> {
  const res = await fetch(buildApiUrl("/analytics/profile"), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// ── AI Conversations (historique persistant) ──────────────────────────────────

export interface AIConversation {
  id:         number;
  course_id?: number;
  chapter_id?: number;
  mode:       string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id:         number;
  role:       "user" | "assistant" | "system";
  content:    string;
  created_at: string;
}

export async function apiGetConversations(): Promise<AIConversation[]> {
  const res = await fetch(buildApiUrl("/ai/conversations"), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiGetConversationMessages(conversationId: number): Promise<{ conversation_id: number; messages: AIMessage[] }> {
  const res = await fetch(buildApiUrl(`/ai/conversations/${conversationId}/messages`), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiDeleteConversation(conversationId: number): Promise<{ status: string }> {
  const res = await fetch(buildApiUrl(`/ai/conversations/${conversationId}`), {
    method:  "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  documents_count: number;
  notes_count: number;
  unread_notifications: number;
  avg_progress: number;
  recent_documents: { id: number; titre: string }[];
}

export async function apiGetDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(buildApiUrl("/dashboard/stats"), {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}
