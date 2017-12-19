'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.WebBuzzer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _buzzer = require('../websocket/buzzer');

var _ip = require('ip');

var ip = _interopRequireWildcard(_ip);

var _express = require('express');

var express = _interopRequireWildcard(_express);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebBuzzer = exports.WebBuzzer = function (_WebsocketBuzzer) {
	_inherits(WebBuzzer, _WebsocketBuzzer);

	// Express ap
	//app: express.Express

	function WebBuzzer(app /*:express.Express*/) {
		var port /*:number*/ = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8083;

		_classCallCheck(this, WebBuzzer);

		var _this = _possibleConstructorReturn(this, (WebBuzzer.__proto__ || Object.getPrototypeOf(WebBuzzer)).call(this, port));

		_this.app = app;
		return _this;
	}

	_createClass(WebBuzzer, [{
		key: 'initWebapp',
		value: function initWebapp() {
			var _this2 = this;

			this.app.get('/buzzer', function (request, response) {
				response.render('buzzer', {
					ip: ip.address(),
					port: _this2.port
				});
			});
		}
	}]);

	return WebBuzzer;
}(_buzzer.WebsocketBuzzer);
//# sourceMappingURL=buzzer.js.map
