import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HUDStats } from './HUD';
import { LoxData } from '../loaders/LoxLoader';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

interface ThreeViewProps {
  onUpdateStats: (stats: HUDStats) => void;
  surfaceVisible: boolean;
  legsVisible: boolean;
  splaysVisible: boolean;
  stationsVisible: boolean;
  labelsVisible: boolean;
  altitudeColor: boolean;
  boundingBoxVisible: boolean;
  centerlineWidth: number;
  splayWidth: number;
  bgColor: string;
  fontSize: number;
  wallsVisible: boolean;
}

export interface ThreeViewHandle {
  loadData: (data: LoxData) => void;
  clearScene: () => void;
}

const createTextSprite = (text: string, sizeMultiplier: number) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return new THREE.Sprite();

  const fontSize = 32;
  context.font = `${fontSize}px Arial`;
  const metrics = context.measureText(text);
  const textWidth = metrics.width;

  canvas.width = textWidth;
  canvas.height = fontSize;

  // re-set after resize
  context.font = `${fontSize}px Arial`;
  context.fillStyle = 'rgba(255, 255, 255, 1.0)';
  context.fillText(text, 0, fontSize - 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(textWidth * 0.05 * sizeMultiplier, fontSize * 0.05 * sizeMultiplier, 1);
  return sprite;
};

