module.exports = (function(){
    function copyObj(obj){
        return JSON.parse(JSON.stringify(obj));
    };
    
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
                return copyObj(getModel());
            }
        };

    };

    function newModel(o){
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
        var currentGeneration;
        var models;             //these should not be called directly, use get
        var getModel;           //this holds the model get functions
                
        function initialize(o){
            currentGeneration = 0;
            models = newModels(o);
            getModel = structuredModelsFactory(newModels());
        }
        
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
            var model = newModel.get(o);

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
        
        function structuredModelsFactory (models) {
            
            var structuredModels = 
                    (function (models){
                        var currentModels = [];
                        var previousModel;
                        models.forEach(function(model){
                            if(model.generation === currentGeneration){
                                currentModels.push(model);
                            }else{
                                previousModel = model;
                            }
                        });
                        return {
                            currentModels: currentModels,
                            previousModel: previousModel
                        };
                    })(models);
            
            return {
                current: function(){
                    return structuredModels.currentModels[0];
                },
                next: function(){
                    return structuredModels.currentModels[1];
                },
                previous: function(){
                    return structuredModels.previousModel;
                }
            };            
        };
        
        var get = {
            
        };
        
        var update = {
            journal: [],//journal of updates
            cell: function(o){
                /*
                o = {
                    cell: cell,
                    coordinate: coordinate //of the cell
                }
                */
                update.journal.push(copyObj(o));
                var currentBoard = getModel.current().board;
                var nextBoard = getModel.next().board;
                
                currentBoard[o.coordinate.x][o.coordinate.y] = copyObj(o.cell);
                nextBoard[o.coordinate.x][o.coordinate.y] = copyObj(o.cell);
                
                if(o.cell.alive){
                    getModel.next().livingCells.push(copyObj(o.coordinate));
                    getModel.previous().livingCells.push(copyObj(o.coordinate));
                }
                
            },
            incrementGeneration: function(){
                //Only call this when *done* with current generation!
                //The order of these steps are important!
                currentGeneration++;
                getModel.next().generation = currentGeneration;
                getModel.previous().generation = currentGeneration;
                getModel = structuredModelsFactory(models);
                update.syncPrevious();
                getModel.next().livingCells = [];        //ready array
                getModel.previous().livingCells = [];    //ready array
            },
            syncPrevious: function(){
                //process journal against previous model
                //clear out journal
                
                var previousBoard = getModel.previous().board;
                
                update.journal.forEach(function(o){
                    previousBoard[o.coordinate.x][o.coordinate.y] = o.cell;  //doesn't need to be copied, because it already was
                });
                
                update.journal = [];
            }
        };
        
        function getStateSnapshot (){
            return copyObj(getModel.current());
        }
        
        return {
            initialize: initialize,
            getStateSnapshot: getStateSnapshot,
            update: {},
            get: {}
        };
    }
    
    return {
        initialize: controls.initialize,
        get: {
            current: {
                
            },
            new: {
                
            }
        },
        update: {
            incrementGeneration: controls.incrementGeneration
        },
        getStateSnapshot: controls.getStateSnapshot
    };
})();
