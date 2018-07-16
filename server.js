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

    (function(){
        life.initialize();
        runLoop();
        
    })();
    
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
            
        }
        if(o.message === 'pause'){
            play = false;
            
        }
        if(o.message === 'update'){
            rxUpdates.push(o.update);
            processUpdates();
            
        }
        if(o.message === 'nextTick'){
            nextTick();
        }
        if(o.message === 'interval'){
            send.interval(o.interval);
        }
        if(o.message === 'model'){
            send.refresh();
            
        }
        if(o.message === 'size'){
            life.initialize({
                boardSize:{
                    x: o.size.match(/(\d*)x(\d*)/)[1],
                    y: o.size.match(/(\d*)x(\d*)/)[2]
                }
            });
            send.refresh();
        }
        
    }
    
    function broadcast(o){
        console.log(o);
        var json = JSON.stringify(o);
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
        
    var send = {
        updates: function (txUpdates){
            broadcast({
                message: 'updates',
                updates: txUpdates
            });
        },
        model: function(){
            broadcast({
                message: 'model',
                model: life.getAll()
            });
        },
        generation: function(generation){
            broadcast({
                message: 'generation',
                generation: generation
            });
        },
        interval: function(){
            broadcast({
                message: 'interval',
                interval: interval
            });
        },
        playState: function(){
            if(play){
                broadcast({
                    message: "play"
                });
            }else{
                broadcast({
                    message: "pause"
                });
            }
        },
        refresh: function(){
            send.model();
            send.interval();
            send.playState();
        }
    };
    
    function nextTick(){
        var txUpdates = life.processUpdates(rxUpdates);
        
        var results = life.getNextGeneration();
        results.forEach(function(update){
            txUpdates.push(update);
        });
        
        if(txUpdates && txUpdates.length){
            send.updates(txUpdates);
        }
        
        send.generation(life.getGeneration());
        rxUpdates = [];
    }
    
    function processUpdates(){
        log.log(rxUpdates);
        var txUpdates = life.processUpdates(rxUpdates);
        
        if(txUpdates && txUpdates.length){
            send.updates(txUpdates);
            rxUpdates = [];
        }
    }
    
    
    function runLoop(){
        //log.log("in the loop");
        if(play){
            nextTick();
            
        }
        
        setTimeout(runLoop, interval);
    }
    
    
    
})();
