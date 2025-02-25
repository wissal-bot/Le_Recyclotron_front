export interface User {
  id: string;
  email: string;
  roles: Role[];
}

export interface CreateUser {
  email: string;
  password: string;
}

export interface UpdateUser {
  email?: string;
  password?: string;
}

export interface Role {
  id: number;
  name: string;
}
