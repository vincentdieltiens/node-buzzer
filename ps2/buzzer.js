/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="./typings/node-hid.d.ts" />
'use strict';
var signals = [
    // controller 1
    [0, 0, 1, 0, 240],
    [0, 0, 16, 0, 240],
    [0, 0, 8, 0, 240],
    [0, 0, 4, 0, 240],
    [0, 0, 2, 0, 240],
    // controller 2
    [0, 0, 32, 0, 240],
    [0, 0, 0, 2, 240],
    [0, 0, 0, 1, 240],
    [0, 0, 128, 0, 240],
    [0, 0, 64, 0, 240],
    // controller 3
    [0, 0, 0, 4, 240],
    [0, 0, 0, 64, 240],
    [0, 0, 0, 32, 240],
    [0, 0, 0, 16, 240],
    [0, 0, 0, 8, 240],
    // controller 4
    [0, 0, 0, 128, 240],
    [0, 0, 0, 0, 248],
    [0, 0, 0, 0, 244],
    [0, 0, 0, 0, 242],
    [0, 0, 0, 0, 241]
];
function signalsEqual(a, b) {
    for (var i = 0; i < 5; i++) {
        if (a[i] != b[i]) {
            return false;
        }
    }
    return true;
}
function searchSignalIndex(signal) {
    for (var i = 0; i < signals.length; i++) {
        if (signalsEqual(signal, signals[i])) {
            return i;
        }
    }
    return -1;
}
function callHandlers(handlers, controllerIndex, buttonIndex) {
    if (!handlers) {
        return;
    }
    for (var i in handlers) {
        handlers[i](controllerIndex, buttonIndex);
    }
}
var Ps2Buzzer = (function () {
    function Ps2Buzzer(device) {
        var _this = this;
        this.device = device;
        this.eventListeners = { 'ready': [], 'leave': [] };
        this.lights = [0x0, 0x0, 0x0, 0x0];
        this.handlers = [];
        this.device.on("data", function (signal) {
            var signalIndex = searchSignalIndex(signal);
            if (signalIndex >= 0) {
                var controllerIndex = Math.floor(signalIndex / 5);
                var buttonIndex = signalIndex % 5;
                var key = 'c' + controllerIndex + 'b' + buttonIndex;
                callHandlers(_this.handlers[key], controllerIndex, buttonIndex);
                key = 'c' + controllerIndex;
                callHandlers(_this.handlers[key], controllerIndex, buttonIndex);
                callHandlers(_this.handlers['all'], controllerIndex, buttonIndex);
            }
        });
        this.device.on("error", function () {
            _this.eventListeners['leave'].forEach(function (f) {
                f();
            });
        });
    }
    Ps2Buzzer.prototype.addEventListener = function (event, callback) {
        this.eventListeners[event].push(callback);
        if (event == 'ready') {
            callback();
        }
    };
    Ps2Buzzer.prototype.removeEventListener = function (event, callback) {
        var index = this.eventListeners[event].indexOf(callback);
        this.eventListeners[event].splice(index, 1);
    };
    Ps2Buzzer.prototype.leave = function () {
        this.light([0, 1, 2, 3], 0x00);
        this.device.close();
    };
    Ps2Buzzer.prototype.light = function (controllerIndexes, value) {
        if (value != 0x00 && value != 0xFF) {
            throw new Error("light should have a value of 0x0 or 0xFF");
        }
        var message = [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0];
        if (typeof (controllerIndexes) == 'number') {
            this.lights[controllerIndexes] = value;
        }
        else {
            for (var ctrl in controllerIndexes) {
                this.lights[controllerIndexes[ctrl]] = value;
            }
        }
        for (var i in this.lights) {
            var j = parseInt(i, 10) + 2;
            message[j] = this.lights[i];
        }
        this.device.write(message);
    };
    Ps2Buzzer.prototype.lightOn = function (controllerIndexes) {
        this.light(controllerIndexes, 0xFF);
    };
    Ps2Buzzer.prototype.lightOff = function (controllerIndexes) {
        this.light(controllerIndexes, 0x0);
    };
    Ps2Buzzer.prototype.blink = function (controllerIndexes, times, duration) {
        if (times === void 0) { times = 5; }
        if (duration === void 0) { duration = 150; }
        var on = true;
        var count = 0;
        var interval = setInterval(function () {
            if (on) {
                if (count > times) {
                    clearInterval(interval);
                    return;
                }
                this.lightOn(controllerIndexes);
                count++;
            }
            else {
                this.lightOff(controllerIndexes);
            }
            on = !on;
        }, duration);
    };
    Ps2Buzzer.prototype.onPress = function (callback, controllerIndex, buttonIndex) {
        var _this = this;
        if (controllerIndex === void 0) { controllerIndex = undefined; }
        if (buttonIndex === void 0) { buttonIndex = undefined; }
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
    Ps2Buzzer.prototype.controllersCount = function () {
        return 4;
    };
    return Ps2Buzzer;
}());
exports.Ps2Buzzer = Ps2Buzzer;
