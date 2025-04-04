import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import styles from './MessageInput.module.css';
import useWebSocket from '../hooks/useWebSocket.tsx';

interface MessageInputProps {
  chatId: number | null | undefined;
  send: any
}


const MessageInput: React.FC<MessageInputProps> = ({ chatId, send}) => {
  const [message, setMessage] = useState('');

  const handleServerMessage = (msg: { type: string; payload: string }) => {
    const {type, payload} = msg;
    switch (type) {
      case '1':
        console.log('[Server] Message received:', payload);
        break;
      case '2':
        console.log('[Server] Successfully joined room:', payload);
        break;
      case '3':
        alert('[Server] Room full.');
        break;
      case '4':
        console.log('[Server] Room status:', payload === '0' ? 'Full' : 'Available');
        break;
      case '5':
        console.log('[Server] Successfully left room');
        break;
      case '6':
        console.log('[Server] Someone left the room:', payload);
        break;
      case '9':
        console.log('[Server] Incoming request from client:', payload);
        break;
      case '10':
        console.log('[Server] Waiting for other client to accept:', payload);
        break;
      default:
        console.log('[Server] Unknown type:', payload);
    }
  };

  const sendToServer = (send: (msg: string) => void, code: number, payload?: string) => {
    const message = payload !== undefined ? `${code};${payload}` : `${code};`;
    send(message);
    console.log('Sent:', message);
  };

  const handleSend = () => {
    if (message.trim()) {
      setTimeout(() => {
        sendToServer(send, 1, message);
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
  <>
    {chatId != undefined && <div className={styles.inputContainer}>
      <TextField
        variant="outlined"
        placeholder="Type a message..."
        fullWidth
        multiline
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        className={styles.textField}
      />
      <IconButton color="primary" onClick={handleSend} className={styles.sendButton}>
        <SendIcon />
      </IconButton>
    </div>}
  </>
  );
};

export default MessageInput;
