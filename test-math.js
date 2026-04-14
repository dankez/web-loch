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
      for (let i = 0; i < recCount; i++) {
         const rOff = chunkOffset + i * 92;
         const from = view.getUint32(rOff, true);
         const to = view.getInt32(rOff + 4, true);
         const flags = view.getUint32(rOff + 80, true);

         const length = view.getFloat64(rOff + 36, true);
         const bearing = view.getFloat64(rOff + 44, true);
         const clino = view.getFloat64(rOff + 52, true);

         if (to === -1) {
             console.log(`Splay: from=${from}, to=${to}, len=${length.toFixed(2)}, bearing=${bearing.toFixed(2)}, clino=${clino.toFixed(2)}`);
         }
      }
  }

  offset = offset + 16 + recSize + dataSize;
}
