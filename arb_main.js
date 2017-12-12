const GDAX = require('gdax');
const trader = require('./myGDAXTrader');
const pairs = ['BTC-USD','ETH-BTC','ETH-USD','LTC-USD','LTC-BTC'];
//API info
const key = 'key';
const b64secret = 'secret';
const passphrase = 'passphrase';

const Gdax = require('gdax');
const apiURI = 'https://api.gdax.com';
//const sandboxURI = 'https://api-public.sandbox.gdax.com';
const authedClient = new Gdax.AuthenticatedClient(key, b64secret, passphrase, apiURI);

const websocket = new GDAX.WebsocketClient(pairs, 'wss://ws-feed.gdax.com',
    null,                     //this can be replaced by api credentials. Benefits to that is that messages due to your account (orders) will have your user id attached.
    { channels: ['ticker'] }  //this element is optional.  Documentation on each channel's message is in GDAX API
  );

  websocket.on('open', () =>    { console.log('Websocket established.') });
  websocket.on('error', err =>  { console.log('Websocket error!' + err) });
  websocket.on('close', () =>   { /*websocket.connect();*/ console.log('Websocket lost. Closing!'); process.exit(); });

var pairBidAsk = 
{
    'BTC-USD':{'bid':0, 'ask': 0},
    'ETH-BTC':{'bid':0, 'ask': 0},
    'ETH-USD':{'bid':0, 'ask': 0},
    'LTC-USD':{'bid':0, 'ask': 0},
    'LTC-BTC':{'bid':0, 'ask': 0},
}
websocket.on('message', data => 
{
    
    switch(data['product_id'])
    {
        case 'BTC-USD':
            pairBidAsk['BTC-USD']['bid'] = data['best_bid']; pairBidAsk['BTC-USD']['ask'] = data['best_ask']; break;
        case 'ETH-BTC':
            pairBidAsk['ETH-BTC']['bid'] = data['best_bid']; pairBidAsk['ETH-BTC']['ask'] = data['best_ask']; break;
        case 'ETH-USD':
            pairBidAsk['ETH-USD']['bid'] = data['best_bid']; pairBidAsk['ETH-USD']['ask'] = data['best_ask']; break;
        case 'LTC-USD':
            pairBidAsk['LTC-USD']['bid'] = data['best_bid']; pairBidAsk['LTC-USD']['ask'] = data['best_ask']; break;
        case 'LTC-BTC':
            pairBidAsk['LTC-BTC']['bid'] = data['best_bid']; pairBidAsk['LTC-BTC']['ask'] = data['best_ask']; break;
    }
    
    
    //executeTrade(bestSpread());
    //This is only here currently for testing purposes. This will be set on its own in a setInterval 
});


function bestSpread()
{
    var beu = (1/pairBidAsk['ETH-BTC']['ask']*pairBidAsk['ETH-USD']['bid']-pairBidAsk['BTC-USD']['ask'])/pairBidAsk['BTC-USD']['ask']; //BTC, ETH, USD
    var blu = (1/pairBidAsk['LTC-BTC']['ask']*pairBidAsk['LTC-USD']['bid']-pairBidAsk['BTC-USD']['ask'])/pairBidAsk['BTC-USD']['ask']; //BTC, LTC, USD
    var ebu = (1*pairBidAsk['ETH-BTC']['bid']*pairBidAsk['BTC-USD']['bid']-pairBidAsk['ETH-USD']['ask'])/pairBidAsk['ETH-USD']['ask']; //ETH, BTC, USD
    var lbu = (1*pairBidAsk['LTC-BTC']['bid']*pairBidAsk['BTC-USD']['bid']-pairBidAsk['LTC-USD']['ask'])/pairBidAsk['LTC-USD']['ask']; //LTC, BTC, USD
    //console.log(Math.max(beu,blu,ebu,lbu));
    var max = Math.max(beu,blu,ebu,lbu);
    var spreadName = 'NA';
    var tradeOrder = '';
    if(max > 0.0010)//Assuming we use mkt order on the BTC traded coins
    {
        switch(max)
        {
            case beu: spreadName = 'beu'; tradeOrder = ['BTC-USD','ETH-BTC','ETH-USD']; break; //BTC, ETH, USD
            case blu: spreadName = 'blu'; tradeOrder = ['BTC-USD','LTC-BTC','LTC-USD']; break; //BTC, LTC, USD
            case ebu: spreadName = 'ebu'; tradeOrder = ['ETH-USD','ETH-BTC','BTC-USD']; break; //ETH, BTC, USD
            case lbu: spreadName = 'lbu'; tradeOrder = ['LTC-USD','LTC-BTC','BTC-USD']; break; //LTC, BTC, USD
        }
    }
    return {spreadName, max, tradeOrder}; //Return NA if spread not big enough.
}


//This is incomplete.
function executeTrade(trade)
{
    if(trade['spreadName'] === 'beu' || trade['spreadName']==='blu')//This split here doesn't seem appropriate, not sure if GDAX  will recognize coin to coin pairs backwards
    {
        trader.limitBuy(trade['tradeOrder'][0],pairBidAsk[trade['tradeOrder'][0]]['bid'],'1','true',authedClient).then(()=>{
            //Do logic here by calling trader.getLastTrade(), then start 2nd leg when ready
            trader.mktBuy(trade['tradeOrder'][1],'1',authedClient).then(()=>{
                //Do logic here by calling trader.getLastTrade(), then start 3rd leg when ready
                trader.limitSell(trade['tradeOrder'][2],pairBidAsk[trade['tradeOrder'][2]]['ask'],'1','true').then(()=>{
                    //Do any logic if needed on the final leg.
                })
            })
        });
        
    }
    else if(trade['spreadName'] === 'beu' || trade['spreadName']==='blu')
    {
        //Repeat similar logic as above for when starting with alt coins. 
    }
}


