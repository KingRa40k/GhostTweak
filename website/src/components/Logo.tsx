import React from "react";

export default function Logo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="gtBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B0D14" />
          <stop offset="100%" stopColor="#141724" />
        </linearGradient>
        <linearGradient id="gtGhostGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <filter id="gtGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="16" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Rounded Container */}
      <rect width="512" height="512" rx="128" fill="url(#gtBgGrad)" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="8" />

      {/* Glowing Ghost Emblem */}
      <g filter="url(#gtGlow)">
        <path
          d="M 256 96 
             C 170 96, 136 160, 136 240 
             L 136 380 
             L 172 344 
             L 214 380 
             L 256 344 
             L 298 380 
             L 340 344 
             L 376 380 
             L 376 240 
             C 376 160, 342 96, 256 96 Z"
          fill="url(#gtGhostGrad)"
        />

        {/* Cyber Eyes */}
        <ellipse cx="206" cy="220" rx="22" ry="28" fill="#06B6D4" />
        <ellipse cx="306" cy="220" rx="22" ry="28" fill="#06B6D4" />
        <circle cx="212" cy="214" r="8" fill="#FFFFFF" />
        <circle cx="312" cy="214" r="8" fill="#FFFFFF" />

        {/* Speed Lightning Bolt */}
        <path
          d="M 246 270 L 268 270 L 250 306 L 274 306 L 238 348 L 248 316 L 232 316 Z"
          fill="#38BDF8"
        />
      </g>
    </svg>
  );
}
