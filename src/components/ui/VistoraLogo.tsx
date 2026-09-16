import React from 'react';

interface VistoraLogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const VistoraLogo: React.FC<VistoraLogoProps> = ({
  className = '',
  showTagline = false,
  size = 'md',
}) => {
  const sizeMap = {
    sm: { icon: 24, text: 'text-lg', gap: 'gap-2' },
    md: { icon: 30, text: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 40, text: 'text-2xl', gap: 'gap-3' },
    xl: { icon: 52, text: 'text-4xl', gap: 'gap-4' },
  };

  const { icon, text, gap } = sizeMap[size];

  return (
    <div className={`flex items-center ${gap} select-none cursor-pointer group ${className}`}>
      {/* Unique Abstract Angled Geometric V Symbol */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-105 shrink-0"
      >
        {/* Left primary angled chevron arm */}
        <path
          d="M7 8.5C6.44772 8.5 6 8.94772 6 9.5V13.5C6 14.12 6.35 14.68 6.9 14.96L18.4 20.8C19.4 21.3 20.6 21.3 21.6 20.8L33.1 14.96C33.65 14.68 34 14.12 34 13.5V9.5C34 8.94772 33.5523 8.5 33 8.5H28C27.4477 8.5 26.94 8.78 26.65 9.25L20 19.8L13.35 9.25C13.06 8.78 12.5523 8.5 12 8.5H7Z"
          fill="#FFD21F"
        />
        {/* Bottom converging apex blade with subtle warm gradient */}
        <path
          d="M14.5 19L19.1 32.2C19.4 33.1 20.6 33.1 20.9 32.2L25.5 19C25.8 18.2 25.1 17.5 24.3 17.5H15.7C14.9 17.5 14.2 18.2 14.5 19Z"
          fill="#FFDF4D"
        />
        {/* Central visual discovery aperture dot */}
        <circle cx="20" cy="14" r="2.5" className="fill-[#171717] dark:fill-white transition-colors" />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className={`font-display font-extrabold tracking-tight ${text} text-[#171717] dark:text-white transition-colors`}>
            VISTORA
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFD21F] ml-1 mb-2 inline-block"></span>
        </div>
        {showTagline && (
          <span className="text-[10px] tracking-widest uppercase font-semibold text-[#666666] dark:text-[#A0A0A0] -mt-1">
            Discover. Save. Create.
          </span>
        )}
      </div>
    </div>
  );
};
