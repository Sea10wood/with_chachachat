export const ALLOWED_ORIGIN = 'http://localhost:3000';

export type MessageType = 'COUNTER_UPDATE' | 'CHAT_NAVIGATION' | 'UPDATE_HEIGHT';

export interface BaseMessage {
  type: MessageType;
}

export interface CounterUpdateMessage extends BaseMessage {
  type: 'COUNTER_UPDATE';
  value: number;
}

export interface ChatNavigationMessage extends BaseMessage {
  type: 'CHAT_NAVIGATION';
  message: string;
}

export interface HeightUpdateMessage extends BaseMessage {
  type: 'UPDATE_HEIGHT';
  height: number;
}

export type Message = CounterUpdateMessage | ChatNavigationMessage | HeightUpdateMessage;

export const sendMessage = (message: Message) => {
  if (window.parent !== window) {
    window.parent.postMessage(message, ALLOWED_ORIGIN);
  }
}; 