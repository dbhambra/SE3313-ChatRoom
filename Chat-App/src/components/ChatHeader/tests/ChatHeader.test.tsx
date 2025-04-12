import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatHeader from '../ChatHeader';
import { Chat } from '../../../types/chatTypes';

const mockChatroom: Chat = {
  roomId: 1,
  messages: [
    {
      nameId: 'user1',
      text: 'Hello!',
      timestamp: new Date().toISOString(),
    },
  ],
};

describe('ChatHeader', () => {
  it('renders without crashing when chatroom is provided', () => {
    render(<ChatHeader chatroom={mockChatroom} />);
    expect(screen.getByText('Room 1')).toBeInTheDocument();
  });

  it('renders nothing when chatroom is null', () => {
    render(<ChatHeader chatroom={null} />);
    expect(screen.queryByText(/Room/)).toBeNull();
  });
});
