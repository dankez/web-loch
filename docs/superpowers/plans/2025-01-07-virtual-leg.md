# Task 4: Virtual Leg (Measurement Tool) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the math for distance/azimuth/inclination and add basic click interaction in ThreeView for measurement.

**Architecture:** Logic is separated into a pure math utility (`math.ts`) and UI interaction logic in the `ThreeView` component. It uses `THREE.Raycaster` to find points in 3D space.

**Tech Stack:** React, Three.js, TypeScript.

---

### Task 1: Implement distance and angle calculations

**Files:**
- Create: `src/utils/math.ts`

- [ ] **Step 1: Create the math utility file**

```typescript
// src/utils/math.ts
import * as THREE from 'three';

/**
 * Calculates distance, azimuth, and inclination between two points.
 * Azimuth: 0 is North (+Y), 90 is East (+X)
 * Inclination: 0 is horizontal, +90 is vertical up (+Z)
 */
export const calculateLeg = (p1: THREE.Vector3, p2: THREE.Vector3) => {
  const dist = p1.distanceTo(p2);
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  
  // Azimuth: Angle in XY plane (assuming Y is North)
  // Converting from Three.js coordinate space to geographical
  const azimuth = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
  
  // Inclination: Vertical angle
  const inclination = Math.asin(dz / dist) * 180 / Math.PI;
  
  return { dist, azimuth, inclination };
};
```

- [ ] **Step 2: Commit math utility**

```bash
git add src/utils/math.ts
git commit -m "feat: add distance and angle calculation utility"
```

### Task 2: Add Click Interaction to ThreeView

**Files:**
- Modify: `src/components/ThreeView.tsx`

- [ ] **Step 1: Update ThreeView with click handler and Raycaster**
Add an invisible plane to catch clicks if there are no objects, and use Raycaster to find intersection points.

```typescript
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { calculateLeg } from '../utils/math';

export const ThreeView = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const points = useRef<THREE.Vector3[]>([]);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    mountRef.current?.appendChild(renderer.domElement);

    // Create a large invisible plane for raycasting when scene is empty
    const planeGeom = new THREE.PlaneGeometry(100, 100);
    const planeMat = new THREE.MeshBasicMaterial({ visible: false });
    const plane = new THREE.Mesh(planeGeom, planeMat);
    scene.add(plane);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        console.log(`Clicked at: x=${point.x.toFixed(2)}, y=${point.y.toFixed(2)}, z=${point.z.toFixed(2)}`);
        
        points.current.push(point.clone());
        if (points.current.length >= 2) {
          const p1 = points.current[points.current.length - 2];
          const p2 = points.current[points.current.length - 1];
          const leg = calculateLeg(p1, p2);
          console.log(`Leg: dist=${leg.dist.toFixed(2)}, azimuth=${leg.azimuth.toFixed(2)}°, inclination=${leg.inclination.toFixed(2)}°`);
        }
      }
    };

    window.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('click', onClick);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />;
};
```

- [ ] **Step 2: Commit interaction logic**

```bash
git add src/components/ThreeView.tsx
git commit -m "feat: add click interaction and raycasting for measurement"
```

### Task 3: Verification

- [ ] **Step 1: Verify clicking logs coordinates and measurement**
Since I cannot interact with the UI, I'll rely on ensuring the code is correctly implemented and potentially adding a simple test or log check if possible. For this task, I will verify the build passes.

- [ ] **Step 2: Final Commit**

```bash
git commit -m "feat: add virtual leg measurement tool"
```
