### 介绍

tradingview 警报 webhook api 进行 币安交易所开单平仓操作【node 版本】

tv 信号 到 tg推送播报机器人【集成】

### 新增

新增趋势跟踪 移动止盈



`scp -i /Users/topbrids/cert/testbbs.pem package.json root@101.32.178.79:/root/tv_gen_order`

`scp -i /Users/topbrids/cert/testbbs.pem index.js root@101.32.178.79:/root/tv_gen_order`

`scp -i /Users/topbrids/cert/testbbs.pem app/message.js root@101.32.178.79:/root/tv_gen_order/app`

```
{
"ticker":"{{ticker}}",
"position":"{{strategy.market_position}}",
"action":"{{strategy.order.action}}",
"price":"{{close}}"
}
```

## 联系

微信: wkc19891
邮箱: topbrids@gmail.com