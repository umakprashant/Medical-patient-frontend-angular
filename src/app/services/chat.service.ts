import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = `${environment.apiUrl}`;

interface Room {
  id: number;
  patientId?: number;
  doctorId?: number;
  doctor?: any;
}

interface Message {
  id: number;
  message: string;
  senderId: number;
  senderRole: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  readAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private http: HttpClient) {}

  getRoom(): Observable<{ room: Room }> {
    return this.http.get<{ room: Room }>(`${API_URL}/chat/room`);
  }

  getMessages(roomId: number): Observable<{ messages: Message[] }> {
    return this.http.get<{ messages: Message[] }>(`${API_URL}/chat/rooms/${roomId}/messages`);
  }

  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${API_URL}/chat/unread-count`);
  }
}
