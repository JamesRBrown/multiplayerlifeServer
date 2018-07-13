module.exports = (function(){
    function copyObj(obj){
        return JSON.parse(JSON.stringify(obj));
    };
    
    var cell = {
        coordinate: {x:0, y:0},
        color: {r:255, g:255, b:255},
        alive: false
    };
    
    var boardSize = {x:16, y:16};
    
    var boardColor = {r:255, g:255, b:255};
    
    var deadColor = {r:215, g:215, b:215};
        
    var generations = [];
    
    var livingCells = [];
    
    
    function initialize(o){
        o = o || {};
        o = o.cell || {};
        cell.color = o.cell.color || cell.color;
        boardSize = o.boardSize || boardSize;
        boardColor = o.boardColor || boardColor;
        deadColor = o.deadColor || deadColor;  
        generations = [];
        livingCells = [];
        update.generation();//"prime the pump"
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
            var hash = `${coordinate.x},${coordinate.y}`;
            var cell = generations[generations.length-1][hash];
            return {
                coordinate: {x:cell.x, y:cell.y},
                color: {r:cell.color.r, g:cell.color.g, b:cell.color.b},
                alive: cell.alive
            };
        },
        generation: function(){
            return generation;
        },
        boardSize: function(){
            return boardSize;
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
        deadColor: function(){
            return {
                r: deadColor.r,
                g: deadColor.g,
                b: deadColor.b
            };
        },
        living: function(mapFunction){
            var living = generations[generations.length-1];
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
                deadColor: get.deadColor(),
                living: get.living()
            };
        }
    };
    
    var update = {
        generation: function (){ //only call when done with the current generation       
            generations.push(livingCells);
            livingCells = [];
            return {
                generation: generations.length
            };
        },
        cell: function (cell){
            
        }
    };
    
    return {
        inilialize: initialize,
        get: get,
        update: update
    };
})();
