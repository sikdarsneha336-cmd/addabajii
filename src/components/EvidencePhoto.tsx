import React, { useState } from 'react';

interface EvidencePhotoProps {
  src?: string;
  alt?: string;
  className?: string;
  isBlurred?: boolean;
}

export const EvidencePhoto: React.FC<EvidencePhotoProps> = ({
  src,
  alt = 'Tactical surveillance evidence',
  className = 'w-full h-full object-cover',
  isBlurred = false,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1b082c] via-[#28113c] to-[#3a1350] flex items-center justify-center ${
          isBlurred ? 'filter blur-[2px]' : ''
        }`}
      >
        {/* Tactical Night Vision Grid */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(236,72,153,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(236,72,153,0.3) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Tactical Crosshair Center */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-3 select-none">
          <div className="w-12 h-12 rounded-full border border-pink-400/50 flex items-center justify-center relative bg-purple-900/30">
            <span className="material-symbols-outlined text-pink-400 text-2xl animate-pulse">
              videocam
            </span>
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-pink-400/40" />
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-pink-400/40" />
          </div>
          <span className="text-[11px] font-mono text-purple-200 mt-2 font-semibold tracking-wide">
            EVIDENCE FRAME BUFFER
          </span>
          <span className="text-[10px] font-mono text-pink-400/90 font-medium">
            METRO RECON • ZERO-TRACE SECURED
          </span>
        </div>

        {/* Corner HUD Markers */}
        <div className="absolute top-2 left-2 text-[9px] font-mono text-pink-400/90 flex items-center gap-1 bg-purple-950/70 px-1.5 py-0.5 rounded border border-pink-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
          NIGHT SCAN ACTIVE
        </div>
        <div className="absolute top-2 right-2 text-[9px] font-mono text-purple-300/90 bg-purple-950/70 px-1.5 py-0.5 rounded border border-purple-500/30">
          28.6328° N, 77.2197° E
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${isBlurred ? 'filter blur-[2px]' : ''}`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};
