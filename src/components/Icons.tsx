import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LoIcon: React.FC<IconProps> = ({
  name,
  size = 18,
  stroke = 1.4,
  color = "currentColor",
  className = "",
  style,
}) => {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style,
    className,
  };

  switch (name) {
    case "sparkle":
      return (
        <svg {...props}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...props}>
          <path d="M5 12h14M13 6l6 6-6 6"/>
        </svg>
      );
    case "arrow-down":
      return (
        <svg {...props}>
          <path d="M12 5v14M6 13l6 6 6-6"/>
        </svg>
      );
    case "chevron-left":
      return (
        <svg {...props}>
          <path d="M15 6l-6 6 6 6"/>
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...props}>
          <path d="M9 6l6 6-6 6"/>
        </svg>
      );
    case "edit":
      return (
        <svg {...props}>
          <path d="M4 20h4l10-10-4-4L4 16v4z"/>
          <path d="M13 7l4 4"/>
        </svg>
      );
    case "pin":
      return (
        <svg {...props}>
          <path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
        </svg>
      );
    case "ruler":
      return (
        <svg {...props}>
          <rect x="3" y="9" width="18" height="6" rx="1"/>
          <path d="M7 9v3M11 9v4M15 9v3M19 9v4"/>
        </svg>
      );
    case "wallet":
      return (
        <svg {...props}>
          <rect x="3" y="6" width="18" height="13" rx="2"/>
          <path d="M16 13h2M3 10h18"/>
        </svg>
      );
    case "globe":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9"/>
          <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>
        </svg>
      );
    case "heart-line":
      return (
        <svg {...props}>
          <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/>
        </svg>
      );
    case "share":
      return (
        <svg {...props}>
          <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"/>
          <path d="M16 6l-4-4-4 4M12 2v14"/>
        </svg>
      );
    case "copy":
      return (
        <svg {...props}>
          <rect x="8" y="8" width="12" height="12" rx="2"/>
          <path d="M4 16V5a1 1 0 011-1h11"/>
        </svg>
      );
    case "info":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 11v6M12 7.5v.5"/>
        </svg>
      );
    case "lock":
      return (
        <svg {...props}>
          <rect x="5" y="10" width="14" height="10" rx="2"/>
          <path d="M8 10V7a4 4 0 018 0v3"/>
        </svg>
      );
    case "x":
      return (
        <svg {...props}>
          <path d="M6 6l12 12M6 18l12-12"/>
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="M5 12l5 5L20 7"/>
        </svg>
      );
    case "play":
      return (
        <svg {...props}>
          <path d="M7 5l12 7-12 7V5z" fill={color} stroke="none"/>
        </svg>
      );
    case "dot-grid":
      return (
        <svg {...props}>
          {[0, 1, 2].flatMap(r => [0, 1, 2].map(c => (
            <circle key={r + '-' + c} cx={6 + c * 6} cy={6 + r * 6} r="1" fill={color} stroke="none"/>
          )))}
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3"/>
          <path d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 00-2-1.2L14 3h-4l-.6 2.6a7 7 0 00-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 005 12a7 7 0 00.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 002 1.2L10 21h4l.6-2.6a7 7 0 002-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/>
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7"/>
          <path d="M21 21l-5-5"/>
        </svg>
      );
    case "rotate":
      return (
        <svg {...props}>
          <path d="M21 12a9 9 0 11-3-6.7L21 8"/>
          <path d="M21 3v5h-5"/>
        </svg>
      );
    case "send":
      return (
        <svg {...props}>
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
      );
    default:
      return null;
  }
};
