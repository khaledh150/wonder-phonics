import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

// --- ANIMATION HOOK ---
const useSpring = (trigger, type = 'bounce') => {
  const [style, setStyle] = useState({});
  useEffect(() => {
    if (!trigger) return;
    let frames = [];
    if (type === 'bounce') {
      frames = [{ transform: 'scale(1)' }, { transform: 'scale(1.15) translateY(-10px)' }, { transform: 'scale(0.95) translateY(5px)' }, { transform: 'scale(1)' }];
    } else if (type === 'shake') {
      frames = [{ transform: 'translateX(0)' }, { transform: 'translateX(-5px) rotate(-5deg)' }, { transform: 'translateX(5px) rotate(5deg)' }, { transform: 'translateX(0)' }];
    }
    
    const duration = 600;
    const startTime = performance.now();
    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const frameIndex = Math.floor(progress * (frames.length - 1));
      setStyle(frames[frameIndex] || frames[frames.length - 1]);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [trigger, type]);
  return style;
};

// --- HEROES ---
export const SuperHero = ({ heroId, emotion = 'idle', className }) => {
  const [t, setT] = useState(0);
  useEffect(() => { if(emotion !== 'idle') setT(c=>c+1) }, [emotion]);
  const style = useSpring(t, emotion === 'sad' ? 'shake' : 'bounce');

  const pal = {
    blaze: { skin: '#FFD1AA', suit: '#EF4444', accent: '#F59E0B', hair: '#4A3022', style: 'boy' },
    storm: { skin: '#8D6E63', suit: '#3B82F6', accent: '#60A5FA', hair: '#1F2937', style: 'boy' },
    spark: { skin: '#F3D2C1', suit: '#EC4899', accent: '#A78BFA', hair: '#FCD34D', style: 'girl' },
    terra: { skin: '#E8CCA0', suit: '#10B981', accent: '#34D399', hair: '#B91C1C', style: 'girl' },
    spidey: { skin: '#FFD1AA', suit: '#EF4444', accent: '#2563EB', hair: '#4A3022', style: 'boy' }, 
  }[heroId] || { skin: '#FFD1AA', suit: '#EF4444', accent: '#F59E0B', hair: '#4A3022', style: 'boy' };

  return (
    <div className={`relative ${className} filter drop-shadow-xl z-20`} style={style}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <path d="M20 60 Q10 80 5 95 L95 95 Q90 80 80 60 Z" fill={pal.accent} className="animate-wave origin-top" />
        <path d="M30 60 L70 60 L75 90 L25 90 Z" fill={pal.suit} />
        <circle cx="50" cy="75" r="8" fill="white" fillOpacity="0.9" />
        <path d="M50 71 L53 78 L47 78 Z" fill={pal.accent} />
        <circle cx="50" cy="40" r="28" fill={pal.skin} />
        {pal.style === 'girl' ? (
           <path d="M20 40 Q20 10 50 10 Q80 10 80 40 Q80 50 75 40 Q50 20 25 40 Z" fill={pal.hair} />
        ) : (
           <path d="M22 35 Q30 15 50 15 Q70 15 78 35 Q80 40 78 30 Q50 5 22 30 Z" fill={pal.hair} />
        )}
        <path d="M24 38 Q50 25 76 38 L76 46 Q50 55 24 46 Z" fill={pal.suit} />
        <g fill="white">
          <ellipse cx="40" cy="42" rx="7" ry="8" />
          <ellipse cx="60" cy="42" rx="7" ry="8" />
        </g>
        <g fill="black">
          <circle cx="40" cy="42" r="3.5" />
          <circle cx="60" cy="42" r="3.5" />
        </g>
        <g fill="white" opacity="0.8">
          <circle cx="42" cy="40" r="2" />
          <circle cx="62" cy="40" r="2" />
        </g>
        {emotion === 'happy' && <path d="M42 58 Q50 65 58 58" fill="none" stroke="#5C4033" strokeWidth="2.5" strokeLinecap="round" />}
        {emotion === 'sad' && <path d="M42 62 Q50 55 58 62" fill="none" stroke="#5C4033" strokeWidth="2.5" strokeLinecap="round" />}
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -3; 0 0" dur="3s" repeatCount="indefinite" />
      </svg>
    </div>
  );
};

// --- GAME ASSETS (Added TAP) ---
export const GameAsset = ({ type, className }) => {
  const svgs = {
    pan: (
      <g>
        <circle cx="50" cy="50" r="35" fill="#e2e8f0" opacity="0.2"/>
        <path d="M20 50 L25 80 Q50 90 75 80 L80 50 Z" fill="#475569" />
        <rect x="80" y="52" width="30" height="8" rx="4" fill="#1e293b" />
        <ellipse cx="50" cy="50" rx="30" ry="10" fill="#94a3b8" />
      </g>
    ),
    tin: (
      <g>
        <path d="M30 30 L30 80 Q50 90 70 80 L70 30 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
        <ellipse cx="50" cy="30" rx="20" ry="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
        <rect x="35" y="40" width="30" height="30" fill="#ef4444" rx="2" />
        <path d="M40 55 L60 55" stroke="white" strokeWidth="2" />
      </g>
    ),
    ant: (
      <g>
        <path d="M30 60 Q40 50 50 60 Q60 50 70 60" fill="none" stroke="#7f1d1d" strokeWidth="2" />
        <circle cx="30" cy="60" r="8" fill="#7f1d1d" />
        <ellipse cx="50" cy="60" rx="6" ry="5" fill="#7f1d1d" />
        <ellipse cx="75" cy="60" rx="10" ry="8" fill="#7f1d1d" />
        <path d="M30 65 L25 80 M50 65 L50 80 M75 65 L80 80" stroke="#7f1d1d" strokeWidth="2" />
        <path d="M25 55 L20 45" stroke="#7f1d1d" strokeWidth="1" />
      </g>
    ),
    pin: (
      <g transform="rotate(-45 50 50)">
        <path d="M48 30 L52 30 L51 70 L50 90 L49 70 Z" fill="#94a3b8" />
        <circle cx="50" cy="30" r="10" fill="#ef4444" />
        <circle cx="53" cy="27" r="3" fill="white" opacity="0.5" />
      </g>
    ),
    nap: (
      <g>
         <circle cx="50" cy="60" r="25" fill="#fcd34d" />
         <path d="M40 60 Q50 70 60 60" stroke="#b45309" strokeWidth="2" fill="none" />
         <path d="M35 55 L45 55 M55 55 L65 55" stroke="#b45309" strokeWidth="2" />
         <text x="75" y="40" fontSize="20" fill="#3b82f6" fontWeight="bold">Zzz</text>
      </g>
    ),
    sat: (
      <g>
        <rect x="30" y="60" width="40" height="5" fill="#78350f" />
        <path d="M35 60 L35 85 M65 60 L65 85" stroke="#78350f" strokeWidth="3" />
        <rect x="30" y="40" width="40" height="20" fill="#fcd34d" rx="2" />
        <path d="M30 50 L70 50" stroke="#f59e0b" strokeWidth="1" />
      </g>
    ),
    sip: (
      <g>
         <path d="M35 40 L40 85 Q50 90 60 85 L65 40 Z" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="2" />
         <path d="M50 60 L80 20" stroke="#ec4899" strokeWidth="4" strokeLinecap="round" />
         <ellipse cx="50" cy="40" rx="15" ry="5" fill="#dbeafe" />
      </g>
    ),
    pants: (
      <g>
        <path d="M30 20 L70 20 L75 80 L55 80 L50 40 L45 80 L25 80 Z" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" />
        <path d="M30 20 L70 20" stroke="#93c5fd" strokeWidth="4" />
        <path d="M50 20 L50 40" stroke="#1e40af" strokeWidth="1" />
      </g>
    ),
    pit: (
      <g>
        <rect x="0" y="60" width="100" height="40" fill="#166534" />
        <ellipse cx="50" cy="70" rx="30" ry="10" fill="#3f2c22" />
        <ellipse cx="50" cy="70" rx="20" ry="6" fill="#0f0a0a" />
      </g>
    ),
    sap: (
      <g>
        <rect x="45" y="20" width="10" height="80" fill="#78350f" />
        <path d="M45 40 Q35 50 45 60" fill="#fbbf24" />
        <path d="M55 70 Q65 80 55 90" fill="#fbbf24" />
      </g>
    ),
    tan: (
      <g>
        <rect x="20" y="20" width="60" height="60" fill="#fdba74" rx="5" />
        <circle cx="50" cy="50" r="20" fill="#f97316" opacity="0.5" />
      </g>
    ),
    tap: (
      <g>
        {/* Faucet Body */}
        <path d="M30 60 L30 40 Q30 20 50 20 L70 20 L70 40" stroke="#94a3b8" strokeWidth="8" fill="none" />
        <rect x="25" y="60" width="10" height="10" fill="#64748b" />
        {/* Handle */}
        <path d="M40 20 L40 10 L60 10 L60 20" fill="#475569" />
        {/* Water Drop */}
        <path d="M70 50 Q70 65 70 70 A5 5 0 0 0 80 70 Q80 65 70 50" fill="#3b82f6" />
      </g>
    ),
    default: (
      <g>
        <rect x="20" y="20" width="60" height="60" rx="10" fill="#e2e8f0" />
        <text x="50" y="60" fontSize="40" textAnchor="middle" fill="#94a3b8">?</text>
      </g>
    )
  };

  return (
    <div className={`${className} drop-shadow-lg transform transition-transform hover:scale-110 flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
         {svgs[type] || svgs['default']}
      </svg>
    </div>
  );
};

// --- BACKGROUND ---
export const WorldBackground = () => {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    setParticles(Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      dur: Math.random() * 10 + 10,
      type: Math.random() > 0.6 ? 'cloud' : 'star'
    })));
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-linear-to-b from-indigo-400 via-purple-300 to-pink-200">
      {particles.map(p => (
        <div 
          key={p.id}
          className="absolute opacity-40 animate-float"
          style={{
            left: `${p.x}%`, 
            top: `${p.y}%`,
            transform: `scale(${p.size})`,
            animationDuration: `${p.dur}s`
          }} 
        >
          {p.type === 'star' 
            ? <Star className="text-yellow-100 fill-yellow-100" size={12} /> 
            : <div className="w-12 h-6 bg-white rounded-full blur-md opacity-60" />
          }
        </div>
      ))}
      <div className="absolute bottom-0 w-full h-32 bg-emerald-500 rounded-t-[50%] blur-sm opacity-80"></div>
      <div className="absolute -bottom-12 w-full h-40 bg-emerald-400 rounded-t-[100%]"></div>
    </div>
  );
};