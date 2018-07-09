(function(){

    var life = require('./lifeFactory.js').get();
    var WebSocket = require('ws'),
    wss = new WebSocket.Server({port: 3000});

    var messageCount = 0;

    var updateRate = 2000;

    var updates = [];

    //*
    wss.on('connection', function (ws) {
        ws.on('message', function (message) {
            console.log('received: %s', message);
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
        
        updates.push(sendUpdate);
        
    });//*/
    
    function sendOutUpdates(){
        var up = updates;
        updates = [];
        
        for(let i = 0, l = up.length; i < l; i++){
            let alive = up[i]();
            if(alive){
                updates.push(up[i]);
            }else{
                console.log("connection dropped");
            }
        }
    }
    
    setInterval(function(){
        sendOutUpdates();
    }, updateRate);
    
})();



