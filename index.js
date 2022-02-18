const express = require('express')
const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
const fs = require('fs')
let configData = fs.readFileSync("config.json");
let configJson = JSON.parse(configData);
let listenPort = configJson.listenPort;


app.get('/api/botmsg', (req, res) => {
    let data = { code: 200, message: 'ok' }
    try {
        let r = req.query
        console.log(r)
        res.json(data);
        
        try {
            // let { oderNo } = r;
            // validateRequiredParameters({ oderNo })
        } catch (error) {
            data.code = -1;
            data.message = error.message
            res.json(data)
            return;
        }
        // let symbolIndex = arr.findIndex(index => index.oderNo == r.oderNo)
        // if (symbolIndex != undefined && symbolIndex != -1) {
        //     arr.splice(symbolIndex, 1)
        //     localStorage.setItem('user', JSON.stringify(arr))
        //     data.data = true;
        //     res.json(data)
        // } else {
        //     data.code = -2;
        //     data.message = '策略编号有误'
        //     res.json(data)
        // }
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