import { Registration } from './registration.interface';

export interface Event {
  id: string;
  name: string;
  description: string;
  date: Date;
  location: string;
  maxParticipants: number;
  registrations?: Registration[];
}

export interface InputEvent {
  name: string;
  description: string;
  date: Date;
  location: string;
  maxParticipants: number;
}

export interface PartialEvent {
  name?: string;
  description?: string;
  date?: Date;
  location?: string;
  maxParticipants?: number;
}
