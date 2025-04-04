import { useEffect, useRef } from 'react';

type OnMessageCallback = (msg: string) => void;

const useWebSocket = (url: string, onMessage: OnMessageCallback) => {
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url) return; // Don't connect if no URL is provided
    
    const ws = new WebSocket(url);
    socket.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Connected');
    };

    ws.onmessage = (event) => {
      onMessage(event.data);
    };

    ws.onerror = (err) => {
      console.error('[WebSocket] Error:', err);
    };

    ws.onclose = () => {
      console.warn('[WebSocket] Disconnected');
    };

    return () => {
      ws.close();
    };
  }, [url, onMessage]);

  const send = (msg: string) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(msg);
    } else {
      console.warn('[WebSocket] Tried to send message but socket not ready:', msg);
    }
  };

  return send;
};

export default useWebSocket;
