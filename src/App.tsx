import React, { useState, useRef } from 'react';
import './App.css';
import { ThreeView, ThreeViewHandle } from './components/ThreeView';
import { HUD, HUDStats } from './components/HUD';
import { LoxLoader } from './loaders/LoxLoader';

interface FileInfo {
  name: string;
  size: string;
  length: number;
  depth: number;
  stations: number;
}

function App() {
  const [stats, setStats] = useState<HUDStats>({
    cursorX: 0, cursorY: 0, cursorZ: 0,
    dist: 0, azimuth: 0, inclination: 0,
    depth: null
  });

  const [vis, setVis] = useState({
    surface: true,
    legs: true,
    splays: true,
    stations: true,
    labels: false,
    altitudeColor: true,
    boundingBox: false,
    walls: false
  });

  const [settings, setSettings] = useState({
    centerlineWidth: 2,
    splayWidth: 1,
    bgColor: '#050505',
    fontSize: 1
  });

  const [fileName, setFileName] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const threeViewRef = useRef<ThreeViewHandle>(null);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 500));
  };

  const processFile = async (file: File) => {
    addLog(`Loading: ${file.name}`);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const loader = new LoxLoader(addLog);
      const data = await loader.load(buffer);

      setFileInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        length: data.metadata.totalLength,
        depth: data.metadata.maxDepth,
        stations: data.metadata.numStations
      });

      threeViewRef.current?.loadData(data);
      addLog(`Render complete.`);
    } catch (err) {
      addLog(`ERROR: ${err}`);
    }
  };

  if (!fileName) {
    return (
      <div className="splash-screen" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
      }}>
        <div className="splash-card">
          <div className="splash-logo">洞</div>
          <h1>Loch Web 2.0</h1>
          <button className="btn btn-primary btn-large" onClick={() => fileInputRef.current?.click()}>
            📂 LOAD LOX FILE
          </button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".lox" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header"><h2><span>洞</span> Loch Web 2.0</h2></div>
        <div className="sidebar-content">
          <div className="info-panel">
            <div className="info-label">INFO O JASKYNI</div>
            <div className="info-row"><span>Dĺžka:</span> <span>{fileInfo?.length.toFixed(2)} m</span></div>
            <div className="info-row"><span>Hĺbka:</span> <span>{fileInfo?.depth.toFixed(2)} m</span></div>
            <div className="info-row"><span>Stanice:</span> <span>{fileInfo?.stations}</span></div>
          </div>

          <div style={{ color: '#888', fontSize: '11px', marginBottom: '10px', marginTop: '20px' }}>VIDITEĽNOSŤ A FUNKCIE</div>
          <div className="button-group">
            <button className={`btn ${vis.legs ? 'btn-active' : ''}`} onClick={() => setVis({...vis, legs: !vis.legs})}>
              {vis.legs ? '🟢 Polygón: ZAP' : '⚫ Polygón: VYP'}
            </button>
            <button className={`btn ${vis.splays ? 'btn-active' : ''}`} onClick={() => setVis({...vis, splays: !vis.splays})}>
              {vis.splays ? '🔘 Splays: ZAP' : '⚫ Splays: VYP'}
            </button>
            <button className={`btn ${vis.stations ? 'btn-active' : ''}`} onClick={() => setVis({...vis, stations: !vis.stations})}>
              {vis.stations ? '⚪ Stanice: ZAP' : '⚫ Stanice: VYP'}
            </button>
            <button className={`btn ${vis.labels ? 'btn-active' : ''}`} onClick={() => setVis({...vis, labels: !vis.labels})}>
              {vis.labels ? '🏷️ Názvy staníc: ZAP' : '🏷️ Názvy staníc: VYP'}
            </button>
            <button className={`btn ${vis.walls ? 'btn-active' : ''}`} onClick={() => setVis({...vis, walls: !vis.walls})}>
              {vis.walls ? '🧱 3D Steny: ZAP' : '🧱 3D Steny: VYP'}
            </button>
            <button className={`btn ${vis.altitudeColor ? 'btn-active' : ''}`} onClick={() => setVis({...vis, altitudeColor: !vis.altitudeColor})}>
              {vis.altitudeColor ? '🌈 Výškový gradient: ZAP' : '🌈 Výškový gradient: VYP'}
            </button>
            <button className={`btn ${vis.boundingBox ? 'btn-active' : ''}`} onClick={() => setVis({...vis, boundingBox: !vis.boundingBox})}>
              {vis.boundingBox ? '📦 Bounding Box: ZAP' : '📦 Bounding Box: VYP'}
            </button>
            <button className={`btn ${vis.surface ? 'btn-active' : ''}`} onClick={() => setVis({...vis, surface: !vis.surface})}>
              {vis.surface ? '⛰️ Povrch: ZAP' : '🕳️ Povrch: VYP'}
            </button>
          </div>

          <div style={{ color: '#888', fontSize: '11px', marginBottom: '10px', marginTop: '20px' }}>NASTAVENIA SCÉNY</div>
          <div className="info-panel" style={{ padding: '10px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px' }}>
              Hrúbka Centerline: {settings.centerlineWidth}
              <input type="range" min="1" max="10" step="1" value={settings.centerlineWidth} onChange={e => setSettings({...settings, centerlineWidth: parseFloat(e.target.value)})} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', marginTop: '10px' }}>
              Hrúbka Splays: {settings.splayWidth}
              <input type="range" min="1" max="5" step="1" value={settings.splayWidth} onChange={e => setSettings({...settings, splayWidth: parseFloat(e.target.value)})} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', marginTop: '10px' }}>
              Veľkosť textu: {settings.fontSize}
              <input type="range" min="0.1" max="5" step="0.1" value={settings.fontSize} onChange={e => setSettings({...settings, fontSize: parseFloat(e.target.value)})} />
            </label>
            <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12px', marginTop: '15px' }}>
              Farba pozadia:
              <input type="color" value={settings.bgColor} onChange={e => setSettings({...settings, bgColor: e.target.value})} style={{ background: 'none', border: 'none', cursor: 'pointer' }} />
            </label>
          </div>

          <div className="log-container">
            <div className="info-label">LOG ZÁZNAMY</div>
            <div className="log-entries">{logs.map((log, i) => <div key={i} className="log-entry">{log}</div>)}</div>
          </div>
          <button className="btn" onClick={() => setFileName(null)} style={{ marginTop: '10px', color: '#ff5252' }}>✖ Zavrieť model</button>
        </div>
      </div>
      <div className="viewport">
        <ThreeView
          ref={threeViewRef}
          onUpdateStats={setStats}
          surfaceVisible={vis.surface}
          legsVisible={vis.legs}
          splaysVisible={vis.splays}
          stationsVisible={vis.stations}
          labelsVisible={vis.labels}
          altitudeColor={vis.altitudeColor}
          boundingBoxVisible={vis.boundingBox}
          wallsVisible={vis.walls}
          centerlineWidth={settings.centerlineWidth}
          splayWidth={settings.splayWidth}
          bgColor={settings.bgColor}
          fontSize={settings.fontSize}
        />
        <HUD stats={stats} fileName={fileName} />
      </div>
    </div>
  );
}

export default App;
