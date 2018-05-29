
const WS = require('./lib/WS.js');
const Kline = require('./lib/Kline.js');
var ws, kline, _markets;

module.exports = app => {
    app.addSingleton('weexWs', createWs);
};

function createWs(config, app) {
    const client = {
        init: function (markets, fn) {
            _markets = markets;
            app.logger.info("weex-wx.initws begin=", config.url);
            ws = new WS(config.url);
            ws.open(function () {
                app.logger.info("weex-wx.initws end open", config.url);
                kline = new Kline(ws, _markets);
                return fn();
            });
        },

        buildTodaySubscribe: function () {
            app.logger.info("weex-wx.buildTodaySubscribe begin");
            kline.getTodaySubscribe(_markets, function () {
                app.logger.info("weex-wx.buildTodaySubscribe end");
            });
        },
        get0Kline: function () {
            return kline.Kline0;
        },
        get1Kline: function () {
            return kline.Kline1;
        },
        getTodaySubscribe: function () {
            return ws.todayupdate;
        }, KILNE: {
            k0: 0,
            k1: 1
        }
    }
    return client;
}