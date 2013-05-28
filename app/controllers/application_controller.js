layout(false);

before('protect from forgery', function () {
    this.csrf_token = req.session._csrf;
    next();
});
before('compile CSS/JS assets', function () {
    this.css = css;
    next();
});
before('set user session', function () {
    this.email = req.session.email || '';
    next();
});
before(function () {
    this.makeEndpoint = process.env['MAKE_ENDPOINT'];
    this.personaSSO   = process.env['AUDIENCE'];
    this.loginAPI     = process.env['LOGIN'];  // minor misnomer (loginAPI vs loginURL)
    next();
});
