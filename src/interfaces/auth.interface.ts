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
  id: string;
  otp: string;
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
