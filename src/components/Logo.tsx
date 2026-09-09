import React from 'react';

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'compact',
  size = 'md',
  showTagline = false,
  className = ''
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  }[size];

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  }[size];

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs'
  }[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon Mark */}
      <img
        src="/logo2.png"
        alt="URLSnip Logo"
        className={`${iconDimensions} object-contain rounded-xl shrink-0 drop-shadow-sm`}
      />

      {variant !== 'icon' && (
        <div className="flex flex-col justify-center">
          <div className={`font-black ${textSizes} tracking-tight leading-none flex items-center`}>
            <span className="text-[#232d69] dark:text-white">URL</span>
            <span className="text-[#ea580c]">Snip</span>
          </div>
          {(showTagline || variant === 'full') && (
            <span className={`text-slate-400 dark:text-slate-400 font-semibold tracking-wider ${taglineSizes} uppercase mt-1`}>
              Shorten Scan Share
            </span>
          )}
        </div>
      )}
    </div>
  );
};
