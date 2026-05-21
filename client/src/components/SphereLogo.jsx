import React from 'react';

const SphereLogo = ({ className = "" }) => {
  const R = 180; // Radius slightly smaller than 200 to give room for glow
  const longitudes = [];
  const latitudes = [];

  // Generate longitudes (vertical-like ellipses that meet at the poles)
  for (let i = 0; i < 18; i++) {
    const phi = (i * 10) * (Math.PI / 180);
    const rx = R * Math.cos(phi);
    longitudes.push(
      <ellipse 
        key={`long-${i}`}
        cx="200" cy="200" 
        rx={Math.abs(rx)} ry={R} 
        fill="none" stroke="#00F0FF" strokeWidth="1.5" opacity="0.75" 
      />
    );
  }

  // Generate latitudes (horizontal-like ellipses that are stacked)
  for (let i = -8; i <= 8; i++) {
    const theta = (i * 10) * (Math.PI / 180);
    const cy = 200 + R * Math.sin(theta);
    const rx = R * Math.cos(theta);
    const ry = rx * 0.35; // perspective factor
    latitudes.push(
      <ellipse 
        key={`lat-${i}`}
        cx="200" cy={cy} 
        rx={Math.abs(rx)} ry={Math.abs(ry)} 
        fill="none" stroke="#00F0FF" strokeWidth="1.5" opacity="0.75" 
      />
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer ambient glow */}
      <div className="absolute inset-0 bg-[#00F0FF] opacity-[0.15] blur-[70px] rounded-full pointer-events-none transform scale-90"></div>
      
      <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_0_12px_rgba(0,240,255,0.7)]" style={{ filter: 'drop-shadow(0 0 8px #00F0FF)' }}>
        <defs>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Tilt the sphere by 45 degrees so poles are top-right and bottom-left */}
        <g transform="rotate(45 200 200)">
          {longitudes}
          {latitudes}
          
          {/* Poles glowing points */}
          <circle cx="200" cy={200 - R} r="18" fill="#00F0FF" filter="url(#strongGlow)" opacity="0.9" />
          <circle cx="200" cy={200 + R} r="18" fill="#00F0FF" filter="url(#strongGlow)" opacity="0.9" />
        </g>
      </svg>
    </div>
  );
};

export default SphereLogo;
