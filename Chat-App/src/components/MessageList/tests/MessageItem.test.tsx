import React from 'react';
import { render } from '@testing-library/react';
import MessageItem from '../MessageItem';
import { Message } from '../../../types/chatTypes';

const mockMessage: Message = {
  nameId: 'testuser',
  text: 'This is a test message',
  timestamp: new Date().toISOString()
};

describe('MessageItem', () => {
  it('renders without crashing', () => {
    render(
      <MessageItem
        message={mockMessage}
        avatarColor="#000000"
        username="testuser"
      />
    );
  });
});
