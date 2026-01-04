import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

interface Message {
  id: number;
  message: string;
  senderId: number;
  senderRole: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  readAt?: string;
  roomId?: number;
}

interface Room {
  id: number;
  patientId?: number;
  doctorId?: number;
  doctor?: any;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  room: Room | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  socket: Socket | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  isTyping: boolean = false;
  otherUserTyping: boolean = false;
  otherUserOnline: boolean = false;
  unreadCount: number = 0;
  typingTimeout: any = null;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRoom();
    this.loadUnreadCount();
    this.initializeSocket();
    
    // Poll for unread count every 30 seconds
    setInterval(() => {
      this.loadUnreadCount();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  initializeSocket(): void {
    const token = this.authService.getToken();
    if (!token) return;

    const socketUrl = environment.production ? window.location.origin : 'http://localhost:3000';
    this.socket = io(socketUrl, {
      auth: { token }
    });

    this.socket.on('authenticated', () => {
      console.log('Socket authenticated');
      if (this.room) {
        this.socket?.emit('join_room', { roomId: this.room.id });
      }
    });

    this.socket.on('joined_room', () => {
      console.log('Joined room');
    });

    this.socket.on('new_message', (message: Message) => {
      this.messages.push(message);
      this.scrollToBottom();
      this.loadUnreadCount();
    });

    this.socket.on('user_typing', (data: { userId: number; isTyping: boolean }) => {
      if (data.userId !== this.authService.getCurrentUser()?.id) {
        this.otherUserTyping = data.isTyping;
      }
    });

    this.socket.on('user_online', (data: { userId: number; isOnline: boolean }) => {
      if (data.userId !== this.authService.getCurrentUser()?.id) {
        this.otherUserOnline = data.isOnline;
      }
    });

    this.socket.on('messages_read', () => {
      // Update read status of messages
      this.messages.forEach(msg => {
        if (msg.senderId === this.authService.getCurrentUser()?.id) {
          msg.readAt = new Date().toISOString();
        }
      });
    });

    this.socket.on('error', (error: any) => {
      this.errorMessage = error.message || 'Socket error occurred';
    });
  }

  loadRoom(): void {
    this.isLoading = true;
    this.chatService.getRoom().subscribe({
      next: (response) => {
        this.room = response.room;
        this.isLoading = false;
        if (this.room && this.room.id) {
          this.loadMessages(this.room.id);
          if (this.socket) {
            this.socket.emit('join_room', { roomId: this.room.id });
          }
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load chat room';
        this.isLoading = false;
      }
    });
  }

  loadMessages(roomId: number): void {
    this.chatService.getMessages(roomId).subscribe({
      next: (response) => {
        this.messages = response.messages;
        this.scrollToBottom();
        // Mark messages as read
        if (this.socket) {
          this.socket.emit('mark_read', { roomId });
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load messages';
      }
    });
  }

  loadUnreadCount(): void {
    this.chatService.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadCount = response.unreadCount;
      },
      error: (error) => {
        console.error('Error loading unread count:', error);
      }
    });
  }

  sendMessage(): void {
    if (!this.room || !this.newMessage.trim() || !this.socket) return;

    this.socket.emit('send_message', {
      roomId: this.room.id,
      message: this.newMessage.trim()
    });

    this.newMessage = '';
    this.stopTyping();
  }

  onTyping(): void {
    if (!this.room || !this.socket) return;

    if (!this.isTyping) {
      this.isTyping = true;
      this.socket.emit('typing_start', { roomId: this.room.id });
    }

    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Set timeout to stop typing indicator
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 1000);
  }

  stopTyping(): void {
    if (this.isTyping && this.room && this.socket) {
      this.isTyping = false;
      this.socket.emit('typing_stop', { roomId: this.room.id });
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  }

  isMyMessage(message: Message): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser && message.senderId === currentUser.id;
  }

  getOtherUserName(): string {
    if (!this.room) return '';
    if (this.authService.getCurrentUser()?.role === 'patient' && this.room.doctor) {
      return `Dr. ${this.room.doctor.first_name} ${this.room.doctor.last_name}`;
    }
    return 'Patient';
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }
}
