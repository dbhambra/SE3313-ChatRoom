// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Chat } from '../../types/chatTypes';
import styles from './SidebarItem.module.css';
import { Alert } from '@mui/material';
import { MdGroups } from "react-icons/md";


interface SidebarItemProps {
  chatroom: Chat;
  onSelect: () => void;
  isRoomFull: boolean;
}


const SidebarItem: React.FC<SidebarItemProps> = ({ chatroom, onSelect, isRoomFull }) => {
  const chatroomId = chatroom?.roomId;
  const statusText = isRoomFull ? "Room Full" : "";

  useEffect(()=>{
    if(statusText === "Room Full"){
      setRoomFullMessage(true);
    }
  },[isRoomFull]);

  const [roomFullMessage, setRoomFullMessage] = useState(false);

  const onRoomClick = () => {
    if (isRoomFull) {
      setRoomFullMessage(true);
    } else {
      onSelect();
    }
  };

  return (
    <>
      <div className={styles.item} onClick={onRoomClick}>
        <MdGroups className={styles.icon} />
        <div className={styles.info}>
          <div className={styles.name}>{`Room ${chatroomId}`}</div>
          <div className={isRoomFull ? styles.status_chatting : styles.status_open}>
            {statusText}
          </div>
        </div>
      </div>
      {roomFullMessage && (
        <Alert severity="error">This room is full. Try again later or join a different room.</Alert>
      )}
    </>
  );
};

export default SidebarItem;
