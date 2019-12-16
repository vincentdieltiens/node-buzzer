# node-buzzer

Play with buzzer of different types in Node JS (compatible with Typescript)

The types supported by default are :

  * PS2 Buzzer (HID Device)
  * Web Buzzer
  * GPIO Buzzer
  * Teensy Buzzer (HID Device)

All buzzers implement the `Buzzer` interface. Each buzzer should handling 3 events :

 * `ready` : event that must be triggered when the buzzer is ready
  * `leave` : event that must be triggered when the buzzer is not available anymore (unplugged, ...)
  * `press` : event that must be triggered when on controller button is press

Installation
------------

Add `vincentdieltiens/node-buzzer` in your dependencies in your `package.conf`

or clone this repo

```
git clone https://github.com/vincentdieltiens/node-buzzer
```

if you get an error with node-gyp, install g++.
In Ubuntu you can install it using :
```
sudo apt-get install build-essentials
```

Tests
-----

There is no automated tests as this interface with physical devices

You can test each buzzer by running the following npm tasks :

```
npm run ps2-example
npm run teensy-example
```

Unix and HID devices (Teensy or PS2)
-------------------------------------

On Unix, your script needs to be run with root permissions to access HID devices