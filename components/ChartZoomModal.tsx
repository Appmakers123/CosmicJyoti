import React, { useState, useRef, useEffect } from 'react';

interface ChartZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const ChartZoomModal: React.FC<ChartZoomModalProps> = ({ isOpen, onClose, children, title = 'Chart View' }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoom > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(prev => Math.min(prev + 0.25, 3));
      } else if (e.key === '-') {
        e.preventDefault();
        setZoom(prev => Math.max(prev - 0.25, 0.5));
      } else if (e.key === '0') {
        e.preventDefault();
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen && !isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ 
        display: isOpen ? 'flex' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}
    >
      <div 
        className={`relative w-full h-full max-w-7xl max-h-[98vh] sm:max-h-[95vh] flex flex-col bg-gradient-to-br from-slate-900/98 to-slate-950/98 border-2 border-amber-500/40 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '98vh',
          height: '100%'
        }}
      >
        {/* Header with gradient */}
        <div className="flex items-center justify-between p-3 sm:p-5 border-b border-amber-500/20 bg-gradient-to-r from-slate-900/50 to-slate-800/30 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></div>
            <h3 className="text-base sm:text-xl font-serif text-amber-200 font-bold tracking-wide truncate">{title}</h3>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Zoom Controls - Enhanced */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 backdrop-blur-sm rounded-xl p-1.5 border border-amber-500/30 shadow-lg">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="p-2.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-lg"
                title="Zoom Out (-)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              <div className="px-3 py-1.5 bg-slate-900/60 rounded-lg border border-amber-500/20">
                <span className="text-sm text-amber-300 font-mono font-bold min-w-[70px] inline-block text-center">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-2.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-lg"
                title="Zoom In (+)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
              <div className="w-px h-6 bg-slate-700 mx-1"></div>
              <button
                onClick={handleReset}
                className="p-2.5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all rounded-lg"
                title="Reset Zoom (0)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            {/* Mobile zoom controls */}
            <div className="sm:hidden flex items-center gap-1 bg-slate-800/80 backdrop-blur-sm rounded-lg p-1 border border-amber-500/30">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="p-1.5 text-amber-400 disabled:opacity-30"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              <span className="text-xs text-amber-300 font-mono px-2">{Math.round(zoom * 100)}%</span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-1.5 text-amber-400 disabled:opacity-30"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 text-slate-400 hover:text-white hover:bg-red-500/20 transition-all rounded-lg border border-transparent hover:border-red-500/30 flex-shrink-0"
              title="Close (ESC)"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chart Container */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-hidden relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          style={{ 
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            touchAction: 'none',
            flex: '1 1 auto',
            minHeight: 0
          }}
        >
          {/* Grid pattern background */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(245, 158, 11, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
          
          <div
            ref={contentRef}
            className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transformOrigin: 'center center'
            }}
          >
            <div className="max-w-full max-h-full drop-shadow-2xl">
              {children}
            </div>
          </div>
        </div>

        {/* Enhanced Instructions Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/95 to-transparent pointer-events-none">
          <div className="flex items-center justify-center gap-6 text-xs">
            {zoom > 1 && (
              <div className="bg-slate-900/90 backdrop-blur-sm border border-amber-500/30 rounded-xl px-4 py-2.5 text-slate-300 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-amber-300 font-semibold">Drag to pan</span>
                  </div>
                  <div className="w-px h-4 bg-slate-700"></div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span className="text-amber-300 font-semibold">Scroll to zoom</span>
                  </div>
                  <div className="w-px h-4 bg-slate-700"></div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-amber-300 font-semibold">ESC to close</span>
                  </div>
                </div>
              </div>
            )}
            {zoom === 1 && (
              <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-lg px-3 py-1.5 text-slate-400">
                <span>Scroll or use controls to zoom</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartZoomModal;

