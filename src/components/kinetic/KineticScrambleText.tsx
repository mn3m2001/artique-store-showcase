"use client";

import React, { useState, useRef } from "react";

const GLYPHS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~0123456789";

export function KineticScrambleText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [displayText, setDisplayText] = useState(text);
  const isScrambling = useRef(false);

  const handleMouseEnter = () => {
    if (isScrambling.current) return;
    isScrambling.current = true;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " " || char === "#" || index < iteration) {
              return text[index];
            }
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        setDisplayText(text);
        isScrambling.current = false;
      }

      iteration += 1 / 2;
    }, 30);
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      className={`k-tag-scramble ${className}`}
      data-scramble="true"
    >
      {displayText}
    </span>
  );
}
