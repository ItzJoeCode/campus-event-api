export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  organizer: User | string;
  totalTickets: number;
  price: number;
  category: string;
  status: string;
  availableTickets: number;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  _id: string;
  event: Event | string;
  user: string;
  price: number;
  status: 'pending' | 'confirmed' | 'expired' | 'used';
  paymentMethod: string;
  checkedIn: boolean;
  ticketNumber: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
}