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
        
        if(message === 'play'){
            play = true;
        }
        if(message === 'pause'){
            play = false;
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
    
    setInterval(function(){
        if(play){
            
            broadcast(JSON.stringify(life));
            
        }
    }, updateRate);
    
})();
