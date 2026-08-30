import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let themeContext: { resolvedTheme: 'dark' | 'light' } | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    themeContext = useTheme();
  } catch {
    themeContext = null;
  }
  const resolvedTheme = themeContext?.resolvedTheme || (typeof document !== 'undefined' && document.documentElement.classList.contains('light') ? 'light' : 'dark');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      speed: number;
      colorType: number;
    }[] = [];
    const numStars = 140;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.4,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.06 + 0.02,
        colorType: Math.floor(Math.random() * 3),
      });
    }

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const isLight = document.documentElement.classList.contains('light');

      if (isLight) {
        // Celestial Dawn / Pearl Daylight Gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#f8fafc');
        grad.addColorStop(0.5, '#f1f5f9');
        grad.addColorStop(1, '#fefce8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Soft celestial aura glow in upper center
        const radial = ctx.createRadialGradient(width * 0.5, height * 0.2, 10, width * 0.5, height * 0.2, Math.max(width, height) * 0.6);
        radial.addColorStop(0, 'rgba(254, 243, 199, 0.45)');
        radial.addColorStop(0.5, 'rgba(243, 232, 255, 0.25)');
        radial.addColorStop(1, 'rgba(241, 245, 249, 0)');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Cosmic Deep Midnight
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.7, '#090d16');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Cosmic nebula glow
        const radial = ctx.createRadialGradient(width * 0.7, height * 0.3, 10, width * 0.7, height * 0.3, Math.max(width, height) * 0.5);
        radial.addColorStop(0, 'rgba(245, 158, 11, 0.04)');
        radial.addColorStop(0.5, 'rgba(147, 51, 234, 0.03)');
        radial.addColorStop(1, 'transparent');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, width, height);
      }

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

        if (isLight) {
          // Soft golden and lavender astral motes
          if (star.colorType === 0) {
            ctx.fillStyle = `rgba(217, 119, 6, ${star.opacity * 0.35})`;
          } else if (star.colorType === 1) {
            ctx.fillStyle = `rgba(147, 51, 234, ${star.opacity * 0.3})`;
          } else {
            ctx.fillStyle = `rgba(100, 116, 139, ${star.opacity * 0.25})`;
          }
        } else {
          // Twinkling white, amber and cyan stars
          if (star.colorType === 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          } else if (star.colorType === 1) {
            ctx.fillStyle = `rgba(251, 191, 36, ${star.opacity * 0.9})`;
          } else {
            ctx.fillStyle = `rgba(192, 132, 252, ${star.opacity * 0.85})`;
          }
        }

        ctx.fill();

        // Twinkle effect
        star.opacity += (Math.random() - 0.5) * 0.04;
        if (star.opacity < 0.15) star.opacity = 0.15;
        if (star.opacity > 1) star.opacity = 1;

        // Gentle floating movement
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme]);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 transition-opacity duration-500 pointer-events-none" />;
};

export default StarBackground;
