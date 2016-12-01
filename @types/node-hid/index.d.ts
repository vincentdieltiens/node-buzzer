declare module "node-hid" {
	export class HID {
		constructor(vid: any, pid: any)
		constructor(path: any)
		on(event: string, callback: Function);
		write(data: any);
		close();
	}

	export function devices()
}