"use client";

import React, { useEffect, useState } from "react";

export function ScrollThread() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(1, Math.max(0, window.scrollY / totalHeight));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-y-0 start-3 sm:start-6 md:start-8 z-20 hidden sm:flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity"
      aria-hidden="true"
    >
      {/* Starting needle eye / bead */}
      <div className="w-3.5 h-3.5 rounded-full border-2 border-[#C8692F] bg-[#FAF7F2] shadow-xs flex items-center justify-center mt-28">
        <div className="w-1.5 h-1.5 rounded-full bg-[#C8692F]" />
      </div>

      {/* Vertical woven thread track */}
      <div className="w-0.5 flex-1 relative bg-gradient-to-b from-[#E0D3C1] via-[#E8DED1] to-[#E0D3C1] my-2">
        {/* Animated active progress thread */}
        <div
          className="absolute top-0 start-0 w-full bg-gradient-to-b from-[#C8692F] via-[#DF8448] to-[#B8862B] transition-all duration-150 ease-out"
          style={{ height: `${scrollProgress * 100}%` }}
        >
          {/* Subtle glowing thread tip / needle stitch */}
          <div className="absolute -bottom-1.5 -start-1 w-2.5 h-2.5 rounded-full bg-[#C8692F] shadow-sm ring-2 ring-[#FAF7F2]" />
        </div>
      </div>

      {/* Decorative ending tassel knot */}
      <div className="w-3 h-3 rounded-full border border-[#B8862B] bg-[#FAF7F2] mb-12 flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-[#B8862B]" />
      </div>
    </div>
  );
}
