"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var buzzer_1 = require("../ps2/buzzer");
var buzzer = new buzzer_1.Ps2Buzzer();
buzzer.addEventListener('ready', function () {
    console.log('ready');
});
buzzer.addEventListener('leave', function () {
    console.log('disconnected');
});
buzzer.addEventListener('press', function (controllerIndex, buttonIndex) {
    console.log('press ', controllerIndex, buttonIndex);
    buzzer.blink(controllerIndex, 4, 100, true).then(function () {
        console.log('blink finished');
    });
});
buzzer.onPress(function (controllerIndex, buttonIndex) {
    console.log('special press on first controller, top button');
}, 0, 0);
buzzer.lightOn(0);
//# sourceMappingURL=ps2-example.js.map