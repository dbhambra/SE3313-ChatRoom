import React, { useEffect, useState } from 'react';
import { Chat } from '../../types/chatTypes';
import Avatar from '../Avatar/Avatar.tsx';
import styles from './SidebarItem.module.css';
import { ChatStatus, FULL_ROOM } from '../../constants/constants.tsx';
import { Alert } from '@mui/material';


interface SidebarItemProps {
  chatroom: Chat;
  onSelect: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ chatroom, onSelect }) => {
  const chatroomId = chatroom?.roomId
  const status  : string = "0/2";

const [roomFullMessage, setRoomFullMessage] = useState<boolean>(false);


useEffect(() => {
  setRoomFullMessage(false);
}, [status])
  
const onSpaceAvaliable = () => {

  onSelect();
}

const onRoomFull = () => {
  setRoomFullMessage(true);
}

  return (
    <>
    <div className={styles.item} onClick={status !== FULL_ROOM ? onSpaceAvaliable : onRoomFull}>
      <div className={styles.info}>
        <div className={styles.name}>{`Room ${chatroomId}`}</div>
        <div className={status !== FULL_ROOM ? styles.status_open : styles.status_chatting }>{status}</div>
      </div>
    </div>
    {roomFullMessage && <Alert severity='error'>This room is full. Try again later or join a different room</Alert>}
    </>
  );
};

export default SidebarItem;
