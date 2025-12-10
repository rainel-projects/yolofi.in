import React from 'react';

// Custom SVG Icons
export const SearchIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
        <path d="M21 21L16.65 16.65" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const BrainIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3C8.5 3 6 5.5 6 8C6 9 6.5 10 7 10.5C6.5 11 6 12 6 13C6 14.5 7 16 8.5 16.5C8.5 18 9.5 20 12 21C14.5 20 15.5 18 15.5 16.5C17 16 18 14.5 18 13C18 12 17.5 11 17 10.5C17.5 10 18 9 18 8C18 5.5 15.5 3 12 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="9" r="1" fill={color} />
        <circle cx="15" cy="9" r="1" fill={color} />
    </svg>
);

export const BoltIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ScanIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
        <path d="M3 12H21" stroke={color} strokeWidth="2" />
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    </svg>
);

export const CheckCircleIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
export const CpuIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth="2" />
        <rect x="9" y="9" width="6" height="6" stroke={color} strokeWidth="2" />
        <path d="M9 1V4" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M15 1V4" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M9 20V23" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M15 20V23" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M20 9H23" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M20 14H23" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M1 9H4" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M1 14H4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const MemoryIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 7H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 2L2 22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 2L22 22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const NetworkIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" stroke={color} strokeWidth="2" />
        <path d="M12 6V12L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const TrashIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6H5H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ShieldIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ActivityIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12H18L15 21L9 3L6 12H2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const TerminalIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 17L10 11L4 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 19H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const WifiIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12.55C6.5 11 8.5 10 10.5 10C12.5 10 14.5 11 16 12.55M2 9.6C4.5 7 7.5 5.5 10.5 5.5C13.5 5.5 16.5 7 19 9.6M8.5 15.5C9 15 9.75 14.75 10.5 14.75C11.25 14.75 12 15 12.5 15.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10.5" cy="19.5" r="1.5" fill={color} />
    </svg>
);

export const LayersIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const HandshakeIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 11L12.5 14.5L16 11M9 11V14M9 11L4 16C4 16 2.5 17.5 5 20C7.5 22.5 9 21 9 21L12.5 17.5M12.5 14.5V17.5M12.5 14.5L16 11M16 11L21 6C21 6 22.5 4.5 20 2C17.5 -0.5 16 1 16 1L12.5 4.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
export const HeartIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
