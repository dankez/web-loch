import fs from 'fs';

const buffer = fs.readFileSync('model-simple.lox');
const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

let offset = 0;
let legs = 0;
let splays = 0;
while (offset + 16 <= buffer.byteLength) {
  const type = view.getUint32(offset, true);
  const recSize = view.getUint32(offset + 4, true);
  const recCount = view.getUint32(offset + 8, true);
  const dataSize = view.getUint32(offset + 12, true);

  if (type === 3) {
      const chunkOffset = offset + 16;
      for (let i = 0; i < recCount; i++) {
         const rOff = chunkOffset + i * 92;
         const fromId = view.getUint32(rOff, true);
         const toId = view.getInt32(rOff + 4, true);
         const flags = view.getUint32(rOff + 80, true);

         const isSplay = (flags & 16) !== 0 || toId === -1;
         const isDuplicate = (flags & 2) !== 0;
         const isSurface = (flags & 1) !== 0;

         if (isSplay) splays++;
         else if (!isDuplicate && !isSurface) legs++;
      }
  }

  offset += 16 + recSize + dataSize;
}
console.log(`Legs: ${legs}, Splays: ${splays}`);
