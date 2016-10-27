declare module "rpio" {
	export const LOW: number;
	export const HIGH: number;
	export const INPUT: number;
	export const OUTPUT: number;
	export const PWM: number;

	export const PULL_OFF: number;
	export const PULL_DOWN: number;
	export const PULL_UP: number;

	export const POLL_LOW: number;
	export const POLL_HIGH: number;
	export const POLL_BOTH: number;

	export const PAD_GROUP_0_27 : number;
	export const PAD_GROUP_28_45: number;
	export const PAD_GROUP_46_53: number;

	export const PAD_DRIVE_2mA      : number;
	export const PAD_DRIVE_4mA      : number;
	export const PAD_DRIVE_6mA      : number;
	export const PAD_DRIVE_8mA      : number;
	export const PAD_DRIVE_10mA     : number;
	export const PAD_DRIVE_12mA     : number;
	export const PAD_DRIVE_14mA     : number;
	export const PAD_DRIVE_16mA     : number;
	export const PAD_HYSTERESIS     : number;
	export const PAD_SLEW_UNLIMITED : number;

	export function on(type: string, callback: Function);

	export function init(opts);
	export function open(pin:number, mode:number, init?:number);
	export function mode(pin:number, mode:number);
	export function read(pin:number);
	export function readBuf(pin, buf, len);
	export function write(pin, value);
	export function writeBuf(pin, buf, len);
	export function readpad(group);
	export function writepad(group, central);
	export function pud(pin, state);
	export function poll(pin, cb?:Function, direction?:number);
	export function close(pin);
	export function pwmSetClockDivider(divider);
	export function pwmSetRange(pin, range);
	export function pwmSetData(pin, data);
	export function i2cBegin();
	export function i2cSetSlaveAddress(addr);
	export function i2cSetClockDivider(divider);
	export function i2cSetBaudRate(baud);
	export function i2cRead(buf, len);
	export function i2cWrite(buf, len);
	export function i2cEnd();
	export function spiBegin();
	export function spiChipSelect(cs);
	export function spiSetCSPolarity(cs, active);
	export function spiSetClockDivider(divider);
	export function spiSetDataMode(mode);
	export function spiTransfer(txtbuf, rxbuf, len);
	export function spiWrite(buf, len);
	export function spiEnd();
	export function sleep(secs);
	export function msleep(msecs);
	export function usleep(usecs);

}


