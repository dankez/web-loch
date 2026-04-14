import fs from 'fs';

const buffer = fs.readFileSync('model-simple.lox');
const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

let offset = 0;
while (offset + 16 <= buffer.byteLength) {
  const type = view.getUint32(offset, true);
  const recSize = view.getUint32(offset + 4, true);
  const recCount = view.getUint32(offset + 8, true);
  const dataSize = view.getUint32(offset + 12, true);

  if (type === 4) {
      console.log(`Type 4: recSize: ${recSize}, recCount: ${recCount}`);
      const chunkOffset = offset + 16;
      for (let i = 0; i < 5; i++) {
         const rOff = chunkOffset + i * 32;
         const fromId = view.getUint32(rOff, true);
         const something1 = view.getUint32(rOff + 4, true);
         const something2 = view.getUint32(rOff + 8, true);
         const something3 = view.getUint32(rOff + 12, true);

         const x = view.getFloat32(rOff + 16, true);
         const y = view.getFloat32(rOff + 20, true);
         const z = view.getFloat32(rOff + 24, true);
         const c = view.getUint32(rOff + 28, true);
         console.log(`Type4 [${i}]: from=${fromId}, x=${x}, y=${y}, z=${z}`);
      }
  }

  offset = offset + 16 + recSize + dataSize;
}
