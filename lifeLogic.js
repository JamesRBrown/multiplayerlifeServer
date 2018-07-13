module.exports = (function(){
    
    var log = require('../libs/logging.js');
    
    //*
    log.config({ 
        console: true,          //turn on/off console logging
        //path: true,           //prepend file path
        //file: true,             //prepend filename
        line: true,             //prepend line number
        //func: true,             //prepend function name
        app: "Life Server"    //set app name, used for email function
    });//*/ 
    
    var model = require('lifeModel.js');
    
    var find = {
            north: function(coordinate){
                var result = {x: coordinate.x, y: coordinate.y};
                result.y = coordinate.y - 1;
                return result;
            },
            northEast: function(coordinate){ 
                var result = {x: coordinate.x, y: coordinate.y};           
                result.y = coordinate.y - 1;
                result.x = coordinate.x + 1;
                return result;
            },
            east: function(coordinate){
                var result = {x: coordinate.x, y: coordinate.y};
                result.x = coordinate.x + 1;
                return result;
            },
            southEast: function(coordinate){
                var result = {x: coordinate.x, y: coordinate.y};
                result.y = coordinate.y + 1;
                result.x = coordinate.x + 1;
                return result;
            },
            south: function(coordinate){
                var result = {x: coordinate.x, y: coordinate.y};
                result.y = coordinate.y + 1;
                return result;
            },
            southWest: function(coordinate){
                var result = {x: coordinate.x, y: coordinate.y};
                result.y = coordinate.y + 1;
                result.x = coordinate.x - 1;
                return result;
            },
            west: function(coordinate){
                var result = {x: coordinate.x, y: coordinate.y};
                result.x = coordinate.x - 1;
                return result;
            },
            northWest: function(coordinate){
                var result = {x: coordinate.x, y: coordinate.y};
                result.y = coordinate.y - 1;
                result.x = coordinate.x - 1;
                return result;
            },
            wrap: function(endCoordinate, testCoordinate){
                var end = endCoordinate,
                    test = testCoordinate,
                    result = {x: test.x, y: test.y};

                function testLimit(end, value){
                    if(value >= end) value = 0;      //test over
                    if(value < 0) value = end - 1;  //test under

                    return value;
                }

                result.x = testLimit(end.x, test.x);
                result.y = testLimit(end.y, test.y);

                return result;
            },
            neighborhood: function (boardSize, coordinates){
                return {
                    north: find.wrap(boardSize, find.north(coordinates)),
                    northEast: find.wrap(boardSize, find.northEast(coordinates)),
                    east: find.wrap(boardSize, find.east(coordinates)),
                    southEast: find.wrap(boardSize, find.southEast(coordinates)),
                    south: find.wrap(boardSize, find.south(coordinates)),
                    southWest: find.wrap(boardSize, find.southWest(coordinates)),
                    west: find.wrap(boardSize, find.west(coordinates)),
                    northWest: find.wrap(boardSize, find.northWest(coordinates))
                };
            }
        };
        
    
    function applyUpdate(update){
        log.log(update);

        model.update.cell(update);
        
        return update;
    };
    
    function processUpdates(updates){

        updates.forEach(function(update){
            applyUpdate(update);
        });

        return updates;
    }
    
    function calcCell(coordinate){ 
        /*
        For a space that is 'populated':
            Each cell with one or no neighbors dies, as if by solitude.
            Each cell with four or more neighbors dies, as if by overpopulation.
            Each cell with two or three neighbors survives.
        For a space that is 'empty' or 'unpopulated'
            Each cell with three neighbors becomes populated.
        */
        
        function caculatedValues(){
            
            var living = 0;
            var colors = [];
            var color = {r:0, g:0, b:0};
            var neighborCell;
            for (var n in neighbors){
                neighborCell = model.get.cell({x: neighbors[n].x, y: neighbors[n].y});
                
                if(neighborCell.alive){
                    living++;
                    colors.push(neighborCell.color);
                }else{
                    model.reprojection.track({x: neighbors[n].x, y: neighbors[n].y});
                }
            }
            
            colors.forEach(function(c){
                color.r += c.r;
                color.g += c.g;
                color.b += c.b;
            });
            
            color.r = color.r / living || 0;
            color.g = color.g / living || 0;
            color.b = color.b / living || 0;
            
            return {living: living, color: color};
        }
        
        
        var cell = model.get.cell(coordinate);
        var neighbors = find.neighborhood(model.get.boardSize, coordinate);
        var cv = caculatedValues();
        var livingNeighbors = cv.living;
        var newLifeColor = cv.color;
        var deadColor = copyObj(model.deadColor);
        
        if(cell.alive){
            if(livingNeighbors <= 1 || livingNeighbors >= 4){
                cell.alive = false;
                cell.color = deadColor;
            }
            if(livingNeighbors === 2 || livingNeighbors === 3){
                //do nothing, it's a survivor
            }
        }else{
            if(livingNeighbors === 3){
                cell.alive = true;
                cell.color = newLifeColor;
            }
        }
        
        return cell;
    }
    
    function getNextGeneration(){
        var updates =  [];
        
        function functor(cell){
            var newCell = calcCell(cell.coordinate);
            model.next.cell(newCell);
            if(newCell.alive !== cell.alive){
                updates.push(newCell);
            }
        }
        
        //process living cells
        var living = model.get.living(function(cell){
                var newCell = calcCell(cell.coordinate);
                model.next.cell(newCell);
                if(newCell.alive !== cell.alive){
                    updates.push(newCell);
                }
            });

        //process dead neighbors
        model.reprojection.process(function(coordinate){
            var newCell = calcCell(coordinate);
            model.next.cell(newCell);
            
            if(newCell.alive !== model.get.cell(coordinate).alive){
                updates.push(newCell);
            }
        });
        
        //proceed to next generation
        model.next.generation();
        
        return updates;
    };
    
    
    return {
        initialize: model.initialize,
        processUpdates: processUpdates,
        getNextGeneration: getNextGeneration
    };
})();