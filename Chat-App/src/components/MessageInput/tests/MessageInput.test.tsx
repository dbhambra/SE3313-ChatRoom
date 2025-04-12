import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import MessageInput from '../MessageInput';

describe('MessageInput', () => {
  const mockSend = jest.fn();
  const mockHandleSendMessage = jest.fn();

  it('renders without crashing when chatId is defined', () => {
    render(
      <MessageInput
        chatId={1}
        send={mockSend}
        handleSendMessage={mockHandleSendMessage}
      />
    );
  });

  it('does not render anything when chatId is undefined', () => {
    const { container } = render(
      <MessageInput
        chatId={undefined}
        send={mockSend}
        handleSendMessage={mockHandleSendMessage}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('calls handleSendMessage on clicking send button', () => {
    const { getByPlaceholderText, getByRole } = render(
      <MessageInput
        chatId={1}
        send={mockSend}
        handleSendMessage={mockHandleSendMessage}
      />
    );

    const input = getByPlaceholderText('Type a message...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello world' } });

    const button = getByRole('button');
    fireEvent.click(button);

    expect(mockHandleSendMessage).toHaveBeenCalledWith('hello world');
  });
});
