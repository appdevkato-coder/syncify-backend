"use client";

import { useEffect, useState, useRef } from "react";

export default function CursorGradient() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState('default');
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      const target = e.target as HTMLElement;
      if (target) {
        const computedCursor = window.getComputedStyle(target).cursor;
        setCursorType(computedCursor);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  const isPointer = cursorType === 'pointer';
  const isHelp = cursorType === 'help';
  const isNotAllowed = cursorType === 'not-allowed';

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[99999] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(0, 255, 65, 0.05), transparent 80%)`,
      }}
    >
      {/* Outer Glow Trail */}
      <div
        className="absolute rounded-full mix-blend-screen pointer-events-none blur-xl"
        style={{
          left: position.x - 40,
          top: position.y - 40,
          width: 80,
          height: 80,
          background: isNotAllowed ? "rgba(255, 0, 0, 0.15)" : "rgba(0, 255, 65, 0.15)",
          transform: `scale(${isPointer || isHelp ? 2 : 1})`,
          transition: "transform 0.4s ease-out, left 0.1s linear, top 0.1s linear",
        }}
      />

      {/* Main Pointer Container */}
      <div
        className="absolute flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.8 : 1})`,
        }}
      >
        {/* Ring */}
        <div
          className={`absolute rounded-full border transition-all duration-300 ease-out ${
            isNotAllowed ? 'border-rose-500 shadow-[0_0_10px_#f43f5e]' : 'border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.5)]'
          }`}
          style={{
            width: isPointer || isHelp ? 40 : 20,
            height: isPointer || isHelp ? 40 : 20,
            opacity: isVisible ? 1 : 0,
          }}
        />

        {/* Center Dot */}
        <div
          className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
            isNotAllowed ? 'bg-rose-500 shadow-[0_0_5px_#f43f5e]' : 'bg-[#00ff41] shadow-[0_0_10px_#00ff41]'
          }`}
        />

        {/* Status Indicators */}
        {isHelp && (
          <div className="absolute -top-6 -right-6 text-[#00ff41] text-[10px] font-bold animate-bounce">
            ?
          </div>
        )}
        {isNotAllowed && (
          <div className="absolute h-4 w-0.5 bg-rose-500 rotate-45 shadow-[0_0_5px_#f43f5e]" />
        )}
      </div>

      {/* Coordinates (tiny terminal aesthetic) */}
      <div 
        className="absolute text-[8px] text-[#00ff41]/40 font-mono tracking-tighter"
        style={{
          left: position.x + 20,
          top: position.y + 20,
        }}
      >
        {Math.round(position.x)},{Math.round(position.y)}
      </div>
    </div>
  );
}
