export type BuzzerEvent = 'ready' | 'leave' | 'press';

export interface Buzzer {
	/**
	 * Attaches an event listener to the event
	 * @param event the event to listen
	 * @param callabck the listener to attach and call when the event is fired
	 */
	addEventListener(event: BuzzerEvent, callabck: Function): void

	/**
	 * Removes a given listener for a given event
	 * @param event the event
	 * @param callback the listener to remove
	 */
	removeEventListener(event: BuzzerEvent, callback: Function): void;

	/**
	 * Frees all resources used by the buzzer
	 */
	leave(): void;

	/**
	 * Turn on the light of the buzzer
	 * @param controllerIndexes a controller index or an array of controller indexes
	 */
	lightOn(controllerIndexes: number | number[]): void;

	/**
	 * Turns off the light of the buzzer
	 * @param controllerIndexes a controller index or an array of controller indexes
	 */
	lightOff(controllerIndexes: number | number[]): void;

	/**
	 * Makes one or more controller to blink
	 * @param controllerIndexes a controller index or an array of controller indexes
	 * @param times (default: 5) the number of on/off cycles
	 * @param duration (default : 150) the duration of earch on/off in ms
	 * @param lightOnAtEnd (default: true) is the light on at the end of the blinking
	 * @returns a promise that will be resolved when the blinking is finished
	 */
	blink(controllerIndexes: number | number[], times?:number, duration?:number, lightOnAtEnd?: boolean): Promise<void>;

	/**
	 * Attaches an listener for the press event. The listener can be attached only to a specific controller
	 * or a specific button
	 * @param callback the listener to attach
	 * @param controllerIndex (default: null) the controller index
	 * @param buttonIndex (default: null) the button index
	 */
	onPress(callback: Function, controllerIndex?:number, buttonIndex?:number): Function;

	/**
	 * Gets the number of controllers
	 */
	controllersCount():number;
}
