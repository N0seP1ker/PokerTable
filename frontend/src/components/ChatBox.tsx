import React, { useState, useRef, useEffect } from 'react';
import './ChatBox.css';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isMinimized?: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, isMinimized = false }) => {
  const [input, setInput] = useState('');
  const [minimized, setMinimized] = useState(isMinimized);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-box ${minimized ? 'minimized' : ''}`}>
      <div className="chat-header" onClick={() => setMinimized(!minimized)}>
        <div className="chat-title">
          <span className="chat-icon">💬</span>
          <span>Chat</span>
        </div>
        <button className="minimize-btn">
          {minimized ? '▲' : '▼'}
        </button>
      </div>

      {!minimized && (
        <>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <p>It's a bit quiet here.</p>
                <p>Click on the balloon and send a Message!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.isSystem ? 'system' : ''}`}
                >
                  <div className="message-header">
                    <span className="message-sender">{message.sender}</span>
                    <span className="message-time">{formatTime(message.timestamp)}</span>
                  </div>
                  <div className="message-text">{message.text}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chat-input"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={200}
            />
            <button type="submit" className="send-btn" disabled={!input.trim()}>
              ➤
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatBox;