module.exports = (function(){
    var express = require('/srv/www/node/node_modules/express');
    var api = require('./models/apiModel.js');       
    //var su = require('/home/node/owi_modules/sysUtil.js'); 
    
    var router = express.Router();

    router.get('/', function (req, res) {
       res.send(api.about(req));
       
    });

    router.post('/', function (req, res) {
       //api.data.processRequest(req, res);
       res.send(api.about(req));
    });

    return router;
    
    
})();