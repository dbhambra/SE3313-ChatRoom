import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import styles from './MessageInput.module.css';

interface MessageInputProps {
  chatId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ chatId }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      // Here you would typically send the message via your API
      console.log(`Sending message to chat ${chatId}: ${message}`);
      setMessage('');
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
