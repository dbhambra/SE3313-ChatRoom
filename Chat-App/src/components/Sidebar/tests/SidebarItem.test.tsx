import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarItem from '../SidebarItem';
import { Chat } from '../../../types/chatTypes';
import { Alert } from '@mui/material';

// Example Chat type for our test
const exampleChat: Chat = {
  roomId: 1,
  messages: [],
};

describe('SidebarItem', () => {
  it('renders the chatroom name', () => {
    render(<SidebarItem chatroom={exampleChat} onSelect={() => {}} isRoomFull={false} />);
    
    // Check if the room name is rendered
    expect(screen.getByText('Room 1')).toBeInTheDocument();
  });

  it('displays "Room Full" when isRoomFull is true', () => {
    render(<SidebarItem chatroom={exampleChat} onSelect={() => {}} isRoomFull={true} />);
    
    // Check if "Room Full" text is displayed
    expect(screen.getByText('Room Full')).toBeInTheDocument();
  });

  it('calls onSelect when clicked if the room is not full', () => {
    const onSelectMock = jest.fn();
    
    render(<SidebarItem chatroom={exampleChat} onSelect={onSelectMock} isRoomFull={false} />);
    
    const roomElement = screen.getByText('Room 1');
    
    // Simulate a click on the room
    fireEvent.click(roomElement);
    
    // Ensure the onSelect function is called
    expect(onSelectMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onSelect and shows an alert when room is full', () => {
    const onSelectMock = jest.fn();
    
    render(<SidebarItem chatroom={exampleChat} onSelect={onSelectMock} isRoomFull={true} />);
    
    const roomElement = screen.getByText('Room 1');
    
    // Simulate a click on the room
    fireEvent.click(roomElement);
    
    // Ensure the onSelect function is not called
    expect(onSelectMock).not.toHaveBeenCalled();
    
    // Ensure the alert message for "room full" is displayed
    expect(screen.getByText('This room is full. Try again later or join a different room.')).toBeInTheDocument();
  });
});
