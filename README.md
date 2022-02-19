scp -i /Users/topbrids/cert/testbbs.pem package.json root@101.32.178.79:/root/tv_gen_order

```
{
"ticker":"{{ticker}}",
"position":"{{strategy.market_position}}",
"action":"{{strategy.order.action}}",
"price":"{{close}}"
}
```