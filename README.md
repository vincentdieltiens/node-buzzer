# node-buzzer

A node module to play with buzzer of different types.

The types supported by default are :

* PS2 Buzzer (HID Device)
* Teensy Buzzer (Custom buzzer as HID Device using Teensy)
* Web Buzzer
* GPIO Buzzer
* Websocket Buzzer

This library is using [node-hid](https://github.com/node-hid/node-hid) to play with HID protocol.

Installation
------------

```bash
# fetch sources
git clone https://github.com/vincentdieltiens/node-buzzer.git

# build es6 sources to es5 if needed
cd node-buzzer
npm run build
```

Playing with PS2 Buzzer
-----------------------
PS2 buzzer is using HID protocol (vendorId: 0x054c, productId: 0x100).

```javascript
// importing PS2 buzzer
import { Ps2Buzzer, BuzzerNotFoundError } from 'node-buzzer';

// Trying to "connect" to PS2 buzzer
let buzzer = new Ps2Buzzer();
let timeout = 5000; // 5000 ms / 5 s
buzzer.addEventListener('ready', () => {
    // Buzzer ready
});

buzzer.addEventListener('error', (e) => {
    // Buzzer error
    // a BuzzerNotFoundError if the buzzer is not found before the timeout
    // a BuzzerReadError if the buzzer is disconnected
});

// Buzzer pressing callback
// controllerIndex : 0 to 3 to tell with controller buzzed
// buttonIndex : 0 to 4 to tell with button has been pressed (0: big dome button, 1: blue, 2: orange: 3: green, 4: yellow)
buzzer.onPress((controllerIndex, buttonIndex) => {
    console.log('buzz !', controllerIndex, buttonIndex);
    buzzer.blink(controllerIndex, 2, 100)
});

buzzer.connect(timeout);
```

**Restriction :** PS2 Controllers can not be controlled independently. By example: you can't make then blink separately. This is because it uses one message to speak to all the controllers. By example to turn on buzzer 1 and 2 it sends something like this `[off, on, on, off]`

This library allows you to turn on/off the controllers separately because it keep in memory the status of all the controllers :

```javacsript
buzzer.turnOn(0);
buzzer.turnOn(1);
buzzer.turnOff(0);
buzzer.turnOn(2);
// Status at this point : [off, on, on, off]
```
Playing with Teensy Buzzer
-----------------------
Teensy buzzer is one buzzer I've made using the [teensy board](https://www.pjrc.com/teensy/). This board allows to make HID devices easily (like a mouse, a keyboard... or a buzzer).

As for the PS2 buzzer, the HID protocol lets to interact with a computer. But unlike the PS2 buzzer, it need one message per controller. It allows to interacts with buzzers independently, it's more flexible.

```javascript
import { TeensyBuzzer } from 'node-buzzer';

let buzzer = new TeensyBuzzer(); // Exception trigger is no buzzer plugged in
let timeout = 5000; // 5000 ms / 5 s

buzzer.addEventListener('ready', () => {
    console.log('Buzzer ready ! Push any button');
    let max = buzzer.controllersCount();
    // Turn off all lights
    for(var i=0; i < max; i++) {
        buzzer.lightOff(i)
    }
});

buzzer.addEventListener('error', (e) => {
    // Buzzer error
    // a BuzzerNotFoundError if the buzzer is not found before the timeout
    // a BuzzerReadError if the buzzer is disconnected
});

buzzer.onPress((controllerIndex, buttonIndex) => {
    console.log('buzz !', controllerIndex, buttonIndex);
    buzzer.blink(controllerIndex, 2, 100)
});

buzzer.connect(timeout);
```

NB : contact me if you need more informations about my own buzzer :)

Create new Buzzers
------------------
All buzzers extend the 'Buzzer' super class and "respect" the following interface :
```typescript
/**
 * Attaches a listener on an event
 * event can be "ready" or "leave"
 */
addEventListener(event: string, callabck: Function): void

/**
 * Removes a listener on an event
 */
removeEventListener(event: string, callback: Function): void;

/**
 * Removes a listener on an event
 * if timeout > 0, a timeout is set
 */
connect(timeout): void;

/**
 * Frees all resources used by the buzzer
 */
leave(): void;

/**
 * Turn on the light of the buzzer
 */
lightOn(controllerIndexes:number): void;

/**
 * Turns off the light of the buzzer
 */
lightOff(controllerIndexes:number): void;

/**
 * Blinks the light of the buzzer
 */
blink(controllerIndexes:Array<number>, times?:number, duration?:number): void;

/**
 * Buzzer press listener
 */
onPress(callback: Function, controllerIndex?:number, buttonIndex?:number): Function;

/**
 * Gets the number of controllers
 */
controllersCount():number;
```

Each buzzer should handling two events :

* `ready` : event that must be triggered when the buzzer is ready 
* `leave`: event that must be triggered when the buzzer is not available anymore (unplugged, ...)

