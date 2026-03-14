// --- User ---
export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  is_active?: boolean;
}

// --- Agent ---
export interface AgentRequest {
  message: string;
  context?: Record<string, string>;
}

export interface AgentResponse {
  reply: string;
  usage?: Record<string, number>;
}

// --- API ---
export interface ApiError {
  detail: string;
}
