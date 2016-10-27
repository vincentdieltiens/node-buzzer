/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/ip/index.d.ts" />
/// <reference path="../node_modules/@types/express/index.d.ts" />
/// <reference path="./typings/nodejs-websocket.d.ts" />
'use strict';
var ip = require('ip');
var ws = require('nodejs-websocket');
function callHandlers(handlers, controllerIndex, buttonIndex) {
    if (!handlers) {
        return;
    }
    for (var i in handlers) {
        handlers[i](controllerIndex, buttonIndex);
    }
}
var WebBuzzer = (function () {
    function WebBuzzer(app, port) {
        if (port === void 0) { port = 8083; }
        this.port = port;
        this.app = app;
        this.handlers = [];
        this.eventListeners = { 'ready': [], 'leave': [] };
        this.initWebapp();
        this.initWebsocket();
    }
    WebBuzzer.prototype.addEventListener = function (event, callback) {
        this.eventListeners[event].push(callback);
        if (event == 'ready' && this.conn) {
            callback();
        }
    };
    WebBuzzer.prototype.removeEventListener = function (event, callback) {
        var index = this.eventListeners[event].indexOf(callback);
        this.eventListeners[event].splice(index, 1);
    };
    WebBuzzer.prototype.leave = function () {
        this.ws.close();
    };
    WebBuzzer.prototype.lightOn = function (controllerIndexes) {
        this.conn.send(JSON.stringify({
            'lights': controllerIndexes,
            'on': true
        }));
    };
    WebBuzzer.prototype.lightOff = function (controllerIndexes) {
        this.conn.send(JSON.stringify({
            'lights': controllerIndexes,
            'on': false
        }));
    };
    WebBuzzer.prototype.blink = function (controllerIndexes, times, duration) {
        if (times === void 0) { times = 5; }
        if (duration === void 0) { duration = 0.2; }
    };
    WebBuzzer.prototype.onPress = function (callback, controllerIndex, buttonIndex) {
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
    WebBuzzer.prototype.initWebapp = function () {
        var _this = this;
        this.app.get('/buzzer', function (request, response) {
            response.render('buzzer', {
                ip: ip.address(),
                port: _this.port
            });
        });
    };
    WebBuzzer.prototype.initWebsocket = function () {
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
    WebBuzzer.prototype.controllersCount = function () {
        return 4;
    };
    return WebBuzzer;
}());
exports.WebBuzzer = WebBuzzer;
