'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var ws = require("nodejs-websocket");
function callHandlers(handlers, controllerIndex, buttonIndex) {
    if (!handlers) {
        return;
    }
    for (var i in handlers) {
        handlers[i](controllerIndex, buttonIndex);
    }
}
var WebsocketBuzzer = (function () {
    function WebsocketBuzzer(port) {
        if (port === void 0) { port = 8083; }
        this.port = port;
        this.handlers = [];
        this.eventListeners = { 'ready': [], 'leave': [] };
        this.initWebsocket();
    }
    WebsocketBuzzer.prototype.addEventListener = function (event, callback) {
        this.eventListeners[event].push(callback);
        if (event == 'ready' && this.conn) {
            callback();
        }
    };
    WebsocketBuzzer.prototype.removeEventListener = function (event, callback) {
        var index = this.eventListeners[event].indexOf(callback);
        this.eventListeners[event].splice(index, 1);
    };
    WebsocketBuzzer.prototype.leave = function () {
        this.ws.close();
    };
    WebsocketBuzzer.prototype.lightOn = function (controllerIndexes) {
        this.conn.send(JSON.stringify({
            'lights': controllerIndexes,
            'on': true
        }));
    };
    WebsocketBuzzer.prototype.lightOff = function (controllerIndexes) {
        this.conn.send(JSON.stringify({
            'lights': controllerIndexes,
            'on': false
        }));
    };
    WebsocketBuzzer.prototype.blink = function (controllerIndexes, times, duration) {
        if (times === void 0) { times = 5; }
        if (duration === void 0) { duration = 0.2; }
        return new Promise(function (resolve) {
            resolve();
        });
    };
    WebsocketBuzzer.prototype.onPress = function (callback, controllerIndex, buttonIndex) {
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
    WebsocketBuzzer.prototype.initWebsocket = function () {
        var _this = this;
        console.log('WebBuzzer : listening ws on ' + this.port);
        this.ws = ws.createServer(function (conn) {
            _this.conn = conn;
            _this.eventListeners['ready'].forEach(function (f) {
                f();
            });
            conn.on("text", function (str) {
                var data = JSON.parse(str);
                if (data.press != undefined) {
                    var controllerIndex = data.press;
                    var buttonIndex = 0;
                    var key = 'c' + controllerIndex;
                    callHandlers(_this.handlers[key], controllerIndex, buttonIndex);
                    callHandlers(_this.handlers['all'], controllerIndex, buttonIndex);
                }
            });
            conn.on("close", function (code, reason) {
                _this.conn = null;
                _this.eventListeners['leave'].forEach(function (f) {
                    f();
                });
            });
        }).listen(this.port);
    };
    WebsocketBuzzer.prototype.controllersCount = function () {
        return 4;
    };
    return WebsocketBuzzer;
}());
exports.WebsocketBuzzer = WebsocketBuzzer;
//# sourceMappingURL=buzzer.js.map