'use strict';

import Avc from './decoder';

// TODO: not hard-code
const width = 960;
const height = 540;
// Process one of every x messages
const skip = 1;
let counter = 0;

const avc = new Avc();

avc.onPictureDecoded = async (b: Buffer, w: number, h: number) => {
  if (!b) return;
  if (++counter === skip) counter = 0;
  else return;

  (async () => {
    const image = new ImageData(width, height);
    const lumaSize = w * h;
    const chromaSize = lumaSize >> 2;
    const ybuf = b.subarray(0, lumaSize);
    const ubuf = b.subarray(lumaSize, lumaSize + chromaSize);
    const vbuf = b.subarray(lumaSize + chromaSize, lumaSize + 2 * chromaSize);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const yIndex = x + y * w;
        const uIndex = ~~(y / 2) * ~~(w / 2) + ~~(x / 2);
        const vIndex = ~~(y / 2) * ~~(w / 2) + ~~(x / 2);
        const R = 1.164 * (ybuf[yIndex] - 16) + 1.596 * (vbuf[vIndex] - 128);
        const G = 1.164 * (ybuf[yIndex] - 16) - 0.813 * (vbuf[vIndex] - 128) - 0.391 * (ubuf[uIndex] - 128);
        const B = 1.164 * (ybuf[yIndex] - 16) + 2.018 * (ubuf[uIndex] - 128);
        const rgbIndex = yIndex * 4;
        image.data[rgbIndex + 0] = R;
        image.data[rgbIndex + 1] = G;
        image.data[rgbIndex + 2] = B;
        image.data[rgbIndex + 3] = 0xff;
      }
    }
    self.postMessage(image.data.buffer, [image.data.buffer]);
  })();
}

avc.decode(Buffer.from([0, 0, 0, 1, 39, 66, 128, 40, 149, 160, 60, 4, 95, 184, 7, 137, 19, 80]));
avc.decode(Buffer.from([0, 0, 0, 1, 40, 206, 6, 242]));

self.onmessage = (e) => {
  if(e.data instanceof ArrayBuffer) {
    avc.decode(Buffer.from(e.data));
  }
}