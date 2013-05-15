var app, compound
  , request = require('supertest')
  , sinon   = require('sinon');

function PartyStub () {
  return {
    title: '',
        description: '',
        expectedCount: '',
        location: '',
        begins: '',
        ends: '',
        externalLink: '',
        organizer: '',
        partner: '',
        image: '',
        hashtag: '',
        createdAt: ''
  };
}

describe('PartyController', function() {
  beforeEach(function(done) {
    app = getApp();
    compound = app.compound;
    compound.on('ready', done);
  });

  /*
   * GET /parties/new
   * Should render parties/new.ejs
   */
  it('should render "new" template on GET /parties/new', function (done) {
    request(app)
      .get('/parties/new')
      .end(function (err, res) {
        res.statusCode.should.equal(200);
        app.didRender(/parties\/new\.ejs$/i).should.be.true;
        done();
      });
  });

  /*
   * GET /parties
   * Should render parties/index.ejs
   */
  it('should render "index" template on GET /parties', function (done) {
    request(app)
      .get('/parties')
      .end(function (err, res) {
        res.statusCode.should.equal(200);
        app.didRender(/parties\/index\.ejs$/i).should.be.true;
        done();
      });
  });

  /*
   * GET /parties/:id/edit
   * Should access Party#find and render parties/edit.ejs
   */
  it('should access Party#find and render "edit" template on GET /parties/:id/edit', function (done) {
    var Party = app.models.Party;

    // Mock Party#find
    Party.find = sinon.spy(function (id, callback) {
      callback(null, new Party);
    });

    request(app)
      .get('/parties/42/edit')
      .end(function (err, res) {
        res.statusCode.should.equal(200);
        Party.find.calledWith('42').should.be.true;
        app.didRender(/parties\/edit\.ejs$/i).should.be.true;

        done();
      });
  });

  /*
   * GET /parties/:id
   * Should render parties/index.ejs
   */
  it('should access Party#find and render "show" template on GET /parties/:id', function (done) {
    var Party = app.models.Party;

    // Mock Party#find
    Party.find = sinon.spy(function (id, callback) {
      callback(null, new Party);
    });

    request(app)
      .get('/parties/42')
      .end(function (err, res) {
        res.statusCode.should.equal(200);
        Party.find.calledWith('42').should.be.true;
        app.didRender(/parties\/show\.ejs$/i).should.be.true;

        done();
      });
  });

  /*
   * POST /parties
   * Should access Party#create when Party is valid
   */
  it('should access Party#create on POST /parties with a valid Party', function (done) {
    var Party = app.models.Party
      , party = new PartyStub;

    // Mock Party#create
    Party.create = sinon.spy(function (data, callback) {
      callback(null, party);
    });

    request(app)
      .post('/parties')
      .send({ "Party": party })
      .end(function (err, res) {
        res.statusCode.should.equal(302);
        Party.create.calledWith(party).should.be.true;

        done();
      });
  });

  /*
   * POST /parties
   * Should fail when Party is invalid
   */
  it('should fail on POST /parties when Party#create returns an error', function (done) {
    var Party = app.models.Party
      , party = new PartyStub;

    // Mock Party#create
    Party.create = sinon.spy(function (data, callback) {
      callback(new Error, party);
    });

    request(app)
      .post('/parties')
      .send({ "Party": party })
      .end(function (err, res) {
        res.statusCode.should.equal(200);
        Party.create.calledWith(party).should.be.true;

        app.didFlash('error').should.be.true;

        done();
      });
  });

  /*
   * PUT /parties/:id
   * Should redirect back to /parties when Party is valid
   */
  it('should redirect on PUT /parties/:id with a valid Party', function (done) {
    var Party = app.models.Party
      , party = new PartyStub;

    Party.find = sinon.spy(function (id, callback) {
        callback(null, {
          id: 1,
          updateAttributes: function (data, cb) { cb(null) }
        });
    });

    request(app)
      .put('/parties/1')
      .send({ "Party": party })
      .end(function (err, res) {
        res.statusCode.should.equal(302);
        res.header['location'].should.include('/parties/1');

        app.didFlash('error').should.be.false;

        done();
      });
  });

  /*
   * PUT /parties/:id
   * Should not redirect when Party is invalid
   */
  it('should fail / not redirect on PUT /parties/:id with an invalid Party', function (done) {
    var Party = app.models.Party
      , party = new PartyStub;

    Party.find = sinon.spy(function (id, callback) {
        callback(null, {
          id: 1,
          updateAttributes: function (data, cb) { cb(new Error) }
        });
    });

    request(app)
      .put('/parties/1')
      .send({ "Party": party })
      .end(function (err, res) {
        res.statusCode.should.equal(200);
        app.didFlash('error').should.be.true;

        done();
      });
  });

  /*
   * DELETE /parties/:id
   * -- TODO: IMPLEMENT --
   */
  it('should delete a Party on DELETE /parties/:id');

  /*
   * DELETE /parties/:id
   * -- TODO: IMPLEMENT FAILURE --
   */
  it('should not delete a Party on DELETE /parties/:id if it fails');
});