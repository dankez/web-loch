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
         const typeFlags = view.getUint32(rOff + 4, true);
         // could it be a station id and coordinates?
         // let's read the rest as floats
         const x = view.getFloat64(rOff + 8, true);
         const y = view.getFloat64(rOff + 16, true);
         const z = view.getFloat64(rOff + 24, true);
         console.log(`Type 4 [${i}]: fromId=${fromId}, typeFlags=${typeFlags}, x=${x}, y=${y}, z=${z}`);
      }
  }

  offset = offset + 16 + recSize + dataSize;
}
