module.exports = function (compound) {

    var express = require('express');
    var app = compound.app;

    var RedisStore = require('connect-redis')(express),
        redisOpts = {};
    if (process.env['REDISTOGO_URL']) {
        var url = require('url').parse(process.env['REDISTOGO_URL']);
        redisOpts = {
            port: url.port,
            host: url.hostname,
            pass: url.auth.split(':')[1]
        };
    }

    require("./mozilla")(app);

    app.configure(function(){
        app.use(express.static(app.root + '/public', { maxAge: 86400000 }));
        app.use(require('connect-assets')({
            src:        'app/assets',
            buildDir:   'public/css',
        }));
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(process.env['REDISTOGO_URL'] ? express.session({
            key: "webmaker.sid",
            secret: process.env['SESSION_SECRET'],
            store: new RedisStore(redisOpts),
        }) : express.cookieSession({
            key: "webmaker.sid",
            secret: process.env['SESSION_SECRET'],
        }));
        app.use(express.methodOverride());
        app.use(express.csrf());
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
    persona(app, { audience: process.env['AUDIENCE'] });

    var loginapi = require("webmaker-loginapi");
    compound.loginAPI = loginapi(process.env['LOGINAPI']);

};
