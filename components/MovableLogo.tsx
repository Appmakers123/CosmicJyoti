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
      id="movable-cosmic-logo"
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onTouchStart={(e) => {
          handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 100,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        backgroundColor: '#090d16',
        borderColor: 'rgba(245, 158, 11, 0.55)',
        boxShadow: '0 0 24px rgba(245, 158, 11, 0.35), inset 0 0 12px rgba(15, 23, 42, 0.8)',
      }}
      className="p-2.5 rounded-full border backdrop-blur-md transition-shadow hover:shadow-[0_0_35px_rgba(245,158,11,0.65)] active:scale-95 duration-200 cosmic-brand-logo"
      title="CosmicJyoti - Drag me!"
    >
      <Logo className="w-12 h-12" />
    </div>
  );
};

export default MovableLogo;