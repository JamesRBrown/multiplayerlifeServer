module.exports = (function(){
    //var data = require('./dataModel.js'); 
    
    function about(o){
        var about = "";
    
        about += "<h1>Life API</h1>";
       
        about += "<h4>Available APIs</h4>";
        about += "<div><a href='/data'>/data</a></div>";
        
        console.log(o.headers.turn);
        
        
        return about;
    };
    
    
    
    
    return{
        about: about//,
        //data: data
    };
    
})();