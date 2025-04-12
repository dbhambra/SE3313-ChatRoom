import React from 'react';
import SidebarItem from './SidebarItem.tsx';
import { Chat } from '../../types/chatTypes';
import styles from './Sidebar.module.css';

interface SidebarProps {
  chatrooms: Chat[];
  onSelectChat: (chatroom: Chat) => void;
  isRoomFull: { [key: number]: boolean }; // key = roomId
}


const Sidebar: React.FC<SidebarProps> = ({ chatrooms, onSelectChat, isRoomFull }) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>ChatRooms</div>
      <div className={styles.chatList}>
        {chatrooms.map((chatroom) => (
          <SidebarItem
            key={chatroom.roomId}
            chatroom={chatroom}
            onSelect={() => onSelectChat(chatroom)}
            isRoomFull={isRoomFull[chatroom.roomId] || false}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
