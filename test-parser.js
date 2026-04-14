import fs from 'fs';

const buffer = fs.readFileSync('model-simple.lox');
const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

let offset = 0;
while (offset + 16 <= buffer.byteLength) {
  const type = view.getUint32(offset, true);
  const recSize = view.getUint32(offset + 4, true);
  const recCount = view.getUint32(offset + 8, true);
  const dataSize = view.getUint32(offset + 12, true);

  const chunkOffset = offset + 16;

  if (type === 3) {
    console.log(`SHOT chunk, recSize: ${recSize}, recCount: ${recCount}`);
    for(let i = 0; i < Math.min(2, recCount); i++) {
        const rOff = chunkOffset + i * recSize;
        const from = view.getUint32(rOff, true);
        const to = view.getInt32(rOff + 4, true);
        console.log(`Shot ${i}: from=${from}, to=${to}`);
        // let's print the floats at 12, 20, 28, 36, 44, 52, 60, 68, 76
        for (let o=12; o<=76; o+=8) {
             const f = view.getFloat64(rOff + o, true);
             console.log(`  Offset ${o}: float64 = ${f}`);
        }
    }
    break;
  }

  offset += 16 + recSize + dataSize;
}
