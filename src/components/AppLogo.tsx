import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'h-8 w-auto', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="AddaBaaji Logo"
    >
      <defs>
        <linearGradient id="addaShieldGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#db2777" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
        <linearGradient id="addaGlowGrad" x1="24" y1="12" x2="24" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fce7f3" />
        </linearGradient>
      </defs>
      {/* Outer Protective Shield */}
      <path
        d="M24 4L7 11V23.5C7 34.2 14.3 43.1 24 45.8C33.7 43.1 41 34.2 41 23.5V11L24 4Z"
        fill="url(#addaShieldGrad)"
      />
      {/* Inner Shield Facet */}
      <path
        d="M24 8L11 14.5V23.5C11 31.8 16.6 38.7 24 40.8C31.4 38.7 37 31.8 37 23.5V14.5L24 8Z"
        fill="#ffffff"
        fillOpacity="0.18"
      />
      {/* Central Vigilance Eye / Beacon */}
      <circle cx="24" cy="24" r="8" fill="url(#addaGlowGrad)" />
      <circle cx="24" cy="24" r="4.5" fill="#9333ea" />
      <circle cx="25.5" cy="22.5" r="1.5" fill="#ffffff" />
      {/* Radiating Signal Arcs */}
      <path
        d="M24 12C17.4 12 12 17.4 12 24"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
      <path
        d="M36 24C36 17.4 30.6 12 24 12"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
