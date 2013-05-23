module.exports = function (compound) {

    var express = require('express');
    var app = compound.app;

    var nunjucks = require('nunjucks'),
        nunjucksEnv = new nunjucks.Environment(
            new nunjucks.FileSystemLoader(app.root + '/app/views'));
    nunjucksEnv.express(app);


    app.configure(function(){
        app.use(express.static(app.root + '/public', { maxAge: 86400000 }));
        app.use(require('connect-assets')({
            src:        'app/assets',
            buildDir:   'public/css',
        }));
        app.use(express.bodyParser());
        app.use(express.cookieParser('secret'));
        app.use(express.session({secret: 'secret'}));
        app.use(express.methodOverride());
        app.use(app.router);
    });

};
