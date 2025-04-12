import React from 'react';
import { render } from '@testing-library/react';
import MessageList from '../MessageList';
import { Chat } from '../../../types/chatTypes';

const mockChatroom: Chat = {
  roomId: 1,
  messages: [
    { nameId: 'testuser', text: 'Hello', timestamp: new Date().toISOString() },
  ],
};

describe('MessageList', () => {
  // Mock scrollIntoView globally
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('renders without crashing', () => {
    render(<MessageList chatroom={mockChatroom} username="testuser" />);
  });
});
