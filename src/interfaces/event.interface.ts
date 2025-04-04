import { Registration } from './registration.interface';

export interface Event {
  id: string;
  title: string;
  image: string;
  description: string;
  date: Date;
}

export interface InputEvent {
  title: string;
  image: string;
  description: string;
  date: Date;
}

export interface PartialEvent {
  title?: string;
  image?: string;
  description?: string;
  date?: Date;
}

export interface EventWithRegistration extends Event {
  categories: Registration[];
}
