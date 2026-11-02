const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

// DEMO server state only. Replace with a persistent database before deployment.
let balance = 10000, nextId = 10001, positions = [], history = [];
const symbols = {
 XAUUSD:{price:3876.72,spread:0.30,contract:100,digits:2},
 EURUSD:{price:1.1542,spread:0.00018,contract:100000,digits:5},
 GBPUSD:{price:1.3124,spread:0.00022,contract:100000,digits:5},
 BTCUSD:{price:67420,spread:8,contract:1,digits:2}
};
function quote(sym){const x=symbols[sym];return {bid:x.price-x.spread/2,ask:x.price+x.spread/2,mid:x.price,digits:x.digits}}
function floating(p){const q=quote(p.symbol),mark=p.side==='BUY'?q.bid:q.ask;return (p.side==='BUY'?mark-p.open:p.open-mark)*p.lots*symbols[p.symbol].contract}
function close(id,reason='MANUAL'){const idx=positions.findIndex(p=>p.id===Number(id));if(idx<0)return null;const p=positions[idx],q=quote(p.symbol),px=p.side==='BUY'?q.bid:q.ask,pl=floating(p);balance+=pl;positions.splice(idx,1);const item={...p,close:px,profit:pl,closedAt:new Date().toISOString(),reason};history.unshift(item);return item}
function tick(){// Illustrative demo quote movement. Not an actual live feed.
 for(const [s,x] of Object.entries(symbols)){const step=s==='XAUUSD'?.35:s==='BTCUSD'?12:s==='EURUSD'?.00006:.00008;x.price=Math.max(s.includes('USD')&&s!=='XAUUSD'&&s!=='BTCUSD'?.1:100,x.price+(Math.random()-.5)*step*2)}
 const hit=[];for(const p of positions){const q=quote(p.symbol),m=p.side==='BUY'?q.bid:q.ask;if((p.sl&&((p.side==='BUY'&&m<=p.sl)||(p.side==='SELL'&&m>=p.sl)))||(p.tp&&((p.side==='BUY'&&m>=p.tp)||(p.side==='SELL'&&m<=p.tp))))hit.push(p.id)}hit.forEach(id=>close(id,'SL/TP'))}
setInterval(tick,1000);
app.get('/api/quotes',(req,res)=>res.json(Object.fromEntries(Object.keys(symbols).map(s=>[s,{...quote(s),name:s}]))));
app.get('/api/account',(req,res)=>res.json({balance,equity:balance+positions.reduce((a,p)=>a+floating(p),0),floating:positions.reduce((a,p)=>a+floating(p),0),mode:'DEMO'}));
app.get('/api/positions',(req,res)=>res.json(positions.map(p=>({...p,current:quote(p.symbol).mid,profit:floating(p)}))));
app.get('/api/history',(req,res)=>res.json(history));
app.post('/api/orders',(req,res)=>{const {symbol,side,lots,sl,tp}=req.body||{};if(!symbols[symbol]||!['BUY','SELL'].includes(side)||!Number.isFinite(Number(lots))||Number(lots)<=0)return res.status(400).json({error:'Invalid demo order'});const q=quote(symbol),open=side==='BUY'?q.ask:q.bid,S=sl?Number(sl):null,T=tp?Number(tp):null;if(S&&((side==='BUY'&&S>=open)||(side==='SELL'&&S<=open)))return res.status(400).json({error:'SL direction invalid'});if(T&&((side==='BUY'&&T<=open)||(side==='SELL'&&T>=open)))return res.status(400).json({error:'TP direction invalid'});const p={id:nextId++,symbol,side,lots:Number(lots),open,sl:S,tp:T,openedAt:new Date().toISOString()};positions.unshift(p);res.status(201).json(p)});
app.post('/api/positions/:id/close',(req,res)=>{const p=close(req.params.id);if(!p)return res.status(404).json({error:'Position not found'});res.json(p)});
app.post('/api/account/credit',(req,res)=>{balance+=1000;res.json({balance})});
app.post('/api/account/reset',(req,res)=>{balance=10000;nextId=10001;positions=[];history=[];res.json({balance})});
app.get('/api/health',(req,res)=>res.json({ok:true,app:'VELQOR demo trading server'}));
const port=process.env.PORT||3000;app.listen(port,'0.0.0.0',()=>console.log('VELQOR demo server listening on '+port));
