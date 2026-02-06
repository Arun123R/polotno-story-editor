import React from 'react';

export const InfoIcon = ({ size = 16, color = '#99A1AF', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0)">
      <path d="M7.99992 14.6668C11.6818 14.6668 14.6666 11.6821 14.6666 8.00016C14.6666 4.31826 11.6818 1.3335 7.99992 1.3335C4.31802 1.3335 1.33325 4.31826 1.33325 8.00016C1.33325 11.6821 4.31802 14.6668 7.99992 14.6668Z" stroke={color} strokeWidth="1.33333"/>
      <path d="M8 10.6668V8.00016M8 5.3335H8.00667" stroke={color} strokeWidth="1.33333" strokeLinecap="round"/>
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="16" height="16" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

export default InfoIcon;
