"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rpio = require("rpio");
;
var GPIOBuzzer = (function () {
    function GPIOBuzzer(buttons) {
        this.eventListeners = { 'ready': [], 'leave': [] };
        this.buttons = buttons;
        openPins.call(this);
        this.handlers = {};
    }
    GPIOBuzzer.prototype.addEventListener = function (event, callback) {
        this.eventListeners[event].push(callback);
        if (event == 'ready') {
            callback();
        }
    };
    GPIOBuzzer.prototype.removeEventListener = function (event, callback) {
        var index = this.eventListeners[event].indexOf(callback);
        this.eventListeners[event].splice(index, 1);
    };
    GPIOBuzzer.prototype.leave = function () {
        closePins.call(this);
    };
    GPIOBuzzer.prototype.lightOn = function (controllerIndexes) {
        light.call(this, controllerIndexes, rpio.HIGH);
    };
    GPIOBuzzer.prototype.lightOff = function (controllerIndexes) {
        light.call(this, controllerIndexes, rpio.LOW);
    };
    GPIOBuzzer.prototype.blink = function (controllerIndexes, times, duration) {
        var _this = this;
        if (times === void 0) { times = 5; }
        if (duration === void 0) { duration = 150; }
        return new Promise(function (resolve) {
            for (var i = 0; i < times; i++) {
                _this.lightOn(controllerIndexes);
                rpio.msleep(duration);
                _this.lightOff(controllerIndexes);
                rpio.msleep(duration);
            }
            resolve();
        });
    };
    GPIOBuzzer.prototype.onPress = function (callback, controllerIndex, buttonIndex) {
        var _this = this;
        if (controllerIndex === void 0) { controllerIndex = undefined; }
        if (buttonIndex === void 0) { buttonIndex = undefined; }
        console.log('onPress : ');
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
    };
    GPIOBuzzer.prototype.controllersCount = function () {
        return this.buttons.length;
    };
    return GPIOBuzzer;
}());
exports.GPIOBuzzer = GPIOBuzzer;
function light(controllerIndexes, value) {
    console.log('light : ', controllerIndexes, value);
    if (typeof (controllerIndexes) == 'number') {
        console.log('LED : ', this.buttons[controllerIndexes].led);
        rpio.write(this.buttons[controllerIndexes].led, value);
    }
    else {
        for (var i = 0; i < controllerIndexes.length; i++) {
            console.log('LED : ', this.buttons[i].led);
            rpio.write(this.buttons[i].led, value);
        }
    }
}
function openPins() {
    var _this = this;
    console.log('buttons : ', this.buttons);
    this.buttons.forEach(function (pin, controllerIndex) {
        rpio.open(pin.led, rpio.OUTPUT, rpio.LOW);
        rpio.open(pin.button, rpio.INPUT);
        console.log('listening : ', pin.button);
        rpio.poll(pin.button, function () {
            var pressed = !rpio.read(pin.button);
            if (pressed) {
                var key = 'c' + controllerIndex;
                if (key in _this.handlers) {
                    callHandlers(_this.handlers[key], controllerIndex, 0);
                }
                if ('all' in _this.handlers) {
                    callHandlers(_this.handlers['all'], controllerIndex, 0);
                }
            }
        });
    });
}
function closePins() {
    console.log('close pins : ', this.buttons);
    for (var i = 0; i < this.buttons.length; i++) {
        var pin = this.buttons[i];
        rpio.poll(pin.button, null);
        this.lightOff(i);
        rpio.close(pin.led);
        rpio.close(pin.button);
    }
    console.log('endclose');
}
function callHandlers(handlers, controllerIndex, buttonIndex) {
    if (!handlers) {
        return;
    }
    for (var i in handlers) {
        handlers[i](controllerIndex, buttonIndex);
    }
}
//# sourceMappingURL=buzzer.js.map