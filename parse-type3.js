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
      console.log(`Type 3: recSize: ${recSize}, recCount: ${recCount}`);
      const chunkOffset = offset + 16;
      let count = 0;
      for (let i = 0; i < recCount; i++) {
         const rOff = chunkOffset + i * 92;
         const fromId = view.getUint32(rOff, true);
         const toId = view.getInt32(rOff + 4, true);

         const x = view.getFloat64(rOff + 12, true); // dx?
         const y = view.getFloat64(rOff + 20, true); // dy?
         const z = view.getFloat64(rOff + 28, true); // dz?

         const isSplay = (fromId !== -1 && toId === -1);
         if (toId === -1 || toId > 150) {
           // It looks like toId is some valid station ID. We need to check if it has a toId!
           if (count < 10) {
              console.log(`Type3 [${i}]: from=${fromId}, to=${toId}, dx=${x.toFixed(3)}, dy=${y.toFixed(3)}, dz=${z.toFixed(3)}`);
              count++;
           }
         }
      }
  }

  offset = offset + 16 + recSize + dataSize;
}
