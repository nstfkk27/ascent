'use client';

interface ClusterMarkerProps {
  pointCount: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function ClusterMarker({
  pointCount,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: ClusterMarkerProps) {
  const size = pointCount < 10 ? 40 : pointCount < 50 ? 50 : pointCount < 100 ? 60 : 70;
  const fontSize = pointCount < 10 ? 'text-sm' : pointCount < 100 ? 'text-base' : 'text-lg';

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={`
          rounded-full flex items-center justify-center font-bold
          bg-[#496f5d] text-white border-4 border-white
          shadow-lg transition-all duration-200
          ${isHovered ? 'scale-110 shadow-xl' : ''}
        `}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        <span className={fontSize}>{pointCount}</span>
      </div>
      
      {/* Pulse effect for clusters */}
      <div
        className="absolute inset-0 rounded-full bg-[#496f5d] opacity-20 animate-ping"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      />
    </div>
  );
}
