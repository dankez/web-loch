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
  cameraAzimuth?: number;
  cameraInclination?: number;
  cameraScale?: number;
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

  // Dynamic Scale calculation to snap to nice human readable numbers (1, 2, 5, 10, 50, 100...)
  const getNiceScale = (rawMetersFor100px: number) => {
     if (!rawMetersFor100px || rawMetersFor100px <= 0) return { label: '0 m', widthPx: 100 };

     const magnitude = Math.pow(10, Math.floor(Math.log10(rawMetersFor100px)));
     const normalized = rawMetersFor100px / magnitude; // between 1 and 10

     let niceValue;
     if (normalized < 1.5) niceValue = 1;
     else if (normalized < 3.5) niceValue = 2;
     else if (normalized < 7.5) niceValue = 5;
     else niceValue = 10;

     const finalMeters = niceValue * magnitude;
     const targetWidthPx = (finalMeters / rawMetersFor100px) * 100;

     return { label: `${finalMeters} m`, widthPx: targetWidthPx };
  };

  const scaleData = getNiceScale(stats.cameraScale || 0);

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
      left: '10px', // Na ľavom okraji Viewportu, úplne pri stene
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

      {/* Indicators: Compass, Inclination, Scale */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginTop: '10px' }}>

        {/* Compass */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
           <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #0055ff', position: 'relative' }}>
              {/* Crosshair */}
              <div style={{ position: 'absolute', top: '50%', left: '0', width: '100%', height: '1px', backgroundColor: 'rgba(0,85,255,0.5)' }}></div>
              <div style={{ position: 'absolute', top: '0', left: '50%', width: '1px', height: '100%', backgroundColor: 'rgba(0,85,255,0.5)' }}></div>
              {/* Arrow */}
              <div style={{
                  position: 'absolute', top: '10%', left: '40%', width: '0', height: '0',
                  borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '40px solid #ffaa00',
                  transformOrigin: '50% 100%',
                  transform: `translateY(-20px) rotate(${stats.cameraAzimuth || 0}deg)`
              }}></div>
           </div>
           <div style={{ fontSize: '11px', color: '#00ffff' }}>
              {Math.round(stats.cameraAzimuth || 0).toString().padStart(3, '0')}°
           </div>
        </div>

        {/* Inclination */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
           <div style={{ width: '50px', height: '25px', borderBottom: '1px solid #0055ff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: '0', left: '25px', width: '25px', height: '25px', borderTopLeftRadius: '25px', border: '1px solid rgba(0,85,255,0.5)', borderBottom: 'none', borderRight: 'none', backgroundColor: 'rgba(0,0,255,0.2)' }}></div>
              {/* Arrow */}
              <div style={{
                  position: 'absolute', bottom: '0', left: '23px', width: '4px', height: '25px', backgroundColor: '#ffaa00',
                  transformOrigin: '50% 100%',
                  transform: `rotate(${stats.cameraInclination || 0}deg)`
              }}></div>
           </div>
           <div style={{ fontSize: '11px', color: '#00ffff' }}>
              {Math.round(stats.cameraInclination || 0).toString().padStart(3, '0')}°
           </div>
        </div>

        {/* Scale */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', paddingBottom: '10px' }}>
            <div style={{ fontSize: '11px', color: '#00ffff', marginBottom: '2px', alignSelf: 'flex-start' }}>
                {scaleData.label}
            </div>
            <div style={{ display: 'flex', width: `${scaleData.widthPx}px`, height: '8px', border: '1px solid #0055ff', borderTop: 'none' }}>
                <div style={{ flex: 1, backgroundColor: '#0000aa', borderRight: '1px solid #0055ff' }}></div>
                <div style={{ flex: 1, backgroundColor: '#000000', borderRight: '1px solid #0055ff' }}></div>
                <div style={{ flex: 1, backgroundColor: '#0000aa', borderRight: '1px solid #0055ff' }}></div>
                <div style={{ flex: 1, backgroundColor: '#000000', borderRight: '1px solid #0055ff' }}></div>
                <div style={{ flex: 1, backgroundColor: '#0000aa' }}></div>
            </div>
        </div>

      </div>

      {/* Title */}
      <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px', textShadow: '1px 1px 2px #000', marginTop: '10px' }}>
         {fileName?.replace('.lox', '') || 'Loch Model'}
      </div>
    </div>
    </>
  );
};
