let { cf, TA, send_msg, init_tg, buy, buy_close, sell, sell_close, get_account, set_leverage } = require('./app/message')

async function run() {
    // records(symbol, interval, limit = 1000)
    let records = await cf.records('ETHUSDT', '1h')
    let boll = TA.BOLL(records, 32)
    let upLine = boll[0]
    let midLine = boll[1]
    let downLine = boll[2]
    console.log("upLine", upLine[upLine.length - 1])
    console.log("midLine", midLine[midLine.length - 1])
    console.log("downLine", downLine[downLine.length - 1])
}

run()