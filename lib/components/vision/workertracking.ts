'use strict';

// TODO: create typings
const cv = require('./opencv');

// TODO: not hard-code
const width = 960;
const height = 540;
// Process one of every x messages
const skip = 6;
let counter = 0;

let init = false;
let fgmask: any = undefined;
let fgbg: any = undefined;
let ksize: any = undefined;
let ematrix: any = undefined;
let dmatrix: any = undefined;
let anchor: any = undefined;
let ccolor: any = undefined;
let rcolor: any = undefined;

cv.onRuntimeInitialized = () => {
  fgmask = new cv.Mat(width, height, cv.CV_8UC1);
  fgbg = new cv.BackgroundSubtractorMOG2(200, 20, true);  //500, 16
  ksize = new cv.Size(5, 5);
  ematrix = cv.Mat.ones(4, 4, cv.CV_8U);
  dmatrix = cv.Mat.ones(8, 8, cv.CV_8U);
  anchor = new cv.Point(-1, -1);
  ccolor = new cv.Scalar(0, 255, 0);
  rcolor = new cv.Scalar(255, 0, 0);
  init = true;
}

self.onmessage = (e) => {
  if (++counter === skip) counter = 0;
  else return;

  if (init) {
    let src = cv.matFromImageData(new ImageData(new Uint8ClampedArray(e.data as ArrayBuffer), width, height));
    let dst = new cv.Mat();

    cv.GaussianBlur(src, src, ksize, 0, 0, cv.BORDER_DEFAULT);

    fgbg.apply(src, fgmask);

    cv.erode(src, src, ematrix, anchor, 2, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.dilate(src, src, dmatrix, anchor, 8, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    cv.findContours(fgmask, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    cv.cvtColor(fgmask, dst, cv.COLOR_GRAY2RGB, 0);

    for (let i = 0; i < contours.size(); ++i) {
      let cnt = contours.get(i);
      let area = cv.contourArea(cnt, false);

      if (area < 300 /*|| area > 30000*/) continue;

      // let moments = cv.moments(cnt, false);
      // let cx = moments['m10'] / moments['m00'];
      // let cy = moments['m01'] / moments['m00'];

      let rect = cv.boundingRect(cnt);

      cv.drawContours(dst, contours, i, ccolor, 1, cv.LINE_8, hierarchy, 100);
      cv.rectangle(dst, new cv.Point(rect.x, rect.y), new cv.Point(rect.x + rect.width, rect.y + rect.height), rcolor, 2, cv.LINE_AA, 0);
    }

    cv.cvtColor(dst, dst, cv.COLOR_RGB2RGBA, 0);

    const image = new ImageData(new Uint8ClampedArray(dst.data, dst.cols, dst.rows), dst.cols, dst.rows);
    self.postMessage(image.data.buffer, [image.data.buffer]);

    src.delete(); dst.delete();
  }
  else {
    if (e.data instanceof ArrayBuffer) {
      self.postMessage(e.data, [e.data]);
    }
  }
}