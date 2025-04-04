import React, { useState, useEffect } from "react";

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const darkenColor = (hex, amount = 30) => {
  let r = parseInt(hex.slice(1, 3), 16) - amount;
  let g = parseInt(hex.slice(3, 5), 16) - amount;
  let b = parseInt(hex.slice(5, 7), 16) - amount;

  r = r < 0 ? 0 : r;
  g = g < 0 ? 0 : g;
  b = b < 0 ? 0 : b;

  return `rgb(${r}, ${g}, ${b})`;
};

const Avatar = ({ username }) => {
  const [bgColor, setBgColor] = useState("");
  
  useEffect(() => {
    setBgColor(getRandomColor());
  }, []);

  const textColor = darkenColor(bgColor);
  const initial = username ? username[0].toUpperCase() : "?";

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
