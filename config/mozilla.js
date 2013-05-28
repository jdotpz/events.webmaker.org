
module.exports = function (app) {

    /* Setup environment variables */

    // 'Make' API endpoint
    app.set("MAKE_ENDPOINT", "http://makeapi.mofostaging.net/");

    // API available at mozilla/login.webmaker.org
    app.set("AUDIENCE", "http://localhost:3000");

    // 'Login' API endpoint
    app.set("LOGIN", "http://login.mofostaging.net");

    // fully-qualified 'Login' API access-point
    app.set("LOGINAPI", "http://testuser:password@login.mofostaging.net");

    // cookie secret
    app.set("SESSION_SECRET", "dummy secret value");
}
