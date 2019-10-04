'use strict';

import * as React from 'react'
import { Component } from 'react'
import { render } from 'react-dom'

import VisionCanvas from './components/vision/visioncanvas';

export interface Props { }

class App extends Component {
  props: Props;
  readonly userAgent: string;
  output: string;

  constructor(props: Props) {
    super(props);
    this.props = props;

    this.userAgent = navigator.userAgent.toLowerCase();
    const workerSupport = (() => typeof (Worker) !== "undefined")();
    const webassemblySupport = (() => {
      try {
        if (typeof WebAssembly === "object"
          && typeof WebAssembly.instantiate === "function") {
          const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
          if (module instanceof WebAssembly.Module)
            return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
        }
      } catch (e) {
      }
      return false;
    })();

    this.output = this.userAgent + (webassemblySupport ? ', webassembly supported' : ', webassembly not supported')
      + (workerSupport ? ', web worker supported' : ', web worker not supported');
  }

  render() {
    return (
      <div>
        <h1>{this.output}</h1>
        <VisionCanvas width={960} height={540} />
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));