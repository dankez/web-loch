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
    stations: true
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
            <div className="info-label">CAVE INFO</div>
            <div className="info-row"><span>Length:</span> <span>{fileInfo?.length.toFixed(2)} m</span></div>
            <div className="info-row"><span>Depth:</span> <span>{fileInfo?.depth.toFixed(2)} m</span></div>
            <div className="info-row"><span>Stations:</span> <span>{fileInfo?.stations}</span></div>
          </div>

          <div style={{ color: '#888', fontSize: '11px', marginBottom: '10px', marginTop: '20px' }}>VISIBILITY</div>
          <div className="button-group">
            <button className={`btn ${vis.legs ? 'btn-active' : ''}`} onClick={() => setVis({...vis, legs: !vis.legs})}>
              {vis.legs ? '🟢 Polygon: ON' : '⚫ Polygon: OFF'}
            </button>
            <button className={`btn ${vis.splays ? 'btn-active' : ''}`} onClick={() => setVis({...vis, splays: !vis.splays})}>
              {vis.splays ? '🔘 Splays: ON' : '⚫ Splays: OFF'}
            </button>
            <button className={`btn ${vis.stations ? 'btn-active' : ''}`} onClick={() => setVis({...vis, stations: !vis.stations})}>
              {vis.stations ? '⚪ Stations: ON' : '⚫ Stations: OFF'}
            </button>
            <button className={`btn ${vis.surface ? 'btn-active' : ''}`} onClick={() => setVis({...vis, surface: !vis.surface})}>
              {vis.surface ? '⛰️ Surface: ON' : '🕳️ Surface: OFF'}
            </button>
          </div>

          <div className="log-container">
            <div className="info-label">LOG</div>
            <div className="log-entries">{logs.map((log, i) => <div key={i} className="log-entry">{log}</div>)}</div>
          </div>
          <button className="btn" onClick={() => setFileName(null)} style={{ marginTop: '10px', color: '#ff5252' }}>✖ Close</button>
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
        />
        <HUD stats={stats} />
      </div>
    </div>
  );
}

export default App;
