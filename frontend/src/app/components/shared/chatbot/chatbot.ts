import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatbotService, ChatbotResponse } from '../../../services/chatbot.service';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: string;
  options?: string[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-container">
      <!-- Chat Button -->
      <div class="chat-button" (click)="toggleChat()">
        <span>💬</span>
        <div class="notification-dot" *ngIf="hasUnreadMessages && !isOpen"></div>
      </div>

      <!-- Chat Window -->
      <div class="chat-window" [class.open]="isOpen">
        <div class="chat-header">
          <div class="header-info">
            <h3>College Help Bot</h3>
            <span class="status">Online</span>
          </div>
          <button class="close-btn" (click)="toggleChat()">×</button>
        </div>
        
        <div class="chat-messages" #chatMessages>
          <div *ngFor="let message of messages" 
               class="message" 
               [class.user-message]="message.isUser" 
               [class.bot-message]="!message.isUser">
            <div class="message-content">
              <p>{{ message.text }}</p>
              <span class="timestamp">{{ message.timestamp }}</span>
            </div>
            
            <!-- Bot message options -->
            <div class="message-options" *ngIf="message.options && message.options.length > 0">
              <button *ngFor="let option of message.options" 
                      class="option-btn"
                      (click)="selectOption(option)">
                {{ option }}
              </button>
            </div>
          </div>

          <!-- Typing indicator -->
          <div class="typing-indicator" *ngIf="isTyping">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-text">College Bot is typing...</span>
          </div>
        </div>
        
        <div class="chat-input">
          <input type="text" 
                 [(ngModel)]="userInput" 
                 (keyup.enter)="sendMessage()"
                 placeholder="Type your message here..."
                 [disabled]="isTyping">
          <button class="send-btn" 
                  (click)="sendMessage()" 
                  [disabled]="!userInput.trim() || isTyping">
            {{ isTyping ? '...' : 'Send' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    .chat-button {
      width: 60px;
      height: 60px;
      background: #667eea;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
      position: relative;
    }

    .chat-button:hover {
      transform: scale(1.1);
      background: #5a6fd8;
    }

    .chat-button span {
      font-size: 24px;
    }

    .notification-dot {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 12px;
      height: 12px;
      background: #ff4757;
      border-radius: 50%;
      border: 2px solid white;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .chat-window {
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 380px;
      height: 500px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }

    .chat-window.open {
      display: flex;
    }

    .chat-header {
      background: #667eea;
      color: white;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-info h3 {
      margin: 0;
      font-size: 1.1rem;
    }

    .status {
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s ease;
    }

    .close-btn:hover {
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
    }

    .chat-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: #f8f9fa;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .message {
      max-width: 85%;
      animation: fadeIn 0.3s ease;
    }

    .user-message {
      align-self: flex-end;
    }

    .bot-message {
      align-self: flex-start;
    }

    .message-content {
      padding: 12px 16px;
      border-radius: 18px;
      position: relative;
    }

    .user-message .message-content {
      background: #667eea;
      color: white;
      border-bottom-right-radius: 5px;
    }

    .bot-message .message-content {
      background: white;
      color: #333;
      border-bottom-left-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .message-content p {
      margin: 0 0 5px 0;
      word-wrap: break-word;
      line-height: 1.4;
    }

    .timestamp {
      font-size: 0.7rem;
      opacity: 0.7;
    }

    .user-message .timestamp {
      color: rgba(255,255,255,0.8);
    }

    .bot-message .timestamp {
      color: #666;
    }

    .message-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .option-btn {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      border: 1px solid #667eea;
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .option-btn:hover {
      background: #667eea;
      color: white;
    }

    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: white;
      border-radius: 18px;
      border-bottom-left-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      align-self: flex-start;
      max-width: 200px;
    }

    .typing-dots {
      display: flex;
      gap: 3px;
    }

    .typing-dots span {
      width: 6px;
      height: 6px;
      background: #667eea;
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out;
    }

    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes typing {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    .typing-text {
      font-size: 0.8rem;
      color: #666;
    }

    .chat-input {
      padding: 15px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 10px;
      background: white;
    }

    .chat-input input {
      flex: 1;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 25px;
      outline: none;
      font-size: 14px;
      transition: border-color 0.3s ease;
    }

    .chat-input input:focus {
      border-color: #667eea;
    }

    .chat-input input:disabled {
      background: #f8f9fa;
      cursor: not-allowed;
    }

    .send-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.3s ease;
      min-width: 60px;
    }

    .send-btn:hover:not(:disabled) {
      background: #5a6fd8;
    }

    .send-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Scrollbar styling */
    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }

    .chat-messages::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .chat-messages::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .chat-messages::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `]
})
export class ChatbotComponent {
  isOpen = false;
  hasUnreadMessages = false;
  userInput = '';
  isTyping = false;
  
  messages: ChatMessage[] = [
    {
      text: 'Hello! I\'m here to help you with college complaints and queries. How can I assist you today?',
      isUser: false,
      timestamp: this.getCurrentTime(),
      options: ['File a complaint', 'Check complaint status', 'Get guidance']
    }
  ];

  constructor(private chatbotService: ChatbotService) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.hasUnreadMessages = false;
      this.scrollToBottom();
    }
  }

  sendMessage() {
    const message = this.userInput.trim();
    if (!message || this.isTyping) return;

    // Add user message
    this.messages.push({
      text: message,
      isUser: true,
      timestamp: this.getCurrentTime()
    });

    this.userInput = '';
    this.isTyping = true;
    this.scrollToBottom();

    // Send to chatbot service
    this.chatbotService.sendMessage(message).subscribe({
      next: (response: ChatbotResponse) => {
        setTimeout(() => {
          this.messages.push({
            text: response.message,
            isUser: false,
            timestamp: this.getCurrentTime(),
            options: response.options
          });
          this.isTyping = false;
          this.scrollToBottom();
          
          if (!this.isOpen) {
            this.hasUnreadMessages = true;
          }
        }, 1000); // Simulate typing delay
      },
      error: (error) => {
        console.error('Chatbot error:', error);
        setTimeout(() => {
          this.messages.push({
            text: 'Sorry, I\'m having trouble connecting right now. Please try again later or contact support.',
            isUser: false,
            timestamp: this.getCurrentTime(),
            options: ['Try again', 'Get help']
          });
          this.isTyping = false;
          this.scrollToBottom();
        }, 1000);
      }
    });
  }

  selectOption(option: string) {
    this.userInput = option;
    this.sendMessage();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }

  private getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
}