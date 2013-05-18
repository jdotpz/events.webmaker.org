module.exports = function (compound) {

    var express = require('express');
    var app = compound.app;
    require('co-assets-compiler').init(compound);

    app.configure(function(){
        app.use(express.static(app.root + '/public', { maxAge: 86400000 }));
        app.use(compound.assetsCompiler.configure('less', {
            sourceDir:  '/css',
            destDir:    '/css',
        }).init());
        app.set('cssDirectory', '/css/');
        app.set('cssEngine', 'less');
        app.use(express.bodyParser());
        app.use(express.cookieParser('secret'));
        app.use(express.session({secret: 'secret'}));
        app.use(express.methodOverride());
        app.use(app.router);
    });

};
