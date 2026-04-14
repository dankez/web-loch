// src/loaders/SurfaceLoader.test.ts
import { expect, test } from 'vitest';
import { parseGrid } from './SurfaceLoader';

test('should parse grid header and data', () => {
  const content = "grid -295800.99 -1244307.99 1.0 1.0 5 5\ninput dmr5.txt";
  const data = "841.77 841.63 841.50 841.41 841.30 841.19 841.02 840.90 840.81 840.64 840.44 840.29 840.18 840.10 839.94 839.76 839.59 839.51 839.51 839.48 839.39 839.35 839.23 839.10 838.95";
  const result = parseGrid(content, data);

  expect(result.originX).toBe(-295800.99);
  expect(result.width).toBe(5);
  expect(result.heights).toHaveLength(25);
  expect(result.heights[0]).toBe(841.77);
});
