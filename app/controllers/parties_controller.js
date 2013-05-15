load('application');

before(loadParty, {
    only: ['show', 'edit', 'update', 'destroy']
    });

action('new', function () {
    this.title = 'New party';
    this.party = new Party;
    render();
});

action(function create() {
    Party.create(req.body.Party, function (err, party) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: party && party.errors || err});
                } else {
                    send({code: 200, data: party.toObject()});
                }
            });
            format.html(function () {
                if (err) {
                    flash('error', 'Party can not be created');
                    render('new', {
                        party: party,
                        title: 'New party'
                    });
                } else {
                    flash('info', 'Party created');
                    redirect(path_to.parties);
                }
            });
        });
    });
});

action(function index() {
    this.title = 'Parties index';
    Party.all(function (err, parties) {
        switch (params.format) {
            case "json":
                send({code: 200, data: parties});
                break;
            default:
                render({
                    parties: parties
                });
        }
    });
});

action(function show() {
    this.title = 'Party show';
    switch(params.format) {
        case "json":
            send({code: 200, data: this.party});
            break;
        default:
            render();
    }
});

action(function edit() {
    this.title = 'Party edit';
    switch(params.format) {
        case "json":
            send(this.party);
            break;
        default:
            render();
    }
});

action(function update() {
    var party = this.party;
    this.title = 'Edit party details';
    this.party.updateAttributes(body.Party, function (err) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: party && party.errors || err});
                } else {
                    send({code: 200, data: party});
                }
            });
            format.html(function () {
                if (!err) {
                    flash('info', 'Party updated');
                    redirect(path_to.party(party));
                } else {
                    flash('error', 'Party can not be updated');
                    render('edit');
                }
            });
        });
    });
});

action(function destroy() {
    this.party.destroy(function (error) {
        respondTo(function (format) {
            format.json(function () {
                if (error) {
                    send({code: 500, error: error});
                } else {
                    send({code: 200});
                }
            });
            format.html(function () {
                if (error) {
                    flash('error', 'Can not destroy party');
                } else {
                    flash('info', 'Party successfully removed');
                }
                send("'" + path_to.parties + "'");
            });
        });
    });
});

function loadParty() {
    Party.find(params.id, function (err, party) {
        if (err || !party) {
            if (!err && !party && params.format === 'json') {
                return send({code: 404, error: 'Not found'});
            }
            redirect(path_to.parties);
        } else {
            this.party = party;
            next();
        }
    }.bind(this));
}
