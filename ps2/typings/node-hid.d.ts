declare module "node-hid" {
	export class HID {
		on(event: string, callback: Function);
		write(data: any);
		close();
	}
}