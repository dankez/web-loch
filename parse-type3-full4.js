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

      if (type === 3) {
          console.log(`\n${filename} TYPE 3: count=${recCount}`);
          const chunkOffset = offset + 16;
          for (let i = 0; i < recCount; i++) {
             const rOff = chunkOffset + i * 92;
             const fromId = view.getUint32(rOff, true);
             const toId = view.getInt32(rOff + 4, true);
             const typeStr = view.getUint32(rOff + 80, true);

             // Check if flags is the right offset
             const isSurface = view.getUint8(rOff + 80) & 1;
             const isDuplicate = view.getUint8(rOff + 80) & 2;
             const isSplay = view.getUint8(rOff + 80) & 16;

             if (!isSurface && !isDuplicate && !isSplay) {
                console.log(`Type 3 Leg: from=${fromId}, to=${toId}`);
             }
          }
      }
      offset += 16 + recSize + dataSize;
    }
};

dump('model-simple.lox');
