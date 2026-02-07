/**
 * Typed API client for backend communication.
 *
 * Task Reference: T035 - Create frontend/src/services/api.ts
 * Task Reference: T034 - Include Authorization header from getSessionToken
 * Task Reference: T047 [US6] - Add 401 detection with redirect to login
 * Task Reference: T048 [US6] - Implement redirect to /login?error=session_expired
 * Task Reference: T050 [US6] - Add return URL handling
 * Task Reference: T017 - Add api.tags endpoints (005-todo-enhancements)
 * Task Reference: T047 [US1] - Add api.occurrences endpoints (006-recurring-reminders)
 * Task Reference: T100 [US7] - Add api.preferences endpoints (006-recurring-reminders)
 * Feature: 001-project-init-architecture, 002-auth-identity, 004-frontend-todo-ui, 005-todo-enhancements, 006-recurring-reminders
 *
 * Provides:
 * - Type-safe API calls
 * - Automatic JWT token inclusion for authenticated requests
 * - Error handling with typed responses
 */

import { env } from "@/lib/env";
import { getSessionToken } from "@/lib/auth";
import type { Todo, TodoCreate, TodoUpdate } from "@/types/todo";
import type { Tag, TagCreate, TagUpdate, TagWithCount } from "@/types/tag";
import type { FilterQueryParams } from "@/types/filters";
import type { OccurrenceStatus, EditScope } from "@/types/recurrence";
import type {
  NotificationResponse,
  NotificationListResponse,
  NotificationUpdate,
  UnreadCountResponse,
  MarkAllReadResponse,
} from "@/types/notification";
import type { ChatRequest, ChatResponse, ChatHistoryResponse } from "@/types/chat";

/**
 * User preferences response from backend
 * Task Reference: T100 [US7] (006-recurring-reminders)
 */
export interface UserPreferencesResponse {
  id: string;
  user_id: string;
  timezone: string;
  default_reminder_offset: number | null;
  push_enabled: boolean;
  daily_digest_enabled: boolean;
  daily_digest_time: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * User preferences update payload
 */
export interface UserPreferencesUpdate {
  timezone?: string;
  default_reminder_offset?: number | null;
  push_enabled?: boolean;
  daily_digest_enabled?: boolean;
  daily_digest_time?: string | null;
}

/**
 * Occurrence response from backend
 * Task Reference: T047 [US1] (006-recurring-reminders)
 */
export interface Occurrence {
  id: string;
  parent_todo_id: string;
  occurrence_date: string;
  status: OccurrenceStatus;
  completed_at: string | null;
  created_at: string;
}

/**
 * Occurrence list response
 */
export interface OccurrenceListResponse {
  items: Occurrence[];
  total: number;
}

/**
 * API error response from backend
 */
export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  request_id?: string;
  details?: Record<string, unknown>;
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  error?: string;
}

/**
 * Readiness check response
 */
export interface ReadinessResponse {
  status: "ready" | "not_ready";
  timestamp: string;
  checks: {
    database: "connected" | "disconnected";
    config: "valid" | "invalid";
  };
  error?: string;
}

/**
 * API client configuration
 */
interface ApiConfig {
  baseUrl: string;
  getToken?: () => Promise<string | null>;
}

/**
 * Build URL with query parameters
 */
