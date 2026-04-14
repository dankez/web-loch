import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HUDStats } from './HUD';
import { LoxData } from '../loaders/LoxLoader';

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

interface ThreeViewProps {
  onUpdateStats: (stats: HUDStats) => void;
  surfaceVisible: boolean;
  legsVisible: boolean;
  splaysVisible: boolean;
  stationsVisible: boolean;
}

export interface ThreeViewHandle {
  loadData: (data: LoxData) => void;
  clearScene: () => void;
}

export const ThreeView = forwardRef<ThreeViewHandle, ThreeViewProps>(({
  onUpdateStats, surfaceVisible, legsVisible, splaysVisible, stationsVisible
}, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const legsGroup = useRef<THREE.Group>(new THREE.Group());
  const splaysGroup = useRef<THREE.Group>(new THREE.Group());
  const stationsGroup = useRef<THREE.Group>(new THREE.Group());
  const controlsRef = useRef<OrbitControls | null>(null);

  useImperativeHandle(ref, () => ({
    loadData: (data: LoxData) => {
      clearCurrentData();

      let minZ = Infinity, maxZ = -Infinity;
      let firstPos: THREE.Vector3 | null = null;
      data.stations.forEach(s => {
        if(!firstPos) firstPos = s.pos;
        if(s.pos.z < minZ) minZ = s.pos.z;
        if(s.pos.z > maxZ) maxZ = s.pos.z;
      });
      if (!firstPos) return;
      const offset = (firstPos as THREE.Vector3).clone();

      // LEG Rendering with Altitude Color
      data.legs.forEach(leg => {
        const p1 = data.stations.get(leg.from)?.pos;
        const p2 = data.stations.get(leg.to)?.pos;
        if (p1 && p2) {
          const v1 = p1.clone().sub(offset);
          const v2 = p2.clone().sub(offset);

          const geom = new THREE.BufferGeometry().setFromPoints([v1, v2]);

          // Color based on avg altitude
          const avgZ = (p1.z + p2.z) / 2;
          const t = (avgZ - minZ) / (maxZ - minZ || 1);
          const color = new THREE.Color().setHSL(0.6 * (1 - t), 1, 0.5); // Blue to Red

          const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color, linewidth: 2 }));
          legsGroup.current.add(line);
        }
      });

      // SPLAY Rendering (Dimmed color)
      data.splays.forEach(splay => {
        const p1 = data.stations.get(splay.from)?.pos;
        const p2 = splay.to !== -1 ? data.stations.get(splay.to)?.pos : null; // Rarely splays have to-station

        if (p1) {
          // If no to-station, splays are often stored as special points in other chunks.
          // For this basic parser, we show splays between known stations if available.
          if (p2) {
            const geom = new THREE.BufferGeometry().setFromPoints([p1.clone().sub(offset), p2.clone().sub(offset)]);
            const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.5 }));
            splaysGroup.current.add(line);
          }
        }
      });

      // STATION Rendering
      const stationPoints: THREE.Vector3[] = [];
      data.stations.forEach(s => stationPoints.push(s.pos.clone().sub(offset)));
      const pointsGeom = new THREE.BufferGeometry().setFromPoints(stationPoints);
      const pointsCloud = new THREE.Points(pointsGeom, new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 }));
      stationsGroup.current.add(pointsCloud);

      if (controlsRef.current) {
        const box = new THREE.Box3().setFromObject(legsGroup.current);
        const center = box.getCenter(new THREE.Vector3());
        controlsRef.current.target.copy(center);
        controlsRef.current.update();
      }
    },
    clearScene: () => {
      clearCurrentData();
    }
  }));

  const clearCurrentData = () => {
    [legsGroup, splaysGroup, stationsGroup].forEach(g => {
      while(g.current.children.length > 0) g.current.remove(g.current.children[0]);
    });
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = sceneRef.current;
    scene.add(legsGroup.current);
    scene.add(splaysGroup.current);
    scene.add(stationsGroup.current);

    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 10000);
    camera.position.set(20, -40, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x050505);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Visibility Toggles
  useEffect(() => { legsGroup.current.visible = legsVisible; }, [legsVisible]);
  useEffect(() => { splaysGroup.current.visible = splaysVisible; }, [splaysVisible]);
  useEffect(() => { stationsGroup.current.visible = stationsVisible; }, [stationsVisible]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
});
