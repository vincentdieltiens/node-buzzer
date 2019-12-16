"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BuzzerNotFoundError_1 = require("../BuzzerNotFoundError");
var HID = require("node-hid");
function callHandlers(handlers, controllerIndex, buttonIndex) {
    if (!handlers) {
        return;
    }
    for (var i in handlers) {
        handlers[i](controllerIndex, buttonIndex);
    }
}
var TeensyBuzzer = (function () {
    function TeensyBuzzer() {
        var _this = this;
        this.eventListeners = {
            'ready': [],
            'leave': [],
            'press': []
        };
        this.handlers = [];
        this.buzzersCount = 4;
        var devices = HID.devices();
        var deviceInfo = devices.find(function (d) {
            return d.vendorId === 0x16C0
                && d.productId === 0x0486
                && d.usagePage === 0xFFAB
                && d.usage === 0x200;
        });
        try {
            if (!deviceInfo) {
                this.device = new HID.HID(5824, 1158);
            }
            else {
                this.device = new HID.HID(deviceInfo.path);
            }
        }
        catch (e) {
            throw new BuzzerNotFoundError_1.BuzzerNotFoundError("No teensy buzzer found");
        }
        this.device.on("data", function (signal) {
            var controllerIndex = signal[0];
            callHandlers(_this.handlers['c' + controllerIndex], controllerIndex, 0);
            callHandlers(_this.handlers['all'], controllerIndex, 0);
            _this.eventListeners['press'].forEach(function (f) { return f(controllerIndex, 0); });
        });
        this.device.on("error", function () {
            _this.eventListeners['leave'].forEach(function (f) {
                f();
            });
        });
    }
    TeensyBuzzer.prototype.addEventListener = function (event, callback) {
        this.eventListeners[event].push(callback);
        if (event == 'ready') {
            callback();
        }
    };
    TeensyBuzzer.prototype.removeEventListener = function (event, callback) {
        var index = this.eventListeners[event].indexOf(callback);
        this.eventListeners[event].splice(index, 1);
    };
    TeensyBuzzer.prototype.leave = function () {
        for (var i = 0; i < this.buzzersCount; i++) {
            this.light(i, false);
        }
        this.device.close();
    };
    TeensyBuzzer.prototype.light = function (controllerIndexes, value) {
        var indexes = [];
        if (typeof (controllerIndexes) == 'number') {
            indexes = [controllerIndexes];
        }
        else {
            indexes = controllerIndexes;
        }
        for (var i = 0; i < indexes.length; i++) {
            var message = [];
            for (var j = 0; j <= 64; j++) {
                message[j] = 0x00;
            }
            message[0] = 1;
            message[1] = indexes[i];
            message[2] = value ? 1 : 0;
            this.device.write(message);
        }
    };
    TeensyBuzzer.prototype.lightOn = function (controllerIndexes) {
        this.light(controllerIndexes, 0xFF);
    };
    TeensyBuzzer.prototype.lightOff = function (controllerIndexes) {
        this.light(controllerIndexes, 0x00);
    };
    TeensyBuzzer.prototype.blink = function (controllerIndexes, times, duration, lightOnAtEnd) {
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
    TeensyBuzzer.prototype.onPress = function (callback, controllerIndex, buttonIndex) {
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
    };
    TeensyBuzzer.prototype.controllersCount = function () {
        return this.buzzersCount;
    };
    return TeensyBuzzer;
}());
exports.TeensyBuzzer = TeensyBuzzer;
//# sourceMappingURL=buzzer.js.map