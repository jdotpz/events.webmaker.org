module.exports = function (compound) {

    var express = require('express');
    var app = compound.app;

    require("./local")(app);

    /* Application middleware configuration */

    app.configure(function(){
        app.use(express.static(app.root + '/public', { maxAge: 86400000 }));
        app.use(require('connect-assets')({
            src:        'app/assets',
            buildDir:   'public/css',
        }));
        app.use(express.methodOverride());
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.cookieSession({
            key: "webmaker.sid",
            secret: app.get('SESSION_SECRET')
        }));
        app.use(express.csrf());  // TODO: integrate into login form
        app.use(app.router);
    });

    /* Nunjucks Compiler Settings */

    var nunjucks = require('nunjucks'),
        nunjucksEnv = new nunjucks.Environment(
            new nunjucks.FileSystemLoader(app.root + '/app/views'));
    nunjucksEnv.express(app);
    app.disable( "x-powered-by" );

    /* Webmaker Persona SSO */

    var persona  = require("express-persona");
    persona(app, { audience: app.get('AUDIENCE') });

    var loginapi = require("webmaker-loginapi");
    compound.loginAPI = loginapi(app.get('LOGINAPI'));

};
