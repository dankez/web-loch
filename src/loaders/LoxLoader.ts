// src/loaders/LoxLoader.ts
import * as THREE from 'three';

export interface LoxData {
  stations: Map<number, { name: string, pos: THREE.Vector3, surveyId: number }>;
  legs: { from: number, to: number, surveyId: number, flags: number }[];
  splays: { from: number, to: number, surveyId: number, flags: number }[]; // to is often -1
  surveys: Map<number, { name: string, parentId: number }>;
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
    const view = new DataView(buffer);
    const data: LoxData = {
      stations: new Map(),
      legs: [],
      splays: [],
      surveys: new Map(),
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
      const nextChunkOffset = dataPoolOffset + dataSize;

      if (nextChunkOffset > buffer.byteLength) break;

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

            const isSplay = (flags & 16) !== 0 || to === -1;
            const isDuplicate = (flags & 2) !== 0;
            const isSurface = (flags & 1) !== 0;

            if (isSplay) {
              data.splays.push({ from, to, surveyId, flags });
            } else if (!isDuplicate && !isSurface) {
              data.legs.push({ from, to, surveyId, flags });
            }
          }
          break;
      }
      offset = nextChunkOffset;
    }

    // Metadata calc
    let minZ = Infinity, maxZ = -Infinity;
    data.stations.forEach(s => {
      if (s.pos.z < minZ) minZ = s.pos.z;
      if (s.pos.z > maxZ) maxZ = s.pos.z;
      const p1 = data.stations.get(s.surveyId)?.pos; // dummy
    });
    data.metadata.maxDepth = (maxZ === -Infinity) ? 0 : (maxZ - minZ);
    data.metadata.numStations = data.stations.size;
    data.legs.forEach(leg => {
      const p1 = data.stations.get(leg.from)?.pos;
      const p2 = data.stations.get(leg.to)?.pos;
      if (p1 && p2) data.metadata.totalLength += p1.distanceTo(p2);
    });

    return data;
  }
}
