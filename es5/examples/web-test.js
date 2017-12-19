'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressHandlebars = require('express-handlebars');

var _expressHandlebars2 = _interopRequireDefault(_expressHandlebars);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _web = require('../web');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var wsPort = 8124;

//
// Make express app
//
var port = 8123;
var app = (0, _express2.default)();

app.use(_express2.default.static(_path2.default.dirname(__filename) + '/public'));
app.engine('handlebars', (0, _expressHandlebars2.default)({
	defaultLayout: 'main',
	layoutsDir: _path2.default.dirname(__filename) + '/views/layouts'
}));
app.set('views', _path2.default.dirname(__filename) + '/views');
app.set('view engine', 'handlebars');
app.get('/', function (request, response) {
	return response.render('buzzer', {
		port: wsPort
	});
});
app.listen(port, function () {
	console.log('Web app : listening on ' + port);
	console.log('Go to https://127.0.0.1:' + port);
});

var buzzer = new _web.WebBuzzer(app, wsPort);

buzzer.addEventListener('ready', function () {
	console.log('Buzzer ready ! Push any button');
	var max = buzzer.controllersCount();

	// Turn off all lights
	for (var i = 0; i < max; i++) {
		buzzer.lightOff(i);
	}
});

buzzer.onPress(function (controllerIndex, buttonIndex) {
	console.log('buzz !', controllerIndex, buttonIndex);
	buzzer.blink(controllerIndex, 2, 100);
});
//# sourceMappingURL=web-test.js.map
