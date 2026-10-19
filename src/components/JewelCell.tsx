import React from 'react';
import { GEM_COLORS } from '../game/colors';

interface JewelCellProps {
  colorId: number | null;
  size?: number; // size in px or tailwind
  isPreview?: boolean;
  isValidPreview?: boolean;
  isClearing?: boolean;
  isRowOrColClearPreview?: boolean;
  className?: string;
  onClick?: () => void;
}

export const JewelCell: React.FC<JewelCellProps> = ({
  colorId,
  size,
  isPreview = false,
  isValidPreview = true,
  isClearing = false,
  isRowOrColClearPreview = false,
  className = '',
  onClick,
}) => {
  const gem = colorId !== null ? GEM_COLORS[colorId] : null;

  // Empty slot on the 8x8 grid
  if (colorId === null && !isPreview) {
    return (
      <div
        onClick={onClick}
        style={size ? { width: size, height: size } : undefined}
        className={`relative aspect-square rounded-[6px] transition-all duration-150 ${
          isRowOrColClearPreview
            ? 'bg-amber-400/20 border border-amber-300/60 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
            : 'bg-[#151d30]/90 border border-[#232e4a]/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] hover:border-[#384873]'
        } ${className}`}
      >
        {isRowOrColClearPreview && (
          <div className="absolute inset-0 rounded-[6px] bg-gradient-to-tr from-amber-400/30 to-yellow-200/40 animate-pulse pointer-events-none" />
        )}
      </div>
    );
  }

  // Ghost / Preview cell during drag or placement
  if (isPreview) {
    const previewGem = colorId !== null ? GEM_COLORS[colorId] : GEM_COLORS[0];
    return (
      <div
        style={size ? { width: size, height: size } : undefined}
        className={`relative aspect-square rounded-[6px] transition-all duration-100 ${
          isValidPreview
            ? 'border-2 border-white/80 shadow-[0_0_14px_rgba(255,255,255,0.7)]'
            : 'border-2 border-rose-500/80 bg-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
        } ${className}`}
      >
        {isValidPreview && (
          <div
            className="absolute inset-0 rounded-[4px] opacity-70"
            style={{
              background: previewGem.bgGradient,
            }}
          />
        )}
      </div>
    );
  }

  // Active Jewel Gem Block
  return (
    <div
      onClick={onClick}
      style={{
        ...(size ? { width: size, height: size } : {}),
        background: gem?.bgGradient,
        boxShadow: isClearing
          ? '0 0 24px rgba(255,255,255,0.9), inset 0 0 10px rgba(255,255,255,0.9)'
          : `0 3px 6px rgba(0,0,0,0.4), inset 0 2px 2px rgba(255,255,255,0.55), inset 0 -2px 3px rgba(0,0,0,0.4), 0 0 8px ${gem?.glow}`,
        borderColor: gem?.border,
      }}
      className={`relative aspect-square rounded-[6px] border border-white/40 transition-transform duration-100 select-none overflow-hidden ${
        isClearing ? 'scale-110 brightness-150 animate-ping' : ''
      } ${className}`}
    >
      {/* 3D Specular Gem Highlights */}
      <div className="absolute inset-x-1 top-0.5 h-[35%] rounded-t-[4px] bg-gradient-to-b from-white/60 via-white/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-white/20 blur-[1px] pointer-events-none" />
      <div className="absolute inset-0 rounded-[5px] ring-1 ring-inset ring-white/25 pointer-events-none" />
    </div>
  );
};
