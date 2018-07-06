(function(){
    var express = require('/srv/www/node/node_modules/express');
    var router = require('./apiRouter.js');
    //var fileUpload = require('/home/node/node_modules/express-fileupload');
    var app = express();

    //app.use(fileUpload());//for data API
    app.use(router);
    //app.use(express.limit('4M'));
    
    var server = app.listen(3000, function () {

      var host = server.address().address;
      var port = server.address().port;

      console.log("Example app listening at http://%s:%s", host, port);

    });


})();   