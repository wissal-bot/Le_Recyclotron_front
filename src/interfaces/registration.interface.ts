export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  registrationDate: Date;
}

export interface InputRegistration {
  userId: string;
  eventId: string;
}

export interface UpdateRegistration {
  userId?: string;
  eventId?: string;
}
