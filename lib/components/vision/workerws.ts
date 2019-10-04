'use strict';

class Socket {
  url: string | undefined;
  socket: WebSocket | undefined;

  constructor() {
    (async () => {
      this.url = 'ws://192.168.1.203:8080';
      this.connect(this.url);
    })();
  }

  /**
   * 
   * This attempts connection to a websocket server
   * 
   * @param url url of server
   * 
   */
  private connect = (url: string) => {
    this.socket = new WebSocket(url);
    this.socket.binaryType = 'arraybuffer';
    this.socket.onopen = async (ev: Event) => {

    };

    this.socket.onmessage = (e: MessageEvent) => {
      if (e.data instanceof ArrayBuffer) {
        self.postMessage(e.data, [e.data]);
      }
    };
    this.socket.onerror = async (error: Event) => {
      if (this.socket)
        this.socket.close();
    };
    this.socket.onclose = async (ev: CloseEvent) => {
      setTimeout(() => {
        this.connect(url);
      }, 3000);
    };
  }
}

const socket = new Socket();