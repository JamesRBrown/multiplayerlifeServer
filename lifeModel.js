module.exports = (function(){
    var modelFactory = function(o){
        o = o || {};
        o.callback = o.callback || function(){ console.log("No callback provided!");};
        o.xSize = o.xSize || 0;
        o.ySize = o.ySize || 0;
        o.cell = o.cell || {};

        o.cell.alive = false;
        //o.cell.updated = false;
        o.cell.color = o.cell.color || colorFactory();

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

        function getModel(){
            return {
                generation: 0,
                gameID: 0,
                board: b,
                livingCells: [],
                userID: 0,
                userColor: colorFactory(),
                boardColor: colorFactory(), //153, 153, 153
                defaultColor: colorFactory(),   //126, 126, 126
                deadColor: colorFactory(),   //126, 126, 126
                colorOptions: colorOptions()
            };
        };

        return {
            get: function(){
                return JSON.parse(JSON.stringify(getModel()));
            }
        };

    };

    function getModel(o){
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

        var mf = modelFactory(o);
        var m = mf.get();
        return m;    
    }
    
    function controls (){
        var models;
    
        (function(){
            models = newModels();
            runLoop();
        })();

        function newModels(o){
            o = o || {
                xSize: 16,
                ySize: 16
            };
            o.cell = o.cell || {
                color: {
                    r: 255,
                    g: 255,
                    b: 255
                }
            };
            var model = getModel.get(o);

            model.boardColor = {  
                r:255,
                g:255,
                b:255
            };
            model.deadColor = {  
                r:215,
                g:215,
                b:215
            };
            model.userColor = {  
                r:0,
                g:255,
                b:0
            };

            //we do this to have a roting set of models 
            //so we don't have to keep accuring the copy penalty 
            var models = [];
            models.push(model);
            models.push(copyObj(model)); //OK, one time cost
            models.push(copyObj(model)); //OK, one time cost


            return models;
        }


        
        return {
            
        };
    }
    
    return {
        current: {},
        new: {}
    };
})();
