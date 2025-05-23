'use client';

import Image from 'next/image';
import { useState } from 'react';
import Button from './atoms/Button/Button';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userAvatar, _setUserAvatar] = useState('/user.webp');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    // ここにAIの応答処理を追加

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-chat-bg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                message.isUser ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={message.isUser ? userAvatar : '/bot.webp'}
                    alt={message.isUser ? 'User' : 'Bot'}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {message.isUser ? 'あなた' : 'AI'}
                </p>
              </div>
              <div
                className={`rounded-lg p-3 ${
                  message.isUser
                    ? 'bg-send-button text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none'
                } shadow-sm transform transition-all duration-200 hover:shadow-md`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-start space-x-2 max-w-[80%]">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src="/bot.webp"
                    alt="Bot"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">AI</p>
              </div>
              <div className="bg-white text-gray-800 rounded-lg rounded-tl-none p-3 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-gray-200 p-4 bg-white">
        <form
          onSubmit={handleSubmit}
          className="flex space-x-4 animate-slide-up"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-send-button/20 transition-all duration-200"
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !input.trim()}
            className={`px-4 py-2 rounded-lg bg-send-button text-white font-medium transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
              (isLoading || !input.trim()) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            送信
          </Button>
        </form>
      </div>
    </div>
  );
}
