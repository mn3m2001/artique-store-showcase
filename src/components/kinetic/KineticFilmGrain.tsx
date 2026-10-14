"use client";

import React, { useEffect, useRef } from "react";

export function KineticFilmGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 160;
    const height = 160;
    canvas.width = width;
    canvas.height = height;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    let animId: number;
    let lastFrame = 0;

    const renderNoise = (timestamp: number) => {
      // Throttle to ~15 fps to preserve CPU/battery while maintaining analog grain feel
      if (timestamp - lastFrame > 66) {
        lastFrame = timestamp;
        const len = data.length;
        for (let i = 0; i < len; i += 4) {
          const val = (Math.random() * 255) | 0;
          data[i] = val;     // R
          data[i + 1] = val; // G
          data[i + 2] = val; // B
          data[i + 3] = 28;  // A subtle alpha
        }
        ctx.putImageData(imgData, 0, 0);
      }
      animId = requestAnimationFrame(renderNoise);
    };

    animId = requestAnimationFrame(renderNoise);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="kinetic-grain-canvas"
      aria-hidden="true"
    />
  );
}
