// src/loaders/LoxLoader.ts
import * as THREE from 'three';

export interface LoxData {
  stations: Map<number, { name: string, pos: THREE.Vector3, surveyId: number }>;
  legs: { from: number, to: number, surveyId: number, flags: number, isSurface?: boolean }[];
  splays: { from: number, to: number, surveyId: number, flags: number, isSurface?: boolean }[]; // to is often -1
  surfaceLegs: { from: number, to: number, surveyId: number, flags: number, isSurface?: boolean }[];
  surveys: Map<number, { name: string, parentId: number }>;
  scraps: { vertices: Float32Array, indices: Uint32Array }[];
  metadata: {
    name: string;
    totalLength: number;
    maxDepth: number;
    numStations: number;
  };
}

export class LoxLoader {
  private logCallback: (msg: string) => void;

  constructor(logCallback: (msg: string) => void) {
    this.logCallback = logCallback;
  }

  async load(buffer: ArrayBuffer): Promise<LoxData> {
    this.logCallback(`Loading LOX from buffer, size: ${buffer.byteLength} bytes`);
    const view = new DataView(buffer);
    const data: LoxData = {
      stations: new Map(),
      legs: [],
      splays: [],
      surfaceLegs: [],
      surveys: new Map(),
      scraps: [],
      metadata: { name: 'Cave Project', totalLength: 0, maxDepth: 0, numStations: 0 }
    };

    let offset = 0;
    while (offset + 16 <= buffer.byteLength) {
      const type = view.getUint32(offset, true);
      const recSize = view.getUint32(offset + 4, true);
      const recCount = view.getUint32(offset + 8, true);
      const dataSize = view.getUint32(offset + 12, true);

      const chunkOffset = offset + 16;
      const dataPoolOffset = chunkOffset + recSize;

      if (dataPoolOffset + dataSize > buffer.byteLength) break;

      const dataPool = new Uint8Array(buffer, dataPoolOffset, dataSize);
      const decoder = new TextDecoder('utf-8');
      const getString = (pos: number, size: number) => {
        if (size <= 1) return "";
        return decoder.decode(dataPool.subarray(pos, pos + size - 1));
      };

      switch (type) {
        case 1: // SURVEY
          for (let i = 0; i < recCount; i++) {
            const rOff = chunkOffset + i * 24;
            const id = view.getUint32(rOff, true);
            const parent = view.getUint32(rOff + 4, true);
            const namePos = view.getUint32(rOff + 8, true);
            const nameSize = view.getUint32(rOff + 12, true);
            data.surveys.set(id, { name: getString(namePos, nameSize), parentId: parent });
          }
          break;

        case 2: // STATION
          for (let i = 0; i < recCount; i++) {
            const rOff = chunkOffset + i * 52;
            const id = view.getUint32(rOff, true);
            const surveyId = view.getUint32(rOff + 4, true);
            const namePos = view.getUint32(rOff + 8, true);
            const nameSize = view.getUint32(rOff + 12, true);
            const x = view.getFloat64(rOff + 28, true);
            const y = view.getFloat64(rOff + 36, true);
            const z = view.getFloat64(rOff + 44, true);
            const name = getString(namePos, nameSize) || `${id}`;
            data.stations.set(id, { name, surveyId, pos: new THREE.Vector3(x, y, z) });
          }
          break;

        case 3: // SHOT
          for (let i = 0; i < recCount; i++) {
            const rOff = chunkOffset + i * 92;
            const from = view.getUint32(rOff, true);
            const to = view.getInt32(rOff + 4, true); // to can be -1
            const surveyId = view.getUint32(rOff + 8, true);
            const flags = view.getUint32(rOff + 80, true);

            // Flag at offset 72 indicates if it is a surface shot (1 = surface, 0 = underground)
            const surfaceFlag = view.getUint32(rOff + 72, true);
            const isSurfaceReal = surfaceFlag === 1;

            // In Lox format, often stations named "." are splays endpoint.
            // We can detect them later. For now, rely on to being valid, but check station names.
            const isSplayFlag = (flags & 16) !== 0 || to === -1;
            const isDuplicate = (flags & 2) !== 0;
            const isSurface = (flags & 1) !== 0;

            // We will separate splays after loading stations by name check.
            data.legs.push({ from, to, surveyId, flags, isSurface: isSurfaceReal });
          }
          break;

        case 4: // SCRAP (Native Therion Walls)
          for (let i = 0; i < recCount; i++) {
            const rOff = chunkOffset + i * 32;

            // Using correct offsets verified from CaveView.js
            const numPoints = view.getUint32(rOff + 8, true);
            const pointsPos = view.getUint32(rOff + 12, true); // pointsPtr.position

            const numAngles = view.getUint32(rOff + 20, true);
            const anglesPos = view.getUint32(rOff + 24, true); // facesPtr.position

            if (numPoints > 0 && numAngles > 0) {
              const pOffset = dataPoolOffset + pointsPos;
              const aOffset = dataPoolOffset + anglesPos;

              const vertices = new Float32Array(numPoints * 3);
              for (let v = 0; v < numPoints; v++) {
                 vertices[v * 3] = view.getFloat64(pOffset + v * 24, true);
                 vertices[v * 3 + 1] = view.getFloat64(pOffset + v * 24 + 8, true);
                 vertices[v * 3 + 2] = view.getFloat64(pOffset + v * 24 + 16, true);
              }

              const indices = new Uint32Array(numAngles * 3);
              let lastFace: number[] | undefined = undefined;

              for (let t = 0; t < numAngles; t++) {
                 const i1 = view.getUint32(aOffset + t * 12, true);
                 const i2 = view.getUint32(aOffset + t * 12 + 4, true);
                 const i3 = view.getUint32(aOffset + t * 12 + 8, true);

                 if (i1 === i2 || i1 === i3 || i2 === i3) continue; // Degenerované trojuholníky preskočíme

                 const face = [i1, i2, i3];

                 // Overenie správneho winding order podľa pôvodného CaveView parsera
                 if (lastFace) {
                     let fixed = false;
                     for (let j = 0; j < 3; j++) {
                         if (face[j] === lastFace[(j + 2) % 3] && face[(j + 1) % 3] === lastFace[(j + 3) % 3]) {
                             face.reverse();
                             fixed = true;
                             break;
                         }
                     }
                     if (!fixed) {
                         for (let j = 0; j < 3; j++) {
                             if (face[j] === lastFace[j] && face[(j + 1) % 3] === lastFace[(j + 1) % 3]) {
                                 face.reverse();
                                 fixed = true;
                                 break;
                             }
                         }
                     }
                     if (!fixed) {
                         for (let j = 0; j < 3; j++) {
                             if (face[j] === lastFace[(j + 1) % 3] && face[(j + 1) % 3] === lastFace[(j + 2) % 3]) {
                                 face.reverse();
                                 fixed = true;
                                 break;
                             }
                         }
                     }
                 }

                 indices[t * 3] = face[0];
                 indices[t * 3 + 1] = face[1];
                 indices[t * 3 + 2] = face[2];
                 lastFace = face;
              }

              data.scraps.push({ vertices, indices });
            }
          }
          break;
      }

      offset += 16 + recSize + dataSize;
    }

    // Post-process legs to extract splays based on station names
    const realLegs: typeof data.legs = [];
    const splays: typeof data.splays = [];
    const surfaceLegs: typeof data.surfaceLegs = [];

    data.legs.forEach(leg => {
      const toStation = data.stations.get(leg.to);
      const isSplayFlag = (leg.flags & 16) !== 0 || leg.to === -1;
      const isDuplicate = (leg.flags & 2) !== 0;

      const toName = toStation ? toStation.name : '';
      // Ak meno neobsahuje žiadne alfanumerické znaky (napr. ".", ",", "", atď.), je to splay.
      // Slepý bod končiaci písmenom alebo číslom je polygón.
      const hasAlphaNum = /[a-zA-Z0-9]/.test(toName);
      const isNameSplay = !hasAlphaNum;

      if (leg.isSurface) {
        surfaceLegs.push(leg);
      } else if (isSplayFlag || isNameSplay || !toStation) {
        splays.push(leg);
      } else if (!isDuplicate) {
        realLegs.push(leg);
      }
    });

    data.legs = realLegs;
    data.splays = splays;
    data.surfaceLegs = surfaceLegs;

    // Build sets to classify stations
    const surfaceStationIds = new Set<number>();
    const undergroundStationIds = new Set<number>();

    data.surfaceLegs.forEach(leg => {
       surfaceStationIds.add(leg.from);
       if (leg.to !== -1) surfaceStationIds.add(leg.to);
    });
    data.legs.forEach(leg => {
       undergroundStationIds.add(leg.from);
       if (leg.to !== -1) undergroundStationIds.add(leg.to);
    });

    // Pure surface station: has surface legs, but NO underground legs
    const pureSurfaceIds = new Set<number>();
    surfaceStationIds.forEach(id => {
       if (!undergroundStationIds.has(id)) pureSurfaceIds.add(id);
    });

    // Označíme pure surface stanice flagom aby sa dali filtrovať pri renderovaní stien
    data.stations.forEach((s, id) => {
        if (pureSurfaceIds.has(id)) {
            (s as any).isPureSurface = true;
        }
    });

    // Metadata calc (exclude PURE surface stations and splays)
    let minZ = Infinity, maxZ = -Infinity;
    data.stations.forEach((s, id) => {
      const hasAlphaNum = /[a-zA-Z0-9]/.test(s.name);
      const isNameSplay = !hasAlphaNum;
      const isPureSurfaceNode = pureSurfaceIds.has(id);

      if (!isNameSplay && !isPureSurfaceNode) {
         if (s.pos.z < minZ) minZ = s.pos.z;
         if (s.pos.z > maxZ) maxZ = s.pos.z;
      }
    });
    data.metadata.maxDepth = (maxZ === -Infinity) ? 0 : (maxZ - minZ);
    data.metadata.numStations = data.stations.size; // Keep raw station count for now

    // Length calc (only count underground real legs)
    data.legs.forEach(leg => {
      const p1 = data.stations.get(leg.from)?.pos;
      const p2 = data.stations.get(leg.to)?.pos;
      if (p1 && p2 && !leg.isSurface) {
          data.metadata.totalLength += p1.distanceTo(p2);
      }
    });

    return data;
  }
}
