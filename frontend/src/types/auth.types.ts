import type { User } from './index'

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}