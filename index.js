let { send_msg, init_tg, buy, buy_close, sell, sell_close, get_account, set_leverage,msg_on, cf, configJson } = require('./app/message')

const express = require('express')
const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
// const fs = require('fs')
// let configData = fs.readFileSync("config.json");
// let configJson = JSON.parse(configData);
let listenPort = configJson.listenPort;
let symbol = "";
init_tg()

async function core(ticker, action, msg = {}) {
    send_msg(`OCC信号提醒:${JSON.stringify(msg)}`)
    let acc = await get_account();
    let posL = null;
    let posS = null;
    acc.data.positions.map(v => {
        if (Number(v.positionAmt) > 0 && v.symbol == ticker) {
            posL = v;
        }
        if (Number(v.positionAmt) < 0 && v.symbol == ticker) {
            posS = v;
        }
    });

    await set_leverage(ticker, configJson.leverge);
    console.log(`修改杠杆:${ticker},${configJson.leverge}`)
    //
    if (action == 'buy') {
        //开多
        let r1 = await buy(ticker, configJson.quantity, -1)
        console.log(`买入开多=>:${r1.status}`)
        if (posS != null) {
            //平空
            let r2 = await sell_close(ticker, -Number(posS.positionAmt), -1)
            console.log(`买平空=>:${r2.status}`)
        }
    }
    if (action == 'sell') {
        //开空
        let r3 = await sell(ticker, configJson.quantity, -1)
        console.log(`卖出开空=>:${r3.status}`)
        if (posL != null) {
            //平多
            let r4 = await buy_close(ticker, Number(posL.positionAmt), -1)
            console.log(`卖出平多=>:${r4.status}`)
        }
    }
}

// core('ETHUSDT', 'sell', { ticker: 'ETHUSDT', position: 'long', action: 'buy', price: '2896.21' })
// { "ticker": "ETHUSDT", "position": "long", "action": "buy", "price": 2896.21 }
app.post("/api/botmsg", function (req, res) {
    let data = { code: 200, message: 'ok' }
    try {
        let r = req.body
        symbol = r.ticker;
        core(r.ticker, r.action, r)
        console.log(r)
        res.json(r);
    } catch (error) {
        console.log(error)
        data.code = -3;
        data.message = '系统异常'
        res.json(data)
    }
});
let onPftData = {}
let onPftData2 = {}
//监听收益
async function onPft() {
    let acc = await get_account();
    let pos = [];
    acc.data.positions.map(v => {
        if (Number(v.positionAmt) != 0) {
            pos.push(v);
        }
    });
    pos.map(v => {
        cf.price({ symbol: v.symbol }).then(pData => {
            //多单
            if (Number(v.positionAmt) > 0) {
                //触发止盈阀值
                let p1 = Number(pData.data.price);
                let p2 = Number(v.entryPrice) * (1 + configJson.pft);
                if (p1 > p2) {
                    //回撤止盈
                    let pftData = onPftData[v.symbol]
                    if (pftData == undefined || pftData == 0) {
                        onPftData[v.symbol] = Number(pData.data.price)
                    } else {
                        let maxPrice = Math.max(onPftData[v.symbol], Number(pData.data.price))
                        onPftData[v.symbol] = maxPrice
                    }
                    //回测止盈
                    if (Number(pData.data.price) < onPftData[v.symbol] * (1 - configJson.pftBack)) {
                        buy_close(v.symbol, Number(v.positionAmt), -1).then(r2 => {
                            onPftData[v.symbol] = 0;
                            send_msg(`多单--回撤止盈平仓`)
                            console.log(`多单--回撤止盈平仓`, r2.status)
                        })
                    }
                }
            }
            //空单
            if (Number(v.positionAmt) < 0) {
                //触发止盈阀值
                let p1 = Number(pData.data.price);
                let p2 = Number(v.entryPrice) * (1 - configJson.pft);
                if (p1 < p2) {
                    //回撤止盈
                    let pftData2 = onPftData2[v.symbol]
                    if (pftData2 == undefined || pftData2 == 0) {
                        onPftData2[v.symbol] = Number(pData.data.price)
                    } else {
                        let minPrice = Math.min(onPftData2[v.symbol], Number(pData.data.price))
                        onPftData2[v.symbol] = minPrice
                    }
                    //回测止盈
                    if (Number(pData.data.price) > onPftData2[v.symbol] * (1 - configJson.pftBack)) {
                        sell_close(v.symbol, -Number(v.positionAmt), -1).then(r3 => {
                            onPftData2[v.symbol] = 0;
                            send_msg(`空单--回撤止盈平仓`)
                            console.log(`空单--回撤止盈平仓`, r3.status)
                        })
                    }
                }
            }
        });
    });
}
msg_on()
//监听
app.listen(listenPort, () => {
    console.log(`本地服务监听地址:http://127.0.0.1:${listenPort}`)
})

setInterval(() => {
    try {
        if (symbol != "") {
            onPft()
        }
    } catch (err) {
        send_msg(err)
        console.log(err)
    }
}, 1000);