
module.exports = function (app) {

    /* Setup environment variables */

    // 'Make' API endpoint
    process.env['MAKE_ENDPOINT'] = "http://makeapi.mofostaging.net/";

    // API available at mozilla/login.webmaker.org
    process.env['AUDIENCE'] = "http://localhost:3000";

    // 'Login' API endpoint
    process.env['LOGIN'] = "http://login.mofostaging.net";

    // fully-qualified 'Login' API access-point
    process.env['LOGINAPI'] = "http://testuser:password@login.mofostaging.net";

    // cookie secret
    process.env['SESSION_SECRET'] = "dummy secret value";
}
