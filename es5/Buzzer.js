"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function callHandlers(handlers /*:Array<Function>*/, controllerIndex /*:number*/, buttonIndex /*:number*/) {
	if (!handlers) {
		return;
	}

	for (var i in handlers) {
		handlers[i](controllerIndex, buttonIndex);
	}
}

function throwImplementError(method) {
	throw new Error("You have to implement the " + method + " method");
}

var Buzzer = exports.Buzzer = function () {
	function Buzzer() {
		_classCallCheck(this, Buzzer);

		this.eventListeners = { 'ready': [], 'leave': [], 'error': [] };
		this.handlers = [];
	}

	_createClass(Buzzer, [{
		key: "addEventListener",
		value: function addEventListener(event /*: string*/, callback /*: Function*/) {
			this.eventListeners[event].push(callback);
		}
	}, {
		key: "removeEventListener",
		value: function removeEventListener(event /*: string*/, callback /*: Function*/) {
			var index = this.eventListeners[event].indexOf(callback);
			this.eventListeners[event].splice(index, 1);
		}
	}, {
		key: "triggerEvent",
		value: function triggerEvent(event, parameters) {
			if (event in this.eventListeners) {
				this.eventListeners[event].map(function (listener) {
					return listener.call(listener, parameters);
				});
			}
		}
	}, {
		key: "callHandlers",
		value: function callHandlers(key, controllerIndex, buttonIndex) {
			if (this.handlers && this.handlers[key]) {
				var handlers = this.handlers[key];
				for (var i in handlers) {
					handlers[i](controllerIndex, buttonIndex);
				}
			}
		}
	}, {
		key: "onPress",
		value: function onPress(callback /*: Function*/, controllerIndex /*: number*/, buttonIndex /*: number*/) /*: Function */{
			var _this = this;

			var key = 'all';
			if (controllerIndex != undefined || buttonIndex != undefined) {
				key = '';
				if (controllerIndex != undefined) {
					key = 'c' + controllerIndex;
				}
				if (buttonIndex != undefined) {
					key += 'b' + buttonIndex;
				}
			}

			if (!(key in this.handlers)) {
				this.handlers[key] = [];
			}
			this.handlers[key].push(callback);
			return function () {
				var index = _this.handlers[key].indexOf(callback);
				if (index >= 0) {
					_this.handlers[key].splice(index, 1);
				}
			};
		}
	}, {
		key: "connect",
		value: function connect() {
			var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3000;

			throwImplementError("connect");
		}
	}, {
		key: "leave",
		value: function leave() {
			throwImplementError("leave");
		}
	}, {
		key: "light",
		value: function light(controllerIndex, value) {
			throwImplementError("light");
		}
	}, {
		key: "lightOn",
		value: function lightOn(controllerIndexes) {
			throwImplementError("lightOn");
		}
	}, {
		key: "lightOff",
		value: function lightOff(controllerIndexes) {
			throwImplementError("lightOff");
		}
	}, {
		key: "blink",
		value: function blink(controllerIndexes, times, duration) {
			throwImplementError("blink");
		}
	}, {
		key: "controllersCount",
		value: function controllersCount() {
			throwImplementError("controllersCount");
		}
	}]);

	return Buzzer;
}();
//# sourceMappingURL=Buzzer.js.map
