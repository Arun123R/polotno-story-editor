import React, { useState, useEffect } from 'react';

/**
 * Countdown Renderer Component
 * Renders a countdown timer with days, hours, minutes, seconds
 */
export const CountdownRenderer = ({ data, style, width, height }) => {
  const title = data?.title || 'Ends In';
  const endDate = data?.endDate || '';
  const endTime = data?.endTime || '23:59';
  const showDays = data?.showDays !== false;
  const showHours = data?.showHours !== false;
  const showMinutes = data?.showMinutes !== false;
  const showSeconds = data?.showSeconds !== false;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!endDate) {
        return { days: 0, hours: 12, minutes: 34, seconds: 56 };
      }
      
      const endDateTime = new Date(`${endDate}T${endTime}:00`);
      const now = new Date();
      const diff = endDateTime - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, endTime]);

  const containerStyle = {
    width: width || 300,
    height: height || 'auto',
    minHeight: 120,
    background: style?.containerBgColor || 'rgba(0,0,0,0.6)',
    borderRadius: style?.containerBorderRadius || 16,
    padding: style?.containerPadding || 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box',
  };

  const titleStyle = {
    color: style?.titleColor || '#ffffff',
    fontSize: style?.titleFontSize || 14,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 2,
    margin: 0,
  };

  const timerContainerStyle = {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  };

  const digitBoxStyle = {
    background: style?.digitBgColor || 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    minWidth: 50,
  };

  const digitStyle = {
    color: style?.digitColor || '#ffffff',
    fontSize: style?.digitFontSize || 36,
    fontWeight: 700,
    lineHeight: 1,
    fontFamily: 'monospace',
  };

  const labelStyle = {
    color: style?.labelColor || 'rgba(255,255,255,0.7)',
    fontSize: style?.labelFontSize || 10,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 1,
  };

  const separatorStyle = {
    color: style?.separatorColor || '#ffffff',
    fontSize: 28,
    fontWeight: 700,
    opacity: 0.5,
  };

  const formatNumber = (num) => String(num).padStart(2, '0');

  const renderDigitBox = (value, label) => (
    <div style={digitBoxStyle}>
      <span style={digitStyle}>{formatNumber(value)}</span>
      <span style={labelStyle}>{label}</span>
    </div>
  );

  return (
    <div style={containerStyle}>
      <p style={titleStyle}>{title}</p>
      <div style={timerContainerStyle}>
        {showDays && (
          <>
            {renderDigitBox(timeLeft.days, 'Days')}
            <span style={separatorStyle}>:</span>
          </>
        )}
        {showHours && (
          <>
            {renderDigitBox(timeLeft.hours, 'Hrs')}
            <span style={separatorStyle}>:</span>
          </>
        )}
        {showMinutes && (
          <>
            {renderDigitBox(timeLeft.minutes, 'Min')}
            {showSeconds && <span style={separatorStyle}>:</span>}
          </>
        )}
        {showSeconds && renderDigitBox(timeLeft.seconds, 'Sec')}
      </div>
    </div>
  );
};

export default CountdownRenderer;
