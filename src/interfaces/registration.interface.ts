export interface Registration {
  id: number;
  seats: number;
  userId: number;
  eventId: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  event?: {
    id: number;
    name: string;
    description?: string;
    date?: string;
    location?: string;
  };
}

export interface InputRegistration {
  seats: number;
  userId: number;
  eventId: number;
}

export interface UpdateRegistration {
  seats?: number;
}
