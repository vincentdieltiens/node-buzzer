import { WebsocketBuzzer } from '../websocket/buzzer'
import * as express from 'express';

export class WebBuzzer extends WebsocketBuzzer {
	// Express ap
	//app: express.Express

	constructor(app/*:express.Express*/, port/*:number*/=8083) {
		super(port)
		this.app = app
	}
}