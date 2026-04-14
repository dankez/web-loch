import fs from 'fs';

const dumpFlags = (filename) => {
    const buffer = fs.readFileSync(filename);
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    let offset = 0;
    const flagsCount = {};
    while (offset + 16 <= buffer.byteLength) {
      const type = view.getUint32(offset, true);
      const recSize = view.getUint32(offset + 4, true);
      const recCount = view.getUint32(offset + 8, true);
      const dataSize = view.getUint32(offset + 12, true);

      if (type === 3) {
          const chunkOffset = offset + 16;
          for (let i = 0; i < recCount; i++) {
             const rOff = chunkOffset + i * 92;
             const toId = view.getInt32(rOff + 4, true);
             const flags = view.getUint32(rOff + 80, true);
             const key = `toId:${toId === -1 ? -1 : 'valid'}, flags:${flags}`;
             flagsCount[key] = (flagsCount[key] || 0) + 1;
          }
      }
      offset += 16 + recSize + dataSize;
    }
    console.log(`${filename} flags:`, flagsCount);
};

dumpFlags('model-simple.lox');
dumpFlags('model2.lox');
