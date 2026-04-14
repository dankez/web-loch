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
      console.log(`Type 4: recSize: ${recSize}`);
      const chunkOffset = offset + 16;
      for (let i = 0; i < 2; i++) {
         const rOff = chunkOffset + i * 32;
         // let's dump first 32 bytes as 32-bit uints to guess structure
         const v0 = view.getUint32(rOff, true);
         const v1 = view.getUint32(rOff + 4, true);
         const v2 = view.getUint32(rOff + 8, true);
         const v3 = view.getUint32(rOff + 12, true);
         const v4 = view.getUint32(rOff + 16, true);
         const v5 = view.getUint32(rOff + 20, true);
         const v6 = view.getUint32(rOff + 24, true);
         const v7 = view.getUint32(rOff + 28, true);
         console.log(`Item ${i}: ${v0} ${v1} ${v2} ${v3} ${v4} ${v5} ${v6} ${v7}`);
      }
  }

  offset = offset + 16 + recSize + dataSize;
}
