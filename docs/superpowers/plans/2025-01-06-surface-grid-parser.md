# Task 3: Surface Grid Parser (DMR5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a parser for DMR5 surface grid data to enable terrain rendering.

**Architecture:** A stateless `parseGrid` function in `SurfaceLoader.ts` that takes header and data strings and returns a structured grid object.

**Tech Stack:** TypeScript, Vitest.

---

### Task 1: Surface Grid Parser (DMR5)

**Files:**
- Create: `src/loaders/SurfaceLoader.ts`
- Create: `src/loaders/SurfaceLoader.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
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
```

- [ ] **Step 2: Create skeleton SurfaceLoader.ts and run test to verify it fails**

Create `src/loaders/SurfaceLoader.ts`:
```typescript
export const parseGrid = (header: string, data: string): any => {
    return {};
};
```

Run: `npm test -- --run src/loaders/SurfaceLoader.test.ts`
Expected: FAIL (assertion failure)

- [ ] **Step 3: Implement minimal code to pass the test**

```typescript
// src/loaders/SurfaceLoader.ts
export const parseGrid = (header: string, data: string) => {
  const parts = header.split(/\s+/);
  // header starts with "grid" so index 1 is originX
  return {
    originX: parseFloat(parts[1]),
    originY: parseFloat(parts[2]),    originY: parseFloat(parts[2]),
    stepX: parseFloat(parts[3]),
    stepY: parseFloat(parts[4]),
    width: parseInt(parts[5]),
    height: parseInt(parts[6]),
    heights: data.trim().split(/\s+/).map(parseFloat)
  };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/loaders/SurfaceLoader.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/loaders/SurfaceLoader.ts src/loaders/SurfaceLoader.test.ts
git commit -m "feat: implement surface grid parser"
```
