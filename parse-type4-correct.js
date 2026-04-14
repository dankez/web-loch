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
          console.log(`\n${filename} TYPE 4: count=${recCount}, recSize=${recSize}`);
          const chunkOffset = offset + 16;
          for (let i = 0; i < 5; i++) {
             const rOff = chunkOffset + i * 32;
             const fromId = view.getUint32(rOff, true);
             const something = view.getUint32(rOff + 4, true);

             // maybe x, y, z as 64-bit float, but we saw they were e-312...
             // what if they are 32-bit floats?
             const dx = view.getFloat32(rOff + 8, true);
             const dy = view.getFloat32(rOff + 12, true);
             const dz = view.getFloat32(rOff + 16, true);

             console.log(`Type 4 [${i}]: from=${fromId}, sm1=${something}, x=${dx.toExponential(2)}, y=${dy.toExponential(2)}, z=${dz.toExponential(2)}`);
          }
      }
      offset += 16 + recSize + dataSize;
    }
};
dump('model-simple.lox');
