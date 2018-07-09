
const WebSocket = require('ws');


class WS {
  constructor(wsurl) {
    this.wsurl = wsurl;// 类中变量
    this.id = 0;
    this.pool = {};
    this.todayupdate = {
      "USD": {}, "BTC": {}
    }

    this.m_bError = false;
    this.m_lastUpdate = new Date().getTime();
    this.m_nCount = 0;
  }



  open(fn) {
    const _this = this;
    this.ws = new WebSocket(this.wsurl);
    this.ws.on('open', function () {
      console.log('WebSocket open');
      return fn();
    });

    this.ws.on('close', function () {
      console.log('WebSocket close');
      _this.m_bError = true;
    });

    this.ws.on('error', function () {
      console.log('WebSocket error');
      _this.m_bError = true;
    });

    this.ws.on('pong', function () {
      _this.m_lastUpdate = new Date().getTime();
      //console.log("[WS.pong]", _this.m_nCount++);
    });

    this.ws.on('ping', function () {
      _this.ws.pong(function noop() {});
      //console.log("[WS.ping]");
    });

    this.ws.on('message', function incoming(data) {
      _this.m_lastUpdate = new Date().getTime();
      try {
        data = JSON.parse(data);
        if (data.method == "today.update") {
          let getPriceChange = function (v1, v2) {
            if (v2 == null ||
              v2 == 0) {
              return {
                priceChange: "$0",
                priceChangePercent: "0.00%"
              }
            }
            v1 == null ? 0 : v1;
            return {
              priceChange: "$" + Math.abs((v1 - v2).toFixed(4)),
              priceChangePercent: ((v1 - v2) / v2 * 100).toFixed(4) + "%"
            }
          };
          data = data.params;    
          
          let symbol = data[0];
          data = data[1];
          data.last = Number(data.last);
          data.open = Number(data.open);

          let results = getPriceChange(data.last, data.open);
          results.market = symbol;
          results.open = data.open;
          results.last = data.last;
          if (symbol.substr(symbol.length - 3, symbol.length) == "USD") {
            _this.todayupdate.USD[symbol] = results;
          } else {
            _this.todayupdate.BTC[symbol] = results;
          }
          console.log("today.update....", symbol);
          return;
        }
        _this.pool[data.id](data);
      } catch (error) {
        console.log('WS.open.message err', error, data);
      }

    });
  }

  send(arg, cb) {
    this.pool[this.id] = cb;
    arg.id = this.id++;
    this.ws.send(JSON.stringify(arg));
  }

  IsAlive(){
    let nSub = new Date().getTime() - this.m_lastUpdate;
    if(false == this.m_bError && nSub<1*1000*60){
      return true;
    }

    return false;
  }

  DoPing(){
    this.ws.ping(function noop() {});
  }

}
module.exports = WS;
