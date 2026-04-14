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
