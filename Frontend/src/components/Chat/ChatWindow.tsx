import { useWebSocketEvent } from '@/hooks/useWebSocketEvent';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { ChatMessage } from '@/types/websocket';
import { useState } from 'react';

const ChatWindow = () => {
  const { send } = useWebSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Receiving messages
  useWebSocketEvent('chat:message', (message) => {
    setMessages((prev) => [...prev, message]);
  });

  // Sending messages
  const sendMessage = (content: string) => {
    send({
      type: 'chat:message',
      data: { content, timestamp: new Date().toISOString() },
    });
  };

  return (
    <>
      {messages.map((message) => message.content)}
      <input type="text" onChange={(e) => sendMessage(e.target.value)} />
    </>
  );
};

export default ChatWindow;
