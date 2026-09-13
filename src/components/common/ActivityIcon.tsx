import React from 'react';
import { ActivityId } from '../../types';

interface ActivityIconProps {
  id: ActivityId;
  size?: number;
  className?: string;
}

export const ActivityIcon: React.FC<ActivityIconProps> = ({ id, size = 64, className = '' }) => {
  switch (id) {
    case 'bubbles':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <defs>
            <radialGradient id="bubGrad1" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#93C5FD" stopOpacity="0.6" />
              <stop offset="85%" stopColor="#60A5FA" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.9" />
            </radialGradient>
            <radialGradient id="bubGrad2" cx="30%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#C4B5FD" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.8" />
            </radialGradient>
          </defs>
          {/* Main Bubble */}
          <circle cx="32" cy="34" r="22" fill="url(#bubGrad1)" stroke="#BFDBFE" strokeWidth="2.5" />
          <ellipse cx="24" cy="24" rx="6" ry="3.5" transform="rotate(-30 24 24)" fill="#FFFFFF" fillOpacity="0.85" />
          <circle cx="38" cy="44" r="2" fill="#FFFFFF" fillOpacity="0.6" />
          {/* Smaller Bubble */}
          <circle cx="48" cy="18" r="10" fill="url(#bubGrad2)" stroke="#DDD6FE" strokeWidth="2" />
          <ellipse cx="44" cy="14" rx="2.5" ry="1.5" transform="rotate(-30 44 14)" fill="#FFFFFF" fillOpacity="0.85" />
          {/* Tiny Bubble */}
          <circle cx="15" cy="46" r="6" fill="url(#bubGrad2)" stroke="#DDD6FE" strokeWidth="1.5" />
        </svg>
      );

    case 'water':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <defs>
            <linearGradient id="watGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>
          </defs>
          {/* Calming Ripple Waves */}
          <path
            d="M8 26C14 22 20 22 26 26C32 30 38 30 44 26C50 22 56 22 62 26"
            stroke="#5EEAD4"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M4 36C10 32 16 32 22 36C28 40 34 40 40 36C46 32 52 32 58 36"
            stroke="url(#watGrad)"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            d="M10 46C16 42 22 42 28 46C34 50 40 50 46 46C52 42 58 42 64 46"
            stroke="#14B8A6"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* Water droplet */}
          <path
            d="M32 8C32 8 23 20 23 23C23 28 27 31 32 31C37 31 41 28 41 23C41 20 32 8 32 8Z"
            fill="#38BDF8"
            stroke="#BAE6FD"
            strokeWidth="2"
          />
          <circle cx="28" cy="22" r="2.5" fill="#FFFFFF" fillOpacity="0.8" />
        </svg>
      );

    case 'magic-touch':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <defs>
            <radialGradient id="magGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="50%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#818CF8" />
            </radialGradient>
          </defs>
          {/* Glowing Magic Wand / Touch Sparkles */}
          {/* Center big star */}
          <path
            d="M32 8L36 24L52 28L36 32L32 48L28 32L12 28L28 24Z"
            fill="url(#magGrad)"
            stroke="#FDF4FF"
            strokeWidth="2"
          />
          {/* Top right mini star */}
          <path
            d="M48 38L50 44L56 46L50 48L48 54L46 48L40 46L46 44Z"
            fill="#FBBF24"
            stroke="#FEF3C7"
            strokeWidth="1.5"
          />
          {/* Bottom left star */}
          <path
            d="M16 12L17.5 17L22 18.5L17.5 20L16 25L14.5 20L10 18.5L14.5 17Z"
            fill="#38BDF8"
            stroke="#E0F2FE"
            strokeWidth="1.5"
          />
          <circle cx="20" cy="42" r="3" fill="#F472B6" />
          <circle cx="44" cy="18" r="2.5" fill="#A78BFA" />
        </svg>
      );

    case 'draw':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <defs>
            <linearGradient id="brushHandle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="brushBristle" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          {/* Palette */}
          <path
            d="M12 36C8 28 14 16 26 14C38 12 50 20 52 32C54 44 42 54 30 52C22 51 22 44 17 44C13 44 13 40 12 36Z"
            fill="#FEF3C7"
            stroke="#FDE68A"
            strokeWidth="2.5"
          />
          {/* Paint dollops */}
          <circle cx="22" cy="22" r="4.5" fill="#EF4444" />
          <circle cx="34" cy="20" r="4.5" fill="#3B82F6" />
          <circle cx="44" cy="28" r="4.5" fill="#10B981" />
          <circle cx="40" cy="40" r="4.5" fill="#F59E0B" />
          {/* Paintbrush dipping */}
          <rect x="22" y="38" width="6" height="14" rx="2" transform="rotate(-40 22 38)" fill="url(#brushHandle)" />
          <path d="M14 47C13 49 14 53 17 52C19 51 20 48 18 45Z" fill="url(#brushBristle)" />
        </svg>
      );

    case 'fireflies':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <defs>
            <radialGradient id="fireflyGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#A3E635" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4ADE80" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Ambient Glow */}
          <circle cx="32" cy="32" r="26" fill="url(#fireflyGlow)" />
          {/* Firefly Body */}
          <ellipse cx="32" cy="36" rx="9" ry="12" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.5" />
          {/* Bioluminescent abdomen */}
          <ellipse cx="32" cy="40" rx="7" ry="6" fill="#FACC15" />
          {/* Head */}
          <circle cx="32" cy="22" r="6" fill="#1E293B" />
          {/* Wings */}
          <ellipse cx="23" cy="28" rx="8" ry="14" transform="rotate(-30 23 28)" fill="#E0F2FE" fillOpacity="0.65" stroke="#BAE6FD" strokeWidth="1.5" />
          <ellipse cx="41" cy="28" rx="8" ry="14" transform="rotate(30 41 28)" fill="#E0F2FE" fillOpacity="0.65" stroke="#BAE6FD" strokeWidth="1.5" />
          {/* Tiny antenna */}
          <path d="M29 18C27 14 24 13 22 14" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M35 18C37 14 40 13 42 14" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'floating':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <defs>
            <linearGradient id="featherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="50%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#FDA4AF" />
            </linearGradient>
          </defs>
          {/* Balloon in back */}
          <circle cx="44" cy="22" r="13" fill="#93C5FD" fillOpacity="0.85" stroke="#60A5FA" strokeWidth="2" />
          <path d="M44 35L42 38H46L44 35Z" fill="#3B82F6" />
          <path d="M44 38C46 43 42 47 44 52" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          {/* Feather in front */}
          <path
            d="M12 50C16 46 22 36 28 26C34 16 40 10 40 10C40 10 32 20 28 30C24 40 18 46 12 50Z"
            fill="url(#featherGrad)"
          />
          <path d="M12 50Q28 28 40 10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          {/* Floating autumn leaf */}
          <path
            d="M16 22C16 16 25 14 28 20C31 26 25 32 19 31C16 30 16 26 16 22Z"
            fill="#34D399"
            stroke="#059669"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'sounds':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <defs>
            <linearGradient id="soundGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          {/* Musical Tone Note */}
          <ellipse cx="22" cy="42" rx="7" ry="5.5" transform="rotate(-15 22 42)" fill="url(#soundGrad)" />
          <ellipse cx="42" cy="36" rx="7" ry="5.5" transform="rotate(-15 42 36)" fill="url(#soundGrad)" />
          <rect x="26" y="16" width="4" height="26" fill="#4F46E5" />
          <rect x="46" y="10" width="4" height="26" fill="#4F46E5" />
          <polygon points="26,16 50,10 50,17 26,23" fill="#6366F1" />
          {/* Calming Sound Waves */}
          <path d="M48 24C52 26 52 32 48 34" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
          <path d="M53 19C60 23 60 37 53 41" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'favorites':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <defs>
            <radialGradient id="favGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FDA4AF" />
              <stop offset="50%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#E11D48" />
            </radialGradient>
          </defs>
          {/* Warm glowing heart with gentle sparkle */}
          <path
            d="M32 54C32 54 10 40 10 24C10 15 17 9 25 9C29 9 32 12 32 12C32 12 35 9 39 9C47 9 54 15 54 24C54 40 32 54 32 54Z"
            fill="url(#favGrad)"
            stroke="#FECDD3"
            strokeWidth="2.5"
          />
          {/* Inner highlight */}
          <ellipse cx="22" cy="18" rx="4" ry="2.5" transform="rotate(-30 22 18)" fill="#FFFFFF" fillOpacity="0.75" />
          {/* Tiny sparkle */}
          <path d="M46 12L47.5 15L50.5 16.5L47.5 18L46 21L44.5 18L41.5 16.5L44.5 15Z" fill="#FDE047" />
        </svg>
      );
  }
};
