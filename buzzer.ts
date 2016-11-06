export interface Buzzer {
	/**
	 * Attaches a listener on an event
	 * event can be "ready" or "leave"
	 */
	addEventListener(event: string, callabck: Function): void

	/**
	 * Removes a listener on an event
	 */
	removeEventListener(event: string, callback: Function): void;

	/**
	 * Frees all resources used by the buzzer
	 */
	leave(): void;

	/**
	 * Turn on the light of the buzzer
	 */
	lightOn(controllerIndexes:number): void;

	/**
	 * Turns off the light of the buzzer
	 */
	lightOff(controllerIndexes:number): void;

	/**
	 * Blinks the light of the buzzer
	 */
	blink(controllerIndexes:Array<number>, times?:number, duration?:number): void;

	/**
	 * Buzzer press listener
	 */
	onPress(callback: Function, controllerIndex?:number, buttonIndex?:number): Function;

	/**
	 * Gets the number of controllers
	 */
	controllersCount():number;
}
