let { send_msg, init_tg, buy, buy_close, sell, sell_close, get_account, set_leverage } = require('./app/message')

const express = require('express')
const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
const fs = require('fs')
let configData = fs.readFileSync("config.json");
let configJson = JSON.parse(configData);
let listenPort = configJson.listenPort;
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
    //
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
        core(r.ticker,r.action,r)
        console.log(r)
        res.json(r);
    } catch (error) {
        console.log(error)
        data.code = -3;
        data.message = '系统异常'
        res.json(data)
    }
});

//监听
app.listen(listenPort, () => {
    console.log(`本地服务监听地址:http://127.0.0.1:${listenPort}`)
})