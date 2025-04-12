import { useEffect, useRef, useState } from 'react';

type ParsedMessage = {
  type: string;
  payload: string;
};


const useWebSocket = (url: string | null, onMessage?: (msg: ParsedMessage) => void ) => {
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    socket.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Connected to', url);
    };

    ws.onmessage = (event) => {
      const raw = event.data as string;
      const [type, payload] = raw.split(';');
      const message = { type, payload };

      //console.log('[WebSocket] Received:', message);
      onMessage?.(message);
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
  }, [url]);

  const send = (msg: string) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(msg);
    } else {
      console.warn('[WebSocket] Tried to send message but socket not open:', msg);
    }
  };

  return { send };
};

export default useWebSocket;
