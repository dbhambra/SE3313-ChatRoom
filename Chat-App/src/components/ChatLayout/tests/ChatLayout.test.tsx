import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatLayout from '../ChatLayout';

// Mock subcomponents to avoid testing their internals here
jest.mock('../../Sidebar/Sidebar.tsx', () => () => <div>Sidebar</div>);
jest.mock('../../ChatHeader/ChatHeader.tsx', () => () => <div>ChatHeader</div>);
jest.mock('../../MessageList/MessageList.tsx', () => () => <div>MessageList</div>);
jest.mock('../../MessageInput/MessageInput.tsx', () => () => <div>MessageInput</div>);
jest.mock('../../UsernameModal/UsernameModal.tsx', () => ({ }) => <div>UsernameModal</div>);

// Mock the WebSocket hook
jest.mock('../../hooks/useWebSocket.tsx', () => () => ({
  send: jest.fn(),
}));

describe('ChatLayout', () => {
  it('renders without crashing', () => {
    render(<ChatLayout />);
  });

  it('shows UsernameModal when username is not set', () => {
    render(<ChatLayout />);
    expect(screen.getByText('UsernameModal')).toBeInTheDocument();
  });

});
