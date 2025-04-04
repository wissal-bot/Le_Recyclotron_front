export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: Role[];
}

export interface CreateUser {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string | null;
}

export interface UpdateUser {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  phone?: string | null;
}

export interface Role {
  id: number;
  name: string;
}
