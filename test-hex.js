import fs from 'fs';

const buffer = fs.readFileSync('model-simple.lox');
const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

let offset = 0;
while (offset + 16 <= buffer.byteLength) {
  const type = view.getUint32(offset, true);
  const recSize = view.getUint32(offset + 4, true);
  const recCount = view.getUint32(offset + 8, true);
  const dataSize = view.getUint32(offset + 12, true);

  if (type === 3) {
      const chunkOffset = offset + 16;
      let flagCounts = {};
      for (let i = 0; i < recCount; i++) {
         const rOff = chunkOffset + i * 92;
         const flags = view.getUint32(rOff + 80, true);
         flagCounts[flags] = (flagCounts[flags] || 0) + 1;
      }
      console.log(`Flags distribution in Type 3:`, flagCounts);
  }

  offset = offset + 16 + recSize + dataSize;
}
