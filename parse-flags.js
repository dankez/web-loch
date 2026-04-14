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
         const fromId = view.getUint32(rOff, true);
         const toId = view.getInt32(rOff + 4, true);
         const flags = view.getUint32(rOff + 80, true);
         if (toId === -1 || i < 10) {
             console.log(`Leg: from=${fromId}, to=${toId}, flags=${flags}`);
         }
      }
  }

  offset = offset + 16 + recSize + dataSize;
}
