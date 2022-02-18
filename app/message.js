let { cf, cs, configJson } = require('../app/binanceApi')
const telegram = require('telegram-bot-api') //2.0.0
let tgParams = { token: configJson.teleBotToken }
if (configJson.env == "dev") {
    let http_proxy = {
        host: configJson.proxyIp,
        port: configJson.proxy
    }
    tgParams.http_proxy = http_proxy
}
let tgApi = new telegram(tgParams)
let mp = new telegram.GetUpdateMessageProvider()
tgApi.setMessageProvider(mp)

const init_tg = () => {
    tgApi.start().then(() => {
        console.log('initTG API is started')
    }).catch(res => {
        console.log(res)
    })
}

const send_msg = (msg) => {
    configJson.chat_id.map(v => {
        tgApi.sendMessage({
            chat_id: v,
            text: msg,
            parse_mode: 'Markdown'
        });
    })

    console.log(`tg:${msg}`)
}

const msg_on = () => {
    tgApi.on('update', (update) => {
        const chat_id = update.message.chat.id

        // Send text message
        tgApi.sendMessage({
            chat_id: chat_id,
            text: 'I got following message from you: *' + update.message.text + '*',
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Visit us!',
                            url: 'https://github.com/mast/telegram-bot-api'
                        }
                    ]
                ]
            }
        })
    })
}
/**
 * 合约多单买入
 * @param {*} symbol 
 * @param {*} quantity 
 * @param {*} price 
 * @returns 
 */
const buy = (symbol, quantity, price) => {
    return new Promise((resolve, reject) => {
        if (price < 0) {
            cf.newOrder(symbol, 'BUY', 'LONG', 'MARKET', { quantity: quantity }).then(res => {
                console.log('市价,开多,买入成功=>', res.status)
                resolve(res);
            }).catch(err => {
                console.log('市价,开多,买入异常=>', err)
                reject(err)
            });
        } else {
            cf.newOrder(symbol, 'BUY', 'LONG', 'LIMIT', { quantity: quantity, price: price, timeInForce: 'GTC' }).then(res => {
                console.log('限价,开多,买入成功=>', res.status)
                resolve(res);
            }).catch(err => {
                console.log('限价,开多,买入异常=>', err)
                reject(err)
            });
        }
    });
}

/**
 * 合约多单-卖出平多
 * @param {*} symbol 
 * @param {*} quantity 
 * @param {*} price 
 * @returns 
 */
const buy_close = (symbol, quantity, price) => {
    return new Promise((resolve, reject) => {
        if (price < 0) {
            cf.newOrder(symbol, 'SELL', 'LONG', 'MARKET', { quantity: quantity }).then(res => {
                console.log('市价,平多,卖出成功=>', res.status)
                resolve(res);
            }).catch(err => {
                console.log('市价,平多,卖出异常=>', err)
                reject(err)
            });
        } else {
            cf.newOrder(symbol, 'SELL', 'LONG', 'LIMIT', { quantity: quantity, price: price, timeInForce: 'GTC' }).then(res => {
                console.log('限价,平多,卖出成功=>', res.status)
                resolve(res);
            }).catch(err => {
                console.log('限价,平多,卖出异常=>', err)
                reject(err)
            });
        }
    });
}

/**
 * 合约卖出开空
 * @param {*} symbol 
 * @param {*} quantity 
 * @param {*} price 
 * @returns 
 */
const sell = (symbol, quantity, price) => {
    return new Promise((resolve, reject) => {
        if (price < 0) {
            cf.newOrder(symbol, 'SELL', 'SHORT', 'MARKET', { quantity: quantity }).then(res => {
                console.log('市价,开空,卖出成功=>', res.status)
                resolve(res);
            }).catch(err => {
                console.log('市价,开空,卖出异常=>', err)
                reject(err)
            });
        } else {
            cf.newOrder(symbol, 'SELL', 'SHORT', 'LIMIT', { quantity: quantity, price: price, timeInForce: 'GTC' }).then(res => {
                console.log('限价,开空,卖出成功=>', res.status)
                resolve(res);
            }).catch(err => {
                console.log('限价,开空,卖出异常=>', err)
                reject(err)
            });
        }
    });
}

/**
 * 合约 空单 买入平空
 * @param {*} symbol 
 * @param {*} quantity 
 * @param {*} price 
 * @returns 
 */
const sell_close = (symbol, quantity, price) => {
    return new Promise((resolve, reject) => {
        if (price < 0) {
            cf.newOrder(symbol, 'BUY', 'SHORT', 'MARKET', { quantity: quantity }).then(res => {
                console.log('市价,平空,买入成功=>', res.status)
                resolve(res);
            }).catch(err => {
                console.log('市价,平空,买入异常=>', err)
                reject(err)
            });
        } else {
            cf.newOrder(symbol, 'BUY', 'SHORT', 'LIMIT', { quantity: quantity, price: price, timeInForce: 'GTC' }).then(res => {
                console.log('限价,平空,买入成功=>', res.status)
                resolve(res);
            }).catch(err => {
                console.log('限价,平空,买入异常=>', err)
                reject(err)
            });
        }
    });
}

module.exports = {
    buy,
    buy_close,
    sell,
    sell_close,
    init_tg,
    send_msg,
    msg_on
}