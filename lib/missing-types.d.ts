// https://github.com/Microsoft/TypeScript/issues/18756
interface Window {
	PointerEvent: typeof PointerEvent;
	Touch: typeof Touch;
	postMessage(msg: any): void;
	postMessage(msg: any, []): void;
}

interface PointerEvent {
	getCoalescedEvents(): PointerEvent[];
}