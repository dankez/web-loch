import React from 'react';

export interface HUDStats {
  cursorX: number;
  cursorY: number;
  cursorZ: number;
  dist: number;
  azimuth: number;
  inclination: number;
  depth: number | null;
}

export const HUD = ({ stats }: { stats: HUDStats }) => {
  return (
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
      maxWidth: 'calc(100vw - 40px)',
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
  );
};
