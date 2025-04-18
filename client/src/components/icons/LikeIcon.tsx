import React from 'react';

interface LikeIconProps {
  className?: string;
}

export const LikeIcon: React.FC<LikeIconProps> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g clipPath="url(#clip0_1280_1053)">
      <path
        d="M17.497 1.91699C16.371 1.93451 15.2695 2.24885 14.3038 2.82826C13.3381 3.40768 12.5424 4.23166 11.997 5.21699C11.4517 4.23166 10.656 3.40768 9.69027 2.82826C8.72457 2.24885 7.62308 1.93451 6.49703 1.91699C4.70197 1.99498 3.01073 2.78025 1.79281 4.10122C0.574888 5.4222 -0.0707219 7.17152 -0.0029714 8.96699C-0.0029714 13.514 4.78303 18.48 8.79703 21.847C9.69325 22.6001 10.8264 23.013 11.997 23.013C13.1677 23.013 14.3008 22.6001 15.197 21.847C19.211 18.48 23.997 13.514 23.997 8.96699C24.0648 7.17152 23.4192 5.4222 22.2012 4.10122C20.9833 2.78025 19.2921 1.99498 17.497 1.91699Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_1280_1053">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
