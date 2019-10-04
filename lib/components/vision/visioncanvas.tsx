'use strict';

import React, { Component } from 'react';

export interface Props {
  width: number,
  height: number
}

export default class AsyncCanvas extends Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  componentDidMount() {
    const c0 = this.refs.r0 as HTMLCanvasElement | undefined;
    if (c0 === undefined) {
      return;
    }
    const ctx0 = c0.getContext('2d');
    if (ctx0 === null) {
      return;
    }

    const c1 = this.refs.r1 as HTMLCanvasElement | undefined;
    if (c1 === undefined) {
      return;
    }
    const ctx1 = c1.getContext('2d');
    if (ctx1 === null) {
      return;
    }

    const wsworker = new Worker('./workerws.ts');
    const avcworker = new Worker('./workeravc.ts');
    const cvworker = new Worker('./workertracking.ts');

    cvworker.onmessage = e => {
      if (e.data instanceof ArrayBuffer) {
        const cvimg = new ImageData(new Uint8ClampedArray(e.data), this.props.width, this.props.height);
        ctx1.putImageData(cvimg, 0, 0);
      }
    }

    avcworker.onmessage = e => {
      if (e.data instanceof ArrayBuffer) {
        const avcimg = new ImageData(new Uint8ClampedArray(e.data), this.props.width, this.props.height);
        ctx0.putImageData(avcimg, 0, 0);
        cvworker.postMessage(e.data, [e.data]);
      }
    }

    wsworker.onmessage = e => {
      if (e.data instanceof ArrayBuffer) {
        avcworker.postMessage(e.data, [e.data]);
      }
    }
  }

  render() {
    return (
      <div>
        <canvas id='c0' ref='r0' width={this.props.width} height={this.props.height} />
        <canvas id='c1' ref='r1' width={this.props.width} height={this.props.height} />
      </div>
    );
  }
}