import React from 'react';

export interface HUDStats {
  cursorX: number;
  cursorY: number;
  cursorZ: number;
  dist: number;
  azimuth: number;
  inclination: number;
  depth: number | null;
  minZ?: number;
  maxZ?: number;
}

export const HUD = ({ stats, fileName }: { stats: HUDStats, fileName: string | null }) => {
  // Generates 6 evenly spaced labels between minZ and maxZ
  const getAltitudeLabels = () => {
      if (stats.minZ === undefined || stats.maxZ === undefined) return [];
      const step = (stats.maxZ - stats.minZ) / 5;
      const labels = [];
      for (let i = 0; i <= 5; i++) {
          labels.push((stats.maxZ - step * i).toFixed(0) + ' m');
      }
      return labels;
  };

  const altitudeLabels = getAltitudeLabels();

  return (
    <>
    {/* Right HUD - Stats */}
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: '15px',
      borderRadius: '8px',
      color: '#fff',
      fontFamily: 'monospace',
      fontSize: '12px',
      border: '1px solid #444',
      pointerEvents: 'none',
      zIndex: 1000,
      boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#888', borderBottom: '1px solid #333', marginBottom: '5px' }}>CURSOR</div>
          <div>X: {stats.cursorX.toFixed(2)}</div>
          <div>Y: {stats.cursorY.toFixed(2)}</div>
          <div>Z: {stats.cursorZ.toFixed(2)}</div>
        </div>

        <div>
          <div style={{ color: '#f44336', borderBottom: '1px solid #333', marginBottom: '5px' }}>LEG</div>
          <div>Dist: {stats.dist.toFixed(2)}m</div>
          <div>Az: {stats.azimuth.toFixed(1)}°</div>
          <div>Incl: {stats.inclination.toFixed(1)}°</div>
        </div>

        <div>
          <div style={{ color: '#4CAF50', borderBottom: '1px solid #333', marginBottom: '5px' }}>SURFACE</div>
          <div style={{ fontWeight: 'bold' }}>Depth: {stats.depth !== null ? `${stats.depth.toFixed(2)}m` : 'N/A'}</div>
        </div>
      </div>
    </div>

    {/* Left HUD - Modern Indicators & Altitude Legend */}
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '320px', // Right next to the sidebar (300px width + 20px margin)
      pointerEvents: 'none',
      zIndex: 1000,
      color: '#00ffff',
      fontFamily: 'monospace',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      {/* Altitude Legend */}
      {(stats.minZ !== undefined && stats.maxZ !== undefined) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>Altitude</div>
            <div style={{ display: 'flex', height: '150px' }}>
                {/* Gradient bar (Red on top, Blue on bottom to match HSL 0 to 0.6) */}
                <div style={{
                    width: '20px',
                    height: '100%',
                    background: 'linear-gradient(to bottom, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%))',
                    marginRight: '8px'
                }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#00ffff', fontSize: '12px' }}>
                    {altitudeLabels.map((label, i) => (
                       <span key={i} style={{ transform: i === 0 ? 'translateY(-50%)' : i === 5 ? 'translateY(50%)' : 'translateY(0)' }}>
                         - {label}
                       </span>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Title */}
      <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px', textShadow: '1px 1px 2px #000' }}>
         {fileName?.replace('.lox', '') || 'Loch Model'}
      </div>
    </div>
    </>
  );
};
