import React from 'react'

export default function Logo({ size = 'medium', showText = true, className = '', showGlow = true }) {
  const iconSizes = {
    xs: 'w-8 h-6',
    small: 'w-11 h-8',
    medium: 'w-13 h-9',
    large: 'w-16 h-11',
    xl: 'w-24 h-16'
  }

  const textSizes = {
    xs: 'text-sm',
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
    xl: 'text-2xl'
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* 3D Infinity Metallic Arrow & Coin Emblem */}
      <div className={`relative ${iconSizes[size] || 'w-13 h-9'} group cursor-pointer flex-shrink-0 flex items-center justify-center`}>
        {/* Ambient Neon Glow */}
        {showGlow && (
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-500/30 via-teal-400/25 to-cyan-500/35 opacity-75 blur-md group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
        )}

        {/* Outer Dark Glass Tile */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-b from-[#111827]/95 to-[#0b0f19]/95 border border-slate-700/70 p-1 shadow-xl flex items-center justify-center transition-all duration-300 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.35)]">
          <svg
            viewBox="0 0 160 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
          >
            <defs>
              {/* Emerald Metallic Gradients for Left Loop */}
              <linearGradient id="emeraldDark" x1="15" y1="25" x2="65" y2="85" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="30%" stopColor="#10b981" />
                <stop offset="70%" stopColor="#059669" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>

              <linearGradient id="emeraldHighlight" x1="15" y1="30" x2="65" y2="60" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="45%" stopColor="#34d399" />
                <stop offset="85%" stopColor="#059669" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>

              {/* Cyan / Teal Metallic Gradients for Right Loop */}
              <linearGradient id="cyanLoop" x1="85" y1="80" x2="135" y2="25" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0f766e" />
                <stop offset="25%" stopColor="#0891b2" />
                <stop offset="60%" stopColor="#06b6d4" />
                <stop offset="85%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#67e8f9" />
              </linearGradient>

              {/* Ascending Arrow Stream Gradient */}
              <linearGradient id="arrowBodyGrad" x1="90" y1="75" x2="140" y2="18" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="35%" stopColor="#14b8a6" />
                <stop offset="70%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#a7f3d0" />
              </linearGradient>

              {/* Arrow Gold Trim */}
              <linearGradient id="goldTrimGrad" x1="110" y1="35" x2="148" y2="8" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="30%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              {/* Gold Coin Medallion */}
              <linearGradient id="goldCoinRim" x1="68" y1="38" x2="92" y2="68" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="30%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>

              <radialGradient id="coinCenterDark" cx="80" cy="54" r="12" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3d2612" />
                <stop offset="60%" stopColor="#201306" />
                <stop offset="100%" stopColor="#0f0903" />
              </radialGradient>

              <linearGradient id="dollarSignGrad" x1="75" y1="45" x2="85" y2="63" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>

            {/* Ambient Backlight Aura */}
            <g opacity="0.35">
              <ellipse cx="50" cy="54" rx="26" ry="24" fill="#10b981" filter="blur(8px)" />
              <ellipse cx="106" cy="54" rx="26" ry="24" fill="#06b6d4" filter="blur(8px)" />
              <path d="M100 60 L132 18" stroke="#22d3ee" strokeWidth="14" strokeLinecap="round" filter="blur(6px)" />
            </g>

            {/* === LEFT INFINITY LOOP (Metallic Emerald Green) === */}
            <g>
              {/* Loop Outer Ring */}
              <circle cx="50" cy="54" r="25" stroke="#044e37" strokeWidth="10" fill="none" />
              <circle cx="50" cy="54" r="25" stroke="url(#emeraldDark)" strokeWidth="8.5" fill="none" />

              {/* Upper Spiral Blade Facet */}
              <path
                d="M 50 29 A 25 25 0 0 1 75 54 C 75 42 62 33 50 29 Z"
                fill="url(#emeraldHighlight)"
                opacity="0.95"
              />

              {/* Lower Spiral Blade Facet */}
              <path
                d="M 75 54 A 25 25 0 0 1 50 79 C 55 67 67 62 75 54 Z"
                fill="#065f46"
                opacity="0.9"
              />

              {/* Left Curve Highlight */}
              <path
                d="M 28 54 A 22 22 0 0 1 65 36"
                stroke="#6ee7b7"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.85"
              />

              {/* Inner Cut Rim */}
              <circle cx="50" cy="54" r="19" stroke="#064e3b" strokeWidth="1" fill="none" />
            </g>

            {/* === RIGHT INFINITY LOOP (Metallic Cyan/Teal) === */}
            <g>
              {/* Base Ring */}
              <circle cx="106" cy="54" r="24" stroke="#0e4a56" strokeWidth="10" fill="none" />
              <circle cx="106" cy="54" r="24" stroke="url(#cyanLoop)" strokeWidth="8.5" fill="none" />

              {/* Lower Shading */}
              <path
                d="M 106 78 A 24 24 0 0 0 130 54 C 120 62 112 72 106 78 Z"
                fill="#083344"
                opacity="0.85"
              />

              {/* Inner Cut Rim */}
              <circle cx="106" cy="54" r="18.5" stroke="#083344" strokeWidth="1" fill="none" />
            </g>

            {/* === ASCENDING GROWTH ARROW (Surging to top-right) === */}
            <g>
              {/* Curved Energy Shaft */}
              <path
                d="M 94 67 C 103 62 118 45 127 28"
                stroke="url(#arrowBodyGrad)"
                strokeWidth="11"
                strokeLinecap="round"
                fill="none"
              />
              {/* Shaft Bright Core Line */}
              <path
                d="M 97 65 C 105 60 118 45 125 30"
                stroke="#ecfeff"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.9"
              />

              {/* Golden Outer Beveled Arrowhead */}
              <path
                d="M 112 25 L 140 8 L 138 38 L 128 30 L 120 38 Z"
                fill="url(#goldTrimGrad)"
                stroke="#78350f"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* Arrowhead Teal Metallic Face */}
              <path
                d="M 115 24 L 137 11 L 135 34 L 128 27 L 120 34 Z"
                fill="url(#arrowBodyGrad)"
              />

              {/* Arrow Center Spine Light */}
              <path
                d="M 120 28 L 137 11"
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.95"
              />
            </g>

            {/* === CENTER NEXUS: Golden Coin Medallion ($) === */}
            <g>
              {/* Coin Base Shadow */}
              <circle cx="80" cy="54" r="16" fill="#0b0f19" opacity="0.9" />

              {/* Golden Outer Rim */}
              <circle cx="80" cy="54" r="14.5" fill="url(#goldCoinRim)" stroke="#78350f" strokeWidth="1.2" />

              {/* Coin Inner Bevel Ring with notches */}
              <circle cx="80" cy="54" r="11.5" fill="#452a10" stroke="#fde68a" strokeWidth="0.8" strokeDasharray="2.5 1.5" opacity="0.8" />

              {/* Coin Core Disc */}
              <circle cx="80" cy="54" r="9.5" fill="url(#coinCenterDark)" />

              {/* Dollar Sign ($) */}
              <text
                x="80"
                y="60"
                textAnchor="middle"
                fontSize="14"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                fill="url(#dollarSignGrad)"
                filter="drop-shadow(0px 1px 1px rgba(0,0,0,0.9))"
                className="select-none"
              >
                $
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex items-baseline gap-1">
          <span className={`${textSizes[size] || 'text-lg'} font-black text-white tracking-tight`}>
            Wealth
          </span>
          <span className={`${textSizes[size] || 'text-lg'} font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400`}>
            Flow
          </span>
        </div>
      )}
    </div>
  )
}
