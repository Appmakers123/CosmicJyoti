import React, { useState, useEffect, useRef } from 'react';
import Logo from './Logo';

const MovableLogo: React.FC = () => {
  // Initial position: Bottom right corner
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    offset.current = {
      x: clientX - position.x,
      y: clientY - position.y
    };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (isDragging) {
      setPosition({
        x: clientX - offset.current.x,
        y: clientY - offset.current.y
      });
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Add global event listeners when dragging starts to handle fast movements outside the element
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onUp = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging]);

  // Handle window resize to keep logo on screen (optional simple check)
  useEffect(() => {
      const handleResize = () => {
          setPosition(prev => ({
              x: Math.min(prev.x, window.innerWidth - 60),
              y: Math.min(prev.y, window.innerHeight - 60)
          }));
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onTouchStart={(e) => {
          // Prevent scrolling while dragging logic could be handled here if needed, 
          // but touch-action: none in style usually suffices.
          handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 100, // Very high z-index
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none' // Critical for mobile dragging
      }}
      className="p-2 bg-slate-900/90 rounded-full border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] backdrop-blur-sm transition-shadow hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] active:scale-95 duration-200"
      title="Drag me!"
    >
      <Logo className="w-12 h-12" />
    </div>
  );
};

export default MovableLogo;