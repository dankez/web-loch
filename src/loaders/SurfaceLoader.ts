// src/loaders/SurfaceLoader.ts
export const parseGrid = (header: string, data: string) => {
  const parts = header.split(/\s+/);
  // header starts with "grid" so index 1 is originX
  return {
    originX: parseFloat(parts[1]),
    originY: parseFloat(parts[2]),
    stepX: parseFloat(parts[3]),
    stepY: parseFloat(parts[4]),
    width: parseInt(parts[5]),
    height: parseInt(parts[6]),
    heights: data.trim().split(/\s+/).map(parseFloat)
  };
};
