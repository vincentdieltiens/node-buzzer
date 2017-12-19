'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _buzzer = require('./web/buzzer');

Object.defineProperty(exports, 'WebBuzzer', {
  enumerable: true,
  get: function get() {
    return _buzzer.WebBuzzer;
  }
});

var _buzzer2 = require('./gpio/buzzer');

Object.defineProperty(exports, 'GPIOBuzzer', {
  enumerable: true,
  get: function get() {
    return _buzzer2.GPIOBuzzer;
  }
});
Object.defineProperty(exports, 'GPIODomePushButton', {
  enumerable: true,
  get: function get() {
    return _buzzer2.GPIODomePushButton;
  }
});

var _buzzer3 = require('./ps2/buzzer');

Object.defineProperty(exports, 'Ps2Buzzer', {
  enumerable: true,
  get: function get() {
    return _buzzer3.Ps2Buzzer;
  }
});

var _buzzer4 = require('./teensy/buzzer');

Object.defineProperty(exports, 'TeensyBuzzer', {
  enumerable: true,
  get: function get() {
    return _buzzer4.TeensyBuzzer;
  }
});

var _buzzer5 = require('./websocket/buzzer');

Object.defineProperty(exports, 'WebsocketBuzzer', {
  enumerable: true,
  get: function get() {
    return _buzzer5.WebsocketBuzzer;
  }
});

var _BuzzerNotFoundError = require('./BuzzerNotFoundError');

Object.defineProperty(exports, 'BuzzerNotFoundError', {
  enumerable: true,
  get: function get() {
    return _BuzzerNotFoundError.BuzzerNotFoundError;
  }
});
//# sourceMappingURL=index.js.map
