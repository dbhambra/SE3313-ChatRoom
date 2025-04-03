import React from 'react';
import MuiAvatar from '@mui/material/Avatar';

interface AvatarProps {
  imageUrl?: string;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ imageUrl, size = 40 }) => {
  return (
    <MuiAvatar
      alt="User Avatar"
      src={imageUrl}
      style={{ width: size, height: size }}
    />
  );
};

export default Avatar;
