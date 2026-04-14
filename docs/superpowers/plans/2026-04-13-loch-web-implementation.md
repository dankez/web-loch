# Loch Web 2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based cave viewer (.lox) with analytical tools for measuring distances and surface proximity.

**Architecture:** A React-based frontend using Three.js for 3D rendering. It integrates CaveView.js logic for .lox parsing and includes custom shaders/geometry for DEM surface rendering.

**Tech Stack:** React, TypeScript, Three.js, Vite, CaveView.js components.

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: Initialize Vite project with React and TypeScript**
```bash
npm create vite@latest . -- --template react-ts
npm install three @types/three
```

- [ ] **Step 2: Create basic App structure**
```tsx
// src/App.tsx
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <div className="sidebar">Sidebar (TBD)</div>
      <div className="viewport">3D View (TBD)</div>
    </div>
  );
}

export default App;
```

- [ ] **Step 3: Run dev server to verify setup**
Run: `npm run dev`
Expected: PASS (site loads with placeholders)

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "chore: initial project scaffold"
```

---

### Task 2: LOX Loader Integration

**Files:**
- Create: `src/loaders/LoxLoader.ts`
- Create: `src/components/ThreeView.tsx`

- [ ] **Step 1: Implement LoxLoader adapter based on CaveView logic**
```typescript
// src/loaders/LoxLoader.ts
export class LoxLoader {
  async load(url: string) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    // Logic to parse binary LOX data (simplified placeholder)
    return { channals: [], stations: [] };
  }
}
```

- [ ] **Step 2: Setup Three.js Scene in component**
```tsx
// src/components/ThreeView.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeView = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);
    // ... animation loop
  }, []);
  return <div ref={mountRef} />;
};
```

- [ ] **Step 3: Verify basic scene rendering**
Expected: PASS (Black screen with WebGL canvas)

- [ ] **Step 4: Commit**
```bash
git commit -m "feat: add basic Three.js viewport and LoxLoader skeleton"
```

---

### Task 3: Surface Grid Parser (DMR5)

**Files:**
- Create: `src/loaders/SurfaceLoader.ts`
- Test: `src/loaders/SurfaceLoader.test.ts`

- [ ] **Step 1: Write test for grid parsing**
```typescript
test('should parse grid header and data', () => {
  const content = "grid -295800 -1244307 1 1 5 5\ninput data.txt";
  const data = "841.77 841.63 841.50";
  // expect result to have correct bounds and height array
});
```

- [ ] **Step 2: Implement SurfaceLoader**
```typescript
// src/loaders/SurfaceLoader.ts
export const parseGrid = (header: string, data: string) => {
  const parts = header.split(/\s+/);
  return {
    originX: parseFloat(parts[1]),
    originY: parseFloat(parts[2]),
    stepX: parseFloat(parts[3]),
    stepY: parseFloat(parts[4]),
    width: parseInt(parts[5]),
    height: parseInt(parts[6]),
    heights: data.split(/\s+/).map(parseFloat)
  };
};
```

- [ ] **Step 3: Run tests**
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git commit -m "feat: implement surface grid parser"
```

---

### Task 4: Virtual Leg (Measurement Tool)

**Files:**
- Create: `src/utils/math.ts`
- Modify: `src/components/ThreeView.tsx`

- [ ] **Step 1: Implement distance and angle calculations**
```typescript
// src/utils/math.ts
export const calculateLeg = (p1: THREE.Vector3, p2: THREE.Vector3) => {
  const dist = p1.distanceTo(p2);
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  const azimuth = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
  const inclination = Math.asin(dz / dist) * 180 / Math.PI;
  return { dist, azimuth, inclination };
};
```

- [ ] **Step 2: Add Raycaster to ThreeView for point selection**
```typescript
// In ThreeView.tsx
const raycaster = new THREE.Raycaster();
const onMouseDown = (event: MouseEvent) => {
  // Logic to select points and draw red line
};
```

- [ ] **Step 3: Verify measurement in UI**
Expected: PASS (Clicking two points draws line and shows console log with math)

- [ ] **Step 4: Commit**
```bash
git commit -m "feat: add virtual leg measurement tool"
```

---

### Task 5: HUD & Proximity UI

**Files:**
- Create: `src/components/HUD.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create HUD component for real-time stats**
```tsx
// src/components/HUD.tsx
export const HUD = ({ stats }: { stats: any }) => (
  <div className="hud">
    <div>Distance: {stats.dist.toFixed(2)}m</div>
    <div>Azimuth: {stats.azimuth.toFixed(1)}°</div>
    <div className="proximity">Depth: {stats.depth.toFixed(2)}m</div>
  </div>
);
```

- [ ] **Step 2: Integrate proximity logic**
```typescript
// Logic to find terrain height above current cursor Z
const terrainHeight = getTerrainHeightAt(cursorX, cursorY);
const depth = terrainHeight - cursorZ;
```

- [ ] **Step 3: Verify final UI layout**
Expected: PASS (Classic layout with working tools and HUD)

- [ ] **Step 4: Final Build for WebSupport**
```bash
npm run build
```

- [ ] **Step 5: Final Commit**
```bash
git commit -m "feat: complete Loch Web 2.0 with HUD and build"
```
