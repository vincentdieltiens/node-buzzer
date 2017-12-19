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
        console.log('ici');
        var devices = HID.devices();
        var deviceInfo = devices.find(function (d) {
            return d.vendorId === 0x16C0
                && d.productId === 0x0486
                && d.usagePage === 0xFFAB
                && d.usage === 0x200;
        });
        if (!deviceInfo) {
            try {
                this.device = new HID.HID(5824, 1158);
            }
            catch (e) {
                throw new BuzzerNotFoundError_1.BuzzerNotFoundError("No teensy buzzer found");
            }
        }
        else {
            this.device = new HID.HID(deviceInfo.path);
        }
        this.buzzersCount = 3;
        this.eventListeners = { 'ready': [], 'leave': [] };
        this.handlers = [];
        this.device.on("data", function (signal) {
            var controllerIndex = signal[0];
            callHandlers(_this.handlers['c' + controllerIndex], controllerIndex, 0);
            callHandlers(_this.handlers['all'], controllerIndex, 0);
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
            this.light(i, 0x00);
        }
        this.device.close();
    };
    TeensyBuzzer.prototype.light = function (controllerIndexes, value) {
        if (value != 0x00 && value != 0xFF) {
            throw new Error("light should have a value of 0x0 or 0xFF");
        }
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
        this.light(controllerIndexes, 0x0);
    };
    TeensyBuzzer.prototype.blink = function (controllerIndexes, times, duration) {
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