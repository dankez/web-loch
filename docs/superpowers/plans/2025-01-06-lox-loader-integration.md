# LOX Loader Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the basic 3D viewport using Three.js and a skeleton for the LOX data loader.

**Architecture:** A dedicated `ThreeView` React component for the WebGL scene and a `LoxLoader` class for handling binary data fetching and parsing.

**Tech Stack:** React, Three.js, TypeScript

---

### Task 1: Implement LoxLoader Skeleton

**Files:**
- Create: `src/loaders/LoxLoader.ts`

- [ ] **Step 1: Create the loaders directory**
Run: `mkdir -p src/loaders`

- [ ] **Step 2: Create LoxLoader.ts with skeleton code**

```typescript
// src/loaders/LoxLoader.ts
export class LoxLoader {
  async load(url: string) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    // Logic to parse binary LOX data (simplified placeholder for now)
    console.log(`Loading LOX from ${url}, size: ${buffer.byteLength} bytes`);
    return { channels: [], stations: [] };
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/loaders/LoxLoader.ts
git commit -m "feat: add LoxLoader skeleton"
```

### Task 2: Implement ThreeView Component

**Files:**
- Create: `src/components/ThreeView.tsx`

- [ ] **Step 1: Create the components directory**
Run: `mkdir -p src/components`

- [ ] **Step 2: Create ThreeView.tsx with a basic scene**

```tsx
// src/components/ThreeView.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeView = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mountRef.current) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    camera.position.z = 5;

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      return animationId;
    };
    const animationId = animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);
  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ThreeView.tsx
git commit -m "feat: add basic ThreeView component"
```

### Task 3: Integrate ThreeView into App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx to use ThreeView**

```tsx
// src/App.tsx
import React from 'react';
import './App.css';
import { ThreeView } from './components/ThreeView';

function App() {
  return (
    <div className="app-container">
      <div className="sidebar">Sidebar (TBD)</div>
      <div className="viewport">
        <ThreeView />
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate ThreeView into App"
```

### Task 4: Verification

- [ ] **Step 1: Run build check**
Run: `npm run build`
Expected: PASS

- [ ] **Step 2: Final commit if needed**
(Already committed in steps)
