import fs from 'fs';

const dump = (filename) => {
    const buffer = fs.readFileSync(filename);
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    let offset = 0;
    while (offset + 16 <= buffer.byteLength) {
      const type = view.getUint32(offset, true);
      const recSize = view.getUint32(offset + 4, true);
      const recCount = view.getUint32(offset + 8, true);
      const dataSize = view.getUint32(offset + 12, true);

      if (type === 4) {
          console.log(`\n${filename} TYPE 4: count=${recCount}`);
          const chunkOffset = offset + 16;
          for (let i = 0; i < 5; i++) {
             const rOff = chunkOffset + i * 32;
             const fromId = view.getUint32(rOff, true);
             const typeFlags = view.getUint32(rOff + 4, true);
             const x = view.getFloat64(rOff + 8, true);
             const y = view.getFloat64(rOff + 16, true);
             const z = view.getFloat64(rOff + 24, true);

             console.log(`Type 4 [${i}]: from=${fromId}, flags=${typeFlags}, dx=${x}, dy=${y}, dz=${z}`);
          }
      }
      offset += 16 + recSize + dataSize;
    }
};

dump('model-simple.lox');
