export interface ApiResponse<T> {
  data?: T;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface OtpVerification {
  email: string; // Change from id to email to match component usage
  otp: string;
  userId?: string; // Add userId to the interface
}

export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: string;
  email: string;
  roles: Role[];
}

export interface LoginResponse {
  jwt: string;
}

export interface RegisterResponse {
  id: string;
}

export interface OtpResponse {
  jwt: string;
}

export interface TokenRevocationResponse {
  message: string;
}
