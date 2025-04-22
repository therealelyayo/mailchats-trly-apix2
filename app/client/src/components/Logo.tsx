import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  // Size mapping for font sizes
  const sizeMap = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-4xl'
  };

  const sizeClass = sizeMap[size];

  return (
    <div className={`${className}`}>
      <h1 className={`${sizeClass} font-black tracking-tight text-black`}>
        <span className="text-black">MailChats</span>
        <span className="ml-2 font-bold">Trly</span>
        <span className="font-extrabold ml-1">APIX2</span>
      </h1>
    </div>
  );
};

export default Logo;