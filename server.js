(function(){

    var model = require('./lifeModelFactory.js').get({
                    xSize: 16,
                    ySize: 16,
                    cell: {
                       color: {
                             r: 25,
                             g: 25,
                             b: 25
                       }
                   }
                });
    
    var life = require('./lifeLogic.js');
    
    var rxUpdates = [];
    
    var WebSocket = require('ws'),
    wss = new WebSocket.Server({port: 3000});

    var connectionID = 0;
    
    var rxMessageCount = 0;
    var txMessageCount = 0;

    var updateRate = 2000;
    var play = true;
    
    var clients = [];

    //*
    wss.on('connection', function (ws) {
        
        connectionID++;
        console.log(`connectionID: ${connectionID}`);
        
        var connection = {
            connectionID: connectionID,
            clientConnection: clientConnection,
            rxMessages: []
        };
        
        ws.on('message', function (message) {
            rxMessageCount++;
            
            console.log('message received: %s', message);
            console.log(`rxMessageCount: ${rxMessageCount}`);
            
            connection.rxMessages.push(message);
            
            rxMessagesProcessor(connection);
        });
        
        ws.on('error', function (message) {
            console.log('Error: %s', message);
        });

        
        function clientConnection (data) {
            txMessageCount++;           
            
            if (ws.readyState === WebSocket.OPEN) {
                try{
                    ws.send(JSON.stringify(data));
                } catch(e) {
                    console.log(e);
                    return false;
                }
                
            }else{
                return false;
            }
            
            console.log(`txMessageCount: ${txMessageCount}`);
            
            return true;
        };
        
        clients.push(connection);
        
    });//*/
    
    function rxMessagesProcessor(connection){
        var message = connection.rxMessages.pop();
        
        var o = JSON.parse(message);
        
        if(o.message === 'play'){
            play = true;
            broadcast(JSON.stringify({
                message: "play"
            }));
        }
        if(o.message === 'pause'){
            play = false;
            broadcast(JSON.stringify({
                message: "pause"
            }));
        }
        if(o.message === 'update'){
            rxUpdates.push(o.update);
            if(!play){//if not playing, update model immediately
                var updates = rxUpdates;
                rxUpdates = [];
                model = sendUpdatedModel(model, updates);
            }
        }
        if(o.message === 'nextTick'){
            var updates = rxUpdates;
            rxUpdates = [];
            model = nextTick(model, updates);
        }
        if(o.message === 'interval'){
            updateRate = o.interval;
            broadcast(JSON.stringify(o));
        }
        
    }
    
    function broadcast(json){
        var updates = clients;
        clients = [];
        
        for(let i = 0, l = updates.length; i < l; i++){
            let alive = updates[i].clientConnection(json);
            if(alive){
                clients.push(updates[i]);
            }else{
                console.log("connection dropped");
            }
        }
    }
    
    function processUpdates(model, rxUpdates){
        model = life.copyObj(model);
        rxUpdates = life.copyObj(rxUpdates);
        
        var result = life.processUpdates(model, rxUpdates);
        
        return {model: result.model, txUpdates: result.updates};
    }
    
    function runGeneration(model){
        model = life.copyObj(model);
        
        var result = life.getNextGeneration(model);
        
        return {model: result.model, txUpdates: result.updates};
    }
    
    var send = {
        updates: function (txUpdates){
            var send = {
                message: 'updates',
                updates: txUpdates
            };

            broadcast(JSON.stringify(send));
        },
        initialize: function(model){
            var send = {
                message: 'initialize',
                initialize: model
            };

            broadcast(JSON.stringify(send));
        }
    };
    
    function nextTick(model, rxUpdates){
        var results = processUpdates(model, rxUpdates);
        model = results.model;
        var txUpdates = results.txUpdates;
        
        results = runGeneration(model);
        model = results.model;
        results.txUpdates.forEach(function(update){
            txUpdates.push(update);
        });
        
        send.updates(txUpdates);
        
        return model;
    }
    
    function sendUpdatedModel(model, rxUpdates){
        var results = processUpdates(model, rxUpdates);
        model = results.model;
        var txUpdates = results.txUpdates;
        
        send.updates(txUpdates);
        
        return model;
    }
    
    setInterval(function(){
        if(play){
            
            var updates = rxUpdates;
            rxUpdates = [];
            model = nextTick(model, updates);
            
        }
    }, updateRate);
    
})();
