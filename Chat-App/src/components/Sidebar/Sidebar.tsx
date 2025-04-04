import React from 'react';
import SidebarItem from './SidebarItem.tsx';
import { Chat } from '../../types/chatTypes';
import styles from './Sidebar.module.css';

interface SidebarProps {
  chatrooms: Chat[];
  onSelectChat: (chatrooms: Chat) => void;
}

const Sidebar: React.FC<SidebarProps> = ({chatrooms, onSelectChat }) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>ChatRooms</div>
      <div className={styles.chatList}>
        {chatrooms.map((chatroom) => (
          <SidebarItem key={chatroom.roomId} chatroom={chatroom} onSelect={() => onSelectChat(chatroom)} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
