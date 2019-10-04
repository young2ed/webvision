export default class Avc {
    constructor();
    decode(buffer: Buffer) : void;
    onPictureDecoded: (b: Buffer, w: number, h: number) => void;
}