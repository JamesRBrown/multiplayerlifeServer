module.exports = (function(){
    var turnFactory = function(o){
        o = o || {};
        o.callback = o.callback || function(){ console.log("No callback provided!");};
        o.xSize = o.xSize || 0;
        o.ySize = o.ySize || 0;
        o.cell = o.cell || {};

        o.cell.live = false;
        o.cell.updated = false;
        o.cell.color = colorFactory();

        function colorFactory(){
            return {
                r: 0,
                g: 0,
                b: 0
            };
        }

        function colorOptions () {
            return {
                red: {
                    r: 255,
                    g: 0,
                    b: 0 
                },
                yellow: {
                    r: 255,
                    g: 255,
                    b: 0 
                },
                blue: {
                    r: 0,
                    g: 0,
                    b: 255 
                },
                cyan: {
                    r: 0,
                    g: 255,
                    b: 255
                },
                purple: {
                    r: 255,
                    g: 0,
                    b: 255 
                },
                green: {
                    r: 0,
                    g: 255,
                    b: 0 
                }
            };

        };



        function boardFactory(o){
            o = o || {};
            o.callback = o.callback || function(){ console.log("No callback provided!");};
            o.xSize = o.xSize || 0;
            o.ySize = o.ySize || 0;
            o.cell = o.cell || {};

            var yFactory = function(size, cell){

                var y = [];


                var getObj = (function(o){                
                    return {
                        get: function (){
                                return o;
                            }
                    }; 
                })(cell);

                for(var i = 0; i < size; i++){
                    y.push(getObj.get());
                }

                return {
                    get: function (){
                        return y;
                    }
                };
            };

            var y = yFactory(o.ySize,  o.cell);

            var x = [];

            for(var i = 0; i < o.xSize; i++){
                x.push(y.get());
            }

            return {
                get:function (){
                        return x;
                    }
            };
        }

        var board = boardFactory({
            xSize: o.xSize,
            ySize: o.ySize,
            cell: o.cell,
            callback: o.callback
        });

        var b = board.get();

        function getTurn(){
            return {
                turnID: 0,
                gameID: 0,
                board: b,
                userID: 0,
                userColor: colorFactory(),
                boardColor: colorFactory(), //153, 153, 153
                deadColor: colorFactory(),   //126, 126, 126
                colorOptions: colorOptions()
            };
        };

        return {
            get: function(){
                return JSON.parse(JSON.stringify(getTurn()));
            }
        };

    };

    function getTurn(o){
        o = o || {
            xSize: 16,
            ySize: 16,
            cell: {
               color: {
                     r:25,
                     g: 25,
                     b: 25
               }
           }
        };

        var tf = turnFactory(o);
        var t = tf.get();
        return t;    
    }
    
    return {
        get: getTurn
    };
})();
