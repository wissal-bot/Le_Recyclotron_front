export interface Registration {
  id: number;
  seats: number;
  userId: number;
  eventId: number;
}

export interface InputRegistration {
  seats: number;
  userId: number;
  eventId: number;
}

export interface UpdateRegistration {
  seats?: number;
}
