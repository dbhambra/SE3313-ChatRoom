// UsernameModal.tsx
import React, { useState } from 'react';
import './UsernameModal.css';

interface Props {
  onSubmit: (username: string) => void;
  error: boolean;
}

const UsernameModal: React.FC<Props> = ({ onSubmit, error}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Enter Your Username</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Your name"
            required
          />
          <button type="submit">Join Chat</button>
          {error && <p className="error">This username is already taken!</p>}
        </form>
      </div>
    </div>
  );
};

export default UsernameModal;
