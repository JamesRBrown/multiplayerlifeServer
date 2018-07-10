(function(){

    var life = require('./lifeFactory.js').get();
    var WebSocket = require('ws'),
    wss = new WebSocket.Server({port: 3000});

    var messageCount = 0;

    var updateRate = 2000;
    var play = true;
    
    var clients = [];

    //*
    wss.on('connection', function (ws) {
        ws.on('message', function (message) {
            console.log('received: %s', message);
            if(message === 'play'){
                play = true;
            }
            if(message === 'pause'){
                play = false;
            }
            
        });
        ws.on('error', function (message) {
            console.log('Error: %s', message);
        });

        
        function sendUpdate () {
            messageCount++;           
            
            if (ws.readyState === WebSocket.OPEN) {
                try{
                    ws.send(JSON.stringify(life));
                } catch(e) {
                    console.log(e);
                    return false;
                }
                
            }else{
                return false;
            }
            
            console.log(`messageCount: ${messageCount}`);
            
            return true;
        };
        
        clients.push(sendUpdate);
        
    });//*/
    
    
    
    function sendOutUpdates(){
        var updates = clients;
        clients = [];
        
        for(let i = 0, l = updates.length; i < l; i++){
            let alive = updates[i]();
            if(alive){
                clients.push(updates[i]);
            }else{
                console.log("connection dropped");
            }
        }
    }
    
    setInterval(function(){
        if(play){
            
            sendOutUpdates();
        }
    }, updateRate);
    
})();



