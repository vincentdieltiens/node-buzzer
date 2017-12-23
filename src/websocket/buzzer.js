
'use strict';

import * as ip from 'ip';
import * as ws from 'nodejs-websocket';
import { Buzzer } from '../Buzzer';
import { BuzzerNotFoundError } from '../BuzzerNotFoundError';
import { BuzzerReadError } from '../BuzzerReadError';

export class WebsocketBuzzer extends Buzzer {

	constructor(port=8083) {
		super();
		this.port = port;
		this.handlers = [];
	}

	connect(timeout=0) {
		this.timeout = timeout;
		this.initWebsocket();
	}

	leave() {
		this.ws.close();
	}

	lightOn(controllerIndexes/*:any*/) {
		this.conn.send(JSON.stringify({
			'lights': controllerIndexes,
			'on': true
		}));
	}

	lightOff(controllerIndexes/*:any*/) {
		this.conn.send(JSON.stringify({
			'lights': controllerIndexes,
			'on': false
		}));
	}
	
	blink(controllerIndexes/*:Array<number>*/, times/*:number*/=5, duration/*:number*/=0.2) {
	}

	initWebsocket() {
		console.log('WebBuzzer : listening ws on '+this.port);

		let interval;
		let startTime = Date.now();
		let tick = () => {
			let currentTime = Date.now();
			if (this.timeout > 0 && currentTime - startTime > this.timeout) {
				clearInterval(interval);
				if (this.ws) {
					this.ws.close();
				}
				this.triggerEvent('error', new BuzzerNotFoundError('PS2 buzzer not found'));
			}
		};
		interval = setInterval(tick, 1000);
		tick();

		this.ws = ws.createServer((conn) => {
			this.conn = conn;

			clearInterval(interval);
			this.triggerEvent('ready');

			conn.on("text", (str/*:string*/) => {
				var data = JSON.parse(str);
				
				if (data.press != undefined) {
					var controllerIndex = data.press;
					var buttonIndex = 0;
					
					var key = 'c'+controllerIndex;
					this.callHandlers(key, controllerIndex, buttonIndex);
					this.callHandlers('all', controllerIndex, buttonIndex);					
				}
			});

			conn.on("close", (code/*:number*/, reason/*:string*/) => {
				this.conn = null;
				this.triggerEvent('leave', new BuzzerReadError(reason));
			});
		}).listen(this.port);
	}

	controllersCount()/*:number*/ {
		return 4;
	}
}
