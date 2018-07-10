module.exports = (function(){
    var life = require('./lifeFactory.js').get({
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
                //test over
                if(value > end) value = 0;

                //test under
                if(value < 0) value = end;
                
                return value;
            }
            
            //test x
            result.x = testLimit(end.x, test.x);
            //test y
            result.y = testLimit(end.y, test.y);
           
            return result;
        }
    };
    
})();