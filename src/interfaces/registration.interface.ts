export interface Registration {
  id: number;
  seats: number;
  userId: number;
  eventId: number;
}

export interface InputRegistration {
  seats: number;
  userId: string;
  eventId: string;
}

export interface UpdateRegistration {
  seats?: number;
}