export const ThreeView = forwardRef<ThreeViewHandle, ThreeViewProps>(({
  onUpdateStats, surfaceVisible, legsVisible, splaysVisible, stationsVisible,
  labelsVisible, altitudeColor, boundingBoxVisible, centerlineWidth, splayWidth, bgColor, fontSize, wallsVisible
}, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const legsGroup = useRef<THREE.Group>(new THREE.Group());
  const splaysGroup = useRef<THREE.Group>(new THREE.Group());
  const stationsGroup = useRef<THREE.Group>(new THREE.Group());
  const labelsGroup = useRef<THREE.Group>(new THREE.Group());
  const wallsGroup = useRef<THREE.Group>(new THREE.Group());
  const boxHelperRef = useRef<THREE.Box3Helper | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const loxDataRef = useRef<LoxData | null>(null);

  const buildScene = (data: LoxData) => {
    clearCurrentData();
    loxDataRef.current = data;

    let minZ = Infinity, maxZ = -Infinity;
    let firstPos: THREE.Vector3 | null = null;
    data.stations.forEach(s => {
      if(!firstPos) firstPos = s.pos;
      if (s.name !== '.') { // Ignore splay endpoints for bounding calculations if needed
         if(s.pos.z < minZ) minZ = s.pos.z;
         if(s.pos.z > maxZ) maxZ = s.pos.z;
      }
    });
    if (!firstPos) return;
    const offset = (firstPos as THREE.Vector3).clone();

    // Update Stats with altitude
    onUpdateStats({
      cursorX: 0, cursorY: 0, cursorZ: 0, dist: 0, azimuth: 0, inclination: 0, depth: null,
      minZ: minZ !== Infinity ? minZ : 0,
      maxZ: maxZ !== -Infinity ? maxZ : 0
    });

    // BoxHelper creation
    const box = new THREE.Box3();
    // Expand box by ALL stations so splays are also within the bounding box
    data.stations.forEach(s => {
        box.expandByPoint(s.pos.clone().sub(offset));
    });

    // LEG Rendering
    data.legs.forEach(leg => {
      const p1 = data.stations.get(leg.from)?.pos;
      const p2 = data.stations.get(leg.to)?.pos;
      if (p1 && p2) {
        const v1 = p1.clone().sub(offset);
        const v2 = p2.clone().sub(offset);

        // Use Line2 for proper thickness support
        const geom = new LineGeometry();
        geom.setPositions([v1.x, v1.y, v1.z, v2.x, v2.y, v2.z]);

        // Color mode with gradient via Vertex Colors
        const matOptions: any = {
            linewidth: centerlineWidth,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        };

        if (altitudeColor) {
            const t1 = (maxZ === minZ) ? 0 : (p1.z - minZ) / (maxZ - minZ);
            const color1 = new THREE.Color().setHSL(0.6 * (1 - t1), 1, 0.5);

            const t2 = (maxZ === minZ) ? 0 : (p2.z - minZ) / (maxZ - minZ);
            const color2 = new THREE.Color().setHSL(0.6 * (1 - t2), 1, 0.5);

            geom.setColors([color1.r, color1.g, color1.b, color2.r, color2.g, color2.b]);
            matOptions.vertexColors = true;
            matOptions.color = 0xffffff;
        } else {
            matOptions.color = 0x00ff00;
        }

        const mat = new LineMaterial(matOptions);

        const line = new Line2(geom, mat);
        line.computeLineDistances();
        legsGroup.current.add(line);
      }
    });

    // SPLAY Rendering & Volume Grouping
    const stationSplayMap = new Map<number, THREE.Vector3[]>(); // stationId -> array of splay endpoint vectors

    data.splays.forEach(splay => {
      const station = data.stations.get(splay.from);
      const p1 = station?.pos;
      const p2 = data.stations.get(splay.to)?.pos;

      if (p1 && p2) {
          const v1 = p1.clone().sub(offset);
          const v2 = p2.clone().sub(offset);

          const geom = new LineGeometry();
          geom.setPositions([v1.x, v1.y, v1.z, v2.x, v2.y, v2.z]);

          const splayMaterial = new LineMaterial({
             color: 0x555555,
             transparent: true,
             opacity: 0.4,
             linewidth: splayWidth,
             resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
          });

          const line = new Line2(geom, splayMaterial);
          line.computeLineDistances();
          splaysGroup.current.add(line);

          // Zbieranie bodov pre convex hull, NEPRIDAŤ pre PURE povrchové stanice
          // Ak je stanica súčasťou jaskyne aj povrchu (zlomový bod), jej steny sa vygenerujú
          if (!(station as any)?.isPureSurface) {
              if (!stationSplayMap.has(splay.from)) {
                  stationSplayMap.set(splay.from, [v1]); // pridať aj stred stanice ako základ
              }
              stationSplayMap.get(splay.from)?.push(v2);
          }
      }
    });

    // SURFACE Rendering
    data.surfaceLegs.forEach(leg => {
      const p1 = data.stations.get(leg.from)?.pos;
      const p2 = data.stations.get(leg.to)?.pos;
      if (p1 && p2) {
        const v1 = p1.clone().sub(offset);
        const v2 = p2.clone().sub(offset);

        box.expandByPoint(v1);
        box.expandByPoint(v2);

        const geom = new LineGeometry();
        geom.setPositions([v1.x, v1.y, v1.z, v2.x, v2.y, v2.z]);

        const mat = new LineMaterial({
            color: 0xffffff, // Biela fixná farba pre povrch
            linewidth: centerlineWidth,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        });

        const line = new Line2(geom, mat);
        line.computeLineDistances();
        legsGroup.current.add(line); // Pre teraz vložíme surface do legsGroup aby sa zapínali spoločne
      }
    });

    // Vytvorenie obalu 3D jaskyne (Walls / Convex Hulls)
    const hullGeometries: THREE.BufferGeometry[] = [];
    stationSplayMap.forEach((points, stationId) => {
        // Konvexný obal má zmysel generovať iba ak má stanica aspoň 4 body pre vytvorenie priestorového objemu
        if (points.length >= 4) {
            try {
                const convexGeom = new ConvexGeometry(points);
                hullGeometries.push(convexGeom);
            } catch (e) {
                console.warn("Could not generate convex hull for station", stationId, e);
            }
        }
    });

    if (hullGeometries.length > 0) {
        const mergedGeom = BufferGeometryUtils.mergeGeometries(hullGeometries, false);
        if (mergedGeom) {
            const wallMaterial = new THREE.MeshStandardMaterial({
                color: 0x888888,
                transparent: true,
                opacity: 0.3,
                roughness: 0.8,
                side: THREE.DoubleSide
            });
            const wallsMesh = new THREE.Mesh(mergedGeom, wallMaterial);
            wallsGroup.current.add(wallsMesh);
        }
    }

    // STATION Rendering & Labels
    const mainStationPoints: THREE.Vector3[] = [];
    const splayStationPoints: THREE.Vector3[] = [];

    data.stations.forEach(s => {
       const v = s.pos.clone().sub(offset);

       const isNameSplay = !(/[a-zA-Z0-9]/.test(s.name));

       if (!isNameSplay) {
           mainStationPoints.push(v);
           const sprite = createTextSprite(s.name, fontSize);
           sprite.position.copy(v);
           sprite.position.y += 0.2; // slight offset
           labelsGroup.current.add(sprite);
       } else {
           splayStationPoints.push(v);
       }
    });

    const mainPointsGeom = new THREE.BufferGeometry().setFromPoints(mainStationPoints);
    const mainPointsCloud = new THREE.Points(mainPointsGeom, new THREE.PointsMaterial({ color: 0xff0000, size: 0.2 })); // Cervena gulicka pre centerline stanice
    stationsGroup.current.add(mainPointsCloud);

    const splayPointsGeom = new THREE.BufferGeometry().setFromPoints(splayStationPoints);
    const splayPointsCloud = new THREE.Points(splayPointsGeom, new THREE.PointsMaterial({ color: 0xffff00, size: 0.05 })); // Splay body 50% mensie z 0.1 na 0.05
    stationsGroup.current.add(splayPointsCloud);

    // Bounding Box
    if (boxHelperRef.current) {
        sceneRef.current.remove(boxHelperRef.current);
    }
    boxHelperRef.current = new THREE.Box3Helper(box, new THREE.Color(0xff0000));
    boxHelperRef.current.visible = boundingBoxVisible;
    sceneRef.current.add(boxHelperRef.current);

    if (controlsRef.current) {
      const center = box.getCenter(new THREE.Vector3());
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  };

  useImperativeHandle(ref, () => ({
    loadData: (data: LoxData) => {
      buildScene(data);
    },
    clearScene: () => {
      clearCurrentData();
    }
  }));

  const clearCurrentData = () => {
    [legsGroup, splaysGroup, stationsGroup, labelsGroup, wallsGroup].forEach(g => {
      while(g.current.children.length > 0) {
        const child = g.current.children[0] as any;
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach((m: any) => {
                   if (m.map) m.map.dispose();
                   m.dispose();
                });
            } else {
                if (child.material.map) child.material.map.dispose();
                child.material.dispose();
            }
        }
        g.current.remove(child);
      }
    });
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = sceneRef.current;
    scene.add(legsGroup.current);
    scene.add(splaysGroup.current);
    scene.add(stationsGroup.current);
    scene.add(labelsGroup.current);
    scene.add(wallsGroup.current);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, -50, 100);
    scene.add(dirLight);

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

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Visibility Toggles
  useEffect(() => { legsGroup.current.visible = legsVisible; }, [legsVisible]);
  useEffect(() => { splaysGroup.current.visible = splaysVisible; }, [splaysVisible]);
  useEffect(() => { stationsGroup.current.visible = stationsVisible; }, [stationsVisible]);
  useEffect(() => { labelsGroup.current.visible = labelsVisible; }, [labelsVisible]);
  useEffect(() => { wallsGroup.current.visible = wallsVisible; }, [wallsVisible]);

  useEffect(() => {
    if (boxHelperRef.current) {
        boxHelperRef.current.visible = boundingBoxVisible;
    }
  }, [boundingBoxVisible]);

  useEffect(() => {
    if (rendererRef.current) {
        rendererRef.current.setClearColor(new THREE.Color(bgColor));
    }
  }, [bgColor]);

  // Re-build scene if color or linewidth changes (since LineBasicMaterial linewidth requires WebGL reconfiguration or just simple recreation, though recreation is safer)
  // Actually, WebGL line width is often limited to 1. But for this exercise we recreate scene to apply color modes and widths.
  useEffect(() => {
    if (loxDataRef.current) {
       buildScene(loxDataRef.current);
    }
  }, [altitudeColor, centerlineWidth, splayWidth, fontSize]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
});
