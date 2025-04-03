import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatLayout from './components/ChatLayout/ChatLayout.tsx';
import './index.css';

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ChatLayout />
  </React.StrictMode>
);
