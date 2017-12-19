'use strict';

import express from 'express';
import exphbs from 'express-handlebars';
import path from 'path';

import { WebBuzzer } from '../web';

let wsPort = 8124;

//
// Make express app
//
let port = 8123;
let app = express();

app.use(express.static(path.dirname(__filename)+'/public'));
app.engine('handlebars', exphbs({
	defaultLayout: 'main',
	layoutsDir: path.dirname(__filename)+'/views/layouts'
}));
app.set('views', path.dirname(__filename)+'/views');
app.set('view engine', 'handlebars');
app.get('/', (request, response) => {
	return response.render('buzzer', {
		port: wsPort
	})
});
app.listen(port, () => {
	console.log('Web app : listening on '+port);
	console.log('Go to https://127.0.0.1:'+port);
});

let buzzer = new WebBuzzer(app, wsPort);

buzzer.addEventListener('ready', () => {
	console.log('Buzzer ready ! Push any button');
	let max = buzzer.controllersCount();

	// Turn off all lights
	for(var i=0; i < max; i++) {
		buzzer.lightOff(i)
	}
});

buzzer.onPress((controllerIndex, buttonIndex) => {
	console.log('buzz !', controllerIndex, buttonIndex);
	buzzer.blink(controllerIndex, 2, 100)
});
