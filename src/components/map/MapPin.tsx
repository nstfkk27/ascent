'use client';

interface MapPinProps {
  label: string;
  color: string;
  isHovered: boolean;
  tooltipText?: string;
  showDot?: boolean;
  // Future props for customization
  variant?: 'default' | 'gold' | 'highlighted';
  badge?: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function MapPin({
  label,
  color,
  isHovered,
  tooltipText,
  showDot = false,
  variant = 'default',
  badge,
  onMouseEnter,
  onMouseLeave,
}: MapPinProps) {
  // Determine colors based on variant (for future use)
  const getVariantStyles = () => {
    switch (variant) {
      case 'gold':
        return {
          bgColor: '#d4af37',
          hoverBgColor: '#b8960c',
          borderColor: '#ffd700',
        };
      case 'highlighted':
        return {
          bgColor: '#ef4444',
          hoverBgColor: '#dc2626',
          borderColor: '#fca5a5',
        };
      default:
        return {
          bgColor: color,
          hoverBgColor: '#1f2937',
          borderColor: 'white',
        };
    }
  };

  const styles = getVariantStyles();
  const currentBgColor = isHovered ? styles.hoverBgColor : styles.bgColor;

  // If showDot is true, render simple dot instead of label
  if (showDot) {
    return (
      <div
        className="relative cursor-pointer"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div
          className={`
            w-3 h-3 rounded-full border-2 border-white shadow-lg
            transition-all duration-200
            ${isHovered ? 'scale-150 shadow-xl' : ''}
          `}
          style={{
            backgroundColor: currentBgColor,
          }}
        />
        {/* Hover tooltip */}
        {isHovered && tooltipText && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap shadow-lg z-50">
            {tooltipText}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative cursor-pointer group"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Badge (for future use) */}
      {badge && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 shadow">
          {badge}
        </div>
      )}

      {/* Pin Tag */}
      <div
        className={`
          px-2.5 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap
          shadow-lg border-2
          transition-all duration-200 ease-out
          ${isHovered ? 'scale-110 -translate-y-1 shadow-xl' : ''}
        `}
        style={{
          backgroundColor: currentBgColor,
          borderColor: styles.borderColor,
          color: 'white',
        }}
      >
        {label}
      </div>

      {/* Arrow/Pointer */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `8px solid ${currentBgColor}`,
        }}
      />

      {/* Hover tooltip */}
      {isHovered && tooltipText && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap shadow-lg">
          {tooltipText}
        </div>
      )}
    </div>
  );
}
