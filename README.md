# node-buzzer

A node module to play with buzzer of different types.

The types supported by default are :

    * PS2 Buzzer (HID Device)
    * Web Buzzer
    * GPIO Buzzer

All buzzers implement the `Buzzer` interface. Each buzzer should handling two events :

    * `ready` : event that must be triggered when the buzzer is ready 
    * `leave`: event that must be triggered when the buzzer is not available anymore (unplugged, ...)

