import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../Sidebar';
import SidebarItem from '../SidebarItem';
import { Chat } from '../../../types/chatTypes';

// Example chatrooms for our test
const chatrooms: Chat[] = [
  { roomId: 1, messages: [] },
  { roomId: 2, messages: [] },
];

describe('Sidebar', () => {
  it('renders the list of chatrooms', () => {
    render(<Sidebar chatrooms={chatrooms} onSelectChat={() => {}} isRoomFull={{}} />);
    
    // Check if the chatroom names are rendered
    expect(screen.getByText('Room 1')).toBeInTheDocument();
    expect(screen.getByText('Room 2')).toBeInTheDocument();
  });

  it('calls onSelectChat when a room is clicked', () => {
    const onSelectChatMock = jest.fn();
    
    render(<Sidebar chatrooms={chatrooms} onSelectChat={onSelectChatMock} isRoomFull={{}} />);
    
    // Simulate a click on Room 1
    fireEvent.click(screen.getByText('Room 1'));
    
    // Ensure the onSelectChat function is called with the correct room
    expect(onSelectChatMock).toHaveBeenCalledWith(chatrooms[0]);
    expect(onSelectChatMock).toHaveBeenCalledTimes(1);
  });
});
