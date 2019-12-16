'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var HID = require("node-hid");
var BuzzerNotFoundError_1 = require("../BuzzerNotFoundError");
var signals = [
    [0, 0, 1, 0, 240],
    [0, 0, 16, 0, 240],
    [0, 0, 8, 0, 240],
    [0, 0, 4, 0, 240],
    [0, 0, 2, 0, 240],
    [0, 0, 32, 0, 240],
    [0, 0, 0, 2, 240],
    [0, 0, 0, 1, 240],
    [0, 0, 128, 0, 240],
    [0, 0, 64, 0, 240],
    [0, 0, 0, 4, 240],
    [0, 0, 0, 64, 240],
    [0, 0, 0, 32, 240],
    [0, 0, 0, 16, 240],
    [0, 0, 0, 8, 240],
    [0, 0, 0, 128, 240],
    [0, 0, 0, 0, 248],
    [0, 0, 0, 0, 244],
    [0, 0, 0, 0, 242],
    [0, 0, 0, 0, 241]
];
function signalsEqual(a, b) {
    for (var i = 0; i < 5; i++) {
        if (a[i] !== b[i]) {
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
        if (device === void 0) { device = null; }
        this.lights = [0x0, 0x0, 0x0, 0x0];
        this.handlers = [];
        this.eventListeners = {
            'ready': [],
            'leave': [],
            'press': []
        };
        try {
            this.device = device;
            if (this.device === null) {
                this.device = new HID.HID(0x054c, 0x1000);
            }
        }
        catch (e) {
            throw new BuzzerNotFoundError_1.BuzzerNotFoundError("No PS2 buzzer found");
        }
        this.device.on("data", function (signal) {
            var signalIndex = searchSignalIndex(signal);
            if (signalIndex >= 0) {
                var controllerIndex_1 = Math.floor(signalIndex / 5);
                var buttonIndex_1 = signalIndex % 5;
                var key = 'c' + controllerIndex_1 + 'b' + buttonIndex_1;
                callHandlers(_this.handlers[key], controllerIndex_1, buttonIndex_1);
                key = 'c' + controllerIndex_1;
                callHandlers(_this.handlers[key], controllerIndex_1, buttonIndex_1);
                callHandlers(_this.handlers['all'], controllerIndex_1, buttonIndex_1);
                _this.eventListeners['press'].forEach(function (f) { return f(controllerIndex_1, buttonIndex_1); });
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
        this.light([0, 1, 2, 3], false);
        this.device.close();
    };
    Ps2Buzzer.prototype.light = function (controllerIndexes, value) {
        var message = [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0];
        if (typeof (controllerIndexes) == 'number') {
            this.lights[controllerIndexes] = value ? 0xFF : 0x00;
        }
        else {
            for (var ctrl in controllerIndexes) {
                this.lights[controllerIndexes[ctrl]] = value ? 0xFF : 0x00;
            }
        }
        for (var i in this.lights) {
            var j = parseInt(i, 10) + 2;
            message[j] = this.lights[i];
        }
        this.device.write(message);
    };
    Ps2Buzzer.prototype.lightOn = function (controllerIndexes) {
        this.light(controllerIndexes, true);
    };
    Ps2Buzzer.prototype.lightOff = function (controllerIndexes) {
        this.light(controllerIndexes, false);
    };
    Ps2Buzzer.prototype.isLightOn = function (controllerIndex) {
        return this.lights[controllerIndex] === '0xFF';
    };
    Ps2Buzzer.prototype.blink = function (controllerIndexes, times, duration, lightOnAtEnd) {
        var _this = this;
        if (times === void 0) { times = 5; }
        if (duration === void 0) { duration = 150; }
        if (lightOnAtEnd === void 0) { lightOnAtEnd = true; }
        return new Promise(function (resolve, reject) {
            var on = true;
            var count = 1;
            var totalTimes = times * 2 - (lightOnAtEnd ? 1 : 0);
            var _update = function () {
                if (count > totalTimes) {
                    clearInterval(interval);
                    resolve();
                    return;
                }
                if (on) {
                    _this.lightOn(controllerIndexes);
                }
                else {
                    _this.lightOff(controllerIndexes);
                }
                count++;
                on = !on;
            };
            _update();
            var interval = setInterval(_update, duration);
        });
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
//# sourceMappingURL=buzzer.js.map