before('protect from forgery', function () {
  protectFromForgery('b0ea7c07cdec6376c9f156630921af3168312033');
});
before('compile CSS/JS assets', function () {
  this.css = css;
  next();
});
