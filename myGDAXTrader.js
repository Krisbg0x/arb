var lastTradeInfo = {};

var _limitBuy = async function(product, price, size, post, authClient)
{
    var param = 
    {
    'price': price, // USD - string
    'size': size,  // BTC - string
    'product_id': product, //String: BTC-USD
    'type':'limit',
    'post_only':post
    }
    try 
    {
        const resp = await authClient.buy(param);
        lastTradeInfo = resp;
    } catch (error) {
        console.log('Error has occured: '+error);
    }
}

var _limitSell = async function(product, price, size, post, authClient)
{
    var param = 
    {
    'price': price, // USD - string
    'size': size,  // BTC - string
    'product_id': product, //String: BTC-USD
    'type':'limit',
    'post_only': post

    }

    try 
    {
        const resp = await authClient.sell(param);
        lastTradeInfo = resp;
    } catch (error) 
    {
        console.log('Error has occured: '+error);
    }
}

var _mktBuy = async function(product, size, authClient)
{
    var param = 
    {
    'size': size,  // BTC - string
    'product_id': product, //String: BTC-USD
    'type':'market'
    }

    try 
    {
        const resp = await authClient.buy(param);
        lastTradeInfo = resp;
    } catch (error) 
    {
        console.log('Error has occured: '+error);
    }
}

var _mktSell = async function(product, size, authClient)
{
    var param = 
    {
    'size': size,  // BTC - string
    'product_id': product, //String: BTC-USD
    'type':'market'
    }

    try 
    {
        resp = await authClient.sell(param);
        lastTradeInfo = resp;
    } catch (error) 
    {
        console.log('Error has occured: '+error);
    }
}

var _cancelOrder = async function(orderID, authClient) //Order ID should be a string
{
    try 
    {
        const resp = await authClient.cancelOrder(orderID);
        lastTradeInfo = resp;
    } catch (error) 
    {
        console.log('Error has occured: '+error);
    }
}

function _getLastTrade(){
    return lastTradeInfo;
}
module.exports = {
    cancelOrder: _cancelOrder,
    limitBuy: _limitBuy,
    limitSell: _limitSell,
    mktBuy: _mktBuy,
    lastTrade:lastTradeInfo,
    getLastTrade: _getLastTrade
};

