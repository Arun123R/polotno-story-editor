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

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, endTime]);



  const containerStyle = {
    width: width || 300,
    height: height || 'auto',
    background: style?.background || style?.containerBgColor || '#ffffff',
    borderRadius: style?.radius !== undefined ? style.radius : (style?.containerBorderRadius || 16),
    padding: style?.padding !== undefined ? style.padding : (style?.containerPadding || 20),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    border: '1px solid #e5e7eb',
    boxSizing: 'border-box',
    fontFamily: 'Inter, Arial, sans-serif',
  };

  const titleStyle = {
    color: style?.titleColor || '#1f2937',
    fontSize: style?.titleFontSize || 16,
    fontWeight: 700,
    margin: 0,
    textAlign: 'center',
    marginBottom: 4,
  };

  const timerContainerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 4, // Compact gap between units
    flexWrap: 'nowrap', // Force one row
  };

  const digitGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  };

  const digitsRowStyle = {
    display: 'flex',
    gap: 1, // Compact gap between digits
  };

  const digitBoxStyle = {
    minWidth: 24, // Compact flexible width
    height: 40,
    background: style?.digitBackground || style?.digitBgColor || '#f3f4f6',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 2px',
  };

  const digitTextStyle = {
    color: style?.digitColor || '#1f2937',
    fontSize: style?.digitSize || style?.digitFontSize || 24, // Smaller font for tiles
    fontWeight: 700,
    lineHeight: 1,
  };

  const labelStyle = {
    color: style?.labelColor || '#1f2937',
    fontSize: 11,
    fontWeight: 600,
  };

  const separatorContainerStyle = {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const separatorStyle = {
    color: style?.separatorColor || '#1f2937',
    fontSize: 20,
    fontWeight: 700,
  };

  const formatDigits = (num) => String(num).padStart(2, '0').split('');

  const renderUnit = (value, label, isLast) => {
    const [d1, d2] = formatDigits(value);

    return (
      <>
        <div style={digitGroupStyle}>
          <div style={digitsRowStyle}>
            <div style={digitBoxStyle}><span style={digitTextStyle}>{d1}</span></div>
            <div style={digitBoxStyle}><span style={digitTextStyle}>{d2}</span></div>
          </div>
          <span style={labelStyle}>{label}</span>
        </div>
        {!isLast && (
          <div style={separatorContainerStyle}>
            <span style={separatorStyle}>:</span>
          </div>
        )}
      </>
    );
  };

  // Filter active units to manage separators correctly
  const activeUnits = [];
  if (showDays) activeUnits.push({ val: timeLeft.days, label: 'days' });
  if (showHours) activeUnits.push({ val: timeLeft.hours, label: 'hours' });
  if (showMinutes) activeUnits.push({ val: timeLeft.minutes, label: 'minutes' });
  if (showSeconds) activeUnits.push({ val: timeLeft.seconds, label: 'seconds' });

  return (
    <div style={containerStyle}>
      <p style={titleStyle}>{title}</p>
      <div style={timerContainerStyle}>
        {activeUnits.map((unit, index) => (
          <React.Fragment key={unit.label}>
            {renderUnit(unit.val, unit.label, index === activeUnits.length - 1)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CountdownRenderer;
