import { Buzzer } from "../buzzer";
import { Ps2Buzzer } from "../ps2/buzzer";

//
// HID only works when run as root under unix
//
const buzzer: Buzzer = new Ps2Buzzer();

buzzer.addEventListener('ready', () => {
    // Buzzer connected
    console.log('ready')
});

buzzer.addEventListener('leave', () => {
    // Buzzer disconnected
    console.log('disconnected');
});

buzzer.addEventListener('press', (controllerIndex: number, buttonIndex: number) => {
    console.log('press ', controllerIndex, buttonIndex);
    buzzer.blink(controllerIndex, 4, 100, true).then(() => {
        console.log('blink finished')
    });
});

buzzer.onPress((controllerIndex, buttonIndex) => {
    console.log('special press on first controller, top button');
}, 0, 0);

buzzer.lightOn(0);