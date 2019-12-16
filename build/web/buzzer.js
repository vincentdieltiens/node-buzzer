"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var buzzer_1 = require("../websocket/buzzer");
var ip = require("ip");
var WebBuzzer = (function (_super) {
    __extends(WebBuzzer, _super);
    function WebBuzzer(app, port) {
        if (port === void 0) { port = 8083; }
        var _this = _super.call(this, port) || this;
        _this.app = app;
        return _this;
    }
    WebBuzzer.prototype.initWebapp = function () {
        var _this = this;
        this.app.get('/buzzer', function (request, response) {
            response.render('buzzer', {
                ip: ip.address(),
                port: _this.port
            });
        });
    };
    return WebBuzzer;
}(buzzer_1.WebsocketBuzzer));
exports.WebBuzzer = WebBuzzer;
//# sourceMappingURL=buzzer.js.map