import fs from 'fs';

const buffer = fs.readFileSync('model-simple.lox');
const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

let offset = 0;
while (offset + 16 <= buffer.byteLength) {
  const type = view.getUint32(offset, true);
  const recSize = view.getUint32(offset + 4, true);
  const recCount = view.getUint32(offset + 8, true);
  const dataSize = view.getUint32(offset + 12, true);

  if (type === 2) {
      const chunkOffset = offset + 16;
      for (let i = 0; i < 3; i++) {
         const rOff = chunkOffset + i * 52;
         const id = view.getUint32(rOff, true);
         console.log(`Station ${i}: id=${id}`);
      }
  }

  if (type === 3) {
      const chunkOffset = offset + 16;
      for (let i = 0; i < 5; i++) {
         const rOff = chunkOffset + i * 92;
         const from = view.getUint32(rOff, true);
         const to = view.getInt32(rOff + 4, true);
         console.log(`Leg ${i}: from=${from}, to=${to}`);
      }
  }

  offset = offset + 16 + recSize + dataSize;
}
