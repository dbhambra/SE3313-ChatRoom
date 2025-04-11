import React from "react";

interface AvatarProps {
  username: string;
  bgColor: string;
}

const Avatar: React.FC<AvatarProps> = ({ username, bgColor }) => {

    const initial = username ? username[0].toUpperCase() : "?";

    const darkenColor = (hex: string, amount = 30): string => {
      let r = parseInt(hex.slice(1, 3), 16) - amount;
      let g = parseInt(hex.slice(3, 5), 16) - amount;
      let b = parseInt(hex.slice(5, 7), 16) - amount;
    
      r = r < 0 ? 0 : r;
      g = g < 0 ? 0 : g;
      b = b < 0 ? 0 : b;
    
      return `rgb(${r}, ${g}, ${b})`;
    };

    
    const textColor = darkenColor(bgColor);

  return (
    <div
      style={{
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: textColor,
        fontSize: "24px",
        fontWeight: "bold",
      }}
    >
      {initial}
    </div>
  );
};

export default Avatar;
