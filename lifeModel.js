module.exports = (function(){
    var cell = {
        coordinate: {x:0, y:0},
        color: {r:255, g:255, b:255},
        alive: false
    };
    
    var boardSize = {x:16, y:16};
    
    var boardColor = {r:255, g:255, b:255};
    
    var defaultColor = {r:255, g:255, b:255};
    
    var deadColor = {r:215, g:215, b:215};
        
    var generations = []; //historic account of each generation, current generation is the last one
    
    var livingCells = []; //reserved for the next generation, gets pushed onto generations once fully populated
    
    var reprojectionCells = [];
    
    function initialize(o){
        o = o || {};
        o.cell = o.cell || {};
        cell.color = o.cell.color || cell.color;
        boardSize = o.boardSize || boardSize;
        boardColor = o.boardColor || boardColor;
        deadColor = o.deadColor || deadColor;  
        generations = [];
        livingCells = [];
        reprojectionCells = [];
        next.generation();//"prime the pump": we need a generation present to start
    }
    
    function hashCoordinates(coordinate){
        return `${coordinate.x},${coordinate.y}`;
    }
    
    function currentGeneration(){
        return generations[generations.length-1];
    }
    
    function addCellToArray(newCell, lifeArray){
        var hash = hashCoordinates(newCell.coordinate);
        if(!lifeArray[hash]){
            lifeArray.push(newCell);      //we want both an array
            lifeArray[hash] = newCell;    //and a hash table
        }        
    }
    
    var get = {//we copy everything, so state can't be changed with the get functions
        newCell: function(){
            return {
                coordinate: {x:0, y:0},
                color: {r:cell.color.r, g:cell.color.g, b:cell.color.b},
                alive: false
            };
        },
        cell: function(coordinate){
            console.log("coordinate:");
            console.log(coordinate);
            var hash = hashCoordinates(coordinate);
            var livingCells = currentGeneration();
            //console.log(livingCells);
            console.log("hash"+hash);
            //console.log(livingCells[hash]);
            var cell = livingCells[hash];
            if(cell){
                return {
                    coordinate: {x:cell.x, y:cell.y},
                    color: {r:cell.color.r, g:cell.color.g, b:cell.color.b},
                    alive: cell.alive //this will 'almost' always be true; there are cases it could be false
                };
            }else{
                return {
                    coordinate: {x:cell.x, y:cell.y},
                    color: {r:deadColor.r, g:deadColor.g, b:deadColor.b},   //we'll assume it died
                    alive: false                                            //but this is the only value that matters 
                };
            }
            
        },
        generation: function(){
            return generations.length;
        },
        boardSize: function(){
            return {x:boardSize.x, y:boardSize.y};
        },
        colorOptions: function(){
            return { 
                red: {r: 255, g: 0, b: 0 },
                yellow: { r: 255, g: 255, b: 0 },
                blue: { r: 0, g: 0, b: 255 },
                cyan: { r: 0, g: 255, b: 255 },
                purple: { r: 255, g: 0, b: 255 },
                green: { r: 0, g: 255, b: 0 }
            };
        },
        boardColor: function(){
            return {
                r: boardColor.r,
                g: boardColor.g,
                b: boardColor.b
            };
        },
        defaultColor: function(){
            return {
                r: defaultColor.r,
                g: defaultColor.g,
                b: defaultColor.b
            };
        },
        deadColor: function(){
            return {
                r: deadColor.r,
                g: deadColor.g,
                b: deadColor.b
            };
        },
        living: function(mapFunction){
            var living = currentGeneration();
            var lifeCount = living.length;
            var copyLiving = [];
            var cell;
            var newCell;
            mapFunction = mapFunction || function(){};
            for(var i = 0; i < lifeCount; i++){
                cell = living[i];
                newCell = {
                    coordinate: {x:cell.coordinate.x, y:cell.coordinate.y},
                    color: {r:cell.color.r, g:cell.color.g, b:cell.color.b},
                    alive: cell.alive
                };
                copyLiving.push(newCell);
                mapFunction(newCell);
            }
            return copyLiving;
        },
        all: function(){
            return {
                generation: get.generation(),
                boardSize: get.boardSize(),
                colorOptions: get.colorOptions(),
                boardColor: get.boardColor(),
                defaultColor: get.defaultColor(),
                deadColor: get.deadColor(),
                living: get.living()
            };
        }
    };
    
    var update = {        
        cell: function (cell){
            var newCell = {//we copy the in coming object, so there is no external reference
                coordinate: {x:cell.coordinate.x, y:cell.coordinate.y},
                color: {r:cell.color.r, g:cell.color.b, b:cell.color.b},
                alive: cell.alive
            };
            
            var hash = hashCoordinates(newCell.coordinate);
            var living = currentGeneration();
            
            if(living[hash]){
                living[hash] = newCell;
            }else{
                if(newCell.alive){
                    addCellToArray(newCell, living);
                }
            }
            
        }
    };
    
    var next = {
        generation: function (){ //only call when done with the current generation       
            generations.push(livingCells);
            livingCells = [];
            reprojectionCells = [];
            return {
                generation: generations.length
            };
        },
        cell: function (cell){
            var newCell = {//we copy the in coming object, so there is no external reference
                coordinate: {x:cell.coordinate.x, y:cell.coordinate.y},
                color: {r:cell.color.r, g:cell.color.b, b:cell.color.b},
                alive: cell.alive
            };
            
            if(cell.alive){
                addCellToArray(newCell, livingCells);
            };
        }
    };
    
    var reprojection = {//dead neighbor processing
            track: function(coordinate){
                addCellToArray({coordinate: coordinate}, reprojectionCells);
            },
            process: function(mapFunction){
                reprojectionCells.forEach(function(cell){
                    mapfunction(cell.coordinate);
                });
            }
    };
    
    return {
        initialize: initialize,
        get: get,
        update: update,
        next: next,
        reprojection: reprojection
    };
})();
