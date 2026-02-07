import InfoTooltipIcon from './InfoTooltipIcon';

export default function DurationHeaderWithTooltip() {
  return (
    <div className="duration-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
      <span className="duration-title">Duration</span>
      <InfoTooltipIcon
        ariaLabel="Show info about Duration"
        tooltipTitle="Duration"
        tooltipText="Set the timing for your interactive elements to appear and create a dynamic and immersive experience for your users."
        iconSize={16}
      />
    </div>
  );
}
