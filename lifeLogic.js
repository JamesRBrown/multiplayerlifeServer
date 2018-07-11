module.exports = (function(){
    
    function copyObj(obj){
        return JSON.parse(JSON.stringify(obj));
    };
    
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
                    if(value > end) value = 0; //test over
                    if(value < 0) value = end; //test under

                    return value;
                }

                result.x = testLimit(end.x, test.x);
                result.y = testLimit(end.y, test.y);

                return result;
            },
            neighborCoordinates: function (board, coordinates){
                var endCoordinates = {
                    x: board.length,
                    y: board[0].length
                };

                return {
                    north: find.wrap(endCoordinates, find.north(coordinates)),
                    northEast: find.wrap(endCoordinates, find.northEast(coordinates)),
                    east: find.wrap(endCoordinates, find.east(coordinates)),
                    southEast: find.wrap(endCoordinates, find.southEast(coordinates)),
                    south: find.wrap(endCoordinates, find.south(coordinates)),
                    southWest: find.wrap(endCoordinates, find.southWest(coordinates)),
                    west: find.wrap(endCoordinates, find.west(coordinates)),
                    northWest: find.wrap(endCoordinates, find.northWest(coordinates))
                };
            }
        };
        
    
    function applyUpdate(currentModel, update){
        var newModel = copyObj(currentModel);
        var u = copyObj(update) || [];

        if(u.alive){
            newModel.board[u.coordinate.x][u.coordinate.y].alive = true;
            newModel.board[u.coordinate.x][u.coordinate.y].color = copyObj(u.color);
        }else{
            newModel.board[u.coordinate.x][u.coordinate.y].alive = false;            
            u.color = copyObj(currentModel.deadColor);
            newModel.board[u.coordinate.x][u.coordinate.y].color = u.color;
        }
        

        return {model: newModel, update: u};
    };
    
    function processUpdates(currentModel, updates){
        var newModel = copyObj(currentModel);
        var newUpdates = copyObj(updates) || [];

        newUpdates.forEach(function(update){
            var result = applyUpdate(newModel, update);
            newModel = result.model;
            update = result.update;
        });

        return {model: newModel, updates: newUpdates};
    }
    
    function calcCell(model, coordinates){
        /*
        For a space that is 'populated':
            Each cell with one or no neighbors dies, as if by solitude.
            Each cell with four or more neighbors dies, as if by overpopulation.
            Each cell with two or three neighbors survives.
        For a space that is 'empty' or 'unpopulated'
            Each cell with three neighbors becomes populated.
        */
        var board = model.board;
        
        function caculatedValues(){
            
            var living = 0;
            var colors = [];
            var color = {r:0, g:0, b:0};
            
            for (var n in neighbors){
                if(board[n.x][n.y].alive){
                    living++;
                    colors.push(board[n.x][n.y].color);
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
        
        
        var cell = copyObj(board[coordinates.x][coordinates.y]);
        var neighbors = find.neighborCoordinates(board, coordinates);
        var cv = caculatedValues();
        var livingNeighbors = cv.living;
        var newLifeColor = cv.color;
        var deadColor = copyObj(model.deadColor);
        
        if(cell.alive){
            if(livingNeighbors < 1 || livingNeighbors > 4){
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
    
    function getNextGeneration(currentModel){
        var newModel = copyObj(currentModel);
        var updates =  [];
        
        var xLength = currentModel.board.length,
            yLength = currentModel.board[0].length,
            xi = 0, 
            yi = 0;
        
        for(; xi < xLength; xi++){
            for(; yi < yLength; yi++){
                newModel.board[xi][yi] = calcCell(currentModel, {x: xi, y: yi});
                
                if(newModel.board[xi][yi].alive !== currentModel.board[xi][yi].alive){
                    updates.push({
                        coordinate: {x: xi, y: yi},
                        color: newModel.board[xi][yi].color,
                        alive: newModel.board[xi][yi].alive
                    });
                }
            }
        }
        
        return {model: newModel, updates: updates};
    };
    
    return {
        copyObj: copyObj,
        processUpdates: processUpdates,
        getNextGeneration: getNextGeneration
    };
})();