import type {
  AgentRequest,
  AgentResponse,
  User,
  UserCreate,
  UserUpdate,
} from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((error as { detail: string }).detail ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// --- Users ---
export const usersApi = {
  list: (skip = 0, limit = 20): Promise<User[]> =>
    request<User[]>(`/api/v1/users/?skip=${skip}&limit=${limit}`),

  get: (id: number): Promise<User> =>
    request<User>(`/api/v1/users/${id}`),

  create: (payload: UserCreate): Promise<User> =>
    request<User>("/api/v1/users/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: UserUpdate): Promise<User> =>
    request<User>(`/api/v1/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  delete: (id: number): Promise<void> =>
    request<void>(`/api/v1/users/${id}`, { method: "DELETE" }),
};

// --- Agent ---
export const agentApi = {
  chat: (payload: AgentRequest): Promise<AgentResponse> =>
    request<AgentResponse>("/api/v1/agent/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
