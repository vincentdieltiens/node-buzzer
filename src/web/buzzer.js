import { WebsocketBuzzer } from '../websocket/buzzer'
import * as ip from 'ip';
import * as express from 'express';

export class WebBuzzer extends WebsocketBuzzer {
	// Express ap
	//app: express.Express

	constructor(app/*:express.Express*/, port/*:number*/=8083) {
		super(port)
		this.app = app
	}

	initWebapp() {
		this.app.get('/buzzer', (request, response) => {
			response.render('buzzer', {
				ip: ip.address(),
				port: this.port
			})
		});
	}
}