function buildUrl(baseUrl: string, endpoint: string, params?: FilterQueryParams): string {
  const url = new URL(`${baseUrl}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle array params (priority[], tag[])
          value.forEach((v) => url.searchParams.append(key, v));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    });
  }

  return url.toString();
}

/**
 * Create the API client
 */
function createApiClient(config: ApiConfig) {
  const { baseUrl, getToken } = config;

  /**
   * Make an authenticated request to the API
   */
  async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: FilterQueryParams
  ): Promise<T> {
    const url = params ? buildUrl(baseUrl, endpoint, params) : `${baseUrl}${endpoint}`;
    const headers = new Headers(options.headers);

    // Add content type if not set
    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    // Add auth token if available
    if (getToken) {
      const token = await getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-OK responses
    if (!response.ok) {
      // T047 [US6] - Handle 401 Unauthorized (session expired)
      if (response.status === 401) {
        // Only redirect on client-side
        if (typeof window !== "undefined") {
          // Preserve the current URL for return after re-authentication
          const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?error=session_expired&returnUrl=${returnUrl}`;
        }
        const error: ApiError = {
          error: "UNAUTHORIZED",
          message: "Session expired. Please log in again.",
          timestamp: new Date().toISOString(),
        };
        throw new ApiClientError(error, response.status);
      }

      const error: ApiError = await response.json().catch(() => ({
        error: "NETWORK_ERROR",
        message: `Request failed with status ${response.status}`,
        timestamp: new Date().toISOString(),
      }));
      throw new ApiClientError(error, response.status);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  }

  return {
    /**
     * Health check endpoints
     */
    health: {
      /**
       * Basic health check
       */
      check: () => request<HealthResponse>("/health"),

      /**
       * Detailed readiness check
       */
      ready: () => request<ReadinessResponse>("/health/ready"),
    },

    /**
     * Todo endpoints
     *
     * Task Reference: T005 - Update API client types
     * Feature: 004-frontend-todo-ui
     */
    todos: {
      /** GET /todos - List all todos for current user with optional filters */
      list: (params?: FilterQueryParams) => request<Todo[]>("/todos", {}, params),

      /** POST /todos - Create a new todo */
      create: (data: TodoCreate) =>
        request<Todo>("/todos", {
          method: "POST",
          body: JSON.stringify(data),
        }),

      /** GET /todos/{id} - Get a specific todo */
      get: (id: string) => request<Todo>(`/todos/${id}`),

      /** PATCH /todos/{id} - Update a todo. T107 [US8] - Add edit_scope support */
      update: (id: string, data: TodoUpdate, editScope?: EditScope) =>
        request<Todo>(
          `/todos/${id}${editScope ? `?edit_scope=${editScope}` : ""}`,
          {
            method: "PATCH",
            body: JSON.stringify(data),
          }
        ),

      /** DELETE /todos/{id} - Delete a todo */
      delete: (id: string) =>
        request<void>(`/todos/${id}`, { method: "DELETE" }),

      /** POST /todos/{id}/stop-recurring - Stop a recurring todo series
       * Task Reference: T108, T112 [US9] (006-recurring-reminders) */
      stopRecurring: (id: string, keepPending: boolean = false) =>
        request<Todo>(`/todos/${id}/stop-recurring?keep_pending=${keepPending}`, {
          method: "POST",
        }),
    },

    /**
     * Tag endpoints
     *
     * Task Reference: T017 - Add api.tags endpoints
     * Feature: 005-todo-enhancements
     */
    tags: {
      /** GET /tags - List all tags for current user */
      list: () => request<TagWithCount[]>("/tags"),

      /** POST /tags - Create a new tag */
      create: (data: TagCreate) =>
        request<TagWithCount>("/tags", {
          method: "POST",
          body: JSON.stringify(data),
        }),

      /** GET /tags/{id} - Get a specific tag */
      get: (id: string) => request<TagWithCount>(`/tags/${id}`),

      /** PATCH /tags/{id} - Update a tag */
      update: (id: string, data: TagUpdate) =>
        request<TagWithCount>(`/tags/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        }),

      /** DELETE /tags/{id} - Delete a tag */
      delete: (id: string) =>
        request<void>(`/tags/${id}`, { method: "DELETE" }),

      /** GET /tags/suggest?q={prefix} - Get tag suggestions for autocomplete */
      suggest: (prefix: string, limit: number = 10) =>
        request<Tag[]>(`/tags/suggest?q=${encodeURIComponent(prefix)}&limit=${limit}`),
    },

    /**
     * Occurrence endpoints
     *
     * Task Reference: T047 [US1] - Add api.occurrences endpoints
     * Task Reference: T074, T077 [US4] - Add occurrence complete/skip/current endpoints
     * Feature: 006-recurring-reminders
     */
    occurrences: {
      /** GET /todos/{todoId}/occurrences - List occurrences for a recurring todo */
      list: (todoId: string, status?: OccurrenceStatus) =>
        request<OccurrenceListResponse>(
          `/todos/${todoId}/occurrences${status ? `?status=${status}` : ""}`
        ),

      /** PATCH /occurrences/{id} - Update occurrence status */
      update: (id: string, status: OccurrenceStatus) =>
        request<Occurrence>(`/occurrences/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }),

      /** POST /occurrences/{id}/complete - Complete an occurrence */
      complete: (id: string) =>
        request<Occurrence>(`/occurrences/${id}/complete`, {
          method: "POST",
        }),

      /** POST /occurrences/{id}/skip - Skip an occurrence */
      skip: (id: string) =>
        request<Occurrence>(`/occurrences/${id}/skip`, {
          method: "POST",
        }),

      /** GET /todos/{todoId}/current-occurrence - Get current/next occurrence */
      getCurrent: (todoId: string) =>
        request<Occurrence>(`/todos/${todoId}/current-occurrence`),
    },

    /**
     * Notification endpoints
     *
     * Task Reference: T071 [US3] - Add api.notifications endpoints
     * Feature: 006-recurring-reminders
     */
    notifications: {
      /** GET /notifications - List notifications for current user */
      list: (options?: { unread_only?: boolean; limit?: number; offset?: number }) =>
        request<NotificationListResponse>(
          `/notifications${options
            ? `?${new URLSearchParams(
              Object.entries(options)
                .filter(([, v]) => v !== undefined)
                .map(([k, v]) => [k, String(v)])
            ).toString()}`
            : ""
          }`
        ),

      /** GET /notifications/unread-count - Get unread notification count */
      unreadCount: () => request<UnreadCountResponse>("/notifications/unread-count"),

      /** PATCH /notifications/{id} - Update notification (mark as read) */
      update: (id: string, data: NotificationUpdate) =>
        request<NotificationResponse>(`/notifications/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        }),

      /** POST /notifications/mark-all-read - Mark all notifications as read */
      markAllRead: () =>
        request<MarkAllReadResponse>("/notifications/mark-all-read", {
          method: "POST",
        }),

      /** DELETE /notifications/{id} - Delete a notification */
      delete: (id: string) =>
        request<void>(`/notifications/${id}`, { method: "DELETE" }),
    },

    /**
     * User preferences endpoints
     *
     * Task Reference: T100 [US7] - Add api.preferences endpoints
     * Feature: 006-recurring-reminders
     */
    preferences: {
      /** GET /me/preferences - Get user preferences */
      get: () => request<UserPreferencesResponse>("/me/preferences"),

      /** PATCH /me/preferences - Update user preferences */
      update: (data: UserPreferencesUpdate) =>
        request<UserPreferencesResponse>("/me/preferences", {
          method: "PATCH",
          body: JSON.stringify(data),
        }),

      /** GET /me/preferences/timezones - Get available timezones */
      getTimezones: () => request<string[]>("/me/preferences/timezones"),
    },

    /**
     * Chat endpoints
     *
     * Task Reference: T008 (007-ai-todo-chatbot)
     * Feature: 007-ai-todo-chatbot
     */
    chat: {
      /** POST /api/chat - Send message to AI (user identity from JWT) */
      sendMessage: (data: ChatRequest) =>
        request<ChatResponse>("/api/chat", {
          method: "POST",
          body: JSON.stringify(data),
        }),

      /** GET /api/chat/history - Get conversation history */
      getHistory: (conversationId?: string) =>
        request<ChatHistoryResponse>(
          `/api/chat/history${conversationId ? `?conversation_id=${conversationId}` : ""}`
        ),
    },

    /**
     * Raw request method for custom endpoints
     */
    request,
  };
}

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  constructor(
    public readonly error: ApiError,
    public readonly status: number
  ) {
    super(error.message);
    this.name = "ApiClientError";
  }
}

/**
 * Default API client instance
 *
 * Task Reference: T034 - Include Authorization header from getSessionToken
 *
 * Usage:
 *   import { api } from '@/services/api';
 *
 *   // Check health
 *   const health = await api.health.check();
 *
 *   // Authenticated requests automatically include JWT token
 *   const todos = await api.todos.list();
 *
 *   // List todos with filters
 *   const filteredTodos = await api.todos.list({
 *     priority: ['high'],
 *     status: 'active',
 *   });
 *
 *   // Tag operations
 *   const tags = await api.tags.list();
 *   const suggestions = await api.tags.suggest('work');
 */
export const api = createApiClient({
  baseUrl: env.apiUrl,
  // Get JWT token from Better Auth session for authenticated requests
  getToken: getSessionToken,
});
