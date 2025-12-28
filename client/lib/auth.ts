// User interface for authentication
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  createdAt?: string;
  lastLoginAt?: string;
}
