"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var teensy_1 = require("../teensy");
var buzzer = new teensy_1.TeensyBuzzer();
buzzer.addEventListener('ready', function () {
    console.log('ready');
});
buzzer.addEventListener('leave', function () {
    console.log('disconnected');
});
buzzer.addEventListener('press', function (controllerIndex, buttonIndex) {
    console.log('press ', controllerIndex, buttonIndex);
    buzzer.blink(controllerIndex, 4, 100, true).then(function () {
        console.log('blinking finished');
    });
});
buzzer.onPress(function (controllerIndex, buttonIndex) {
    console.log('special press on first controller, top button');
}, 0, 0);
buzzer.lightOn(0);
//# sourceMappingURL=teensy-example.js.map