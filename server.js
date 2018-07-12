(function(){
    var life = require('./lifeLogic.js');
    var log = require('../libs/logging.js');
    
    //*
    log.config({ 
        console: true,          //turn on/off console logging
        //path: true,           //prepend file path
        file: true,             //prepend filename
        line: true,             //prepend line number
        //func: true,             //prepend function name
        app: "Life Server"    //set app name, used for email function
    });//*/ 
    
    var rxUpdates = [];
    
    var WebSocket = require('ws'),
    wss = new WebSocket.Server({port: 3000});

    var connectionID = 0;
    
    var rxMessageCount = 0;
    var txMessageCount = 0;

    var interval = 4000;
    var play = false;
    
    log.log("Server Started...");
    
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
            log.log(rxUpdates);
            var updates = life.copyObj(rxUpdates);
            log.log(updates);
            rxUpdates = [];
            life.state.current(models)
            sendUpdatedModel(models, updates);
        }
        if(o.message === 'nextTick'){
            var updates = life.copyObj(rxUpdates);
            rxUpdates = [];
            model = nextTick(model, updates);
        }
        if(o.message === 'interval'){
            interval = o.interval;
            console.log(o.interval);
            console.log(interval);
            send.interval(interval);
        }
        if(o.message === 'model'){
            send.model(model);
            send.interval(interval);
            
        }
        if(o.message === 'size'){
            model = newModel({
                xSize: o.size.match(/(\d*)x(\d*)/)[1],
                ySize: o.size.match(/(\d*)x(\d*)/)[2]
            });
            send.model(model);
            send.interval(interval);
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
        model = life.copyObj(model);//TODO: needs to go
        
        var result = life.getFastNextGeneration(model);
        
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
        model: function(model){
            var send = {
                message: 'model',
                model: model
            };

            broadcast(JSON.stringify(send));
        },
        generation: function(model){
            var send = {
                message: 'generation',
                generation: model.generation
            };

            broadcast(JSON.stringify(send));
        },
        interval: function(interval){
            console.log(interval);
            var send = {
                message: 'interval',
                interval: interval
            };

            broadcast(JSON.stringify(send));
        },
        refresh: function(interval){
            
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
        
        if(txUpdates && txUpdates.length){
            send.updates(txUpdates);
        }
        
        send.generation(model);
        
        return model;
    }
    
    function sendUpdatedModel(models, rxUpdates){
        var results = processUpdates(models, rxUpdates);
        var txUpdates = results.txUpdates;
        
        if(txUpdates && txUpdates.length){
            send.updates(txUpdates);
        }
    }
    
    
    function runLoop(){
        //log.log("in the loop");
        if(play){
            var updates = life.copyObj(rxUpdates);
            rxUpdates = [];
            model = nextTick(model, updates);
            
        }
        
        setTimeout(runLoop, interval);
    }
    
    
    
})();
