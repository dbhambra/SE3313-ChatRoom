import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import styles from './MessageInput.module.css';

interface MessageInputProps {
  chatId: number | null | undefined;
  send: any
  handleSendMessage: (message: string)=> void
}


const MessageInput: React.FC<MessageInputProps> = ({ chatId, send, handleSendMessage}) => {
  const [message, setMessage] = useState('');


  const sendToServer = (send: (msg: string) => void, code: number, payload?: string) => {
    const message = payload !== undefined ? `${code};${payload}` : `${code};`;
    send(message);
    console.log('Sent:', message);
  };

  const handleEnter = () => {
    handleSendMessage(message);
    setMessage('');
  }

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
        className={styles.textField}
      />
      <IconButton color="primary" onClick={handleEnter} className={styles.sendButton}>
        <SendIcon />
      </IconButton>
    </div>}
  </>
  );
};

export default MessageInput;
